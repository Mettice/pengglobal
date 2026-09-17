/**
 * Prepares the partner & brand marks for the home page strip.
 *
 *   node scripts/prepare-logos.mjs
 *
 * Each supplied file arrives differently, so each gets its own treatment
 * before they are trimmed to their ink and sized to one height:
 *
 * - pensan.jpeg is a brand-guideline sheet: the mark is cropped out of it.
 * - pensan kidz logo.jpg and flexoffice.jpg (media/logos) sit on white. The white is
 *   kept — the strip prints them with mix-blend-mode: multiply, which
 *   drops white into the paper ground without touching white detail
 *   inside the marks (PENSAN's lettering, the Kidz cloud).
 * - peng trust.jpg (media/logos) has a transparency checkerboard painted into the JPEG
 *   rather than real transparency. Every part of the mark is a saturated
 *   green and every checker square is a neutral grey, so bright neutral
 *   pixels are keyed out, feathered by saturation so the edges stay soft.
 */
import sharp from "sharp";
import { mkdir } from "node:fs/promises";

const SRC = "public/images";
// Supplied originals live outside public/ so they do not deploy — the
// larger ones are over a megabyte and the site only needs the outputs.
const LOGOS = "media/logos";
const OUT = "public/images/partners";
const HEIGHT = 240; // ~2x the rendered height

await mkdir(OUT, { recursive: true });

async function finish(input, name, { alpha = false } = {}) {
  const trimmed = await sharp(input)
    .trim({ background: alpha ? { r: 0, g: 0, b: 0, alpha: 0 } : "#ffffff", threshold: 18 })
    .toBuffer();
  const out = `${OUT}/${name}.${alpha ? "png" : "webp"}`;
  const img = sharp(trimmed).resize({ height: HEIGHT, withoutEnlargement: true });
  await (alpha ? img.png({ compressionLevel: 9 }) : img.webp({ quality: 90 })).toFile(out);
  const m = await sharp(out).metadata();
  console.log(`${out.padEnd(34)} ${m.width}x${m.height}`);
}

// PENSAN: the navy box on the guideline sheet (source px).
await finish(
  await sharp(`${SRC}/pensan.jpeg`).extract({ left: 333, top: 168, width: 614, height: 172 }).toBuffer(),
  "pensan",
);

await finish(`${LOGOS}/pensan kidz logo.jpg`, "pensan-kidz");
await finish(`${LOGOS}/flexoffice.jpg`, "flexoffice");

// Peng "P" mark: key out the painted checkerboard.
{
  const { data, info } = await sharp(`${LOGOS}/peng trust.jpg`)
    .removeAlpha()
    .raw()
    .toBuffer({ resolveWithObject: true });
  const rgba = Buffer.alloc(info.width * info.height * 4);
  for (let p = 0, q = 0; p < data.length; p += 3, q += 4) {
    const r = data[p], g = data[p + 1], b = data[p + 2];
    const sat = Math.max(r, g, b) - Math.min(r, g, b);
    const light = (r + g + b) / 3;
    // Dark or clearly coloured pixels are the mark; bright greys are the
    // checkerboard; in between, fade by saturation.
    const a = light < 150 || sat >= 48 ? 255 : Math.round(Math.max(0, (sat - 12) / 36) * 255);
    rgba[q] = r;
    rgba[q + 1] = g;
    rgba[q + 2] = b;
    rgba[q + 3] = a;
  }
  await finish(
    await sharp(rgba, { raw: { width: info.width, height: info.height, channels: 4 } }).png().toBuffer(),
    "peng-p",
    { alpha: true },
  );
}

/* ------------------------------------------------------------------ */
/* Peng Global Holding — the site's own lockup                         */
/* ------------------------------------------------------------------ */
/*
 * Supplied as one green on white, in a PNG with no transparency. Since
 * the ink is a single colour, the white can be removed exactly rather
 * than keyed: every pixel is the green laid over white at some coverage,
 * so coverage = (255 - pixel) / (255 - green), measured on the red and
 * blue channels where green and white differ most. That keeps the
 * anti-aliased edges, and the lockup then sits on paper and on ink alike.
 *
 * Two outputs:
 *   peng-global.png          the full lockup, tagline included
 *   peng-global-compact.png  emblem and name only, for the header — at
 *                            header height the tagline is ~2px tall and
 *                            reads as noise, so it is removed there
 */
{
  const BRAND = "public/images/brand";
  const INK = [123, 187, 38]; // measured off the file
  await mkdir(BRAND, { recursive: true });

  const { data, info } = await sharp(`${LOGOS}/peng global holding.png`)
    .removeAlpha()
    .raw()
    .toBuffer({ resolveWithObject: true });
  const { width: W, height: H } = info;
  const span = 255 - INK[0] + (255 - INK[2]);
  const alpha = new Float32Array(W * H);
  for (let i = 0, p = 0; i < W * H; i++, p += 3) {
    const a = (510 - data[p] - data[p + 2]) / span;
    alpha[i] = a < 0.04 ? 0 : Math.min(1, a);
  }

  const ink = (x0, x1, y0, y1) => {
    for (let y = y0; y < y1; y++) for (let x = x0; x < x1; x++) if (alpha[y * W + x] > 0.3) return true;
    return false;
  };

  // The emblem is the first run of inked columns; the words start after
  // the first empty gap that follows it.
  let x = 0;
  while (x < W && !ink(x, x + 1, 0, H)) x++;
  while (x < W && ink(x, x + 1, 0, H)) x++;
  const wordsFrom = x;

  // Within the words, rows form bands; the last band is the tagline.
  const bands = [];
  for (let y = 0, inBand = false, start = 0; y <= H; y++) {
    const has = y < H && ink(wordsFrom, W, y, y + 1);
    if (has && !inBand) { inBand = true; start = y; }
    if (!has && inBand) { inBand = false; bands.push([start, y]); }
  }
  // Padded: the band was found at >30% coverage, and the letters' soft
  // edges extend past it — left in, they read as a faint dotted row.
  const PAD = 5;
  const last = bands[bands.length - 1];
  const tagline = [Math.max(0, last[0] - PAD), Math.min(H, last[1] + PAD)];

  const render = async (name, dropTagline) => {
    const rgba = Buffer.alloc(W * H * 4);
    for (let y = 0; y < H; y++) {
      for (let xx = 0; xx < W; xx++) {
        const i = y * W + xx;
        const cut = dropTagline && xx >= wordsFrom && y >= tagline[0] && y < tagline[1];
        rgba[i * 4] = INK[0];
        rgba[i * 4 + 1] = INK[1];
        rgba[i * 4 + 2] = INK[2];
        rgba[i * 4 + 3] = cut ? 0 : Math.round(alpha[i] * 255);
      }
    }
    const out = `${BRAND}/${name}.png`;
    await sharp(rgba, { raw: { width: W, height: H, channels: 4 } })
      .trim({ background: { r: 0, g: 0, b: 0, alpha: 0 }, threshold: 1 })
      .png({ compressionLevel: 9 })
      .toFile(out);
    const m = await sharp(out).metadata();
    console.log(`${out.padEnd(38)} ${m.width}x${m.height}`);
  };

  console.log(`  words start at x=${wordsFrom}; text bands ${JSON.stringify(bands)}; tagline ${JSON.stringify(tagline)}`);
  await render("peng-global", false);
  await render("peng-global-compact", true);
}
