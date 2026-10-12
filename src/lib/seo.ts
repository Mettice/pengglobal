import type { Metadata } from "next";
import { getTranslations } from "next-intl/server";
import { routing, type Locale } from "@/i18n/routing";

export const SITE_URL =
  process.env.NEXT_PUBLIC_SITE_URL ?? "https://penglobalholding.com";

/**
 * Localized metadata with hreflang alternates for a page.
 * `path` is the locale-independent pathname ("/", "/about", ...).
 * `key` addresses the meta.* entry in the message catalogs.
 */
export async function pageMetadata(
  locale: Locale,
  key: string,
  path: string,
): Promise<Metadata> {
  const t = await getTranslations({ locale, namespace: "meta" });
  const suffix = path === "/" ? "" : path;

  const languages = Object.fromEntries(
    routing.locales.map((l) => [l, `${SITE_URL}/${l}${suffix}`]),
  );

  // One card per language, built by scripts/build-og.mjs. Shared links are
  // how most of this audience meets the site — WhatsApp, LinkedIn — and
  // without an image they arrive as a line of grey text.
  const card = {
    url: `${SITE_URL}/og/${locale}.jpg`,
    width: 1200,
    height: 630,
    alt: t("siteName"),
  };

  return {
    metadataBase: new URL(SITE_URL),
    title: t(`${key}.title`),
    description: t(`${key}.description`),
    alternates: {
      canonical: `${SITE_URL}/${locale}${suffix}`,
      languages: {
        ...languages,
        "x-default": `${SITE_URL}/${routing.defaultLocale}${suffix}`,
      },
    },
    openGraph: {
      title: t(`${key}.title`),
      description: t(`${key}.description`),
      siteName: t("siteName"),
      url: `${SITE_URL}/${locale}${suffix}`,
      locale: locale === "fr" ? "fr_CM" : "en_GB",
      alternateLocale: locale === "fr" ? "en_GB" : "fr_CM",
      type: "website",
      images: [card],
    },
    twitter: {
      card: "summary_large_image",
      title: t(`${key}.title`),
      description: t(`${key}.description`),
      images: [card.url],
    },
  };
}
