import { chromium } from "playwright";

async function measure(url: string) {
  const browser = await chromium.launch({ channel: "chrome", headless: true });
  const page = await browser.newPage({ viewport: { width: 1440, height: 900 } });
  await page.goto(url, { waitUntil: "domcontentloaded", timeout: 60000 });
  await page.waitForTimeout(3000);

  const data = await page.evaluate(() => {
    const h1 = document.querySelector("h1");
    const logo = document.querySelector('a[aria-label="Cursor home"]');
    const input = document.querySelector('input[type="email"], input[name="email"]');
    const main = document.querySelector("#main");

    const h1r = h1?.getBoundingClientRect();
    const logor = logo?.getBoundingClientRect();
    const inputr = input?.getBoundingClientRect();
    const mainr = main?.getBoundingClientRect();

    const grids = [...document.querySelectorAll("#main *")]
      .filter((el) => getComputedStyle(el).display === "grid")
      .map((el) => {
        const cs = getComputedStyle(el);
        const r = el.getBoundingClientRect();
        return {
          className: String(el.className).slice(0, 120),
          x: Math.round(r.x),
          y: Math.round(r.y),
          w: Math.round(r.width),
          h: Math.round(r.height),
          padding: cs.padding,
          gap: cs.gap,
          cols: cs.gridTemplateColumns,
          rows: cs.gridTemplateRows,
        };
      });

    return {
      h1: h1r
        ? {
            x: Math.round(h1r.x),
            y: Math.round(h1r.y),
            w: Math.round(h1r.width),
            h: Math.round(h1r.height),
            fontSize: getComputedStyle(h1!).fontSize,
            maxWidth: getComputedStyle(h1!).maxWidth,
          }
        : null,
      logo: logor
        ? {
            x: Math.round(logor.x),
            y: Math.round(logor.y),
            w: Math.round(logor.width),
            h: Math.round(logor.height),
          }
        : null,
      input: inputr
        ? {
            x: Math.round(inputr.x),
            y: Math.round(inputr.y),
            w: Math.round(inputr.width),
            h: Math.round(inputr.height),
          }
        : null,
      grids,
      main: mainr
        ? {
            x: Math.round(mainr.x),
            y: Math.round(mainr.y),
            w: Math.round(mainr.width),
            h: Math.round(mainr.height),
          }
        : null,
    };
  });

  console.log(`\n=== ${url} ===`);
  console.log(JSON.stringify(data, null, 2));
  await browser.close();
}

async function main() {
  await measure("https://cursor.com/origin");
  await measure("http://localhost:3456");
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
