"use client";

import { motion, useReducedMotion, type Variants } from "motion/react";
import type { ReactNode } from "react";

/* ============================================================
   Kinetic Ink motion primitives.

   House easing is a single expressive curve — [0.22, 1, 0.36, 1] —
   used everywhere so the whole site moves with one hand.

   SSR CONTRACT: these must never branch their DOM *structure* on
   useReducedMotion(). That hook resolves false on the server and may
   flip to true after hydration, so a structural branch guarantees a
   hydration mismatch. Reduced motion is expressed only through
   transition timing — duration 0 lands on the finished state instantly.
   ============================================================ */

const EASE = [0.22, 1, 0.36, 1] as const;

function useTiming(duration: number, delay: number) {
  const reduced = useReducedMotion();
  return {
    duration: reduced ? 0 : duration,
    delay: reduced ? 0 : delay,
    ease: EASE,
  };
}

/**
 * Masked line reveal — type rises from behind a hard edge.
 *
 * Deliberately CSS-only rather than Framer-driven: this carries the
 * headline, so it must survive a stalled, throttled, or absent script.
 * The rest state is the finished line; see .kin-mask in globals.css.
 */
export function MaskLine({
  children,
  delay = 0,
  className = "",
}: {
  children: ReactNode;
  delay?: number;
  className?: string;
}) {
  return (
    <span
      className={`kin-mask ${className}`}
      style={{ "--line-delay": `${delay}s` } as React.CSSProperties}
    >
      <span>{children}</span>
    </span>
  );
}

/** Container that staggers its <Item> children. */
export function Stagger({
  children,
  className = "",
  delay = 0,
  gap = 0.08,
}: {
  children: ReactNode;
  className?: string;
  delay?: number;
  gap?: number;
}) {
  const reduced = useReducedMotion();

  const variants: Variants = {
    hidden: {},
    show: {
      transition: {
        staggerChildren: reduced ? 0 : gap,
        delayChildren: reduced ? 0 : delay,
      },
    },
  };

  return (
    <motion.div
      className={className}
      variants={variants}
      initial="hidden"
      whileInView="show"
      viewport={{ once: true, margin: "-10%" }}
    >
      {children}
    </motion.div>
  );
}

/** Child of <Stagger>. Rises and fades on cue. */
export function Item({
  children,
  className = "",
  y = 26,
}: {
  children: ReactNode;
  className?: string;
  y?: number;
}) {
  const transition = useTiming(0.7, 0);

  const variants: Variants = {
    hidden: { opacity: 0, y },
    show: { opacity: 1, y: 0, transition },
  };

  return (
    <motion.div className={className} variants={variants}>
      {children}
    </motion.div>
  );
}

/** Standalone scroll reveal for whole blocks. */
export function Reveal({
  children,
  className = "",
  delay = 0,
  y = 30,
}: {
  children: ReactNode;
  className?: string;
  delay?: number;
  y?: number;
}) {
  const transition = useTiming(0.75, delay);

  return (
    <motion.div
      className={className}
      initial={{ opacity: 0, y }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-10%" }}
      transition={transition}
    >
      {children}
    </motion.div>
  );
}
