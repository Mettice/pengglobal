/**
 * Builds a scroll-scrubbed frame sequence.
 *
 * Two modes:
 *
 *   node scripts/build-sequence.mjs --placeholder
 *     Renders the route-draw sequence procedurally, in brand colour. Use
 *     this to judge pacing, frame count and placement before spending any
 *     time generating video.
 *
 *   node scripts/build-sequence.mjs --video clip.mp4 [--trim-start 1] [--trim-end 0.5]
 *     Extracts frames with ffmpeg, drops the unstable head and tail,
 *     decimates to FRAME_COUNT, and pushes every frame through the
 *     duotone treatment before encoding. Trims are in seconds.
 *
 *     Veo 3.1 writes 4/6/8s at 24fps, so an 8s clip yields ~192 frames —
 *     ample for 60 even after a second is trimmed off each end.
 *
 * Why duotone the real footage: it is what stops generated frames reading
 * as generic AI stock, it hides the inter-frame flicker and interpolation
 * artifacts that are painfully visible when a sequence is scrubbed slowly,
 * and a two-tone image compresses far harder than full colour — roughly
 * 20KB a frame instead of 60KB. It also matches .kin-photo, so the
 * sequence belongs to the same system as every other image on the site.
 *
 * Output: public/sequence/<name>/0001.webp …  plus src/lib/sequences.json
 * so the component never hardcodes a frame count.
 */
import sharp from "sharp";
import { mkdir, rm, readdir, writeFile, readFile, stat } from "node:fs/promises";
import { execFile } from "node:child_process";
import { promisify } from "node:util";
import path from "node:path";

const run = promisify(execFile);

const NAME = "route";
const WIDTH = 1440;
const HEIGHT = 810;
/** 60 frames over ~150vh of scroll is ~25px per frame — smooth to scrub. */
const FRAME_COUNT = 60;

const OUT_DIR = `public/sequence/${NAME}`;
const MANIFEST = "src/lib/sequences.json";

// Kinetic Ink
const INK = "#0b0b0b";
const LIME = "#78be20";
const LIME_BRIGHT = "#8fd62c";
const ORANGE = "#f97316";
const PAPER = "#f4f2ec";

/* ------------------------------------------------------------------ */
/* Placeholder: a nib draws the route                                  */
/* ------------------------------------------------------------------ */

/**
 * The route, as a cubic bezier.
 *
 * Held to the right of the frame on purpose: the copy sits left under an
 * ink wash, and an earlier version started the line at x=250, which put
 * the origin — and the pen — behind the headline at every viewport width.
 *
 * The component crops with object-right, so the rightmost pixel column is
 * always on screen and cropping only ever eats the left. x=580 is the
 * left edge of what survives a 1024x900 window; keep P0 at or above it.
 */
const P0 = { x: 580, y: 650 };
const P1 = { x: 865, y: 235 };
const P2 = { x: 1055, y: 625 };
const P3 = { x: 1340, y: 250 };

function cubic(t) {
  const u = 1 - t;
  return {
    x: u ** 3 * P0.x + 3 * u * u * t * P1.x + 3 * u * t * t * P2.x + t ** 3 * P3.x,
    y: u ** 3 * P0.y + 3 * u * u * t * P1.y + 3 * u * t * t * P2.y + t ** 3 * P3.y,
  };
}

const SAMPLES = 480;
const PATH_POINTS = Array.from({ length: SAMPLES + 1 }, (_, i) =>
  cubic(i / SAMPLES),
);

const fullPath = PATH_POINTS.map((p) => `${p.x.toFixed(1)},${p.y.toFixed(1)}`).join(" ");

/** Static backdrop: a faint horizon limb and rule field, not a busy grid. */
function backdrop() {
  const rules = [];
  for (let y = 110; y < HEIGHT; y += 88) {
    rules.push(
      `<line x1="0" y1="${y}" x2="${WIDTH}" y2="${y}" stroke="${LIME}" stroke-opacity="0.10"/>`,
    );
  }
  // Meridians converging toward the limb, echoing the globe's graticule.
  const meridians = [];
  for (let i = -4; i <= 4; i++) {
    const x = WIDTH / 2 + i * 190;
    meridians.push(
      `<path d="M ${x} 0 Q ${WIDTH / 2 + i * 128} ${HEIGHT / 2} ${WIDTH / 2 + i * 66} ${HEIGHT}"
             fill="none" stroke="${LIME}" stroke-opacity="0.08"/>`,
    );
  }
  return `
    <rect width="${WIDTH}" height="${HEIGHT}" fill="${INK}"/>
    ${rules.join("")}
    ${meridians.join("")}
    <circle cx="${WIDTH / 2}" cy="${HEIGHT + 290}" r="900"
            fill="none" stroke="${LIME}" stroke-opacity="0.30"/>
    <circle cx="${WIDTH / 2}" cy="${HEIGHT + 290}" r="1090"
            fill="none" stroke="${LIME}" stroke-opacity="0.16"/>
  `;
}

/** The nib, drawn pointing along the tangent at its position. */
function nib(point, angleDeg) {
  return `
    <g transform="translate(${point.x.toFixed(1)} ${point.y.toFixed(1)}) rotate(${angleDeg.toFixed(1)})">
      <!-- Barrel, tapering to the nib at the origin of this group -->
      <path d="M -150 -11 L -52 -11 L -52 11 L -150 11 Z" fill="${PAPER}" fill-opacity="0.28"/>
      <path d="M -52 -11 L -18 -5 L -18 5 L -52 11 Z" fill="${PAPER}" fill-opacity="0.7"/>
      <path d="M -18 -5 L 0 0 L -18 5 Z" fill="${ORANGE}"/>
      <!-- Slit down the nib, as on a real one -->
      <line x1="-16" y1="0" x2="-2" y2="0" stroke="${INK}" stroke-opacity="0.55"/>
      <circle cx="0" cy="0" r="3" fill="${PAPER}"/>
    </g>
  `;
}

function placeholderFrame(progress) {
  const drawn = Math.max(1, Math.round(progress * SAMPLES));
  const head = PATH_POINTS[drawn];
  const prev = PATH_POINTS[Math.max(0, drawn - 6)];
  const angle = (Math.atan2(head.y - prev.y, head.x - prev.x) * 180) / Math.PI;

  const drawnPath = PATH_POINTS.slice(0, drawn + 1)
    .map((p) => `${p.x.toFixed(1)},${p.y.toFixed(1)}`)
    .join(" ");

  // Destination resolves over the last fifth, so the end has a payoff.
  const arrive = Math.max(0, Math.min(1, (progress - 0.8) / 0.2));
  const ringR = 22 + (1 - arrive) * 46;

  return Buffer.from(`
    <svg xmlns="http://www.w3.org/2000/svg" width="${WIDTH}" height="${HEIGHT}"
         viewBox="0 0 ${WIDTH} ${HEIGHT}">
      ${backdrop()}

      <!-- The whole route, so the destination reads from frame one -->
      <polyline points="${fullPath}" fill="none" stroke="${LIME}"
                stroke-opacity="0.42" stroke-width="2" stroke-dasharray="2 12"
                stroke-linecap="round"/>

      <!-- Drawn so far. Weighted for the ~0.94 downscale that object-cover
           applies at common desktop sizes; 5px rendered thin. -->
      <polyline points="${drawnPath}" fill="none" stroke="${ORANGE}"
                stroke-width="8" stroke-linecap="round" stroke-linejoin="round"/>

      <!-- Origin -->
      <circle cx="${P0.x}" cy="${P0.y}" r="9" fill="${PAPER}"/>

      <!-- Destination -->
      <circle cx="${P3.x}" cy="${P3.y}" r="${ringR.toFixed(1)}" fill="none"
              stroke="${LIME_BRIGHT}" stroke-opacity="${(arrive * 0.6).toFixed(3)}" stroke-width="2"/>
      <circle cx="${P3.x}" cy="${P3.y}" r="${(7 + arrive * 5).toFixed(1)}"
              fill="${LIME_BRIGHT}" fill-opacity="${(0.25 + arrive * 0.75).toFixed(3)}"/>

      ${progress < 0.995 ? nib(head, angle) : ""}
    </svg>
  `);
}

async function buildPlaceholder() {
  for (let i = 0; i < FRAME_COUNT; i++) {
    // Ease so the line starts and lands calmly rather than at constant speed.
    const linear = i / (FRAME_COUNT - 1);
    const eased = linear < 0.5
      ? 2 * linear * linear
      : 1 - (-2 * linear + 2) ** 2 / 2;

    await sharp(placeholderFrame(eased))
      .webp({ quality: 80 })
      .toFile(`${OUT_DIR}/${String(i + 1).padStart(4, "0")}.webp`);
  }
}

/* ------------------------------------------------------------------ */
/* Video: extract → decimate → duotone                                 */
/* ------------------------------------------------------------------ */

/**
 * Mirrors the .kin-photo CSS exactly: greyscale, then ink taken through
 * `lighten` so shadows keep the ground colour, then the brand hue through
 * `darken` so highlights take the tint.
 */
async function duotone(input) {
  const solid = (colour) => ({
    create: {
      width: WIDTH,
      height: HEIGHT,
      channels: 4,
      background: colour,
    },
  });

  return sharp(input)
    .resize(WIDTH, HEIGHT, { fit: "cover" })
    .greyscale()
    .linear(1.12, -8) // match the CSS contrast/brightness nudge
    .composite([
      { input: solid({ r: 11, g: 11, b: 11, alpha: 1 }), blend: "lighten" },
      { input: solid({ r: 120, g: 190, b: 32, alpha: 1 }), blend: "darken" },
    ])
    .webp({ quality: 72 })
    .toBuffer();
}

/** Frames per second, probed. Veo writes 24; assume that if probing fails. */
async function probeFps(videoPath) {
  try {
    const { stdout } = await run("ffprobe", [
      "-v", "error",
      "-select_streams", "v:0",
      "-show_entries", "stream=r_frame_rate",
      "-of", "default=nw=1:nk=1",
      videoPath,
    ]);
    const [num, den] = stdout.trim().split("/").map(Number);
    const fps = den ? num / den : num;
    return Number.isFinite(fps) && fps > 0 ? fps : 24;
  } catch {
    return 24;
  }
}

async function buildFromVideo(videoPath, trimStart, trimEnd) {
  const raw = path.join(OUT_DIR, "_raw");
  await mkdir(raw, { recursive: true });

  console.log("Extracting frames…");
  await run("ffmpeg", [
    "-hide_banner",
    "-loglevel", "error",
    "-i", videoPath,
    "-vf", `scale=${WIDTH}:${HEIGHT}:force_original_aspect_ratio=increase,crop=${WIDTH}:${HEIGHT}`,
    "-y",
    path.join(raw, "%05d.png"),
  ]);

  let all = (await readdir(raw)).filter((f) => f.endsWith(".png")).sort();
  if (all.length === 0) throw new Error("ffmpeg produced no frames");

  // Generated clips rarely start moving on frame one — there is usually a
  // settling moment at the head, and often a drift or hold at the tail.
  // Both are invisible at speed and obvious when scrubbed, so trim them
  // before decimating rather than spending frames on them.
  if (trimStart || trimEnd) {
    const fps = await probeFps(videoPath);
    const head = Math.round(trimStart * fps);
    const tail = Math.round(trimEnd * fps);
    const kept = all.slice(head, all.length - tail);
    if (kept.length < FRAME_COUNT) {
      throw new Error(
        `Trim leaves ${kept.length} frames, fewer than the ${FRAME_COUNT} needed ` +
          `(clip is ${(all.length / fps).toFixed(1)}s at ${fps}fps)`,
      );
    }
    console.log(
      `  trimmed ${trimStart}s head / ${trimEnd}s tail at ${fps}fps ` +
        `→ ${kept.length} of ${all.length} frames`,
    );
    all = kept;
  }

  console.log(`  ${all.length} frames usable, decimating to ${FRAME_COUNT}`);

  for (let i = 0; i < FRAME_COUNT; i++) {
    const pick = all[Math.round((i / (FRAME_COUNT - 1)) * (all.length - 1))];
    const out = await duotone(path.join(raw, pick));
    await writeFile(`${OUT_DIR}/${String(i + 1).padStart(4, "0")}.webp`, out);
  }

  await rm(raw, { recursive: true, force: true });
}

/* ------------------------------------------------------------------ */

const args = process.argv.slice(2);
const flag = (name, fallback = null) => {
  const i = args.indexOf(name);
  return i === -1 ? fallback : args[i + 1];
};
const video = flag("--video");
const trimStart = Number(flag("--trim-start", 0)) || 0;
const trimEnd = Number(flag("--trim-end", 0)) || 0;

await rm(OUT_DIR, { recursive: true, force: true });
await mkdir(OUT_DIR, { recursive: true });

if (video) {
  await buildFromVideo(video, trimStart, trimEnd);
} else {
  console.log("Rendering placeholder sequence…");
  await buildPlaceholder();
}

// Record the shape of the sequence so the component cannot drift from it.
let manifest = {};
try {
  manifest = JSON.parse(await readFile(MANIFEST, "utf8"));
} catch {
  /* first run */
}
manifest[NAME] = {
  frames: FRAME_COUNT,
  width: WIDTH,
  height: HEIGHT,
  source: video ? path.basename(video) : "placeholder",
};
await writeFile(MANIFEST, `${JSON.stringify(manifest, null, 2)}\n`);

const files = (await readdir(OUT_DIR)).filter((f) => f.endsWith(".webp"));
let bytes = 0;
for (const f of files) {
  bytes += (await stat(`${OUT_DIR}/${f}`)).size;
}
console.log(
  `${files.length} frames → ${OUT_DIR}  (${(bytes / 1024).toFixed(0)} KB total, ` +
    `${(bytes / files.length / 1024).toFixed(1)} KB avg)`,
);
