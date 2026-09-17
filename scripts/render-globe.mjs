/**
 * Renders the reach section's globe to a seamless looping video.
 *
 *   node scripts/render-globe.mjs            full render + encode
 *   node scripts/render-globe.mjs --preview  six frames as a contact sheet
 *
 * Why a rendered video rather than generated footage or live WebGL:
 * a video model invents continents and cannot place a real route, and
 * the live three.js globe cost every desktop visitor the whole WebGL
 * runtime. Rendering our own scene from Natural Earth land data gives
 * true geography and the real Istanbul → Douala route, and the site then
 * ships a video instead of a 3D engine. three, world-atlas and
 * topojson-client are devDependencies used only here.
 *
 * The scene is rendered in headless Chromium, one frame per exact
 * timestamp, so the output is deterministic.
 *
 * Seamless loop, one element: the globe drifts right-to-left, so the last
 * frame cannot match the first. Instead of cross-fading two <video>
 * elements in JavaScript (double decode, and no loop at all without a
 * script), the cross-fade is baked in: across the final FADE seconds each
 * frame is blended toward the scene as it looked one loop earlier, so the
 * last frame flows straight into the first. Everything else is a
 * function of the phase within the loop, so the blend only ever
 * reconciles the drift — and the route is cleared before the blend
 * window, so it is never doubled.
 */
import http from "node:http";
import path from "node:path";
import { createRequire } from "node:module";
import { execFile } from "node:child_process";
import { promisify } from "node:util";
import { mkdir, readFile, rm, stat, writeFile } from "node:fs/promises";
import { chromium } from "playwright";
import sharp from "sharp";
import { feature } from "topojson-client";

const require = createRequire(import.meta.url);
const run = promisify(execFile);
const PREVIEW = process.argv.includes("--preview");
const KEEP_FRAMES = process.argv.includes("--keep-frames");

/* ---------------------------------------------------------------- */
/* Loop and output                                                   */
/* ---------------------------------------------------------------- */

const W = 1920;
const H = 1080;
const FPS = 24;
const LOOP_S = 10;
const FADE_S = 1.5;
const OUT = "public/globe";
const FRAMES_DIR = path.join(OUT, "_frames");

/* ---------------------------------------------------------------- */
/* Composition — fractions of the frame                              */
/* ---------------------------------------------------------------- */

const SCENE = {
  // A planet rising from the bottom edge: the copy sits above its limb.
  globeRadius: 0.56, // of frame height
  globeCentreY: 0.98, // of frame height, from the top
  // Where the route's midpoint should land on screen. Higher up the cap
  // foreshortens the route, which keeps Douala and its pulse clear of the
  // bottom edge.
  routeAt: { x: 0.5, y: 0.66 },
  driftDeg: 5, // right-to-left over one loop
};

/**
 * The route is drawn once per loop and cleared before the seam. A route
 * that stayed lit would be doubled by the loop blend — two bright arcs a
 * few degrees apart — so the blend window only ever contains the dot
 * field, where the same blend reads as a soft motion trail.
 * Seconds within the loop:
 */
const TIMELINE = {
  pinsIn: [0.3, 0.8], // endpoints appear
  draw: [1.0, 4.2], // the pen travels Istanbul → Douala
  pulseEvery: 1.2, // Douala rings after arrival
  fadeOut: [7.4, 8.2], // route and pins leave together
};

const ISTANBUL = { lat: 41.0082, lon: 28.9784 };
const DOUALA = { lat: 4.0511, lon: 9.7679 };

/* ---------------------------------------------------------------- */
/* Land dots from Natural Earth (110m)                               */
/* ---------------------------------------------------------------- */

const topo = require("world-atlas/land-110m.json");
const polygons = feature(topo, topo.objects.land).features[0].geometry.coordinates.map(
  (rings) => {
    let minX = 180, maxX = -180, minY = 90, maxY = -90;
    for (const [x, y] of rings[0]) {
      if (x < minX) minX = x;
      if (x > maxX) maxX = x;
      if (y < minY) minY = y;
      if (y > maxY) maxY = y;
    }
    return { rings, minX, maxX, minY, maxY };
  },
);

/** Even-odd ray cast across every ring, so lakes stay holes. */
function isLand(lat, lon) {
  for (const p of polygons) {
    if (lon < p.minX || lon > p.maxX || lat < p.minY || lat > p.maxY) continue;
    let inside = false;
    for (const ring of p.rings) {
      for (let i = 0, j = ring.length - 1; i < ring.length; j = i++) {
        const [xi, yi] = ring[i];
        const [xj, yj] = ring[j];
        if (yi > lat !== yj > lat && lon < ((xj - xi) * (lat - yi)) / (yj - yi) + xi) {
          inside = !inside;
        }
      }
    }
    if (inside) return true;
  }
  return false;
}

/**
 * Even-area lat/lon grid with alternate rows offset half a step, so the
 * matrix reads as a woven screen rather than a spreadsheet.
 */
function sampleDots(stepDeg, keep) {
  const out = [];
  let row = 0;
  for (let lat = -90 + stepDeg / 2; lat < 90; lat += stepDeg, row++) {
    const cos = Math.cos((lat * Math.PI) / 180);
    const lonStep = stepDeg / Math.max(cos, 0.04);
    const offset = row % 2 ? lonStep / 2 : 0;
    for (let lon = -180 + offset; lon < 180; lon += lonStep) {
      if (keep(lat, lon)) out.push(lat, lon);
    }
  }
  return out;
}

const landDots = sampleDots(1.0, (lat, lon) => isLand(lat, lon));
const seaDots = sampleDots(2.3, (lat, lon) => !isLand(lat, lon));

/** A small deterministic starfield — same every render. */
function stars(count) {
  let s = 20260917;
  const rnd = () => ((s = (s * 1664525 + 1013904223) >>> 0) / 4294967296);
  const out = [];
  for (let i = 0; i < count; i++) out.push(rnd(), rnd() * 0.72, 0.2 + rnd() * 0.6, 1 + rnd() * 1.6);
  return out;
}

/* ---------------------------------------------------------------- */
/* The page that renders                                             */
/* ---------------------------------------------------------------- */

const PAGE = `<!doctype html><html><head><meta charset="utf-8">
<style>html,body{margin:0;background:#0b0b0b;overflow:hidden}canvas{display:block}</style>
<script type="importmap">{"imports":{"three":"/three/three.module.js"}}</script>
</head><body><script type="module" src="/scene.js"></script></body></html>`;

const SCENE_JS = String.raw`
import * as THREE from "three";

// Exact brand colours out: no colour management, no output conversion.
THREE.ColorManagement.enabled = false;

const INK = 0x0b0b0b, LIME = 0x78be20, LIME_BRIGHT = 0x8fd62c,
      ORANGE = 0xf97316, PAPER = 0xf4f2ec;

function toVector(lat, lon, r = 1) {
  const phi = (90 - lat) * Math.PI / 180;
  const theta = (lon + 180) * Math.PI / 180;
  return new THREE.Vector3(
    -r * Math.sin(phi) * Math.cos(theta),
    r * Math.cos(phi),
    r * Math.sin(phi) * Math.sin(theta),
  );
}

function dotCloud(flat, radius, colour, bright, size) {
  const n = flat.length / 2;
  const pos = new Float32Array(n * 3);
  for (let i = 0; i < n; i++) {
    const v = toVector(flat[i * 2], flat[i * 2 + 1], radius);
    pos[i * 3] = v.x; pos[i * 3 + 1] = v.y; pos[i * 3 + 2] = v.z;
  }
  const geo = new THREE.BufferGeometry();
  geo.setAttribute("position", new THREE.BufferAttribute(pos, 3));
  const mat = new THREE.ShaderMaterial({
    transparent: true,
    depthWrite: false,
    uniforms: {
      uColor: { value: new THREE.Color(colour) },
      uBright: { value: bright },
      uSize: { value: size },
    },
    vertexShader: ${"`"}
      uniform float uSize;
      uniform float uBright;
      varying float vAlpha;
      void main() {
        vec4 mv = modelViewMatrix * vec4(position, 1.0);
        vec3 n = normalize(normalMatrix * normalize(position));
        float facing = dot(n, normalize(-mv.xyz));
        vAlpha = uBright * smoothstep(0.02, 0.4, facing);
        gl_PointSize = uSize * (0.5 + 0.5 * clamp(facing, 0.0, 1.0));
        gl_Position = projectionMatrix * mv;
      }
    ${"`"},
    fragmentShader: ${"`"}
      uniform vec3 uColor;
      varying float vAlpha;
      void main() {
        float d = length(gl_PointCoord - 0.5);
        float a = smoothstep(0.5, 0.34, d) * vAlpha;
        if (a <= 0.003) discard;
        gl_FragColor = vec4(uColor, a);
      }
    ${"`"},
  });
  return new THREE.Points(geo, mat);
}

function graticule(radius) {
  const pts = [];
  const SEG = 120;
  for (const lat of [-60, -30, 0, 30, 60]) {
    for (let i = 0; i < SEG; i++) {
      pts.push(toVector(lat, i / SEG * 360 - 180, radius), toVector(lat, (i + 1) / SEG * 360 - 180, radius));
    }
  }
  for (let m = 0; m < 12; m++) {
    const lon = m / 12 * 360 - 180;
    for (let i = 0; i < SEG / 2; i++) {
      pts.push(toVector(-90 + i / (SEG / 2) * 180, lon, radius), toVector(-90 + (i + 1) / (SEG / 2) * 180, lon, radius));
    }
  }
  return new THREE.LineSegments(
    new THREE.BufferGeometry().setFromPoints(pts),
    new THREE.LineBasicMaterial({ color: LIME, transparent: true, opacity: 0.07 }),
  );
}

let renderer, scene, camera, globe, rim, bead, pulse, curve, cfg, baseY;
let arc, arcIndexCount, origin, dest;
let glow, satellite, orbit, streaks = [];

const clamp01 = (x) => Math.min(1, Math.max(0, x));
const ramp = (t, [a, b]) => clamp01((t - a) / (b - a));
const easeInOut = (x) => (x < 0.5 ? 4 * x * x * x : 1 - Math.pow(-2 * x + 2, 3) / 2);

window.__init = (c) => {
  cfg = c;
  renderer = new THREE.WebGLRenderer({ antialias: true, preserveDrawingBuffer: true });
  renderer.outputColorSpace = THREE.LinearSRGBColorSpace;
  renderer.setPixelRatio(1);
  renderer.setSize(c.W, c.H);
  renderer.setClearColor(INK, 1);
  document.body.appendChild(renderer.domElement);

  scene = new THREE.Scene();
  const FOV = 18;
  camera = new THREE.PerspectiveCamera(FOV, c.W / c.H, 0.1, 200);

  // Place the globe: its projected radius and centre as fractions of H.
  const dist = 1 / c.scene.globeRadius / (2 * Math.tan(FOV / 2 * Math.PI / 180));
  const viewH = 2 * dist * Math.tan(FOV / 2 * Math.PI / 180);
  globe = new THREE.Group();
  globe.position.set(0, -(c.scene.globeCentreY - 0.5) * viewH, -dist);
  scene.add(globe);

  // Starfield, fixed to the camera so the loop blend never ghosts it.
  {
    const s = c.stars, n = s.length / 4;
    const pos = new Float32Array(n * 3), size = new Float32Array(n), alpha = new Float32Array(n);
    const far = 60, fh = 2 * far * Math.tan(FOV / 2 * Math.PI / 180), fw = fh * c.W / c.H;
    for (let i = 0; i < n; i++) {
      pos[i * 3] = (s[i * 4] - 0.5) * fw;
      pos[i * 3 + 1] = (0.5 - s[i * 4 + 1]) * fh;
      pos[i * 3 + 2] = -far;
      alpha[i] = s[i * 4 + 2];
      size[i] = s[i * 4 + 3];
    }
    const g = new THREE.BufferGeometry();
    g.setAttribute("position", new THREE.BufferAttribute(pos, 3));
    g.setAttribute("aSize", new THREE.BufferAttribute(size, 1));
    g.setAttribute("aAlpha", new THREE.BufferAttribute(alpha, 1));
    scene.add(new THREE.Points(g, new THREE.ShaderMaterial({
      transparent: true, depthWrite: false,
      uniforms: { uColor: { value: new THREE.Color(PAPER) } },
      vertexShader: ${"`"}
        attribute float aSize; attribute float aAlpha; varying float vA;
        void main(){ vA = aAlpha * 0.32; gl_PointSize = aSize;
          gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0); }
      ${"`"},
      fragmentShader: ${"`"}
        uniform vec3 uColor; varying float vA;
        void main(){ float d = length(gl_PointCoord - 0.5);
          float a = smoothstep(0.5, 0.2, d) * vA; if (a <= 0.003) discard;
          gl_FragColor = vec4(uColor, a); }
      ${"`"},
    })));
  }

  // Ink core that occludes the far hemisphere, with a thin crisp rim.
  rim = new THREE.ShaderMaterial({
    uniforms: {
      uInk: { value: new THREE.Color(INK) },
      uRim: { value: new THREE.Color(LIME_BRIGHT) },
      uAmt: { value: 0.6 },
    },
    vertexShader: ${"`"}
      varying vec3 vN; varying vec3 vV;
      void main(){ vec4 mv = modelViewMatrix * vec4(position, 1.0);
        vN = normalize(normalMatrix * normal); vV = normalize(-mv.xyz);
        gl_Position = projectionMatrix * mv; }
    ${"`"},
    fragmentShader: ${"`"}
      uniform vec3 uInk; uniform vec3 uRim; uniform float uAmt;
      varying vec3 vN; varying vec3 vV;
      void main(){ float f = 1.0 - max(dot(vN, vV), 0.0);
        float edge = smoothstep(0.9, 1.0, f);
        gl_FragColor = vec4(mix(uInk, uRim, edge * uAmt), 1.0); }
    ${"`"},
  });
  globe.add(new THREE.Mesh(new THREE.SphereGeometry(0.994, 160, 120), rim));

  globe.add(graticule(1.002));
  globe.add(dotCloud(c.seaDots, 1.0, LIME, 0.24, 3.2));
  globe.add(dotCloud(c.landDots, 1.001, LIME_BRIGHT, 0.95, 4.6));

  // Faceted lattice: the icosahedral shell a planet is modelled from.
  globe.add(new THREE.LineSegments(
    new THREE.EdgesGeometry(new THREE.IcosahedronGeometry(1.02, 2)),
    new THREE.LineBasicMaterial({ color: LIME, transparent: true, opacity: 0.075 }),
  ));

  // Atmosphere: an additive shell just outside the limb. Camera-facing
  // and rotation-invariant, so it never ghosts in the loop blend.
  glow = new THREE.Mesh(
    new THREE.SphereGeometry(1.14, 96, 64),
    new THREE.ShaderMaterial({
      transparent: true,
      depthWrite: false,
      side: THREE.BackSide,
      blending: THREE.AdditiveBlending,
      uniforms: { uColor: { value: new THREE.Color(LIME_BRIGHT) }, uAmt: { value: 0.5 } },
      // Per-fragment view direction, not a fixed +Z: the planet sits well
      // below the optical centre, and a fixed direction painted the shell
      // as a flat, hard-edged band. On this back-facing shell the dot
      // product runs from 0 at its own silhouette to about -0.48 where it
      // meets the planet's limb (sqrt(1 - (1/1.14)^2)), so normalising by
      // that gives a glow that is brightest at the limb and gone at the
      // shell's edge.
      vertexShader: ${"`"}
        varying vec3 vN; varying vec3 vV;
        void main(){ vec4 mv = modelViewMatrix * vec4(position, 1.0);
          vN = normalize(normalMatrix * normal); vV = normalize(-mv.xyz);
          gl_Position = projectionMatrix * mv; }
      ${"`"},
      fragmentShader: ${"`"}
        uniform vec3 uColor; uniform float uAmt; varying vec3 vN; varying vec3 vV;
        void main(){ float d = clamp(-dot(vN, vV) / 0.48, 0.0, 1.0);
          float i = pow(d, 2.6);
          gl_FragColor = vec4(uColor * i * uAmt, 1.0); }
      ${"`"},
    }),
  );
  glow.position.copy(globe.position);
  scene.add(glow);

  // An orbit in its own tilted plane, fixed in world space: the
  // satellite's period is the loop, so it never ghosts either.
  orbit = new THREE.Group();
  orbit.position.copy(globe.position);
  orbit.rotation.set(1.22, 0, -0.32);
  scene.add(orbit);
  {
    const pts = [];
    for (let i = 0; i <= 256; i++) {
      const a = i / 256 * Math.PI * 2;
      pts.push(new THREE.Vector3(Math.cos(a) * 1.3, 0, Math.sin(a) * 1.3));
    }
    orbit.add(new THREE.Line(
      new THREE.BufferGeometry().setFromPoints(pts),
      new THREE.LineBasicMaterial({ color: LIME_BRIGHT, transparent: true, opacity: 0.16 }),
    ));
    satellite = new THREE.Group();
    satellite.add(new THREE.Mesh(new THREE.BoxGeometry(0.02, 0.012, 0.012), new THREE.MeshBasicMaterial({ color: PAPER })));
    const panel = new THREE.MeshBasicMaterial({ color: LIME_BRIGHT, side: THREE.DoubleSide });
    const wing = new THREE.PlaneGeometry(0.028, 0.009);
    const left = new THREE.Mesh(wing, panel); left.position.x = -0.026; satellite.add(left);
    const right = new THREE.Mesh(wing, panel); right.position.x = 0.026; satellite.add(right);
    orbit.add(satellite);
  }

  // Light streaks running along parallels — abstract signal, not routes.
  // Head bright, tail dark; additive, so dark reads as transparent.
  for (const [lat, lead] of [[20, 0], [38, 2.1], [54, 4.4]]) {
    const SPAN = 26, SEG = 48;
    const path = new THREE.CatmullRomCurve3(
      Array.from({ length: SEG + 1 }, (_, i) => toVector(lat, -SPAN + i / SEG * SPAN, 1.006)),
    );
    const geo = new THREE.TubeGeometry(path, SEG, 0.0032, 6, false);
    const colors = new Float32Array(geo.attributes.position.count * 3);
    const lime = new THREE.Color(LIME_BRIGHT);
    for (let i = 0; i < geo.attributes.position.count; i++) {
      const ring = Math.floor(i / 7); // radialSegments + 1
      const k = Math.pow(ring / SEG, 2.2);
      colors[i * 3] = lime.r * k; colors[i * 3 + 1] = lime.g * k; colors[i * 3 + 2] = lime.b * k;
    }
    geo.setAttribute("color", new THREE.BufferAttribute(colors, 3));
    const holder = new THREE.Group();
    holder.add(new THREE.Mesh(geo, new THREE.MeshBasicMaterial({
      vertexColors: true, transparent: true, blending: THREE.AdditiveBlending, depthWrite: false,
    })));
    globe.add(holder);
    streaks.push({ holder, lead });
  }

  // The one real route.
  const start = toVector(c.from.lat, c.from.lon);
  const end = toVector(c.to.lat, c.to.lon);
  const mid = start.clone().add(end).multiplyScalar(0.5).normalize().multiplyScalar(1.3);
  curve = new THREE.QuadraticBezierCurve3(start, mid, end);
  // Tube indices run along its length, so a draw range draws it partially.
  arc = new THREE.Mesh(
    new THREE.TubeGeometry(curve, 200, 0.0055, 10, false),
    new THREE.MeshBasicMaterial({ color: ORANGE, transparent: true }),
  );
  arcIndexCount = arc.geometry.index.count;
  globe.add(arc);
  origin = new THREE.Mesh(new THREE.SphereGeometry(0.012, 20, 20), new THREE.MeshBasicMaterial({ color: PAPER, transparent: true }));
  origin.position.copy(start);
  globe.add(origin);
  dest = new THREE.Mesh(new THREE.SphereGeometry(0.014, 20, 20), new THREE.MeshBasicMaterial({ color: LIME_BRIGHT, transparent: true }));
  dest.position.copy(end);
  globe.add(dest);
  pulse = new THREE.Mesh(
    new THREE.RingGeometry(0.02, 0.025, 64),
    new THREE.MeshBasicMaterial({ color: LIME_BRIGHT, transparent: true, side: THREE.DoubleSide, depthWrite: false }),
  );
  pulse.position.copy(end.clone().multiplyScalar(1.004));
  pulse.lookAt(end.clone().multiplyScalar(2));
  globe.add(pulse);
  bead = new THREE.Mesh(new THREE.SphereGeometry(0.009, 16, 16), new THREE.MeshBasicMaterial({ color: PAPER, transparent: true }));
  globe.add(bead);

  // Solve the orientation so the route midpoint lands at scene.routeAt.
  // Euler XYZ applies Ry then Rx to a vector, i.e. spin about the Earth's
  // axis, then tilt — so north stays up and drift is a true rotation.
  scene.updateMatrixWorld();
  const ndc = new THREE.Vector3(c.scene.routeAt.x * 2 - 1, -(c.scene.routeAt.y * 2 - 1), 0.5);
  const dir = ndc.unproject(camera).normalize();
  const ray = new THREE.Ray(new THREE.Vector3(0, 0, 0), dir);
  const hit = ray.intersectSphere(new THREE.Sphere(globe.position, 1), new THREE.Vector3());
  if (!hit) throw new Error("routeAt does not fall on the globe");
  const v = hit.clone().sub(globe.position).normalize();
  const m = start.clone().add(end).normalize();
  const A = Math.hypot(m.x, m.z);
  const phi = Math.atan2(m.z, m.x);
  const rotY = phi - Math.acos(Math.max(-1, Math.min(1, v.x / A)));
  const my = m.clone().applyEuler(new THREE.Euler(0, rotY, 0));
  const rotX = Math.atan2(v.z, v.y) - Math.atan2(my.z, my.y);
  baseY = rotY;
  globe.rotation.set(rotX, rotY, 0);
  globe.updateMatrixWorld();
  const check = m.clone().applyEuler(globe.rotation);
  return { orientationError: check.distanceTo(v), dots: (c.landDots.length + c.seaDots.length) / 2 };
};

/** Render the scene at time t (may be negative: one loop earlier). */
window.__render = (t) => {
  const s = cfg.scene;
  const drift = s.driftDeg * Math.PI / 180 * (0.5 - t / cfg.LOOP_S);
  globe.rotation.y = baseY + drift;

  // Everything below is a function of the phase within the loop, so the
  // scene one loop earlier differs from this one only by the drift.
  const tl = cfg.timeline;
  const ph = ((t % cfg.LOOP_S) + cfg.LOOP_S) % cfg.LOOP_S;
  const out = 1 - ramp(ph, tl.fadeOut);
  const pins = ramp(ph, tl.pinsIn) * out;
  const drawn = easeInOut(ramp(ph, tl.draw));

  origin.material.opacity = pins;
  dest.material.opacity = pins;
  origin.visible = dest.visible = pins > 0.001;

  arc.material.opacity = out;
  arc.visible = drawn > 0 && out > 0.001;
  // Whole segments only: a draw range must end on a triangle boundary.
  const tris = Math.floor((arcIndexCount / 3) * drawn);
  arc.geometry.setDrawRange(0, tris * 3);

  // The bead is the pen tip, present only while drawing.
  const drawing = ph > tl.draw[0] && ph < tl.draw[1];
  bead.visible = drawing;
  if (drawing) {
    bead.position.copy(curve.getPoint(drawn));
    bead.material.opacity = 1;
  }

  // Douala rings once the route has arrived, until the route leaves.
  const since = ph - tl.draw[1];
  if (since >= 0 && out > 0.001) {
    const pt = (since % tl.pulseEvery) / tl.pulseEvery;
    pulse.visible = true;
    pulse.scale.setScalar(1 + pt * 2.4);
    pulse.material.opacity = 0.85 * (1 - pt) * out;
  } else {
    pulse.visible = false;
  }

  rim.uniforms.uAmt.value = 0.68 + 0.14 * Math.sin(2 * Math.PI * t / cfg.LOOP_S);
  glow.material.uniforms.uAmt.value = 0.3 + 0.1 * Math.sin(2 * Math.PI * t / cfg.LOOP_S);

  // One orbit per loop.
  const orbitA = 2 * Math.PI * t / cfg.LOOP_S;
  satellite.position.set(Math.cos(orbitA) * 1.3, 0, Math.sin(orbitA) * 1.3);
  satellite.rotation.y = -orbitA;

  // Streaks lap their parallel once per loop, and are gone before the
  // blend window — they turn with the planet, so they would double.
  const streakOn = ramp(ph, [0.4, 1.0]) * (1 - ramp(ph, [7.8, 8.4]));
  for (const s of streaks) {
    s.holder.rotation.y = 2 * Math.PI * (t / cfg.LOOP_S) + s.lead;
    s.holder.children[0].material.opacity = streakOn;
    s.holder.visible = streakOn > 0.001;
  }

  renderer.render(scene, camera);
  return renderer.domElement.toDataURL("image/png");
};
window.__ready = true;
`;

function serve() {
  // The package's exports map hides build/ paths; its entry point lives
  // in that same directory, alongside three.module.js and three.core.js.
  const threeDir = path.dirname(require.resolve("three"));
  const server = http.createServer(async (req, res) => {
    try {
      if (req.url === "/" || req.url === "/index.html") {
        res.writeHead(200, { "content-type": "text/html" }).end(PAGE);
      } else if (req.url === "/scene.js") {
        res.writeHead(200, { "content-type": "text/javascript" }).end(SCENE_JS);
      } else if (req.url.startsWith("/three/")) {
        const file = path.join(threeDir, path.basename(req.url));
        res.writeHead(200, { "content-type": "text/javascript" }).end(await readFile(file));
      } else {
        res.writeHead(404).end();
      }
    } catch (err) {
      res.writeHead(500).end(String(err));
    }
  });
  return new Promise((resolve) => server.listen(0, () => resolve(server)));
}

const decode = (dataUrl) => Buffer.from(dataUrl.slice(dataUrl.indexOf(",") + 1), "base64");

/** Linear blend of two PNG frames, `w` toward b. */
async function blend(a, b, w) {
  const [ra, rb] = await Promise.all([
    sharp(a).raw().toBuffer({ resolveWithObject: true }),
    sharp(b).raw().toBuffer(),
  ]);
  const out = Buffer.alloc(ra.data.length);
  for (let i = 0; i < out.length; i++) out[i] = ra.data[i] * (1 - w) + rb[i] * w + 0.5;
  return sharp(out, { raw: ra.info }).png().toBuffer();
}

/* ---------------------------------------------------------------- */

const server = await serve();
const port = server.address().port;
const browser = await chromium.launch();
const page = await browser.newPage({ viewport: { width: W, height: H } });
page.on("pageerror", (e) => console.error("page error:", e.message));
await page.goto(`http://127.0.0.1:${port}/`);
await page.waitForFunction(() => window.__ready === true);

const info = await page.evaluate((c) => window.__init(c), {
  W, H, LOOP_S,
  scene: SCENE,
  timeline: TIMELINE,
  from: ISTANBUL,
  to: DOUALA,
  landDots,
  seaDots,
  stars: stars(260),
});
console.log(`scene: ${info.dots} dots, orientation error ${info.orientationError.toExponential(2)}`);

const FRAMES = FPS * LOOP_S;
const fadeFrom = LOOP_S - FADE_S;

async function frameAt(i) {
  const t = i / FPS;
  const current = decode(await page.evaluate((x) => window.__render(x), t));
  if (t < fadeFrom) return current;
  // Reach exactly 1 on the final frame, so it is purely the scene one
  // loop earlier — one frame of drift away from frame 0. Dividing by the
  // full FADE_S left a ~3% ghost on the last frame that vanished at the cut.
  const w = Math.min(1, (t - fadeFrom) / (FADE_S - 1 / FPS));
  const earlier = decode(await page.evaluate((x) => window.__render(x), t - LOOP_S));
  return blend(current, earlier, w);
}

if (PREVIEW) {
  // Empty, drawing, arrived, leaving, mid-seam, last frame.
  const picks = [0, 2.6, 5.0, 7.8, fadeFrom + FADE_S / 2, LOOP_S - 1 / FPS].map((s) => Math.round(s * FPS));
  const tw = 640, th = 360;
  const tiles = [];
  for (const [k, i] of picks.entries()) {
    tiles.push({ input: await sharp(await frameAt(i)).resize(tw, th).toBuffer(), left: (k % 3) * tw, top: Math.floor(k / 3) * th });
  }
  const sheet = process.argv[process.argv.indexOf("--preview") + 1];
  const target = sheet && !sheet.startsWith("--") ? sheet : "globe-preview.png";
  await sharp({ create: { width: tw * 3, height: th * 2, channels: 3, background: "#222" } }).composite(tiles).png().toFile(target);
  await writeFile(target.replace(/\.png$/, "-full.png"), await frameAt(Math.round(5.0 * FPS)));
  console.log(`preview → ${target} (frames ${picks.join(", ")})`);
} else {
  await rm(FRAMES_DIR, { recursive: true, force: true });
  await mkdir(FRAMES_DIR, { recursive: true });
  const started = Date.now();
  for (let i = 0; i < FRAMES; i++) {
    await writeFile(path.join(FRAMES_DIR, `${String(i).padStart(4, "0")}.png`), await frameAt(i));
    if (i % 24 === 0) console.log(`  frame ${i}/${FRAMES}  ${((Date.now() - started) / 1000).toFixed(0)}s`);
  }

  // A field of thousands of moving dots is hard to compress; 1600x900
  // keeps the dots crisp while cutting roughly a third of the pixels.
  const src = path.join(FRAMES_DIR, "%04d.png");
  const scale = ["-vf", "scale=1600:900:flags=lanczos"];
  const ffmpeg = (args) => run("ffmpeg", ["-hide_banner", "-loglevel", "error", "-y", ...args], { maxBuffer: 1 << 26 });
  // One keyframe per loop. Keyframes every 2s made the whole dot field
  // "pop" at each one — measured at ~3x a normal frame-to-frame change —
  // because frames coded against an old keyframe drift from the next.
  // With a single keyframe the only step is at the loop point, which
  // falls in the quiet phase with no route drawn, and both files shrink
  // (AV1 516 → ~300KB). I and P quality are levelled for the same reason.
  const oneKey = String(FPS * LOOP_S);
  await ffmpeg(["-framerate", String(FPS), "-i", src, ...scale, "-c:v", "libsvtav1", "-preset", "5", "-crf", "43", "-pix_fmt", "yuv420p", "-g", oneKey, path.join(OUT, "loop.av1.webm")]);
  await ffmpeg(["-framerate", String(FPS), "-i", src, ...scale, "-c:v", "libx264", "-preset", "slow", "-crf", "29", "-pix_fmt", "yuv420p",
    "-x264-params", `keyint=${oneKey}:min-keyint=${oneKey}:scenecut=0:ipratio=1.0:pbratio=1.0`,
    "-movflags", "+faststart", path.join(OUT, "loop.h264.mp4")]);

  // The poster is not frame 0. It is the only image mobile and
  // reduced-motion visitors see, and frame 0 is the empty globe before
  // the route is drawn — so take the moment the route has arrived.
  // Mobile pair. Below lg the globe is a block at most ~1000 CSS px wide,
  // so 960x540 is enough and roughly a third of the pixels. Same single
  // keyframe, so the loop behaves identically.
  const small = ["-vf", "scale=960:540:flags=lanczos"];
  await ffmpeg(["-framerate", String(FPS), "-i", src, ...small, "-c:v", "libsvtav1", "-preset", "5", "-crf", "42", "-pix_fmt", "yuv420p", "-g", oneKey, path.join(OUT, "loop-sm.av1.webm")]);
  await ffmpeg(["-framerate", String(FPS), "-i", src, ...small, "-c:v", "libx264", "-preset", "slow", "-crf", "32", "-pix_fmt", "yuv420p",
    "-x264-params", `keyint=${oneKey}:min-keyint=${oneKey}:scenecut=0:ipratio=1.0:pbratio=1.0`,
    "-movflags", "+faststart", path.join(OUT, "loop-sm.h264.mp4")]);

  const posterFrame = Math.round((TIMELINE.draw[1] + 0.3) * FPS);
  await sharp(path.join(FRAMES_DIR, `${String(posterFrame).padStart(4, "0")}.png`))
    .resize(1600)
    .webp({ quality: 80 })
    .toFile(path.join(OUT, "poster.webp"));
  if (!KEEP_FRAMES) await rm(FRAMES_DIR, { recursive: true, force: true });

  for (const f of ["poster.webp", "loop.av1.webm", "loop.h264.mp4", "loop-sm.av1.webm", "loop-sm.h264.mp4"]) {
    const { size } = await stat(path.join(OUT, f));
    console.log(`${path.join(OUT, f).padEnd(28)} ${(size / 1024).toFixed(0).padStart(6)} KB`);
  }
}

await browser.close();
server.close();
