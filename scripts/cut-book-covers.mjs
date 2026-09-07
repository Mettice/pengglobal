/**
 * Cuts the supplied print spreads into web assets.
 *
 * Every cover file the client sent is a full wraparound spread laid out as
 *   [ back cover | spine | front cover ]
 * with no separation other than the artwork itself. The site previously
 * showed the front board by loading the entire spread and cropping it in
 * CSS, which meant every visitor downloaded roughly twice the pixels they
 * could see, and the spine — which carries real title artwork — was thrown
 * away entirely.
 *
 * This cuts each spread once, into three honest assets, so the 3D book can
 * use the real spine as its real spine.
 *
 * Coordinates are measured from the files by eye against a magnified crop,
 * then checked: both front boards land on aspect 0.670, i.e. 2:3, a normal
 * trade paperback. That agreement is the proof the cuts are right.
 *
 * Trims are explicit rather than auto-detected. Detecting "flat" edge
 * columns sounds tidier but is wrong here — these covers contain large
 * legitimately flat areas (the poetry back cover is mostly white margin),
 * so detection eats real artwork.
 *
 * Re-run and re-measure if a cover is ever re-supplied:
 *   node scripts/cut-book-covers.mjs
 */
import sharp from "sharp";
import { mkdir } from "node:fs/promises";

const SRC = "public/images";
const OUT = "public/images/books";

/**
 * `spine` is the [start, end) of the spine in source pixels; the front
 * board runs from spine[1] to the right edge, the back from 0 to spine[0].
 * `trim` drops print bleed — flat colour past the trim line that would
 * otherwise read as a stray sliver down the edge of the board.
 */
const SPREADS = [
  {
    key: "fireside",
    file: "firesidetales.jpeg",
    spine: [744, 818],
    trim: { front: { right: 24 }, spine: { left: 14, right: 6 } },
  },
  {
    // Keys match the `pengEdition.books.*` message keys, not the filenames.
    key: "poems",
    file: "my cameroon.jpg",
    spine: [604, 648],
    trim: { front: { right: 26 } },
  },
];

/** Boards render at most ~420px wide; 2x covers retina. */
const OUT_WIDTH = { front: 840, spine: 160, back: 840 };

await mkdir(OUT, { recursive: true });

for (const { key, file, spine, trim = {} } of SPREADS) {
  const src = `${SRC}/${file}`;
  const { width, height } = await sharp(src).metadata();
  const [spineStart, spineEnd] = spine;

  const pieces = {
    front: { left: spineEnd, width: width - spineEnd },
    spine: { left: spineStart, width: spineEnd - spineStart },
    back: { left: 0, width: spineStart },
  };

  for (const [name, box] of Object.entries(pieces)) {
    const { left: tl = 0, right: tr = 0 } = trim[name] ?? {};
    const target = `${OUT}/${key}-${name}.webp`;
    const cutWidth = box.width - tl - tr;

    await sharp(src)
      .extract({ left: box.left + tl, top: 0, width: cutWidth, height })
      .resize({
        width: Math.min(OUT_WIDTH[name], cutWidth),
        withoutEnlargement: true,
      })
      .webp({ quality: 82 })
      .toFile(target);

    const meta = await sharp(target).metadata();
    console.log(
      `${target.padEnd(34)} ${String(meta.width).padStart(4)}x${meta.height}` +
        `  aspect ${(meta.width / meta.height).toFixed(3)}`,
    );
  }
}
