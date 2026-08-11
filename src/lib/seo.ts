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

  return {
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
      locale,
      type: "website",
    },
  };
}
