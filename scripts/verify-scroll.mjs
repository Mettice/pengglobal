/**
 * Walks every page and fails on the class of bug that typechecks, lints
 * and builds clean while being visibly broken.
 *
 * This exists because two of the worst faults in this project were
 * invisible to every other check:
 *
 *   - the hero headline rendered as blank space, because a scroll
 *     animation stalled mid-flight and never reached its end state
 *   - the globe's route origin sat behind the sphere at rest, under a
 *     comment claiming it faced the viewer
 *
 * Both shipped a green build. Neither would survive this.
 *
 * Checks, per page:
 *
 *   never-visible   Text that never reaches full opacity at ANY scroll
 *                   position. Measured as a maximum across the whole
 *                   page, not per position, so deliberately cross-fading
 *                   copy (the route beats) passes while genuinely
 *                   stalled copy does not.
 *   dead-scroll     A stretch of scrolling where the viewport does not
 *                   change at all. Catches pinned sections whose content
 *                   is not actually advancing.
 *   overflow        Horizontal page scroll, which the design forbids.
 *   contrast        Text below WCAG AA against its resolved background.
 *                   Skipped where an image or canvas sits behind the
 *                   text, since CSS cannot tell us what colour that is —
 *                   a check that cries wolf gets ignored, which is worse
 *                   than not running it.
 *
 * Usage — needs a server already running:
 *   npm run build && npm start
 *   node scripts/verify-scroll.mjs [--base http://localhost:3000] [--all]
 *
 * --all adds mobile (390x844) and reduced-motion passes.
 */
import { chromium } from "playwright";
import sharp from "sharp";

const args = process.argv.slice(2);
const flag = (name, fallback = null) => {
  const i = args.indexOf(name);
  return i === -1 ? fallback : args[i + 1];
};
const BASE = flag("--base", "http://localhost:3000").replace(/\/$/, "");
const ALL = args.includes("--all");

/** Scroll samples per page. Eight is enough to catch a dead pin. */
const SAMPLES = 8;
/** Below this, two frames are the same picture. Tuned on a 64x36 grey. */
const DEAD_THRESHOLD = 0.6;
/** Text is expected to reach at least this opacity somewhere. */
const VISIBLE_MIN = 0.9;

const PASSES = ALL
  ? [
      { name: "desktop", viewport: { width: 1440, height: 900 }, reducedMotion: "no-preference" },
      { name: "mobile", viewport: { width: 390, height: 844 }, reducedMotion: "no-preference" },
      { name: "reduced-motion", viewport: { width: 1440, height: 900 }, reducedMotion: "reduce" },
    ]
  : [
      { name: "desktop", viewport: { width: 1440, height: 900 }, reducedMotion: "no-preference" },
    ];

/** Pages come from the site's own sitemap, so this cannot drift. */
async function urlsFromSitemap() {
  const res = await fetch(`${BASE}/sitemap.xml`);
  if (!res.ok) throw new Error(`sitemap.xml returned ${res.status}`);
  const xml = await res.text();
  const locs = [...xml.matchAll(/<loc>([^<]+)<\/loc>/g)].map((m) => m[1]);
  if (locs.length === 0) throw new Error("sitemap.xml listed no URLs");
  // Rewrite to the base under test; the sitemap carries production URLs.
  return locs.map((u) => BASE + new URL(u).pathname);
}

/** A stable-enough identifier for an element across page states. */
const PATH_FN = `(el) => {
  const parts = [];
  let node = el;
  while (node && node.nodeType === 1 && parts.length < 6) {
    let part = node.tagName.toLowerCase();
    if (node.id) { parts.unshift(part + '#' + node.id); break; }
    const parent = node.parentElement;
    if (parent) {
      const sibs = [...parent.children].filter(c => c.tagName === node.tagName);
      if (sibs.length > 1) part += ':nth(' + sibs.indexOf(node) + ')';
    }
    parts.unshift(part);
    node = node.parentElement;
  }
  return parts.join('>');
}`;

/**
 * Collects text elements with their effective opacity and colours.
 * An IIFE, not a bare arrow: page.evaluate given a string evaluates it as
 * an expression, so an un-invoked function would just return itself.
 */
const COLLECT = `(() => {
  const pathOf = ${PATH_FN};
  const TEXT_TAGS = new Set(['H1','H2','H3','H4','H5','H6','P','LI','A','BLOCKQUOTE','DT','DD','SPAN','FIGCAPTION','BUTTON','LABEL','TD','TH']);

  // Tailwind 4 opacity modifiers (text-paper/80) compute to oklab(), not
  // rgb(). An rgb-only parser silently skipped every such element.
  const fromOklab = (L, A, B) => {
    const l = (L + 0.3963377774*A + 0.2158037573*B) ** 3;
    const m = (L - 0.1055613458*A - 0.0638541728*B) ** 3;
    const s = (L - 0.0894841775*A - 1.2914855480*B) ** 3;
    const lin = [
      4.0767416621*l - 3.3077115913*m + 0.2309699292*s,
      -1.2684380046*l + 2.6097574011*m - 0.3413193965*s,
      -0.0041960863*l - 0.7034186147*m + 1.7076147010*s,
    ];
    const enc = (v) => {
      v = Math.min(1, Math.max(0, v));
      return 255 * (v <= 0.0031308 ? 12.92*v : 1.055*Math.pow(v, 1/2.4) - 0.055);
    };
    return lin.map(enc);
  };
  const parseColour = (s) => {
    let m = s.match(/rgba?\\(([^)]+)\\)/);
    if (m) {
      const p = m[1].split(/[\\s,\\/]+/).filter(Boolean).map(Number);
      return { r: p[0], g: p[1], b: p[2], a: p.length > 3 ? p[3] : 1 };
    }
    m = s.match(/oklab\\(([^)]+)\\)/);
    if (m) {
      const [main, alpha] = m[1].split('/');
      const p = main.trim().split(/\\s+/).map((v) => v.endsWith('%') ? parseFloat(v)/100 : parseFloat(v));
      const [r, g, b] = fromOklab(p[0], p[1], p[2]);
      const a = alpha === undefined ? 1 : (alpha.trim().endsWith('%') ? parseFloat(alpha)/100 : parseFloat(alpha));
      return { r, g, b, a };
    }
    return null;
  };
  const over = (fg, bg) => ({
    r: fg.a*fg.r + (1-fg.a)*bg.r,
    g: fg.a*fg.g + (1-fg.a)*bg.g,
    b: fg.a*fg.b + (1-fg.a)*bg.b,
    a: 1,
  });
  const IMAGE_TAGS = new Set(['IMG','VIDEO','CANVAS','PICTURE','IFRAME']);
  const lum = (c) => {
    const f = (v) => { v /= 255; return v <= 0.03928 ? v/12.92 : Math.pow((v+0.055)/1.055, 2.4); };
    return 0.2126*f(c.r) + 0.7152*f(c.g) + 0.0722*f(c.b);
  };

  const out = [];
  for (const el of document.querySelectorAll('*')) {
    if (!TEXT_TAGS.has(el.tagName)) continue;
    // Only elements that directly own visible text.
    const own = [...el.childNodes].filter(n => n.nodeType === 3).map(n => n.textContent.trim()).join(' ').trim();
    if (own.length < 2) continue;

    const rect = el.getBoundingClientRect();
    const onScreen = rect.bottom > 0 && rect.top < innerHeight && rect.width > 0 && rect.height > 0;
    if (!onScreen) continue;

    // Effective opacity: multiply through ancestors, as the compositor does.
    let opacity = 1, node = el;
    while (node && node.nodeType === 1) {
      const o = parseFloat(getComputedStyle(node).opacity);
      if (!Number.isNaN(o)) opacity *= o;
      node = node.parentElement;
    }

    const cs = getComputedStyle(el);
    const fg = parseColour(cs.color);

    // Resolve the background from what is actually painted under the
    // text, not from the ancestor chain. A fixed header over a hero has no
    // ancestor carrying the footage; walking up found the page's paper
    // ground and reported paper-on-paper for text that sits on video.
    // Probe the centre of the part that is actually on screen. Clamping
    // the full-box centre instead put the point on the sticky header for
    // half-scrolled elements, and measured text against the wrong thing.
    const px = Math.min(innerWidth - 1, Math.max(0, rect.left + rect.width / 2));
    const py = (Math.max(0, rect.top) + Math.min(innerHeight, rect.bottom)) / 2;
    const stack = document.elementsFromPoint(px, py);
    const at = stack.indexOf(el);
    // Skip if anything that is not part of el paints above it there — the
    // text is covered at this point, so its contrast is not what shows.
    const occluded = at === -1 || stack.slice(0, at).some((s) => !el.contains(s));
    let bg = null, imageBehind = false;
    for (const s of occluded ? [] : stack.slice(at)) {
      const scs = getComputedStyle(s);
      if (IMAGE_TAGS.has(s.tagName) || (scs.backgroundImage && scs.backgroundImage !== 'none')) {
        imageBehind = true;
        break;
      }
      const c = parseColour(scs.backgroundColor);
      if (c && c.a >= 0.95) { bg = c; break; }
    }
    if (!occluded && !bg && !imageBehind) bg = parseColour(getComputedStyle(document.body).backgroundColor);

    let contrast = null;
    if (!occluded && fg && bg && !imageBehind) {
      const shown = fg.a < 1 ? over(fg, bg) : fg;
      const l1 = lum(shown), l2 = lum(bg);
      contrast = (Math.max(l1,l2) + 0.05) / (Math.min(l1,l2) + 0.05);
    }

    const size = parseFloat(cs.fontSize);
    const bold = parseInt(cs.fontWeight, 10) >= 700;
    const large = size >= 24 || (size >= 18.66 && bold);

    out.push({
      path: pathOf(el),
      text: own.slice(0, 60),
      opacity: Math.round(opacity * 1000) / 1000,
      contrast: contrast === null ? null : Math.round(contrast * 100) / 100,
      large,
    });
  }
  return {
    elements: out,
    overflow: document.documentElement.scrollWidth - document.documentElement.clientWidth,
  };
})()`;

/** Mean absolute difference of two screenshots, 0-255. */
async function frameDelta(a, b) {
  const prep = (buf) =>
    sharp(buf).greyscale().resize(64, 36, { fit: "fill" }).raw().toBuffer();
  const [x, y] = await Promise.all([prep(a), prep(b)]);
  let sum = 0;
  for (let i = 0; i < x.length; i++) sum += Math.abs(x[i] - y[i]);
  return sum / x.length;
}

/**
 * Waits for entrance animations to land before measuring.
 *
 * A fixed pause flagged scroll-triggered entrances as never-visible: a
 * 1.4s reveal sampled at 650ms reads as faded, and by the next sample the
 * section has scrolled away. This waits for every finite animation to
 * finish instead — looping ones (drift, marquee, scroll cue) never will,
 * so they are ignored. An animation that has genuinely stalled never
 * finishes either, so the cap is reached and the stalled state is what
 * gets measured, which is what should be reported.
 */
async function settle(page) {
  await page.waitForTimeout(250); // let scroll-triggered observers fire
  await page.evaluate(
    (cap) =>
      Promise.race([
        Promise.all(
          document
            .getAnimations()
            .filter((a) => a.effect?.getTiming().iterations !== Infinity)
            .map((a) => a.finished.catch(() => {})),
        ),
        new Promise((resolve) => setTimeout(resolve, cap)),
      ]),
    3000,
  );
}

async function checkPage(context, url) {
  const page = await context.newPage();
  const problems = [];
  try {
    await page.goto(url, { waitUntil: "networkidle", timeout: 45000 });
    // Let entrance animations finish before measuring anything.
    await page.waitForTimeout(1200);

    const height = await page.evaluate(
      "document.documentElement.scrollHeight - innerHeight",
    );
    const maxOpacity = new Map();
    const worstContrast = new Map();
    const texts = new Map();
    const shots = [];
    let overflow = 0;

    for (let i = 0; i < SAMPLES; i++) {
      const y = height > 0 ? Math.round((i / (SAMPLES - 1)) * height) : 0;
      await page.evaluate((top) => scrollTo(0, top), y);
      await settle(page);

      const { elements, overflow: ov } = await page.evaluate(COLLECT);
      overflow = Math.max(overflow, ov);

      for (const el of elements) {
        const prev = maxOpacity.get(el.path) ?? 0;
        if (el.opacity > prev) maxOpacity.set(el.path, el.opacity);
        texts.set(el.path, el);
        // Keep each element's worst reading across samples; report once.
        if (el.contrast !== null) {
          const seen = worstContrast.get(el.path);
          if (!seen || el.contrast < seen.contrast) worstContrast.set(el.path, el);
        }
      }
      shots.push(await page.screenshot({ type: "png" }));
      if (height === 0) break;
    }

    for (const el of worstContrast.values()) {
      const min = el.large ? 3 : 4.5;
      if (el.contrast < min) {
        problems.push(`contrast ${el.contrast.toFixed(2)} < ${min}  "${el.text}"`);
      }
    }

    for (const [path, max] of maxOpacity) {
      if (max < VISIBLE_MIN) {
        problems.push(
          `never-visible  max opacity ${max}  "${texts.get(path).text}"  [${path}]`,
        );
      }
    }

    for (let i = 1; i < shots.length; i++) {
      const delta = await frameDelta(shots[i - 1], shots[i]);
      if (delta < DEAD_THRESHOLD) {
        problems.push(
          `dead-scroll  no change between sample ${i - 1} and ${i} (delta ${delta.toFixed(2)})`,
        );
      }
    }

    if (overflow > 1) {
      problems.push(`overflow  page scrolls horizontally by ${overflow}px`);
    }
  } catch (err) {
    problems.push(`error  ${err.message}`);
  } finally {
    await page.close();
  }
  // Duplicates are noise; the same fault repeats at every sample.
  return [...new Set(problems)];
}

const urls = await urlsFromSitemap();
console.log(`Verifying ${urls.length} pages against ${BASE}\n`);

const browser = await chromium.launch();
let failures = 0;

for (const pass of PASSES) {
  console.log(`── ${pass.name} ${"─".repeat(Math.max(0, 46 - pass.name.length))}`);
  const context = await browser.newContext({
    viewport: pass.viewport,
    reducedMotion: pass.reducedMotion,
  });

  for (const url of urls) {
    const problems = await checkPage(context, url);
    const path = new URL(url).pathname;
    if (problems.length === 0) {
      console.log(`  ok    ${path}`);
    } else {
      failures += problems.length;
      console.log(`  FAIL  ${path}`);
      for (const p of problems) console.log(`          ${p}`);
    }
  }

  await context.close();
  console.log("");
}

await browser.close();

if (failures > 0) {
  console.log(`${failures} problem(s) found.`);
  process.exit(1);
}
console.log("No problems found.");
