"use client";

import { useEffect, useRef } from "react";
import * as THREE from "three";

// Istanbul (PENSAN's home) → Douala, Cameroon (Peng Global Holding).
const ISTANBUL = { lat: 41.0082, lon: 28.9784 };
const DOUALA = { lat: 4.0511, lon: 9.7679 };

const RADIUS = 1;

// Kinetic Ink palette, as three.js colours.
const INK = 0x0b0b0b;
const LIME = 0x78be20;
const LIME_BRIGHT = 0x8fd62c;
const ORANGE = 0xf97316;
const PAPER = 0xf4f2ec;

/** Lat/lon (degrees) → point on the sphere. */
function toVector(lat: number, lon: number, radius = RADIUS) {
  const phi = (90 - lat) * (Math.PI / 180);
  const theta = (lon + 180) * (Math.PI / 180);
  return new THREE.Vector3(
    -radius * Math.sin(phi) * Math.cos(theta),
    radius * Math.cos(phi),
    radius * Math.sin(phi) * Math.sin(theta),
  );
}

/**
 * Builds a proper graticule — real parallels and meridians.
 *
 * The previous version used WireframeGeometry(SphereGeometry), which draws
 * every triangle edge including the diagonals. That reads as mesh noise,
 * not as a globe. Latitude circles and longitude half-circles are what
 * makes an engraved globe legible as one.
 */
function buildGraticule(
  radius: number,
  { parallels, meridians }: { parallels: number[]; meridians: number },
) {
  const points: THREE.Vector3[] = [];
  const SEG = 96;

  for (const lat of parallels) {
    for (let i = 0; i < SEG; i++) {
      points.push(toVector(lat, (i / SEG) * 360 - 180, radius));
      points.push(toVector(lat, ((i + 1) / SEG) * 360 - 180, radius));
    }
  }

  for (let m = 0; m < meridians; m++) {
    const lon = (m / meridians) * 360 - 180;
    for (let i = 0; i < SEG / 2; i++) {
      points.push(toVector(-90 + (i / (SEG / 2)) * 180, lon, radius));
      points.push(toVector(-90 + ((i + 1) / (SEG / 2)) * 180, lon, radius));
    }
  }

  return new THREE.BufferGeometry().setFromPoints(points);
}

/**
 * The route the business actually runs, drawn as an engraved plate.
 *
 * Styling follows Kinetic Ink rather than the default "glowing tech orb":
 * an ink sphere that only occludes, a hard lime graticule, and the route
 * in Peng Edition orange so the one line that carries meaning is the one
 * line that is hot. No atmosphere shader — a soft halo is the single most
 * generic thing a WebGL globe can do.
 *
 * The two endpoints carry HTML labels tracking their projected positions,
 * because an arc between two unnamed dots on a featureless sphere states
 * nothing. There is no coastline data in the project, so the labels are
 * what make the geography legible.
 *
 * Rendered only behind the useEnhanced() gate — callers supply the static
 * fallback for mobile, reduced-motion, and data-saver visitors.
 */
export default function ConnectionGlobe({
  originLabel,
  destinationLabel,
}: {
  originLabel: string;
  destinationLabel: string;
}) {
  const mountRef = useRef<HTMLDivElement>(null);
  const originRef = useRef<HTMLSpanElement>(null);
  const destRef = useRef<HTMLSpanElement>(null);

  useEffect(() => {
    const mount = mountRef.current;
    if (!mount) return;

    const size = mount.clientWidth;
    const scene = new THREE.Scene();

    const camera = new THREE.PerspectiveCamera(38, 1, 0.1, 100);
    camera.position.z = 3.2;

    let renderer: THREE.WebGLRenderer;
    try {
      renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    } catch {
      return; // No WebGL — the static fallback stays visible.
    }
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.setSize(size, size);
    mount.appendChild(renderer.domElement);
    renderer.domElement.style.cursor = "grab";

    // Everything rotates as one group.
    const globe = new THREE.Group();
    scene.add(globe);

    // --- Core: near-ink. Its job is to occlude the far hemisphere, not to
    //     be seen. Flat-shaded (Basic) because a lit sphere with no texture
    //     just produces a grey gradient that muddies the linework.
    const core = new THREE.Mesh(
      new THREE.SphereGeometry(RADIUS, 64, 64),
      new THREE.MeshBasicMaterial({ color: INK }),
    );
    globe.add(core);

    // --- Graticule: the structure, and the only thing describing the form.
    const graticule = new THREE.LineSegments(
      buildGraticule(RADIUS * 1.001, {
        parallels: [-60, -30, 30, 60],
        meridians: 12,
      }),
      new THREE.LineBasicMaterial({
        color: LIME,
        transparent: true,
        opacity: 0.34,
      }),
    );
    globe.add(graticule);

    // Equator carries more weight, as on a printed globe.
    const equator = new THREE.LineSegments(
      buildGraticule(RADIUS * 1.002, { parallels: [0], meridians: 0 }),
      new THREE.LineBasicMaterial({
        color: LIME_BRIGHT,
        transparent: true,
        opacity: 0.6,
      }),
    );
    globe.add(equator);

    // --- Plate edge: a hard ring just outside the silhouette. Added to the
    //     scene, not the globe, so it stays put while the globe turns.
    const rim = new THREE.Mesh(
      new THREE.RingGeometry(RADIUS * 1.035, RADIUS * 1.045, 128),
      new THREE.MeshBasicMaterial({
        color: LIME,
        transparent: true,
        opacity: 0.4,
        side: THREE.DoubleSide,
      }),
    );
    scene.add(rim);

    // --- The route: Istanbul → Douala ------------------------------------
    const start = toVector(ISTANBUL.lat, ISTANBUL.lon);
    const end = toVector(DOUALA.lat, DOUALA.lon);
    // Lift the midpoint off the surface so the arc bows outward.
    const mid = start
      .clone()
      .add(end)
      .multiplyScalar(0.5)
      .normalize()
      .multiplyScalar(RADIUS * 1.32);
    const curve = new THREE.QuadraticBezierCurve3(start, mid, end);

    const arc = new THREE.Mesh(
      new THREE.TubeGeometry(curve, 96, 0.011, 8, false),
      new THREE.MeshBasicMaterial({ color: ORANGE }),
    );
    globe.add(arc);

    // Endpoint markers.
    const originDot = new THREE.Mesh(
      new THREE.SphereGeometry(0.026, 16, 16),
      new THREE.MeshBasicMaterial({ color: PAPER }),
    );
    originDot.position.copy(start);
    globe.add(originDot);

    const destDot = new THREE.Mesh(
      new THREE.SphereGeometry(0.032, 16, 16),
      new THREE.MeshBasicMaterial({ color: LIME_BRIGHT }),
    );
    destDot.position.copy(end);
    globe.add(destDot);

    // Pulse ring over Douala, lying flat against the surface.
    const pulse = new THREE.Mesh(
      new THREE.RingGeometry(0.042, 0.05, 48),
      new THREE.MeshBasicMaterial({
        color: LIME_BRIGHT,
        transparent: true,
        side: THREE.DoubleSide,
      }),
    );
    pulse.position.copy(end.clone().multiplyScalar(1.01));
    pulse.lookAt(end.clone().multiplyScalar(2));
    globe.add(pulse);

    // A travelling bead along the arc — the shipment in motion.
    const bead = new THREE.Mesh(
      new THREE.SphereGeometry(0.019, 12, 12),
      new THREE.MeshBasicMaterial({ color: PAPER, transparent: true }),
    );
    globe.add(bead);

    // Rest with the route facing the viewer.
    //
    // Derived from the endpoints rather than hardcoded. The previous fixed
    // rotation.y of -0.35 claimed to do this but left Istanbul at z=-0.12,
    // i.e. behind the sphere — the origin of the route the section is
    // about was never visible until you dragged it into view. Computing it
    // also means the framing survives a change of city.
    const midpoint = start.clone().add(end).normalize();
    const restY = Math.atan2(midpoint.z, midpoint.x) - Math.PI / 2;
    globe.rotation.y = restY;
    // Tilt to most of the midpoint's latitude — all of it would put the
    // route dead centre, which reads flat.
    globe.rotation.x = Math.asin(midpoint.y) * 0.7;

    // --- Interaction ------------------------------------------------------
    // The globe does not spin freely. This section exists to explain one
    // route, and a continuous rotation carries that route out of sight
    // every few seconds — the reader loses the thing they came to read.
    // Instead it sways gently around the resting angle, and a drag adds an
    // offset that decays so the view always settles back on the route.
    let dragging = false;
    let lastX = 0;
    let velocity = 0;
    let offset = 0;

    const onPointerDown = (e: PointerEvent) => {
      dragging = true;
      lastX = e.clientX;
      renderer.domElement.style.cursor = "grabbing";
    };
    const onPointerMove = (e: PointerEvent) => {
      if (!dragging) return;
      const delta = (e.clientX - lastX) * 0.005;
      offset += delta;
      velocity = delta;
      lastX = e.clientX;
    };
    const onPointerUp = () => {
      dragging = false;
      renderer.domElement.style.cursor = "grab";
    };

    renderer.domElement.addEventListener("pointerdown", onPointerDown);
    window.addEventListener("pointermove", onPointerMove);
    window.addEventListener("pointerup", onPointerUp);

    const onResize = () => {
      const next = mount.clientWidth;
      if (!next) return;
      renderer.setSize(next, next);
      camera.aspect = 1;
      camera.updateProjectionMatrix();
    };
    window.addEventListener("resize", onResize);

    // --- Label tracking ---------------------------------------------------
    // Project each endpoint to screen space and park its label there,
    // fading it out as the point rotates behind the sphere.
    const projected = new THREE.Vector3();

    const placeLabel = (
      el: HTMLSpanElement | null,
      local: THREE.Vector3,
      offsetY: number,
    ) => {
      if (!el) return;
      projected.copy(local).applyMatrix4(globe.matrixWorld);

      // Facing test: compare the point's direction against the camera's.
      const facing = projected.clone().normalize().dot(new THREE.Vector3(0, 0, 1));
      projected.project(camera);

      const w = mount.clientWidth;
      const x = (projected.x * 0.5 + 0.5) * w;
      const y = (-projected.y * 0.5 + 0.5) * w;

      el.style.transform = `translate(-50%, ${offsetY}px) translate(${x}px, ${y}px)`;
      // Fade across the limb rather than popping at exactly 90°.
      el.style.opacity = String(Math.max(0, Math.min(1, (facing - 0.02) * 6)));
    };

    // --- Render loop ------------------------------------------------------
    const timer = new THREE.Timer();
    timer.connect(document);
    let frame = 0;

    const tick = (timestamp: number) => {
      timer.update(timestamp);
      const t = timer.getElapsed();

      if (!dragging) {
        // Ease out the throw, then draw the offset back to zero so the
        // route returns to face the reader on its own.
        velocity *= 0.95;
        offset += velocity;
        offset *= 0.99;
      }

      // Idle sway around the resting angle — enough that the object reads
      // as live, small enough that the arc never leaves the front face.
      globe.rotation.y = restY + offset + Math.sin(t * 0.22) * 0.16;
      globe.updateMatrixWorld();

      // Bead travels the arc on a loop.
      const progress = (t * 0.22) % 1;
      bead.position.copy(curve.getPoint(progress));
      (bead.material as THREE.MeshBasicMaterial).opacity =
        progress < 0.06 || progress > 0.94 ? 0 : 1;

      // Pulse ring breathes.
      const beat = (Math.sin(t * 2) + 1) / 2;
      pulse.scale.setScalar(1 + beat * 0.7);
      (pulse.material as THREE.MeshBasicMaterial).opacity = 0.75 - beat * 0.6;

      placeLabel(originRef.current, start, -30);
      placeLabel(destRef.current, end, 18);

      renderer.render(scene, camera);
      frame = requestAnimationFrame(tick);
    };
    frame = requestAnimationFrame(tick);
    // Paint one frame immediately so the globe is present even if the
    // environment never schedules an animation frame.
    globe.updateMatrixWorld();
    renderer.render(scene, camera);

    requestAnimationFrame(() => {
      renderer.domElement.style.opacity = "1";
    });
    renderer.domElement.style.transition = "opacity 700ms ease";
    renderer.domElement.style.opacity = "0";

    return () => {
      cancelAnimationFrame(frame);
      timer.dispose();
      renderer.domElement.removeEventListener("pointerdown", onPointerDown);
      window.removeEventListener("pointermove", onPointerMove);
      window.removeEventListener("pointerup", onPointerUp);
      window.removeEventListener("resize", onResize);
      scene.traverse((obj) => {
        if (obj instanceof THREE.Mesh || obj instanceof THREE.LineSegments) {
          obj.geometry.dispose();
          const mat = obj.material;
          if (Array.isArray(mat)) mat.forEach((m) => m.dispose());
          else mat.dispose();
        }
      });
      renderer.dispose();
      if (renderer.domElement.parentNode === mount) {
        mount.removeChild(renderer.domElement);
      }
    };
  }, []);

  return (
    <div className="relative aspect-square w-full max-w-[520px]">
      <div ref={mountRef} aria-hidden className="absolute inset-0" />

      {/* Labels are positioned from the render loop. aria-hidden because
          the same two places are already named in the route chips beside
          the globe — announcing them twice would be noise. */}
      <span
        ref={originRef}
        aria-hidden
        className="kin-mono pointer-events-none absolute left-0 top-0 whitespace-nowrap border border-paper/30 bg-ink/80 px-2 py-1 text-paper opacity-0"
      >
        {originLabel}
      </span>
      <span
        ref={destRef}
        aria-hidden
        className="kin-mono pointer-events-none absolute left-0 top-0 whitespace-nowrap border border-lime bg-lime px-2 py-1 text-ink opacity-0"
      >
        {destinationLabel}
      </span>
    </div>
  );
}
