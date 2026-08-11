"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import Image from "next/image";
import { useTranslations } from "next-intl";
import { useReducedMotion } from "motion/react";

export type HeroSlide = {
  /** Path under /public. Leave undefined to render the pending frame. */
  src?: string;
  /** Names the shot that belongs in this slot. */
  labelKey: "hero1" | "hero2" | "hero3";
};

const INTERVAL_MS = 5000;

/**
 * Rotating hero visual.
 *
 * Crossfade is opacity-only, which stays comfortable under
 * prefers-reduced-motion — so the images still change for those users.
 * The slow Ken Burns push is the part that gets dropped, since scaling
 * movement is what causes vestibular trouble.
 *
 * Auto-advance pauses on hover, on keyboard focus, and whenever the tab
 * is hidden, so it never animates unseen or fights a user reading it.
 */
export default function HeroSlideshow({
  slides,
  variant = "panel",
}: {
  slides: HeroSlide[];
  /** "panel" sits in a column; "fill" covers its positioned parent. */
  variant?: "panel" | "fill";
}) {
  const t = useTranslations("photo");
  const reduced = useReducedMotion();
  const fill = variant === "fill";
  const [index, setIndex] = useState(0);
  const [paused, setPaused] = useState(false);
  const timer = useRef<ReturnType<typeof setInterval> | null>(null);

  const advance = useCallback(() => {
    setIndex((i) => (i + 1) % slides.length);
  }, [slides.length]);

  useEffect(() => {
    if (paused || slides.length < 2) return;

    const start = () => {
      if (timer.current) clearInterval(timer.current);
      timer.current = setInterval(advance, INTERVAL_MS);
    };
    const stop = () => {
      if (timer.current) clearInterval(timer.current);
      timer.current = null;
    };

    const onVisibility = () => (document.hidden ? stop() : start());

    start();
    document.addEventListener("visibilitychange", onVisibility);
    return () => {
      stop();
      document.removeEventListener("visibilitychange", onVisibility);
    };
  }, [advance, paused, slides.length]);

  return (
    <div
      className={fill ? "absolute inset-0" : "relative"}
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
      onFocusCapture={() => setPaused(true)}
      onBlurCapture={() => setPaused(false)}
    >
      <div
        className={
          fill
            ? "relative h-full w-full overflow-hidden bg-ink"
            : "relative aspect-[4/5] w-full overflow-hidden border-2 border-ink bg-ink"
        }
      >
        {slides.map((slide, i) => {
          const active = i === index;
          return (
            <div
              key={slide.labelKey}
              aria-hidden={!active}
              className="absolute inset-0 transition-opacity duration-700 ease-out"
              style={{ opacity: active ? 1 : 0 }}
            >
              {slide.src ? (
                <div className="kin-photo h-full w-full">
                  <Image
                    src={slide.src}
                    alt=""
                    fill
                    priority={i === 0}
                    sizes="(max-width: 1024px) 100vw, 45vw"
                    className={
                      reduced
                        ? "object-cover"
                        : "object-cover motion-safe:animate-[kin-kenburns_14s_ease-out_both]"
                    }
                  />
                </div>
              ) : (
                /* Pending frame — still rotates, so the motion is visible
                   before any photography exists. */
                <div className="flex h-full w-full flex-col items-center justify-center gap-3 bg-paper/5">
                  <svg
                    className="h-9 w-9 text-paper/25"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                    strokeWidth={1.4}
                    aria-hidden
                  >
                    <path
                      strokeLinecap="square"
                      d="M3 5h18v14H3zM3 16l5-5 4 4 3-3 6 6"
                    />
                    <circle cx="8.5" cy="9" r="1.5" />
                  </svg>
                  <span className="kin-mono px-6 text-center text-paper/60">
                    {t(slide.labelKey)}
                  </span>
                  <span className="kin-mono px-6 text-center text-paper/30">
                    {t("pending")}
                  </span>
                </div>
              )}
            </div>
          );
        })}

        {/* Progress ticks, doubling as controls */}
        <div
          className={`absolute bottom-4 flex gap-2 ${fill ? "left-1/2 -translate-x-1/2" : "left-4"}`}
        >
          {slides.map((slide, i) => (
            <button
              key={slide.labelKey}
              type="button"
              onClick={() => setIndex(i)}
              aria-label={t("slideGo", { n: i + 1 })}
              aria-current={i === index}
              className={`h-1.5 w-9 border border-paper/40 transition-colors ${
                i === index ? "bg-lime" : "bg-transparent hover:bg-paper/30"
              }`}
            />
          ))}
        </div>
      </div>
    </div>
  );
}
