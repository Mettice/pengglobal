"use client";

import { useEffect, useRef, useState } from "react";
import Image from "next/image";
import {
  motion,
  useScroll,
  useTransform,
  useMotionValueEvent,
} from "motion/react";
import { useEnhanced } from "@/lib/useEnhanced";

/**
 * A frame sequence scrubbed by scroll position.
 *
 * Frames are decoded up front and painted to a canvas, rather than swapped
 * between <img> elements: swapping causes a decode on the first paint of
 * each frame, which is exactly when it is least affordable. Scrubbing a
 * <video>'s currentTime would be far lighter, but seeks are not
 * frame-accurate and stall badly in Safari.
 *
 * The copy is ordinary HTML that renders server-side and never depends on
 * a frame arriving. If the sequence never loads — slow link, blocked
 * request, no JS — the section still reads as a section. The pictures are
 * the decoration; the words are the content.
 *
 * Whether this scrubs at all is decided in CSS (.seq-track) so the page
 * height is settled before hydration. This component only decides whether
 * to mount the canvas.
 */
export default function ScrollSequence({
  name,
  frames,
  width,
  height,
  eyebrow,
  heading,
  beats,
}: {
  name: string;
  frames: number;
  width: number;
  height: number;
  eyebrow: string;
  heading: string;
  beats: string[];
}) {
  const enhanced = useEnhanced();
  const trackRef = useRef<HTMLElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const imagesRef = useRef<(HTMLImageElement | undefined)[]>([]);
  const loadedRef = useRef(0);
  const currentRef = useRef(-1);
  const rafRef = useRef(0);
  const [ready, setReady] = useState(false);

  const frameSrc = (i: number) =>
    `/sequence/${name}/${String(i + 1).padStart(4, "0")}.webp`;

  const { scrollYProgress } = useScroll({
    target: trackRef,
    offset: ["start start", "end end"],
  });

  // --- Decode every frame before scrubbing --------------------------
  useEffect(() => {
    if (!enhanced) return;
    let cancelled = false;
    imagesRef.current = new Array(frames);

    const paint = (i: number) => {
      const canvas = canvasRef.current;
      const img = imagesRef.current[i];
      if (!canvas || !img) return;
      canvas.getContext("2d")?.drawImage(img, 0, 0, width, height);
    };

    (async () => {
      // Sequential, so the frames the reader meets first arrive first
      // instead of 60 requests competing.
      for (let i = 0; i < frames; i++) {
        const img = new window.Image();
        img.src = frameSrc(i);
        try {
          await img.decode();
        } catch {
          continue; // A missing frame should not stall the rest.
        }
        if (cancelled) return;
        imagesRef.current[i] = img;
        loadedRef.current = i + 1;
        if (i === 0) paint(0);
      }
      if (!cancelled) setReady(true);
    })();

    return () => {
      cancelled = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [enhanced, frames, width, height, name]);

  // --- Drive the frame from scroll ----------------------------------
  useMotionValueEvent(scrollYProgress, "change", (v) => {
    if (!enhanced) return;
    const wanted = Math.round(v * (frames - 1));
    // Never ask for a frame that has not decoded yet — hold the last one
    // that has, so the sequence degrades to a slower scrub, not a gap.
    const index = Math.max(
      0,
      Math.min(wanted, frames - 1, loadedRef.current - 1),
    );
    if (index === currentRef.current) return;
    currentRef.current = index;

    // Coalesce to one paint per frame; scroll fires far more often.
    if (rafRef.current) return;
    rafRef.current = requestAnimationFrame(() => {
      rafRef.current = 0;
      const canvas = canvasRef.current;
      const img = imagesRef.current[currentRef.current];
      if (!canvas || !img) return;
      canvas.getContext("2d")?.drawImage(img, 0, 0, width, height);
    });
  });

  useEffect(() => () => cancelAnimationFrame(rafRef.current), []);

  // Beats cross-fade across the scrub. Driven by motion values so the
  // captions never trigger a React render while scrolling.
  const beatOpacity = [
    useTransform(scrollYProgress, [0.0, 0.08, 0.26, 0.34], [0, 1, 1, 0]),
    useTransform(scrollYProgress, [0.34, 0.42, 0.58, 0.66], [0, 1, 1, 0]),
    useTransform(scrollYProgress, [0.66, 0.74, 0.95, 1], [0, 1, 1, 1]),
  ];

  return (
    <section ref={trackRef} className="seq-track kin-on-ink">
      <div className="seq-stage flex items-center overflow-hidden">
        {enhanced ? (
          <canvas
            ref={canvasRef}
            width={width}
            height={height}
            aria-hidden
            /* object-right, not centre: cover crops horizontally, and on a
               tall window that removes ~260px from each side — enough to
               take the destination marker off screen. Anchoring right means
               the crop only ever eats the left, which is where the ink wash
               and the copy already are. */
            className={`absolute inset-0 h-full w-full object-cover object-right transition-opacity duration-700 ${
              ready ? "opacity-100" : "opacity-70"
            }`}
          />
        ) : (
          /* The finished route — the single most informative frame, and
             the only one anyone gets who is not scrubbing. */
          <Image
            src={frameSrc(frames - 1)}
            alt=""
            width={width}
            height={height}
            aria-hidden
            className="absolute inset-0 h-full w-full object-cover object-right"
          />
        )}

        {/* Ink wash under the copy so it stays readable over any frame.
            Cleared by ~70% across so it never sits over the drawn route. */}
        <div
          aria-hidden
          className="pointer-events-none absolute inset-0 bg-gradient-to-r from-ink from-15% via-ink/55 via-45% to-transparent to-70%"
        />

        <div className="relative mx-auto w-full max-w-[1240px] px-4 py-20 sm:px-8">
          <span className="kin-mono kin-green-mark">{eyebrow}</span>
          <h2 className="kin-display mt-5 max-w-[16ch] text-[clamp(1.9rem,4.8vw,3.4rem)] text-paper">
            {heading}
          </h2>

          {/* Scrubbing: the beats cross-fade in one place, tracking the
              line as it is drawn. Otherwise: a plain ordered list, since
              without the scrub there is no sequence to track. */}
          {enhanced ? (
            <div className="relative mt-10 h-24 max-w-[46ch]">
              {beats.map((beat, i) => (
                <motion.p
                  key={beat}
                  style={{ opacity: beatOpacity[i] }}
                  className="absolute inset-x-0 top-0 flex gap-4 text-[1.05rem] leading-relaxed text-paper/80"
                >
                  <span aria-hidden className="kin-mono pt-1 text-lime-bright">
                    {String(i + 1).padStart(2, "0")}
                  </span>
                  {beat}
                </motion.p>
              ))}
            </div>
          ) : (
            <ol className="mt-9 max-w-[46ch] space-y-4">
              {beats.map((beat, i) => (
                <li key={beat} className="flex gap-4">
                  <span aria-hidden className="kin-mono pt-1 text-lime-bright">
                    {String(i + 1).padStart(2, "0")}
                  </span>
                  <span className="leading-relaxed text-paper/80">{beat}</span>
                </li>
              ))}
            </ol>
          )}
        </div>
      </div>
    </section>
  );
}
