import { chromium } from "playwright";

async function main() {
  const browser = await chromium.launch({ channel: "chrome", headless: true });
  const page = await browser.newPage({ viewport: { width: 1440, height: 900 } });
  page.on("console", (m) => console.log("CONSOLE", m.type(), m.text()));
  page.on("pageerror", (e) => console.log("PAGEERROR", e.message));
  await page.goto("http://localhost:3456", { waitUntil: "domcontentloaded", timeout: 30000 });
  await page.waitForTimeout(2000);

  const img = await page.evaluate(async () => {
    const r = await fetch("/origin_background.webp");
    const buf = await r.arrayBuffer();
    return { ok: r.ok, status: r.status, type: r.headers.get("content-type"), size: buf.byteLength };
  });
  console.log("img", img);

  const probe = await page.evaluate(() => {
    const canvases = [...document.querySelectorAll("canvas")];
    const samples = canvases.map((c, i) => {
      try {
        const tmp = document.createElement("canvas");
        tmp.width = 8;
        tmp.height = 8;
        const tctx = tmp.getContext("2d")!;
        tctx.drawImage(c, 0, 0, 8, 8);
        const data = [...tctx.getImageData(0, 0, 8, 8).data].slice(0, 32);
        return { i, w: c.width, h: c.height, rgba: data };
      } catch (e) {
        return { i, err: String(e) };
      }
    });
    const all = [...document.querySelectorAll("div")].slice(0, 40).map((el) => ({
      className: String(el.className).slice(0, 80),
      opacity: getComputedStyle(el).opacity,
      z: getComputedStyle(el).zIndex,
      bg: getComputedStyle(el).backgroundColor,
    }));
    return { samples, all: all.filter((a) => a.className.includes("Origin") || a.className.includes("shader") || a.className.includes("stage") || a.opacity !== "1") };
  });
  console.log(JSON.stringify(probe, null, 2));
  await page.screenshot({ path: "reference/frames/local/debug.png" });
  await browser.close();
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
