import type { Metadata } from "next";
import Image from "next/image";
import { use } from "react";
import { notFound } from "next/navigation";
import { hasLocale, useTranslations } from "next-intl";
import { setRequestLocale } from "next-intl/server";
import { routing } from "@/i18n/routing";
import { pageMetadata } from "@/lib/seo";
import { Link } from "@/i18n/navigation";
import { Reveal, MaskLine } from "@/components/motion/Kinetic";
import BrandPhoto from "@/components/BrandPhoto";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  if (!hasLocale(routing.locales, locale)) notFound();
  return pageMetadata(locale, "about", "/about");
}

/**
 * Portraits cut to matching 4:5 frames by scripts/prepare-portraits.mjs.
 * Names come from the catalogue; an empty name is simply not shown, so a
 * missing one never renders as a placeholder.
 */
const LEADERS = [
  { key: "ceo", src: "/images/leaders/ceo.webp", accent: "bg-lime" },
  { key: "md", src: "/images/leaders/md.webp", accent: "bg-orange" },
] as const;

export default function AboutPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = use(params);
  setRequestLocale(locale);
  const t = useTranslations("about");
  const tLegal = useTranslations("legal");
  const tContact = useTranslations("home.contactCta");
  const tPhoto = useTranslations("photo");

  const leaders = LEADERS.map((l) => ({
    ...l,
    name: t(`leadership.${l.key}Name`),
    title: t(`leadership.${l.key}Title`),
    text: t(`leadership.${l.key}Text`),
  }));

  return (
    <>
      {/* Masthead — the heading beside the people behind it. The
          portraits rise in CSS, so they never depend on a script to be
          seen above the fold. */}
      <section className="kin-grain bg-paper">
        <hr className="kin-rule" />
        <div className="mx-auto max-w-[1240px] px-4 sm:px-8">
          <div className="flex items-baseline justify-between gap-4 border-b border-ink/15 py-4">
            <span className="kin-mono text-ink-faint">
              {tLegal("companyName")}
            </span>
            <span className="kin-mono text-ink-faint">Douala · Cameroon</span>
          </div>

          <div className="grid items-center gap-14 pb-20 pt-12 sm:pb-24 sm:pt-16 lg:grid-cols-[1.05fr_0.95fr]">
            <div>
              <h1 className="kin-display text-[clamp(2.4rem,7vw,5.4rem)] text-ink">
                <MaskLine>{t("heading")}</MaskLine>
              </h1>
              <p className="kin-italic mt-8 max-w-[34ch] text-[clamp(1.2rem,3vw,2rem)] text-lime-deep">
                Holding your hands in a changing world
              </p>
            </div>

            <div className="grid grid-cols-2 gap-6 sm:gap-10">
              {leaders.map((l, i) => (
                <figure
                  key={l.key}
                  className={`kin-rise ${i === 1 ? "mt-12 sm:mt-20" : ""}`}
                  style={{ "--rise-delay": `${0.35 + i * 0.15}s` } as React.CSSProperties}
                >
                  <div className="relative">
                    <span
                      aria-hidden
                      className={`absolute -bottom-3 -left-3 h-full w-full ${l.accent}`}
                    />
                    <Image
                      src={l.src}
                      alt={l.name ? `${l.name}, ${l.title}` : l.title}
                      width={800}
                      height={1000}
                      priority
                      sizes="(min-width: 1024px) 260px, 45vw"
                      className="relative block aspect-[4/5] w-full border-2 border-ink object-cover"
                    />
                  </div>
                  <figcaption className="mt-6">
                    <span className="kin-mono block text-ink-faint">{l.title}</span>
                    {l.name && (
                      <span className="kin-display mt-2 block text-[clamp(1.05rem,1.9vw,1.5rem)] leading-[0.95] text-ink">
                        {l.name}
                      </span>
                    )}
                  </figcaption>
                </figure>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Story */}
      <section className="kin-on-ink py-20 sm:py-28">
        <div className="mx-auto grid max-w-[1240px] gap-10 px-4 sm:px-8 lg:grid-cols-[0.8fr_1.2fr]">
          <Reveal>
            <span className="kin-mono kin-green-mark">01</span>
            <h2 className="kin-display mt-4 text-[clamp(1.7rem,4vw,2.8rem)] text-paper">
              {t("story.heading")}
            </h2>
          </Reveal>
          <Reveal delay={0.1} className="space-y-5 leading-relaxed text-paper/70">
            <p>{t("story.p1")}</p>
            <p>{t("story.p2")}</p>
          </Reveal>
        </div>
      </section>

      {/* Leadership */}
      <section className="bg-paper-2 py-20 sm:py-28">
        <div className="mx-auto max-w-[1240px] px-4 sm:px-8">
          <Reveal>
            <span className="kin-mono text-lime-deep">02</span>
            <h2 className="kin-display mt-4 text-[clamp(1.7rem,4vw,2.8rem)] text-ink">
              {t("leadership.heading")}
            </h2>
          </Reveal>
          <div className="mt-12 grid gap-10 md:grid-cols-2 md:gap-14">
            {leaders.map((l, i) => (
              <Reveal key={l.key} delay={i * 0.08}>
                <div className="border-t-2 border-ink pt-6">
                  <span className="kin-mono block text-ink-faint">{l.title}</span>
                  <h3 className="kin-display mt-3 text-[clamp(1.3rem,2.6vw,1.9rem)] leading-[0.95] text-ink">
                    {l.name || l.title}
                  </h3>
                  <p className="mt-5 max-w-[52ch] leading-relaxed text-ink-soft">{l.text}</p>
                </div>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* Value proposition, paired with the warehouse frame */}
      <section className="bg-paper py-20 sm:py-28">
        <div className="mx-auto grid max-w-[1240px] gap-12 px-4 sm:px-8 lg:grid-cols-2 lg:items-center">
          <Reveal>
            <span className="kin-mono text-lime-deep">03</span>
            <h2 className="kin-display mt-4 text-[clamp(1.7rem,4vw,2.8rem)] text-ink">
              {t("valueProp.heading")}
            </h2>
            <div className="mt-6 space-y-5 leading-relaxed text-ink-soft">
              <p>{t("valueProp.p1")}</p>
              <p>{t("valueProp.p2")}</p>
            </div>
          </Reveal>

          {/* Slot 2 — warehouse interior. See docs/photography-spec.md */}
          <Reveal delay={0.1}>
            <BrandPhoto
              tone="lime"
              className="aspect-[4/3] w-full"
              pendingLabel={tPhoto("warehouse")}
              pendingNote={tPhoto("pending")}
            />
          </Reveal>
        </div>
      </section>

      {/* Commitment. Display type carries only the short promise; the
          detail sits beside it in sentence case, where it can be read. */}
      <section className="bg-lime py-20 sm:py-28">
        <div className="mx-auto grid max-w-[1240px] gap-10 px-4 sm:px-8 lg:grid-cols-[1.1fr_0.9fr] lg:items-end">
          <Reveal>
            <span className="kin-mono text-ink/80">{t("commitment.heading")}</span>
            <h2 className="kin-display mt-6 max-w-[14ch] text-[clamp(2.2rem,5.4vw,4.2rem)] text-ink">
              {t("commitment.headline")}
            </h2>
          </Reveal>
          <Reveal delay={0.1}>
            <p className="max-w-[44ch] text-lg leading-relaxed text-ink">
              {t("commitment.text")}
            </p>
            <Link href="/contact" className="kin-btn mt-8">
              {tContact("button")}
            </Link>
          </Reveal>
        </div>
      </section>

      {/* The registration strip is left out until the RCCM number is
          supplied: it rendered "[to be supplied]" to visitors. The
          legal notice page still carries the registration record. */}
    </>
  );
}
