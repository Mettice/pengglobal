"use client";

import { useTranslations } from "next-intl";
import { motion, useReducedMotion } from "motion/react";
import { Link } from "@/i18n/navigation";
import { MaskLine } from "./motion/Kinetic";
import HeroSlideshow, { type HeroSlide } from "./HeroSlideshow";

const EASE = [0.22, 1, 0.36, 1] as const;

/**
 * The three hero images, in rotation order.
 *
 * Each `src` is empty until real photography is licensed; the slideshow
 * shows a labelled pending frame in its place and keeps rotating, so the
 * motion is visible before any file exists. Drop a path under /public
 * here and it appears in the rotation with no other change.
 * See docs/photography-spec.md for what to buy.
 */
const HERO_SLIDES: HeroSlide[] = [
  { labelKey: "hero1" },
  { labelKey: "hero2" },
  { labelKey: "hero3" },
];

/** The four service lines, surfaced in the hero as the offering. */
const SERVICE_KEYS = [
  "representation",
  "importExport",
  "contracts",
  "machinery",
] as const;

export type HeroVariant = "split" | "full";

/**
 * The hero message. `onInk` flips it for the full-bleed variant, where it
 * sits over a darkened photograph rather than on paper.
 */
function HeroMessage({ onInk }: { onInk: boolean }) {
  const t = useTranslations("home.hero");
  const tServices = useTranslations("services");
  const reduced = useReducedMotion();

  return (
    <div className={onInk ? "kin-on-ink" : ""}>
      <h1
        className={`kin-display text-[clamp(2.5rem,6.6vw,4.9rem)] ${
          onInk ? "text-paper" : "text-ink"
        }`}
      >
        <MaskLine delay={0.05}>{t("line1")}</MaskLine>
        <MaskLine delay={0.17}>
          <span className="kin-italic text-orange">{t("line2a")}</span>{" "}
          {t("line2b")}
        </MaskLine>
        <MaskLine delay={0.29}>
          <span className="kin-accent-green">{t("line3")}</span>
        </MaskLine>
      </h1>

      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{
          duration: reduced ? 0 : 0.7,
          delay: reduced ? 0 : 0.5,
          ease: EASE,
        }}
      >
        <p
          className={`mt-7 max-w-[50ch] text-[1.05rem] leading-relaxed ${
            onInk ? "text-paper/80" : "text-ink-soft"
          }`}
        >
          {t("subtitle")}
        </p>

        {/* The offering, stated plainly — this is the holding's business */}
        <ul className="mt-7 flex flex-wrap gap-x-6 gap-y-2">
          {SERVICE_KEYS.map((key) => (
            <li
              key={key}
              className={`kin-mono flex items-center gap-2 ${
                onInk ? "text-paper/70" : "text-ink-soft"
              }`}
            >
              <span aria-hidden className="h-1.5 w-1.5 shrink-0 bg-lime" />
              {tServices(`${key}.label`)}
            </li>
          ))}
        </ul>

        {/* Proof chips — real claims only, each in its brand's colour */}
        <div className="mt-7 flex flex-wrap gap-2">
          <span className="kin-chip kin-chip--pensan">{t("chip1")}</span>
          <span className="kin-chip kin-chip--orange">{t("chip2")}</span>
          <span className="kin-chip kin-chip--lime">{t("chip3")}</span>
        </div>

        <div className="mt-9 flex flex-wrap gap-3">
          <Link href="/contact" className="kin-btn">
            {t("cta1")}
          </Link>
          <Link href="/peng-edition" className="kin-btn kin-btn--ghost">
            {t("cta2")}
          </Link>
        </div>
      </motion.div>
    </div>
  );
}

function CapabilityMarquee() {
  const tMarquee = useTranslations("home.marquee");
  const items = (["a", "b", "c", "d", "e"] as const).map((k) => tMarquee(k));

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

export default function KineticHero({
  variant = "split",
}: {
  variant?: HeroVariant;
}) {
  const t = useTranslations("home.hero");
  const reduced = useReducedMotion();

  /* ---- Full bleed: photograph edge to edge, message over it ---- */
  if (variant === "full") {
    return (
      <section className="relative overflow-hidden bg-ink">
        <div className="relative min-h-[clamp(560px,82vh,820px)]">
          <HeroSlideshow slides={HERO_SLIDES} variant="fill" />

          {/* Scrim: strongest bottom-left where the message sits, so the
              type stays legible whatever the photograph does. */}
          <div
            aria-hidden
            className="pointer-events-none absolute inset-0 bg-gradient-to-tr from-ink via-ink/80 to-ink/25"
          />

          <div className="relative flex min-h-[clamp(560px,82vh,820px)] items-end">
            <div className="mx-auto w-full max-w-[1240px] px-4 pb-20 pt-24 sm:px-8">
              <div className="max-w-3xl">
                <HeroMessage onInk />
              </div>
            </div>
          </div>
        </div>
        <CapabilityMarquee />
      </section>
    );
  }

  /* ---- Split: type left, rotating panel right ---- */
  return (
    <section className="kin-grain relative overflow-hidden bg-paper">
      <hr className="kin-rule" />

      <div className="mx-auto max-w-[1240px] px-4 sm:px-8">
        <div className="flex items-baseline justify-between gap-4 border-b border-ink/15 py-3.5">
          <span className="kin-mono text-ink-faint">{t("meta1")}</span>
          <span className="kin-mono text-ink-faint">{t("meta2")}</span>
        </div>

        <div className="grid items-center gap-10 py-12 lg:grid-cols-[1.1fr_0.9fr] lg:gap-14 lg:py-16">
          <HeroMessage onInk={false} />

          <motion.div
            initial={{ opacity: 0, y: 32 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{
              duration: reduced ? 0 : 0.9,
              delay: reduced ? 0 : 0.3,
              ease: EASE,
            }}
          >
            <HeroSlideshow slides={HERO_SLIDES} />
          </motion.div>
        </div>
      </div>

      <CapabilityMarquee />
    </section>
  );
}
