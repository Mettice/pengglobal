"use client";

import { useTranslations } from "next-intl";
import { Stagger, Item, Reveal } from "./motion/Kinetic";

/**
 * Designed empty slots for content the client will supply from the old
 * site (partner logos, testimonials).
 *
 * These render as deliberate, styled frames — not fake content. Nothing
 * here asserts a partnership or quotes anyone. Swap each cell's contents
 * for the real asset once it has been supplied and verified.
 */

export function PartnerSlots() {
  const t = useTranslations("home.slots");

  return (
    <section className="bg-paper-2 py-16 sm:py-20">
      <div className="mx-auto max-w-[1240px] px-4 sm:px-8">
        <div className="flex flex-wrap items-baseline justify-between gap-3 border-b border-ink/15 pb-4">
          <span className="kin-mono text-ink-faint">{t("partnersLabel")}</span>
          <span className="kin-mono text-ink-faint">{t("pending")}</span>
        </div>

        <Stagger className="mt-px grid gap-px bg-ink/15 sm:grid-cols-2 lg:grid-cols-4">
          {/* Slot 1 holds the one real, verified mark we can show today. */}
          <Item>
            <div className="flex h-32 items-center justify-center bg-paper px-4">
              <span
                className="pensan-mark block"
                role="img"
                aria-label="PENSAN"
                title="PENSAN"
              />
            </div>
          </Item>
          {[0, 1, 2].map((i) => (
            <Item key={i}>
              <div className="flex h-32 items-center justify-center bg-paper px-4">
                <span
                  aria-hidden
                  className="flex h-16 w-full items-center justify-center border border-dashed border-ink/25"
                >
                  <span className="kin-mono text-ink/30">Logo</span>
                </span>
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
                <span aria-hidden className="kin-display text-5xl text-ink/12">
                  &ldquo;
                </span>
                <figcaption className="kin-mono text-ink/30">
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
