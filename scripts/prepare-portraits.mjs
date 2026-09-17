/**
 * Cuts the leadership portraits to matching 4:5 frames.
 *
 *   node scripts/prepare-portraits.mjs
 *
 * The two supplied files differ: CEO.jpeg is a rectangular studio shot,
 * Managing Director.jpeg is already cut to a circle on black. The site
 * frames portraits square-cornered, so the circular one is cropped to a
 * 4:5 rectangle that sits entirely inside its circle — otherwise its
 * black corners would show.
 */
import sharp from "sharp";
import { mkdir } from "node:fs/promises";

const OUT = "public/images/leaders";
const W = 800;
const H = 1000;
await mkdir(OUT, { recursive: true });

// CEO: crop by height; the face sits slightly left of centre, so anchor
// the frame to the left edge. The file carries a black band across its
// first 21 rows, which would show as a stray bar along the frame's top.
{
  const src = "public/images/CEO.jpeg";
  const BAND = 22;
  const { width, height: full } = await sharp(src).metadata();
  const height = full - BAND;
  const w = Math.round(height * (W / H));
  await sharp(src)
    .extract({ left: 0, top: BAND, width: Math.min(w, width), height })
    .resize(W, H)
    .webp({ quality: 82 })
    .toFile(`${OUT}/ceo.webp`);
}

// Managing Director: the circle fills the square. Take a 4:5 rectangle at
// 95% of the largest that fits, and spend the slack moving it up — her
// hair sits close to the top of the circle.
{
  const src = "public/images/Managing Director.jpeg";
  const { width } = await sharp(src).metadata();
  const r = width / 2;
  const scale = 0.95;
  const w = Math.round(2 * r * (4 / Math.sqrt(41)) * scale);
  const h = Math.round(w * (H / W));
  // Highest top edge whose corners still lie inside the circle.
  const top = Math.round(r - Math.sqrt(r * r - (w / 2) ** 2)) + 2;
  await sharp(src)
    .extract({ left: Math.round(r - w / 2), top, width: w, height: h })
    .resize(W, H)
    .webp({ quality: 82 })
    .toFile(`${OUT}/md.webp`);
}

console.log(`portraits → ${OUT}/ceo.webp, ${OUT}/md.webp`);
