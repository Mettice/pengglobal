"use client";

import Image from "next/image";
import { useTranslations } from "next-intl";
import { Stagger, Item, Reveal } from "./motion/Kinetic";

/**
 * Brand marks supplied by the client, prepared by
 * scripts/prepare-logos.mjs. Heights are set per mark so they read at
 * the same optical weight: the wide PENSAN box needs less height than
 * the near-square marks. Marks delivered on white print with multiply,
 * which drops the white into the paper tile; the P mark was keyed to
 * real transparency and needs no blend.
 */
const PARTNERS = [
  { name: "PENSAN", src: "/images/partners/pensan.webp", w: 614, h: 172, blend: true, size: "h-10" },
  { name: "PENSAN Kidz", src: "/images/partners/pensan-kidz.webp", w: 398, h: 240, blend: true, size: "h-16" },
  { name: "Flexoffice", src: "/images/partners/flexoffice.webp", w: 297, h: 240, blend: true, size: "h-16" },
  { name: "Peng Trust", src: "/images/partners/peng-p.png", w: 241, h: 240, blend: false, size: "h-14" },
] as const;

export function PartnerLogos() {
  const t = useTranslations("home.slots");

  return (
    <section className="bg-paper-2 py-16 sm:py-20">
      <div className="mx-auto max-w-[1240px] px-4 sm:px-8">
        <div className="border-b border-ink/15 pb-4">
          <span className="kin-mono text-ink-faint">{t("partnersLabel")}</span>
        </div>

        <Stagger className="mt-px grid grid-cols-2 gap-px bg-ink/15 lg:grid-cols-4">
          {PARTNERS.map((p) => (
            <Item key={p.name}>
              <div className="flex h-32 items-center justify-center bg-paper px-4">
                <Image
                  src={p.src}
                  alt={p.name}
                  title={p.name}
                  width={p.w}
                  height={p.h}
                  sizes="160px"
                  className={`${p.size} w-auto max-w-full object-contain ${p.blend ? "kin-logo" : ""}`}
                />
              </div>
            </Item>
          ))}
        </Stagger>

        <p className="mt-4 max-w-[60ch] text-sm text-ink-faint">
          {t("partnersNote")}
        </p>
      </div>
    </section>
  );
}

/**
 * Designed empty frames for testimonials the client will supply. They
 * render as deliberate, styled slots — nothing here quotes anyone.
 */
export function TestimonialSlots() {
  const t = useTranslations("home.slots");

  return (
    <section className="bg-paper py-16 sm:py-24">
      <div className="mx-auto max-w-[1240px] px-4 sm:px-8">
        <Reveal>
          <span className="kin-mono text-ink-faint">{t("voicesLabel")}</span>
          <h2 className="kin-display mt-4 max-w-[16ch] text-[clamp(1.9rem,5vw,3.4rem)] text-ink">
            {t("voicesHeading")}
          </h2>
        </Reveal>

        <Stagger className="mt-10 grid gap-5 md:grid-cols-3">
          {[0, 1, 2].map((i) => (
            <Item key={i}>
              <figure className="flex h-full min-h-[220px] flex-col justify-between border-2 border-dashed border-ink/25 p-6">
                <span aria-hidden className="kin-display text-5xl leading-[0.88] text-ink/12">
                  &ldquo;
                </span>
                <figcaption className="kin-mono text-ink/60">
                  {t("pending")}
                </figcaption>
              </figure>
            </Item>
          ))}
        </Stagger>

        <p className="mt-5 max-w-[60ch] text-sm text-ink-faint">
          {t("voicesNote")}
        </p>
      </div>
    </section>
  );
}
