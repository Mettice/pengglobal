/**
 * Builds the social preview images (Open Graph / Twitter cards).
 *
 *   node scripts/build-og.mjs
 *
 * Output: public/og/en.jpg, public/og/fr.jpg — 1200x630, the size every
 * platform crops from.
 *
 * Rendered in headless Chromium rather than composed with sharp, because
 * the card is type: it has to be set in Archivo and Fraunces, at the same
 * weights and tracking as the hero, or the preview looks like a different
 * company. Chromium loads the real webfonts; sharp would need them
 * installed system-wide and would still not kern the same way.
 *
 * The headline is read from the message catalogues, so a copy change is
 * picked up by re-running this — nothing here restates the wording.
 */
import { chromium } from "playwright";
import { mkdir, readFile, rm, stat, writeFile } from "node:fs/promises";
import path from "node:path";

const OUT = "public/og";
const LOCALES = ["en", "fr"];
const W = 1200;
const H = 630;

await mkdir(OUT, { recursive: true });

// The card is written next to the assets and opened as a file, not handed
// to the page as a string: Chromium refuses to load file:// images into a
// document created in memory, and the poster and lockup are the point.
const CARD = path.join(OUT, "_card.html");
const POSTER = "../hero/poster.webp";
const LOCKUP = "../images/brand/peng-global-compact.png";

const page = (hero, meta) => `<!doctype html>
<html><head><meta charset="utf-8">
<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link href="https://fonts.googleapis.com/css2?family=Archivo:wght@800;900&family=Fraunces:ital,wght@1,400&family=IBM+Plex+Mono:wght@500&display=swap" rel="stylesheet">
<style>
  *{margin:0;padding:0;box-sizing:border-box}
  body{width:${W}px;height:${H}px;position:relative;overflow:hidden;background:#0b0b0b}
  .shot{position:absolute;inset:0;background:url('${POSTER}') right center/cover no-repeat}
  /* The hero's own scrim, so the card reads as a frame of the site. */
  .scrim{position:absolute;inset:0;background:
    linear-gradient(to top,#0b0b0b 0%,rgba(11,11,11,.25) 55%,rgba(11,11,11,.45) 100%),
    linear-gradient(to right,rgba(11,11,11,.9) 0%,rgba(11,11,11,.35) 55%,transparent 100%)}
  .frame{position:absolute;inset:0;display:flex;flex-direction:column;justify-content:space-between;padding:56px 64px}
  /* align-self, or the column flex stretches the mark across the card. */
  .lockup{height:48px;width:auto;align-self:flex-start}
  h1{font-family:Archivo,sans-serif;font-weight:900;font-size:76px;line-height:.88;
     letter-spacing:-.02em;text-transform:uppercase;color:#f4f2ec}
  .it{font-family:Fraunces,serif;font-style:italic;font-weight:400;text-transform:none;color:#f97316}
  .dim{color:rgba(244,242,236,.55)}
  .lime{color:#8fd62c}
  .foot{display:flex;align-items:center;gap:18px;font-family:'IBM Plex Mono',monospace;
        font-weight:500;font-size:19px;letter-spacing:.14em;text-transform:uppercase;color:rgba(244,242,236,.7)}
  .dot{width:9px;height:9px;background:#78be20;display:inline-block}
  .rule{height:3px;background:#78be20;width:96px;margin-bottom:26px}
</style></head>
<body>
  <div class="shot"></div><div class="scrim"></div>
  <div class="frame">
    <img class="lockup" src="${LOCKUP}">
    <div>
      <div class="rule"></div>
      <h1>${hero.line1}<br><span class="it">${hero.line2a}</span> <span class="dim">${hero.line2b}</span><br><span class="lime">${hero.line3}</span></h1>
    </div>
    <div class="foot"><span>penglobalholding.com</span><span class="dot"></span><span>${meta}</span></div>
  </div>
</body></html>`;

const browser = await chromium.launch();
for (const locale of LOCALES) {
  const messages = JSON.parse(await readFile(`messages/${locale}.json`, "utf8"));
  const { hero } = messages.home;
  await writeFile(CARD, page(hero, hero.meta2), "utf8");
  const tab = await browser.newPage({ viewport: { width: W, height: H }, deviceScaleFactor: 1 });
  await tab.goto(`file:///${path.resolve(CARD).replace(/\\/g, "/")}`, { waitUntil: "load" });
  await tab.evaluate(() => document.fonts.ready);
  await tab.waitForTimeout(300);
  // JPEG: the card is a photograph under type, and a 1200x630 PNG of it
  // runs ~560KB where quality 88 lands near a tenth of that. Every
  // platform that reads og:image takes JPEG.
  const out = path.join(OUT, `${locale}.jpg`);
  await tab.screenshot({ path: out, type: "jpeg", quality: 88 });
  await tab.close();
  const { size } = await stat(out);
  console.log(`${out.padEnd(20)} ${W}x${H}  ${(size / 1024).toFixed(0)} KB`);
}
await browser.close();
await rm(CARD, { force: true });
