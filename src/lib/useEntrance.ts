"use client";

import { useEffect, type RefObject } from "react";

/**
 * Plays a section's CSS entrance once, as it scrolls into view.
 *
 * Drives the data-entrance states defined in globals.css. The rules that
 * matter:
 *
 * - It only arms a section that starts entirely below the viewport. A
 *   section already on screen at mount has been painted finished by the
 *   server; hiding it to replay an entrance would be a visible flash.
 * - Reduced motion never arms, so those readers get the finished design.
 * - Once the element marked data-entrance-last finishes (or maxMs passes,
 *   whichever is first) the attribute is removed, so no entrance rule
 *   matches any more and the page is plain static design again.
 *
 * Without JavaScript nothing is ever armed, so nothing is ever hidden.
 */
export function useEntrance(
  ref: RefObject<HTMLElement | null>,
  maxMs = 2800,
) {
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    if (el.getBoundingClientRect().top < window.innerHeight) return;

    el.dataset.entrance = "armed";

    let finished = false;
    let timer = 0;

    const finish = () => {
      if (finished) return;
      finished = true;
      window.clearTimeout(timer);
      el.removeEventListener("animationend", onEnd);
      delete el.dataset.entrance;
    };

    const onEnd = (e: AnimationEvent) => {
      if ((e.target as Element).hasAttribute("data-entrance-last")) finish();
    };

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (!entry.isIntersecting) return;
        observer.disconnect();
        el.addEventListener("animationend", onEnd);
        timer = window.setTimeout(finish, maxMs);
        el.dataset.entrance = "go";
      },
      { threshold: 0.15 },
    );
    observer.observe(el);

    return () => {
      observer.disconnect();
      finish();
    };
  }, [ref, maxMs]);
}
