import { SITE_URL } from "@/lib/seo";

/**
 * BreadcrumbList structured data.
 *
 * Nothing is drawn: the pages are two levels deep at most and a visible
 * breadcrumb would be noise beside the header. This exists so search
 * results show the site's shape under the title — "Peng Global Holding ›
 * Peng Edition › Our books" — instead of a bare URL.
 *
 * `trail` is locale-independent: paths without the /en or /fr prefix,
 * names already translated by the caller, home first.
 */
export default function BreadcrumbJsonLd({
  locale,
  trail,
}: {
  locale: string;
  trail: { name: string; path: string }[];
}) {
  const data = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: trail.map((step, i) => ({
      "@type": "ListItem",
      position: i + 1,
      name: step.name,
      // "/" would otherwise produce a trailing slash the site never serves.
      item: `${SITE_URL}/${locale}${step.path === "/" ? "" : step.path}`,
    })),
  };

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(data) }}
    />
  );
}
