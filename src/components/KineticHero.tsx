"use client";

import { useEffect, useRef, useState } from "react";
import Image from "next/image";
import { useTranslations } from "next-intl";
import { motion, useMotionValue, useSpring } from "motion/react";
import { Link } from "@/i18n/navigation";
import { useAmbientVideo, useEnhanced } from "@/lib/useEnhanced";
import { HERO_ID } from "@/lib/hero";
import { MaskLine } from "./motion/Kinetic";

/** Encoded by scripts/build-hero.mjs from media/hero-source.mp4. */
const POSTER = "/hero/poster.webp";

/** Portrait screens get the 3:4 cut (loop-sm.*); see build-hero.mjs. */
const PORTRAIT = "(max-aspect-ratio: 1/1)";

/** How far, in px, the footage drifts toward the pointer at the edges. */
const PARALLAX_PX = 18;

/**
 * Full-viewport cinematic hero.
 *
 * Layers, back to front: graded port footage (poster always, video faded
 * in over it), a scrim that carries text contrast,
 * grain, then the copy.
 *
 * The footage plays everywhere motion is welcome — phones included, from
 * a 3:4 cut about half the size. Pointer parallax stays desktop-only.
 *
 * The poster is never replaced by the video. The enhancement gate only
 * opens after hydration, so swapping one element for the other would
 * flash; instead the video mounts on top at opacity 0 and fades in once
 * it is actually playing. The poster is the LCP element either way.
 *
 * All copy renders and is visible without JavaScript: headline lines use
 * the CSS-only .kin-mask reveal and the lower block uses .kin-rise, both
 * of which default to their finished state.
 */
export default function KineticHero() {
  const t = useTranslations("home.hero");
  const enhanced = useEnhanced();
  const video = useAmbientVideo(PORTRAIT);
  const variant = video.small ? "-sm" : "";
  const sectionRef = useRef<HTMLElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  // Which cut is actually playing, so a rotation that swaps the cut fades
  // the new one in rather than showing it before its first frame.
  const [playing, setPlaying] = useState<string | null>(null);

  const x = useMotionValue(0);
  const y = useMotionValue(0);
  const smoothX = useSpring(x, { stiffness: 60, damping: 20 });
  const smoothY = useSpring(y, { stiffness: 60, damping: 20 });

  // Pointer parallax (desktop only).
  useEffect(() => {
    if (!enhanced) {
      x.set(0);
      y.set(0);
      return;
    }
    const onMove = (e: PointerEvent) => {
      const cx = window.innerWidth / 2;
      const cy = window.innerHeight / 2;
      x.set(((e.clientX - cx) / cx) * PARALLAX_PX);
      y.set(((e.clientY - cy) / cy) * PARALLAX_PX);
    };
    window.addEventListener("pointermove", onMove, { passive: true });
    return () => window.removeEventListener("pointermove", onMove);
  }, [enhanced, x, y]);

  // Start the footage, and pause it while the hero is off screen so a
  // long page does not decode video nobody can see. React does not
  // reliably reflect `muted` before autoplay is attempted, and browsers
  // refuse to autoplay unmuted video — so it is set on the element.
  useEffect(() => {
    const el = videoRef.current;
    const section = sectionRef.current;
    if (!video.allowed || !el || !section) return;
    el.muted = true;
    el.play().catch(() => {});
    const observer = new IntersectionObserver(([entry]) => {
      if (entry.isIntersecting) el.play().catch(() => {});
      else el.pause();
    });
    observer.observe(section);
    return () => observer.disconnect();
  }, [video.allowed, variant]);

  const proof = [t("chip1"), t("chip3"), t("meta2")];

  return (
    <>
      <section
        ref={sectionRef}
        id={HERO_ID}
        className="kin-on-ink relative flex min-h-[max(640px,100svh)] flex-col overflow-hidden"
      >
        {/* ---- Footage ---- */}
        <motion.div
          aria-hidden
          style={{ x: smoothX, y: smoothY }}
          className="absolute inset-0 z-0 origin-center scale-[1.08]"
        >
          <Image
            src={POSTER}
            alt=""
            fill
            priority
            sizes="100vw"
            className="object-cover object-right"
          />
          {video.allowed && (
            <video
              key={variant}
              ref={videoRef}
              className={`absolute inset-0 h-full w-full object-cover object-right transition-opacity duration-1000 ${
                playing === variant ? "opacity-100" : "opacity-0"
              }`}
              autoPlay
              muted
              loop
              playsInline
              preload="none"
              poster={POSTER}
              onLoadedMetadata={(e) => {
                e.currentTarget.playbackRate = 1.15;
              }}
              onPlaying={() => setPlaying(variant)}
            >
              <source
                src={`/hero/loop${variant}.av1.webm`}
                type='video/webm; codecs="av01.0.05M.08"'
              />
              <source src={`/hero/loop${variant}.h264.mp4`} type="video/mp4" />
            </video>
          )}
        </motion.div>

        {/* ---- Scrim: carries text contrast, so the grade does not have to.
             Heaviest at the base, where the lower block sits, and left,
             where the headline sits; the sun is top-right. ---- */}
        <div
          aria-hidden
          className="pointer-events-none absolute inset-0 z-10 bg-gradient-to-t from-ink via-ink/25 to-ink/45"
        />
        <div
          aria-hidden
          className="pointer-events-none absolute inset-0 z-10 bg-gradient-to-r from-ink/55 via-ink/10 to-transparent"
        />
        <div aria-hidden className="kin-grain pointer-events-none absolute inset-0 z-10" />

        {/* ---- Copy. A flex column rather than two absolutely placed
             blocks, so headline and lower block can never collide on a
             short viewport — the section grows instead. ---- */}
        <div className="relative z-20 mx-auto flex w-full max-w-[1240px] flex-1 flex-col justify-between gap-12 px-4 pb-10 pt-[calc(68px+9svh)] sm:px-8 sm:pb-12">
          <h1 className="kin-display text-[length:clamp(3rem,min(8.4vw,13svh),7.5rem)] text-paper">
            <MaskLine delay={0.05}>{t("line1")}</MaskLine>
            <MaskLine delay={0.17}>
              {/* Bright orange is 7:1 on ink, so it is legible here. */}
              <span className="kin-italic text-orange">{t("line2a")}</span>{" "}
              <span className="text-paper/55">{t("line2b")}</span>
            </MaskLine>
            <MaskLine delay={0.29}>
              <span className="text-lime-bright">{t("line3")}</span>
            </MaskLine>
          </h1>

          <div
            className="kin-rise"
            style={{ "--rise-delay": "0.5s" } as React.CSSProperties}
          >
            <div className="flex flex-col gap-8 lg:flex-row lg:items-end lg:justify-between">
              <p className="max-w-[46ch] text-[15px] leading-relaxed text-paper/85">
                {t("subtitle")}
              </p>
              <div className="flex flex-wrap gap-3">
                <Link href="/contact" className="kin-btn">
                  {t("cta1")}
                </Link>
                <Link href="/services" className="kin-btn kin-btn--ghost">
                  {t("cta2")}
                </Link>
              </div>
            </div>

            <div className="mt-8 flex flex-wrap items-center gap-x-4 gap-y-3 border-t border-paper/15 pt-5">
              {proof.map((item, i) => (
                <span key={item} className="flex items-center gap-4">
                  {i > 0 && (
                    <span aria-hidden className="inline-block h-1.5 w-1.5 bg-lime" />
                  )}
                  <span className="kin-mono text-paper/65">{item}</span>
                </span>
              ))}

              {/* Scroll cue — part of this row rather than separately
                  positioned, so it cannot overlap the proof items. */}
              <span
                aria-hidden
                className="ml-auto hidden items-center gap-3 sm:flex"
              >
                <span className="kin-mono text-[0.65rem] tracking-[0.2em] text-paper/70">
                  {t("scroll")}
                </span>
                <span className="kin-scroll-cue block h-10 w-px bg-paper/70" />
              </span>
            </div>
          </div>
        </div>
      </section>

      <CapabilityMarquee />
    </>
  );
}

/** The capability rail that has always followed the hero. */
function CapabilityMarquee() {
  const tMarquee = useTranslations("home.marquee");
  // "d" is educational publishing — Peng Edition's trade, which the home
  // page leaves to the Peng Edition pages.
  const items = (["a", "b", "c", "e"] as const).map((k) => tMarquee(k));

  return (
    <div className="kin-on-ink border-y-2 border-ink py-4">
      <div className="kin-marquee">
        {[0, 1].map((copy) => (
          <div
            key={copy}
            className="kin-marquee__track"
            aria-hidden={copy === 1 || undefined}
          >
            {items.map((item) => (
              <span
                key={item}
                className="kin-mono flex items-center gap-3 whitespace-nowrap text-paper"
              >
                <span className="text-orange">✦</span>
                {item}
              </span>
            ))}
          </div>
        ))}
      </div>
    </div>
  );
}
