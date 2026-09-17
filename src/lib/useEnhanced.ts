"use client";

import { useEffect, useState } from "react";

/**
 * Progressive-enhancement gate for the heavy/animated visuals.
 *
 * Returns true only when the device and the user's stated preferences can
 * comfortably afford the full experience. Everything gated behind this must
 * have a static fallback that renders first — audience 3 (schools) is on
 * slow, expensive mobile data and sets the performance budget.
 */
export function useEnhanced({
  minWidth = 1024,
  requireFinePointer = true,
}: { minWidth?: number; requireFinePointer?: boolean } = {}) {
  const [enhanced, setEnhanced] = useState(false);

  useEffect(() => {
    const evaluate = () => {
      if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
        return false;
      }
      if (window.innerWidth < minWidth) return false;
      if (
        requireFinePointer &&
        !window.matchMedia("(pointer: fine)").matches
      ) {
        return false;
      }
      // Respect data-saver and very slow connections when exposed.
      const conn = (
        navigator as Navigator & {
          connection?: { saveData?: boolean; effectiveType?: string };
        }
      ).connection;
      if (conn?.saveData) return false;
      if (conn?.effectiveType && /2g/.test(conn.effectiveType)) return false;

      return true;
    };

    const update = () => setEnhanced(evaluate());
    update();

    const motionQuery = window.matchMedia("(prefers-reduced-motion: reduce)");
    motionQuery.addEventListener("change", update);
    window.addEventListener("resize", update);
    return () => {
      motionQuery.removeEventListener("change", update);
      window.removeEventListener("resize", update);
    };
  }, [minWidth, requireFinePointer]);

  return enhanced;
}

/**
 * Gate for the ambient background loops, which every device may play.
 *
 * Unlike useEnhanced this ignores width and pointer: the loops are a few
 * hundred KB, muted and inline, and phones get their own smaller cut.
 * Reduced motion, data saver and 2g still keep the poster. `small` is
 * true while `smallQuery` matches, so the caller can pick that cut; it is
 * re-evaluated on resize and rotation.
 */
export function useAmbientVideo(smallQuery: string) {
  const [state, setState] = useState({ allowed: false, small: false });

  useEffect(() => {
    const motion = window.matchMedia("(prefers-reduced-motion: reduce)");
    const small = window.matchMedia(smallQuery);

    const update = () => {
      const conn = (
        navigator as Navigator & {
          connection?: { saveData?: boolean; effectiveType?: string };
        }
      ).connection;
      const allowed =
        !motion.matches &&
        !conn?.saveData &&
        !(conn?.effectiveType && /2g/.test(conn.effectiveType));
      setState((prev) =>
        prev.allowed === allowed && prev.small === small.matches
          ? prev
          : { allowed, small: small.matches },
      );
    };

    update();
    motion.addEventListener("change", update);
    small.addEventListener("change", update);
    return () => {
      motion.removeEventListener("change", update);
      small.removeEventListener("change", update);
    };
  }, [smallQuery]);

  return state;
}

/** Reduced-motion only — for lightweight CSS/SVG effects that mobile can afford. */
export function useMotionAllowed() {
  const [allowed, setAllowed] = useState(false);

  useEffect(() => {
    const query = window.matchMedia("(prefers-reduced-motion: reduce)");
    const update = () => setAllowed(!query.matches);
    update();
    query.addEventListener("change", update);
    return () => query.removeEventListener("change", update);
  }, []);

  return allowed;
}
