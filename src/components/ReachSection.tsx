"use client";

import { useEffect, useRef, useState } from "react";
import Image from "next/image";
import { useTranslations } from "next-intl";
import { Link } from "@/i18n/navigation";
import { useEnhanced } from "@/lib/useEnhanced";
import { useEntrance } from "@/lib/useEntrance";
import { Item, Stagger } from "./motion/Kinetic";

/**
 * Rendered by scripts/render-globe.mjs from Natural Earth land data: the
 * real Istanbul → Douala route, drawn once per loop.
 */
const POSTER = "/globe/poster.webp";

const delay = (s: number) => ({ "--d": `${s}s` }) as React.CSSProperties;

/**
 * "How the route works", staged as a planet rising under the copy.
 *
 * Desktop (lg+): the globe is a full-bleed stage and the copy sits above
 * its limb. Below lg the globe becomes its own block after the copy —
 * full-bleed on a phone would put the route straight behind the
 * paragraph, and the route is the point.
 *
 * The video mounts only on capable desktops, and only as the section
 * approaches, so it never competes with the hero loop on first load. It
 * pauses once far off screen. The poster, which shows the route already
 * drawn, is what everyone else sees.
 */
export default function ReachSection() {
  const t = useTranslations("home.reach");
  const tContact = useTranslations("home.contactCta");
  const enhanced = useEnhanced();
  const stageRef = useRef<HTMLDivElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const [near, setNear] = useState(false);
  const [playing, setPlaying] = useState(false);

  useEntrance(stageRef);

  useEffect(() => {
    const stage = stageRef.current;
    if (!enhanced || !stage) return;
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) setNear(true);
        const video = videoRef.current;
        if (!video) return;
        if (entry.isIntersecting) video.play().catch(() => {});
        else video.pause();
      },
      { rootMargin: "50% 0px" },
    );
    observer.observe(stage);
    return () => observer.disconnect();
  }, [enhanced]);

  const showVideo = enhanced && near;

  // React does not reliably reflect `muted` before autoplay is attempted.
  useEffect(() => {
    const video = videoRef.current;
    if (!showVideo || !video) return;
    video.muted = true;
    video.play().catch(() => {});
  }, [showVideo]);

  return (
    <section aria-labelledby="reach-heading" className="kin-on-ink relative">
      <div
        ref={stageRef}
        className="relative flex flex-col overflow-hidden lg:min-h-[max(720px,100svh)]"
      >
        {/* ---- The globe ---- */}
        <div
          aria-hidden
          className="relative order-last aspect-[2/1] w-full sm:aspect-[16/10] lg:absolute lg:inset-0 lg:order-none lg:aspect-auto"
        >
          <Image
            src={POSTER}
            alt=""
            fill
            sizes="100vw"
            className="object-cover object-bottom"
          />
          {showVideo && (
            <video
              ref={videoRef}
              className={`absolute inset-0 h-full w-full object-cover object-bottom transition-opacity duration-1000 ${
                playing ? "opacity-100" : "opacity-0"
              }`}
              autoPlay
              muted
              loop
              playsInline
              preload="auto"
              disablePictureInPicture
              poster={POSTER}
              onPlaying={() => setPlaying(true)}
            >
              <source
                src="/globe/loop.av1.webm"
                type='video/webm; codecs="av01.0.08M.08"'
              />
              <source src="/globe/loop.h264.mp4" type="video/mp4" />
            </video>
          )}
          {/* Blends the block into the copy above it on small screens. */}
          <div className="pointer-events-none absolute inset-x-0 top-0 h-16 bg-gradient-to-b from-ink to-transparent lg:hidden" />
        </div>

        {/* ---- Scrim (stage only): quiets the stars and dots behind the
             copy, and lets the planet sink into the strip below. ---- */}
        <div
          aria-hidden
          className="pointer-events-none absolute inset-0 hidden bg-[radial-gradient(ellipse_62%_48%_at_50%_26%,rgb(11_11_11/0.8),transparent_72%)] lg:block"
        />
        <div
          aria-hidden
          className="pointer-events-none absolute inset-x-0 bottom-0 hidden h-32 bg-gradient-to-t from-ink to-transparent lg:block"
        />

        {/* ---- Copy ---- */}
        <div className="relative z-10 mx-auto flex w-full max-w-[1240px] flex-col items-center px-4 pb-4 pt-20 text-center sm:px-8 lg:pb-0 lg:pt-[calc(68px+4svh)]">
          <span className="ent-lift kin-mono kin-green-mark" style={delay(0.04)}>
            {t("eyebrow")}
          </span>

          <h2
            id="reach-heading"
            className="kin-display mt-6 text-[length:clamp(2.2rem,min(5vw,8svh),4.2rem)] text-paper"
          >
            <span className="ent-mask">
              <span style={delay(0.12)}>{t("heading1")}</span>
            </span>
            <span className="ent-mask">
              <span style={delay(0.22)}>{t("heading2")}</span>
            </span>
          </h2>

          <p
            className="ent-focus mt-6 max-w-[64ch] text-[15px] leading-relaxed text-paper/80 sm:text-base"
            style={delay(0.58)}
          >
            {t("body")}
          </p>

          <div className="mt-8 flex flex-wrap justify-center gap-3">
            <Link href="/services" className="ent-settle kin-btn" style={delay(0.9)}>
              {t("cta")}
            </Link>
            {/* An ink-glass fill: this row sits over the planet's upper
                edge, where lit land dots would otherwise show through the
                ghost button behind its letters. hover:bg-paper restores
                the ghost hover, which the fill utility would override. */}
            <Link
              href="/contact"
              className="ent-settle kin-btn kin-btn--ghost bg-ink/80 backdrop-blur-[2px] hover:bg-paper"
              style={delay(0.97)}
              data-entrance-last
            >
              {tContact("button")}
            </Link>
          </div>
        </div>
      </div>

      {/* ---- The route in words, under the stage ---- */}
      <div className="border-t border-paper/15">
        <div className="mx-auto max-w-[1240px] px-4 py-12 sm:px-8 sm:py-14">
          <div className="flex flex-wrap items-center gap-3">
            <span className="kin-chip">{t("origin")}</span>
            <span aria-hidden className="kin-mono text-lime-bright">
              ───▸
            </span>
            <span className="kin-chip kin-chip--lime">{t("destination")}</span>
          </div>

          {/* Numbered because this genuinely is a sequence: the order a
              shipment moves through the route. */}
          <Stagger className="mt-9 grid gap-6 md:grid-cols-3 md:gap-10">
            {(["point1", "point2", "point3"] as const).map((key, i) => (
              <Item key={key}>
                <div className="flex items-start gap-4 border-t border-paper/15 pt-5">
                  <span aria-hidden className="kin-mono shrink-0 pt-0.5 text-lime-bright">
                    {String(i + 1).padStart(2, "0")}
                  </span>
                  <span className="text-[0.95rem] leading-relaxed text-paper/75">
                    {t(key)}
                  </span>
                </div>
              </Item>
            ))}
          </Stagger>
        </div>
      </div>
    </section>
  );
}
