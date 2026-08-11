import type { Metadata } from "next";
import { use } from "react";
import { notFound } from "next/navigation";
import { hasLocale, useTranslations } from "next-intl";
import { setRequestLocale } from "next-intl/server";
import { routing } from "@/i18n/routing";
import { pageMetadata } from "@/lib/seo";
import ContactForm from "@/components/ContactForm";
import { MaskLine } from "@/components/motion/Kinetic";
import BrandPhoto from "@/components/BrandPhoto";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  if (!hasLocale(routing.locales, locale)) notFound();
  return pageMetadata(locale, "contact", "/contact");
}

export default function ContactPage({
  params,
  searchParams,
}: {
  params: Promise<{ locale: string }>;
  searchParams: Promise<{ type?: string }>;
}) {
  const { locale } = use(params);
  const { type } = use(searchParams);
  setRequestLocale(locale);
  const t = useTranslations("contact");
  const tPhoto = useTranslations("photo");

  return (
    <>
      <section className="kin-grain bg-paper">
        <hr className="kin-rule" />
        <div className="mx-auto max-w-[1240px] px-4 sm:px-8">
          <div className="flex items-baseline justify-between gap-4 border-b border-ink/15 py-4">
            <span className="kin-mono text-ink-faint">Peng Global Holding</span>
            <span className="kin-mono text-ink-faint">
              {t("details.address")}
            </span>
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
        <div className="mx-auto grid max-w-[1240px] gap-12 px-4 sm:px-8 lg:grid-cols-[1.6fr_1fr]">
          <ContactForm defaultType={type} />

          <aside className="h-fit border-2 border-ink bg-paper-2 p-7">
            <h2 className="kin-mono text-ink-faint">{t("details.heading")}</h2>
            <dl className="mt-6 space-y-6">
              <div>
                <dt className="kin-mono text-ink-faint">
                  {t("details.emailLabel")}
                </dt>
                <dd className="mt-1">
                  <a
                    href={`mailto:${t("details.email")}`}
                    className="kin-link font-semibold text-ink"
                  >
                    {t("details.email")}
                  </a>
                </dd>
              </div>
              <div>
                <dt className="kin-mono text-ink-faint">
                  {t("details.phoneLabel")}
                </dt>
                <dd className="mt-1 font-semibold tabular-nums text-ink">
                  {t("details.phone")}
                </dd>
              </div>
              <div>
                <dt className="kin-mono text-ink-faint">
                  {t("details.addressLabel")}
                </dt>
                <dd className="mt-1 font-semibold text-ink">
                  {t("details.address")}
                </dd>
              </div>
            </dl>

            {/* Slot 5 — the market being served, not the office.
                See docs/photography-spec.md */}
            <BrandPhoto
              tone="lime"
              className="mt-7 aspect-[4/3] w-full"
              pendingLabel={tPhoto("city")}
              pendingNote={tPhoto("pending")}
            />
          </aside>
        </div>
      </section>
    </>
  );
}
