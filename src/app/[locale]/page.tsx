import type { Metadata } from "next";
import { hasLocale, useTranslations } from "next-intl";
import { setRequestLocale } from "next-intl/server";
import { use } from "react";
import { notFound } from "next/navigation";
import { Link } from "@/i18n/navigation";
import { routing } from "@/i18n/routing";
import { pageMetadata } from "@/lib/seo";
import ServiceCards from "@/components/ServiceCards";
import KineticHero from "@/components/KineticHero";
import ReachSection from "@/components/ReachSection";
import StatsBand from "@/components/StatsBand";
import { PartnerLogos } from "@/components/PlaceholderSlots";
import Testimonials from "@/components/Testimonials";
import { Reveal } from "@/components/motion/Kinetic";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  if (!hasLocale(routing.locales, locale)) notFound();
  return pageMetadata(locale, "home", "/");
}

export default function HomePage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = use(params);
  setRequestLocale(locale);
  const t = useTranslations("home");

  return (
    <>
      <KineticHero />

      {/* ---- Introduction: statement type on paper ---- */}
      <section className="bg-paper py-20 sm:py-28">
        <div className="mx-auto max-w-[1240px] px-4 sm:px-8">
          <div className="grid gap-10 lg:grid-cols-[0.9fr_1.1fr]">
            <Reveal>
              <span className="kin-mono text-ink-faint">
                {t("trust.eyebrow")}
              </span>
              <h2 className="kin-display mt-4 text-[clamp(1.9rem,4.6vw,3.2rem)] text-ink">
                {t("intro.heading")}
              </h2>
            </Reveal>
            <Reveal delay={0.1}>
              <div className="space-y-5 text-[1.02rem] leading-relaxed text-ink-soft">
                <p>{t("intro.p1")}</p>
                <p>{t("intro.p2")}</p>
              </div>
              <Link
                href="/about"
                className="kin-link kin-mono mt-8 inline-block text-ink"
              >
                {t("servicesCta")} →
              </Link>
            </Reveal>
          </div>
        </div>
      </section>

      {/* ---- Proof: the group's verifiable claim, stated as data ---- */}
      <section className="kin-on-ink py-16 sm:py-20">
        <div className="mx-auto max-w-[1240px] px-4 sm:px-8">
          <Reveal>
            <div className="bg-ink p-8 sm:p-10">
              <span className="kin-mono text-orange">
                {t("proof.pensan.brand")}
              </span>
              <p className="kin-display mt-5 text-[clamp(1.5rem,3.2vw,2.3rem)] text-paper">
                {t("proof.pensan.claim")}
              </p>
            </div>
          </Reveal>
        </div>
      </section>

      {/* ---- Operating figures ---- */}
      <StatsBand />

      {/* ---- Partners & brands ---- */}
      <PartnerLogos />

      {/* ---- Services ---- */}
      <section className="bg-paper py-20 sm:py-28">
        <div className="mx-auto max-w-[1240px] px-4 sm:px-8">
          <Reveal className="mb-12">
            <span className="kin-mono text-ink-faint">
              {t("servicesHeading")}
            </span>
            <hr className="kin-rule mt-4 w-16" />
          </Reveal>
          <ServiceCards showPractice />
          <Reveal delay={0.1}>
            <Link href="/services" className="kin-btn mt-12">
              {t("servicesCta")}
            </Link>
          </Reveal>
        </div>
      </section>

      {/* ---- The route (three.js globe, desktop-gated) ---- */}
      <ReachSection />

      {/* ---- What clients say ---- */}
      <Testimonials />

      {/* ---- Final CTA: one action ---- */}
      <section className="kin-on-ink kin-grain py-20 sm:py-28">
        <div className="mx-auto max-w-[1240px] px-4 sm:px-8">
          <Reveal>
            <h2 className="kin-display max-w-[18ch] text-[clamp(2.1rem,6vw,4.4rem)] text-paper">
              {t("finalCta.heading")}
            </h2>
            <p className="mt-6 max-w-[52ch] leading-relaxed text-paper/70">
              {t("finalCta.text")}
            </p>
            <Link href="/contact" className="kin-btn mt-10">
              {t("contactCta.button")}
            </Link>
          </Reveal>
        </div>
      </section>
    </>
  );
}
