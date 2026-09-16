import type { Metadata } from "next";
import Image from "next/image";
import { hasLocale, useTranslations } from "next-intl";
import { setRequestLocale } from "next-intl/server";
import { use } from "react";
import { notFound } from "next/navigation";
import { Link } from "@/i18n/navigation";
import { routing } from "@/i18n/routing";
import { pageMetadata } from "@/lib/seo";
import Book3D, { BOOK_FACES } from "@/components/Book3D";
import ServiceCards from "@/components/ServiceCards";
import KineticHero from "@/components/KineticHero";
import ReachSection from "@/components/ReachSection";
import StatsBand from "@/components/StatsBand";
import { PartnerSlots, TestimonialSlots } from "@/components/PlaceholderSlots";
import { Reveal, Stagger, Item } from "@/components/motion/Kinetic";

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
  const tPe = useTranslations("pengEdition");

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

      {/* ---- Proof: the two verifiable pillars, stated as data ---- */}
      <section className="kin-on-ink py-16 sm:py-20">
        <div className="mx-auto max-w-[1240px] px-4 sm:px-8">
          <Stagger className="grid gap-px bg-paper/20 md:grid-cols-2">
            <Item>
              <div className="h-full bg-ink p-8 sm:p-10">
                <span className="kin-mono text-orange">
                  {t("proof.pensan.brand")}
                </span>
                <p className="kin-display mt-5 text-[clamp(1.5rem,3.2vw,2.3rem)] text-paper">
                  {t("proof.pensan.claim")}
                </p>
              </div>
            </Item>
            <Item>
              <div className="h-full bg-ink p-8 sm:p-10">
                <span className="kin-mono text-lime">
                  {t("proof.edition.brand")}
                </span>
                <p className="kin-display mt-5 text-[clamp(1.5rem,3.2vw,2.3rem)] text-paper">
                  {t("proof.edition.claim")}
                </p>
              </div>
            </Item>
          </Stagger>
        </div>
      </section>

      {/* ---- Operating figures ---- */}
      <StatsBand />

      {/* ---- Partner logo slots (awaiting real assets) ---- */}
      <PartnerSlots />

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

      {/* ---- Peng Edition: sub-brand takes over the page ---- */}
      <section className="kin-on-ink py-20 sm:py-28">
        <div className="mx-auto max-w-[1240px] px-4 sm:px-8">
          <div className="grid items-center gap-12 lg:grid-cols-[1fr_0.8fr]">
            <Reveal>
              {/* Real Peng Edition mark, on a paper tile so its black
                  linework stays legible against the ink ground. */}
              <span className="inline-block bg-paper p-3">
                <Image
                  src="/images/peng edition logo.jpeg"
                  alt="Peng Edition"
                  width={150}
                  height={150}
                  className="kin-logo h-16 w-auto"
                />
              </span>
              <h2 className="kin-display mt-6 text-[clamp(2rem,5.4vw,3.8rem)] text-paper">
                {tPe("tagline")}
              </h2>
              <p className="mt-6 max-w-[50ch] leading-relaxed text-paper/70">
                {t("editionBlock.proof")}
              </p>
              <div className="mt-8 flex flex-wrap gap-2">
                {["badgeSchools", "badgeBookshops", "badgeCemac"].map((key) => (
                  <span
                    key={key}
                    className="kin-chip"
                  >
                    {t(`catalogue.${key}`)}
                  </span>
                ))}
              </div>
              <Link href="/peng-edition" className="kin-btn mt-10">
                {t("editionBlock.cta")}
              </Link>
            </Reveal>

            <Stagger
              className="flex items-end justify-center gap-8 pb-6 sm:gap-12"
              gap={0.12}
            >
              {BOOK_FACES.map((book, i) => (
                <Item key={book.key}>
                  <Book3D
                    bookKey={book.key}
                    width={168}
                    driftDelay={i === 0 ? "0s" : "-4.5s"}
                    className={i === 1 ? "sm:-mb-8" : ""}
                  />
                </Item>
              ))}
            </Stagger>
          </div>
        </div>
      </section>

      {/* ---- Testimonial slots (awaiting verified quotes) ---- */}
      <TestimonialSlots />

      {/* ---- Final CTA: one action ---- */}
      <section className="kin-on-ink kin-grain py-20 sm:py-28">
        <div className="mx-auto max-w-[1240px] px-4 sm:px-8">
          <Reveal>
            <h2 className="kin-display max-w-[18ch] text-[clamp(2.1rem,6vw,4.4rem)] text-paper">
              {t("catalogue.projectHeading")}
            </h2>
            <p className="mt-6 max-w-[52ch] leading-relaxed text-paper/70">
              {t("catalogue.projectText")}
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
