"use client";

import { motion, useScroll, useSpring } from "motion/react";
import { usePathname } from "next/navigation";

/**
 * Minimalist, tactile scroll progress bar fixed at the very top of the viewport.
 * Uses spring physics to follow Lenis smooth scrolling with zero lag or stutter.
 */
export default function ScrollProgress() {
  const { scrollYProgress } = useScroll();
  const scaleX = useSpring(scrollYProgress, {
    stiffness: 120,
    damping: 30,
    restDelta: 0.001,
  });

  const pathname = usePathname();
  const isPengEdition = pathname.includes("/peng-edition");

  return (
    <motion.div
      style={{ scaleX }}
      className={`fixed top-0 left-0 right-0 z-[120] h-[3px] origin-left pointer-events-none transition-colors duration-300 ${
        isPengEdition
          ? "bg-orange shadow-[0_1px_8px_rgba(242,101,34,0.6)]"
          : "bg-lime shadow-[0_1px_8px_rgba(154,205,50,0.6)]"
      }`}
      aria-hidden
    />
  );
}
