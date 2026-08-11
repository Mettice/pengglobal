import type { Metadata } from "next";
import { use } from "react";
import { notFound } from "next/navigation";
import { hasLocale, useTranslations } from "next-intl";
import { setRequestLocale } from "next-intl/server";
import { routing } from "@/i18n/routing";
import { pageMetadata } from "@/lib/seo";
import { MaskLine } from "@/components/motion/Kinetic";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  if (!hasLocale(routing.locales, locale)) notFound();
  return pageMetadata(locale, "legal", "/legal-notice");
}

export default function LegalNoticePage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = use(params);
  setRequestLocale(locale);
  const t = useTranslations("legal");
  const tContact = useTranslations("contact.details");

  const blocks = [
    {
      heading: t("companyHeading"),
      lines: [t("companyName"), t("rccm"), t("address")],
    },
    { heading: t("publisherHeading"), lines: [t("publisherText")] },
    { heading: t("hostingHeading"), lines: [t("hostingText")] },
  ];

  return (
    <>
      <section className="kin-grain bg-paper">
        <hr className="kin-rule" />
        <div className="mx-auto max-w-[1240px] px-4 sm:px-8">
          <div className="flex items-baseline justify-between gap-4 border-b border-ink/15 py-3.5">
            <span className="kin-mono text-ink-faint">
              {t("companyName")}
            </span>
            <span className="kin-mono text-ink-faint">
              {tContact("address")}
            </span>
          </div>
          <h1 className="kin-display py-14 text-[clamp(2.2rem,7vw,4.6rem)] text-ink sm:py-20">
            <MaskLine>{t("heading")}</MaskLine>
          </h1>
        </div>
      </section>

      <section className="bg-paper pb-24">
        <div className="mx-auto max-w-[760px] px-4 sm:px-8">
          <dl className="space-y-10">
            {blocks.map((block) => (
              <div key={block.heading} className="border-t-2 border-ink pt-6">
                <dt className="kin-mono text-ink-faint">{block.heading}</dt>
                <dd className="mt-4 space-y-2 leading-relaxed text-ink-soft">
                  {block.lines.map((line) => (
                    <p key={line}>{line}</p>
                  ))}
                </dd>
              </div>
            ))}
          </dl>
        </div>
      </section>
    </>
  );
}
