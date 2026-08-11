import type { MetadataRoute } from "next";
import { routing } from "@/i18n/routing";
import { SITE_URL } from "@/lib/seo";

const PATHS = [
  "",
  "/about",
  "/services",
  "/peng-edition",
  "/peng-edition/books",
  "/contact",
  "/legal-notice",
  "/privacy",
];

export default function sitemap(): MetadataRoute.Sitemap {
  return PATHS.map((path) => ({
    url: `${SITE_URL}/${routing.defaultLocale}${path}`,
    lastModified: new Date(),
    alternates: {
      languages: Object.fromEntries(
        routing.locales.map((locale) => [
          locale,
          `${SITE_URL}/${locale}${path}`,
        ]),
      ),
    },
  }));
}
