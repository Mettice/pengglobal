"use client";

import dynamic from "next/dynamic";
import { useTranslations } from "next-intl";
import { useEnhanced } from "@/lib/useEnhanced";
import { Link } from "@/i18n/navigation";
import { Reveal } from "./motion/Kinetic";

// WebGL globe is loaded only when the enhancement gate opens, so the
// bundle never reaches mobile/slow-data visitors.
const ConnectionGlobe = dynamic(() => import("./ConnectionGlobe"), {
  ssr: false,
});

/**
 * The route as a flat engraving — the same graticule, arc and markers as
 * the WebGL globe, in about a kilobyte of inline SVG.
 *
 * Meridians are ellipses of decreasing width, which is exactly what
 * longitude lines project to on a sphere, so this reads as the same object
 * seen without the renderer rather than as a different illustration.
 */
function StaticGlobe({
  originLabel,
  destinationLabel,
}: {
  originLabel: string;
  destinationLabel: string;
}) {
  return (
    <svg
      viewBox="0 0 220 220"
      role="img"
      aria-label={`${originLabel} → ${destinationLabel}`}
      className="aspect-square w-full max-w-[360px]"
    >
      <circle cx="110" cy="110" r="88" fill="#0b0b0b" />

      <g fill="none" stroke="#78be20" strokeOpacity="0.32" strokeWidth="1">
        {/* Parallels */}
        <ellipse cx="110" cy="110" rx="88" ry="30" />
        <ellipse cx="110" cy="66" rx="76" ry="22" />
        <ellipse cx="110" cy="154" rx="76" ry="22" />
        {/* Meridians */}
        <ellipse cx="110" cy="110" rx="30" ry="88" />
        <ellipse cx="110" cy="110" rx="60" ry="88" />
      </g>

      <circle
        cx="110"
        cy="110"
        r="88"
        fill="none"
        stroke="#8fd62c"
        strokeOpacity="0.55"
      />

      {/* The route */}
      <path
        d="M 143 66 Q 168 108 112 143"
        fill="none"
        stroke="#f97316"
        strokeWidth="2.5"
        strokeLinecap="round"
      />

      <circle cx="143" cy="66" r="4.5" fill="#f4f2ec" />
      <circle cx="112" cy="143" r="6" fill="#8fd62c" />
      <circle
        cx="112"
        cy="143"
        r="11"
        fill="none"
        stroke="#8fd62c"
        strokeOpacity="0.5"
      />
    </svg>
  );
}

export default function ReachSection() {
  const t = useTranslations("home.reach");
  const enhanced = useEnhanced();

  return (
    <section className="kin-on-ink relative overflow-hidden py-20 sm:py-28">
      <div className="relative mx-auto grid max-w-[1240px] items-center gap-14 px-4 sm:px-8 lg:grid-cols-[1fr_0.9fr]">
        <Reveal>
          <span className="kin-mono kin-green-mark">{t("eyebrow")}</span>
          <h2 className="kin-display mt-5 text-[clamp(1.9rem,4.8vw,3.4rem)] text-paper">
            {t("heading")}
          </h2>
          <p className="mt-6 max-w-[56ch] leading-relaxed text-paper/70">
            {t("body")}
          </p>

          {/* The route, stated as hard-edged nodes rather than soft pills */}
          <div className="mt-9 flex flex-wrap items-center gap-3">
            <span className="kin-chip">
              {t("origin")}
            </span>
            <span aria-hidden className="kin-mono text-lime-bright">
              ───▸
            </span>
            <span className="kin-chip kin-chip--lime">{t("destination")}</span>
          </div>

          {/* Numbered because this genuinely is a sequence: the order a
              shipment moves through the route. */}
          <ol className="mt-9 space-y-4">
            {["point1", "point2", "point3"].map((key, i) => (
              <li key={key} className="flex items-start gap-4">
                <span
                  aria-hidden
                  className="kin-mono shrink-0 pt-0.5 text-lime-bright"
                >
                  {String(i + 1).padStart(2, "0")}
                </span>
                <span className="text-[0.95rem] leading-relaxed text-paper/70">
                  {t(key)}
                </span>
              </li>
            ))}
          </ol>

          <Link href="/services" className="kin-btn mt-10">
            {t("cta")}
          </Link>
        </Reveal>

        <div className="flex justify-center">
          {enhanced ? (
            <ConnectionGlobe
              originLabel={t("originPin")}
              destinationLabel={t("destinationPin")}
            />
          ) : (
            /* Static fallback — no WebGL, no JS, no image request.
               This is what the performance-critical audience actually
               sees, so it draws the same graticule and the same route
               rather than standing in as an abstract blob. */
            <StaticGlobe
              originLabel={t("originPin")}
              destinationLabel={t("destinationPin")}
            />
          )}
        </div>
      </div>
    </section>
  );
}
