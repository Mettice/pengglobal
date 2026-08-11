"use client";

import { useEffect, useRef } from "react";
import * as THREE from "three";

// Turkey (PENSAN's origin) → Douala, Cameroon (Peng Global Holding).
const ISTANBUL = { lat: 41.0082, lon: 28.9784 };
const DOUALA = { lat: 4.0511, lon: 9.7679 };

const RADIUS = 1;

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
 * Interactive globe drawing the route the business actually runs:
 * an international manufacturer → Cameroon & CEMAC. Drag to spin.
 *
 * Rendered only behind the useEnhanced() gate — callers supply the static
 * fallback for mobile, reduced-motion, and data-saver visitors.
 */
export default function ConnectionGlobe() {
  const mountRef = useRef<HTMLDivElement>(null);

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

    // --- Core sphere: deep brand green, subtly lit -----------------------
    const core = new THREE.Mesh(
      new THREE.SphereGeometry(RADIUS, 64, 64),
      new THREE.MeshPhongMaterial({
        color: 0x1b2c0d,
        emissive: 0x0d1608,
        shininess: 12,
        transparent: true,
        opacity: 0.95,
      }),
    );
    globe.add(core);

    // --- Latitude/longitude wireframe: the "engineered" look -------------
    const grid = new THREE.LineSegments(
      new THREE.WireframeGeometry(
        new THREE.SphereGeometry(RADIUS * 1.002, 36, 24),
      ),
      new THREE.LineBasicMaterial({
        color: 0x78be20,
        transparent: true,
        opacity: 0.13,
      }),
    );
    globe.add(grid);

    // --- Atmosphere glow -------------------------------------------------
    const glow = new THREE.Mesh(
      new THREE.SphereGeometry(RADIUS * 1.16, 48, 48),
      new THREE.ShaderMaterial({
        transparent: true,
        side: THREE.BackSide,
        blending: THREE.AdditiveBlending,
        uniforms: { uColor: { value: new THREE.Color(0x78be20) } },
        vertexShader: `
          varying vec3 vNormal;
          void main() {
            vNormal = normalize(normalMatrix * normal);
            gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
          }
        `,
        fragmentShader: `
          varying vec3 vNormal;
          uniform vec3 uColor;
          void main() {
            float intensity = pow(0.62 - dot(vNormal, vec3(0.0, 0.0, 1.0)), 3.0);
            gl_FragColor = vec4(uColor, 1.0) * intensity;
          }
        `,
      }),
    );
    scene.add(glow);

    // --- The route arc: Turkey → Douala ----------------------------------
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
      new THREE.TubeGeometry(curve, 64, 0.008, 8, false),
      new THREE.MeshBasicMaterial({ color: 0xc5a880 }),
    );
    globe.add(arc);

    // Endpoint markers — gold for origin, brand green for destination.
    const originDot = new THREE.Mesh(
      new THREE.SphereGeometry(0.022, 16, 16),
      new THREE.MeshBasicMaterial({ color: 0xdfd3c3 }),
    );
    originDot.position.copy(start);
    globe.add(originDot);

    const destDot = new THREE.Mesh(
      new THREE.SphereGeometry(0.03, 16, 16),
      new THREE.MeshBasicMaterial({ color: 0x9ade3f }),
    );
    destDot.position.copy(end);
    globe.add(destDot);

    // Pulse ring over Douala, oriented flat against the surface.
    const pulse = new THREE.Mesh(
      new THREE.RingGeometry(0.04, 0.052, 32),
      new THREE.MeshBasicMaterial({
        color: 0x78be20,
        transparent: true,
        side: THREE.DoubleSide,
      }),
    );
    pulse.position.copy(end.clone().multiplyScalar(1.01));
    pulse.lookAt(end.clone().multiplyScalar(2));
    globe.add(pulse);

    // A travelling bead along the arc — the shipment in motion.
    const bead = new THREE.Mesh(
      new THREE.SphereGeometry(0.017, 12, 12),
      new THREE.MeshBasicMaterial({ color: 0xffffff }),
    );
    globe.add(bead);

    scene.add(new THREE.AmbientLight(0xffffff, 0.55));
    const key = new THREE.DirectionalLight(0xbfe98a, 1.15);
    key.position.set(-1.5, 1.2, 2.5);
    scene.add(key);

    // Orient so Africa/Europe — the route's two ends — face the viewer.
    globe.rotation.y = -0.35;
    globe.rotation.x = 0.18;

    // --- Interaction ------------------------------------------------------
    let dragging = false;
    let lastX = 0;
    let velocity = 0;

    const onPointerDown = (e: PointerEvent) => {
      dragging = true;
      lastX = e.clientX;
      renderer.domElement.style.cursor = "grabbing";
    };
    const onPointerMove = (e: PointerEvent) => {
      if (!dragging) return;
      const delta = (e.clientX - lastX) * 0.005;
      globe.rotation.y += delta;
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

    // --- Render loop ------------------------------------------------------
    const clock = new THREE.Clock();
    let frame = 0;

    const tick = () => {
      const t = clock.getElapsedTime();

      if (!dragging) {
        // Ease out any drag momentum, then resume the slow drift.
        velocity *= 0.95;
        globe.rotation.y += velocity + 0.0016;
      }

      // Bead travels the arc on a loop.
      const progress = (t * 0.22) % 1;
      bead.position.copy(curve.getPoint(progress));
      (bead.material as THREE.MeshBasicMaterial).opacity =
        progress < 0.06 || progress > 0.94 ? 0 : 1;
      (bead.material as THREE.MeshBasicMaterial).transparent = true;

      // Pulse ring breathes.
      const beat = (Math.sin(t * 2) + 1) / 2;
      pulse.scale.setScalar(1 + beat * 0.7);
      (pulse.material as THREE.MeshBasicMaterial).opacity = 0.75 - beat * 0.6;

      renderer.render(scene, camera);
      frame = requestAnimationFrame(tick);
    };
    frame = requestAnimationFrame(tick);
    // Paint one frame immediately so the globe is present even if the
    // environment never schedules an animation frame.
    renderer.render(scene, camera);

    requestAnimationFrame(() => {
      renderer.domElement.style.opacity = "1";
    });
    renderer.domElement.style.transition = "opacity 700ms ease";
    renderer.domElement.style.opacity = "0";

    return () => {
      cancelAnimationFrame(frame);
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
    <div
      ref={mountRef}
      aria-hidden
      className="aspect-square w-full max-w-[520px]"
    />
  );
}
