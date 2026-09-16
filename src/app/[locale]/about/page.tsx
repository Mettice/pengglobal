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

  return (
    <>
      {/* Masthead */}
      <section className="kin-grain bg-paper">
        <hr className="kin-rule" />
        <div className="mx-auto max-w-[1240px] px-4 sm:px-8">
          <div className="flex items-baseline justify-between gap-4 border-b border-ink/15 py-4">
            <span className="kin-mono text-ink-faint">
              {tLegal("companyName")}
            </span>
            <span className="kin-mono text-ink-faint">Douala · Cameroon</span>
          </div>
          <h1 className="kin-display py-14 text-[clamp(2.4rem,8vw,5.4rem)] text-ink sm:py-20">
            <MaskLine>{t("heading")}</MaskLine>
          </h1>
          <p className="kin-italic max-w-[34ch] pb-14 text-[clamp(1.2rem,3vw,2rem)] text-lime-deep sm:pb-20">
            Holding your hands in a changing world
          </p>
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

      {/* Value proposition, paired with the warehouse frame */}
      <section className="bg-paper py-20 sm:py-28">
        <div className="mx-auto grid max-w-[1240px] gap-12 px-4 sm:px-8 lg:grid-cols-2 lg:items-center">
          <Reveal>
            <span className="kin-mono text-lime-deep">02</span>
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

      {/* Commitment — the due-diligence promise, given its own weight */}
      <section className="bg-lime py-20 sm:py-28">
        <div className="mx-auto max-w-[1240px] px-4 sm:px-8">
          <Reveal>
            <span className="kin-mono text-ink/80">
              {t("commitment.heading")}
            </span>
            <p className="kin-display mt-6 max-w-[20ch] text-[clamp(1.8rem,5.4vw,3.8rem)] text-ink">
              {t("commitment.text")}
            </p>
            <Link href="/contact" className="kin-btn mt-10">
              {tContact("button")}
            </Link>
          </Reveal>
        </div>
      </section>

      {/* Registration details */}
      <section className="bg-paper py-14">
        <div className="mx-auto max-w-[1240px] px-4 sm:px-8">
          <Image
            src="/images/LOGO.jpg"
            alt="Peng Global Holding"
            width={260}
            height={156}
            className="kin-logo h-14 w-auto"
          />
          <p className="kin-mono mt-6 text-ink-faint">
            {tLegal("rccm")} · {tLegal("address")}
          </p>
        </div>
      </section>
    </>
  );
}
