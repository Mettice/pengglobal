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
