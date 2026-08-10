/**
 * Capture local replica frames for overlay comparison against reference/.
 * Prerequisites: npm run dev
 */
import { chromium } from "playwright";
import fs from "node:fs/promises";
import path from "node:path";

const VIEWPORT = { width: 1440, height: 900 };
const TIMES = [0, 100, 500, 800, 1200, 2000, 3500, 5000];
const OUT = path.resolve(__dirname, "../reference/frames/local");

async function main() {
  await fs.mkdir(OUT, { recursive: true });
  const browser = await chromium.launch({ channel: "chrome", headless: true });
  const page = await browser.newPage({
    viewport: VIEWPORT,
    deviceScaleFactor: 1,
  });

  const t0 = Date.now();
  await page.goto("http://localhost:3456", {
    waitUntil: "domcontentloaded",
    timeout: 30_000,
  });

  for (const t of TIMES) {
    const elapsed = Date.now() - t0;
    if (t > elapsed) await page.waitForTimeout(t - elapsed);
    await page.screenshot({
      path: path.join(OUT, `${String(t).padStart(4, "0")}ms.png`),
    });
    console.log(`local ${t}ms`);
  }

  const metrics = await page.evaluate(() => {
    const h1 = document.querySelector("h1");
    const brand = document.querySelector("a[aria-label='Cursor home']");
    const hr = h1?.getBoundingClientRect();
    const br = brand?.getBoundingClientRect();
    return {
      h1: hr
        ? { x: hr.x, y: hr.y, w: hr.width, h: hr.height, size: getComputedStyle(h1!).fontSize }
        : null,
      brand: br ? { x: br.x, y: br.y } : null,
      canvases: document.querySelectorAll("canvas").length,
    };
  });

  console.log("metrics", JSON.stringify(metrics, null, 2));
  console.log("Reference targets @1440: brand~(378,272) h1~(378,350) size 52px");
  await browser.close();
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
