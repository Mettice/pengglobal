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
            <span className="kin-chip border-paper/40 text-paper">
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
            <ConnectionGlobe />
          ) : (
            /* Static fallback — no WebGL, no JS cost. */
            <div
              aria-hidden
              className="relative aspect-square w-full max-w-[360px] rounded-full border border-paper/10 bg-[radial-gradient(circle_at_35%_30%,rgba(120,190,32,0.3),rgba(11,11,11,0.9)_65%)]"
            >
              <span className="absolute left-[58%] top-[26%] h-2.5 w-2.5 rounded-full bg-orange" />
              <span className="absolute left-[46%] top-[62%] h-3.5 w-3.5 rounded-full bg-lime" />
            </div>
          )}
        </div>
      </div>
    </section>
  );
}
