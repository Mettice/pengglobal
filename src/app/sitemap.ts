import type { MetadataRoute } from "next";
import { routing } from "@/i18n/routing";
import { SITE_URL } from "@/lib/seo";

// Priority is relative within the site: the pages that should rank are
// the commercial ones, the legal pages exist to be found when looked for.
const PATHS: [path: string, priority: number][] = [
  ["", 1],
  ["/services", 0.9],
  ["/about", 0.8],
  ["/peng-edition", 0.8],
  ["/peng-edition/books", 0.7],
  ["/contact", 0.7],
  ["/legal-notice", 0.2],
  ["/privacy", 0.2],
];

export default function sitemap(): MetadataRoute.Sitemap {
  return PATHS.map(([path, priority]) => ({
    url: `${SITE_URL}/${routing.defaultLocale}${path}`,
    lastModified: new Date(),
    changeFrequency: "monthly" as const,
    priority,
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
