import type { Metadata } from "next";
import { use } from "react";
import { notFound } from "next/navigation";
import { hasLocale, useTranslations } from "next-intl";
import { setRequestLocale } from "next-intl/server";
import { routing } from "@/i18n/routing";
import { pageMetadata } from "@/lib/seo";
import { Link } from "@/i18n/navigation";
import ServiceCards from "@/components/ServiceCards";
import { Reveal, MaskLine } from "@/components/motion/Kinetic";
import BrandPhoto from "@/components/BrandPhoto";
import ScrollSequence from "@/components/ScrollSequence";
import sequences from "@/lib/sequences.json";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  if (!hasLocale(routing.locales, locale)) notFound();
  return pageMetadata(locale, "services", "/services");
}

export default function ServicesPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = use(params);
  setRequestLocale(locale);
  const t = useTranslations("services");
  const tContact = useTranslations("home.contactCta");
  const tPhoto = useTranslations("photo");

  return (
    <>
      <section className="kin-grain bg-paper">
        <hr className="kin-rule" />
        <div className="mx-auto max-w-[1240px] px-4 sm:px-8">
          <div className="flex items-baseline justify-between gap-4 border-b border-ink/15 py-4">
            <span className="kin-mono text-ink-faint">
              Peng Global Holding
            </span>
            <span className="kin-mono text-ink-faint">04 · Service lines</span>
          </div>
          <h1 className="kin-display pt-14 text-[clamp(2.4rem,8vw,5.4rem)] text-ink sm:pt-20">
            <MaskLine>{t("heading")}</MaskLine>
          </h1>
          <p className="max-w-[52ch] py-8 text-lg leading-relaxed text-ink-soft">
            {t("intro")}
          </p>
        </div>
      </section>

      <section className="bg-paper pb-20 sm:pb-28">
        <div className="mx-auto max-w-[1240px] px-4 sm:px-8">
          <ServiceCards showPractice />

          {/* Slots 3 & 4 — product in retail, freight in motion.
              See docs/photography-spec.md */}
          <div className="mt-14 grid gap-5 sm:grid-cols-2">
            <Reveal>
              <BrandPhoto
                src="/images/retail-stationery.jpg"
                alt={tPhoto("shelfAlt")}
                trueColour
                className="aspect-[3/2] w-full"
              />
            </Reveal>
            <Reveal delay={0.08}>
              <BrandPhoto
                src="/images/freight-logistics.jpg"
                alt={tPhoto("freightAlt")}
                trueColour
                className="aspect-[3/2] w-full"
              />
            </Reveal>
          </div>
        </div>
      </section>

      {/* The route, drawn. Sits immediately before the PENSAN case so the
          line the reader just watched being drawn resolves into the one
          worked example that proves it. */}
      <ScrollSequence
        name="route"
        frames={sequences.route.frames}
        width={sequences.route.width}
        height={sequences.route.height}
        eyebrow={t("route.eyebrow")}
        heading={t("route.heading")}
        beats={[t("route.beat1"), t("route.beat2"), t("route.beat3")]}
      />

      {/* PENSAN worked example — the anchor proof, on the holding's green */}
      <section className="kin-on-ink py-20 sm:py-28">
        <div className="mx-auto max-w-[1240px] px-4 sm:px-8">
          <Reveal className="max-w-3xl">
            <span
              className="pensan-mark block"
              role="img"
              aria-label="PENSAN"
              title="PENSAN"
            />
            <h2 className="kin-display mt-8 text-[clamp(1.7rem,4.4vw,3rem)] text-paper">
              {t("representation.caseHeading")}
            </h2>
            <p className="mt-6 leading-relaxed text-paper/70">
              {t("representation.caseText")}
            </p>
            <Link href="/contact" className="kin-btn mt-10">
              {tContact("button")}
            </Link>
          </Reveal>
        </div>
      </section>
    </>
  );
}
