"use client";

import { motion, useReducedMotion, type Variants } from "motion/react";

/**
 * Scroll-triggered section reveal.
 *
 * Keeps the original prop shape so existing pages keep working, but the
 * implementation is Framer Motion rather than GSAP + ScrollTrigger —
 * one animation library for the whole site.
 *
 * `staggerClass` is retained for source compatibility; staggering is now
 * expressed with <Stagger>/<Item> from ./motion/Kinetic.
 */
export default function ScrollSection({
  children,
  className = "",
  y = 30,
}: {
  children: React.ReactNode;
  className?: string;
  staggerClass?: string;
  y?: number;
}) {
  const reduced = useReducedMotion();

  // Structure and initial state stay identical across server/client; only
  // the timing responds to reduced motion. See ./motion/Kinetic.tsx.
  const variants: Variants = {
    hidden: { opacity: 0, y },
    show: {
      opacity: 1,
      y: 0,
      transition: { duration: reduced ? 0 : 0.8, ease: [0.22, 1, 0.36, 1] },
    },
  };

  return (
    <motion.section
      className={className}
      variants={variants}
      initial="hidden"
      whileInView="show"
      viewport={{ once: true, margin: "-10%" }}
    >
      {children}
    </motion.section>
  );
}
