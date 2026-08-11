"use client";

import { ReactLenis } from "lenis/react";

/**
 * Smooth scrolling. Framer Motion's whileInView reads native scroll
 * position, so no ticker wiring is needed — Lenis just drives the scroll.
 */
export default function LenisProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <ReactLenis root options={{ lerp: 0.1, duration: 1.2, syncTouch: true }}>
      {children}
    </ReactLenis>
  );
}
