/**
 * Encodes the hero background loop and its poster.
 *
 *   node scripts/build-hero.mjs [path/to/source.mp4]
 *
 * Source defaults to media/hero-source.mp4, which lives outside public/
 * on purpose: anything in public/ deploys, and the untrimmed original
 * would ship alongside the encodes it was made from.
 *
 * Outputs, all under public/hero/:
 *   poster.webp      frame 0, graded — also the LCP image
 *   loop.av1.webm    SVT-AV1, preferred where supported
 *   loop.h264.mp4    H.264 fallback, faststart for progressive start
 *   loop-sm.*        the same pair cut to 3:4 for portrait screens
 *
 * The poster is cut from the video's own first frame rather than made
 * separately, so it is pixel-identical to where playback begins and
 * nothing jumps when the video fades in over it.
 *
 * Grade, not duotone. Pushed through the ink/lime duotone the site uses
 * for stills, this golden-hour footage turns acid green and the
 * containers read as black blocks. A darkening grade keeps the story,
 * and the warm orange already echoes the Peng Edition accent. Text
 * contrast is carried by the scrim in KineticHero, not by this grade.
 *
 * Audio is dropped: the element plays muted, so a track is dead weight.
 * The source is expected to loop cleanly (same first and last frame).
 */
import { execFile } from "node:child_process";
import { promisify } from "node:util";
import { mkdir, stat, rm } from "node:fs/promises";
import path from "node:path";
import sharp from "sharp";

const run = promisify(execFile);

const SOURCE = process.argv[2] ?? "media/hero-source.mp4";
const OUT = "public/hero";

/** Darken to 78% and pull saturation to 80%. */
const GRADE =
  "eq=saturation=0.8,colorchannelmixer=rr=0.78:gg=0.78:bb=0.78";

const ffmpeg = (args) =>
  run("ffmpeg", ["-hide_banner", "-loglevel", "error", "-y", ...args], {
    maxBuffer: 1024 * 1024 * 16,
  });

await mkdir(OUT, { recursive: true });

// Poster: frame 0, graded, via a temporary PNG so sharp controls the WebP.
const tmp = path.join(OUT, "_poster.png");
await ffmpeg(["-i", SOURCE, "-frames:v", "1", "-vf", GRADE, tmp]);
await sharp(tmp).webp({ quality: 78 }).toFile(path.join(OUT, "poster.webp"));
await rm(tmp);

// Desktop takes the full frame; phones take a 3:4 cut from the right
// edge. The hero is object-right, so in portrait the right edge is all
// anyone sees — the cut ships only those pixels, at native resolution,
// and a 3:4 box still covers every phone and portrait tablet.
const VARIANTS = [
  { suffix: "", vf: GRADE },
  { suffix: "-sm", vf: `crop=ih*3/4:ih:iw-ih*3/4:0,${GRADE}` },
];

for (const { suffix, vf } of VARIANTS) {
  // H.264 — the universal fallback. Keyframes every 2s are plenty for
  // looped playback; this is not a scrubbed sequence.
  await ffmpeg([
    "-i", SOURCE,
    "-vf", vf,
    "-an",
    "-c:v", "libx264",
    "-preset", "slow",
    "-crf", "26",
    "-pix_fmt", "yuv420p",
    "-g", "48",
    "-movflags", "+faststart",
    path.join(OUT, `loop${suffix}.h264.mp4`),
  ]);

  // AV1 — roughly half the bytes at matching quality where supported.
  await ffmpeg([
    "-i", SOURCE,
    "-vf", vf,
    "-an",
    "-c:v", "libsvtav1",
    "-preset", "6",
    "-crf", "38",
    "-pix_fmt", "yuv420p",
    "-g", "48",
    path.join(OUT, `loop${suffix}.av1.webm`),
  ]);
}

for (const f of ["poster.webp", "loop.av1.webm", "loop.h264.mp4", "loop-sm.av1.webm", "loop-sm.h264.mp4"]) {
  const { size } = await stat(path.join(OUT, f));
  console.log(`${path.join(OUT, f).padEnd(28)} ${(size / 1024).toFixed(0).padStart(6)} KB`);
}
