/**
 * Forensic capture of cursor.com/origin for animation reverse-engineering.
 * Falls back to Wayback Machine when live CDN is unreachable.
 * Run: npm run capture
 */
import { chromium, type Page } from "playwright";
import fs from "node:fs/promises";
import path from "node:path";

const LIVE = "https://cursor.com/origin";
const WAYBACK =
  "https://web.archive.org/web/20260721165949/https://cursor.com/origin";
const VIEWPORT = { width: 1440, height: 900 };
const FRAME_MS = [0, 50, 100, 200, 300, 500, 800, 1200, 2000, 3000, 5000];
const ROOT = path.resolve(__dirname, "..");
const REF = path.join(ROOT, "reference");
const FRAMES = path.join(REF, "frames");
const ASSETS = path.join(REF, "network-assets");

const UA =
  "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/131.0.0.0 Safari/537.36";

async function ensureDirs() {
  await fs.mkdir(FRAMES, { recursive: true });
  await fs.mkdir(ASSETS, { recursive: true });
}

async function hideWaybackChrome(page: Page) {
  await page.evaluate(() => {
    for (const id of ["wm-ipp-base", "donato", "wm-ipp"]) {
      const el = document.getElementById(id);
      if (el) (el as HTMLElement).style.display = "none";
    }
    document
      .querySelectorAll('[id^="wm-"], .wb-autocomplete, #wm-ipp-print')
      .forEach((el) => {
        (el as HTMLElement).style.display = "none";
      });
  });
}

async function dumpStructure(page: Page) {
  return page.evaluate(() => {
    const canvasNodes = Array.from(document.querySelectorAll("canvas")).map(
      (c, i) => ({
        index: i,
        width: c.width,
        height: c.height,
        clientWidth: c.clientWidth,
        clientHeight: c.clientHeight,
        className: c.className,
        id: c.id,
        style: c.getAttribute("style"),
      }),
    );

    const imgs = Array.from(document.querySelectorAll("img")).map((im) => ({
      src: im.currentSrc || im.src,
      naturalWidth: im.naturalWidth,
      naturalHeight: im.naturalHeight,
      className: im.className,
      alt: im.alt,
    }));

    const headings = Array.from(
      document.querySelectorAll("h1, h2, p, button, a, input, label"),
    )
      .slice(0, 40)
      .map((el) => {
        const cs = getComputedStyle(el);
        const r = el.getBoundingClientRect();
        return {
          tag: el.tagName.toLowerCase(),
          text: (el.textContent ?? "").trim().slice(0, 200),
          className: el.className?.toString?.() ?? "",
          fontFamily: cs.fontFamily,
          fontSize: cs.fontSize,
          fontWeight: cs.fontWeight,
          letterSpacing: cs.letterSpacing,
          lineHeight: cs.lineHeight,
          color: cs.color,
          opacity: cs.opacity,
          transform: cs.transform,
          filter: cs.filter,
          backgroundColor: cs.backgroundColor,
          borderRadius: cs.borderRadius,
          rect: { x: r.x, y: r.y, width: r.width, height: r.height },
        };
      });

    const body = getComputedStyle(document.body);
    return {
      title: document.title,
      bodyBg: body.backgroundColor,
      theme: document.documentElement.getAttribute("data-theme"),
      canvasNodes,
      imgs: imgs.slice(0, 20),
      headings,
      allCanvas: canvasNodes.length,
    };
  });
}

async function tryGoto(page: Page, url: string): Promise<boolean> {
  try {
    console.log(`Trying ${url}…`);
    await page.goto(url, { waitUntil: "domcontentloaded", timeout: 45_000 });
    return true;
  } catch (err) {
    console.warn(`Failed ${url}:`, (err as Error).message);
    return false;
  }
}

async function main() {
  await ensureDirs();

  const browser = await chromium.launch({
    channel: "chrome",
    headless: true,
    args: ["--disable-blink-features=AutomationControlled"],
  });

  const context = await browser.newContext({
    viewport: VIEWPORT,
    userAgent: UA,
    deviceScaleFactor: 1,
  });

  const page = await context.newPage();
  page.setDefaultTimeout(60_000);

  const fontUrls: string[] = [];
  const assetUrls: string[] = [];

  page.on("response", async (res) => {
    const url = res.url();
    const ct = res.headers()["content-type"] ?? "";
    try {
      if (
        ct.includes("font") ||
        url.includes(".woff") ||
        url.includes(".woff2") ||
        url.includes(".ttf")
      ) {
        fontUrls.push(url);
        const buf = await res.body();
        const name =
          url.split("/").pop()?.split("?")[0] ?? `font-${fontUrls.length}.woff2`;
        await fs.writeFile(path.join(ASSETS, name), buf);
      }
      if (
        (ct.includes("image") || url.includes(".webp") || url.includes(".svg")) &&
        url.includes("origin")
      ) {
        assetUrls.push(url);
        const buf = await res.body();
        const name =
          url.split("/").pop()?.split("?")[0] ?? `asset-${assetUrls.length}`;
        await fs.writeFile(path.join(ASSETS, name), buf);
      }
    } catch {
      // body may be unavailable
    }
  });

  let source = "live";
  let ok = await tryGoto(page, LIVE);
  if (!ok) {
    source = "wayback";
    ok = await tryGoto(page, WAYBACK);
  }
  if (!ok) {
    throw new Error("Could not reach live Origin or Wayback snapshot");
  }

  if (source === "wayback") {
    await page.waitForTimeout(2500);
    await hideWaybackChrome(page);
  }

  const loadStart = Date.now();
  // Soft reload for timed frames
  await page.reload({ waitUntil: "load", timeout: 90_000 });
  if (source === "wayback") {
    await page.waitForTimeout(1500);
    await hideWaybackChrome(page);
  }
  const loadMs = Date.now() - loadStart;
  console.log(`reload load in ${loadMs}ms (source=${source})`);

  for (const t of FRAME_MS) {
    const elapsed = Date.now() - loadStart;
    const wait = Math.max(0, t - elapsed);
    if (wait > 0) await page.waitForTimeout(wait);
    if (source === "wayback") await hideWaybackChrome(page);
    const label = String(t).padStart(4, "0");
    await page.screenshot({
      path: path.join(FRAMES, `${label}ms.png`),
      fullPage: false,
    });
    console.log(`frame ${label}ms`);
  }

  await page.waitForTimeout(2000);
  if (source === "wayback") await hideWaybackChrome(page);
  await page.screenshot({
    path: path.join(FRAMES, "settled.png"),
    fullPage: false,
  });

  const structure = await dumpStructure(page);
  const html = await page.content();

  await fs.writeFile(
    path.join(REF, "page-structure.json"),
    JSON.stringify(structure, null, 2),
  );
  await fs.writeFile(path.join(REF, "dom-snapshot.html"), html);
  await fs.writeFile(
    path.join(REF, "network-manifest.json"),
    JSON.stringify({ source, fonts: fontUrls, assets: assetUrls }, null, 2),
  );

  const timingNotes = `# Origin capture timing notes

- Captured: ${new Date().toISOString()}
- Source: ${source}
- Viewport: ${VIEWPORT.width}x${VIEWPORT.height}
- reload load: ~${loadMs}ms
- Frames: ${FRAME_MS.map((t) => `${t}ms`).join(", ")}, settled
- Canvas count: ${structure.allCanvas}
- Body bg: ${structure.bodyBg}
- Theme: ${structure.theme}
- Title: ${structure.title}

## Notes from HTML forensics

- \`OriginBackground\` + \`OriginRippleShader\` drive the animated backdrop
- Base texture: \`/marketing-static/origin/origin_background.webp\`
- Dark theme forced via \`data-origin-dark="true"\`
- Intro uses opacity / translate transitions (\`duration-700\`, \`duration-200\`, delays)
- Fonts on page: CursorGothic, Berkeley Mono, EB Garamond
- Theme colors: light \`#f7f7f4\`, dark \`#14120b\`
`;

  await fs.writeFile(path.join(REF, "timing-notes.md"), timingNotes);
  console.log("Capture complete → reference/");
  await browser.close();
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
