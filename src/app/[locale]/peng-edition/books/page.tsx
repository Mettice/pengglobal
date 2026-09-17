import type { Metadata } from "next";
import { use } from "react";
import { notFound } from "next/navigation";
import { hasLocale, useLocale, useTranslations } from "next-intl";
import { setRequestLocale } from "next-intl/server";
import { routing } from "@/i18n/routing";
import { pageMetadata, SITE_URL } from "@/lib/seo";
import BookCard, { BOOKS } from "@/components/BookCard";
import SchoolsBand from "@/components/SchoolsBand";
import BookShelf from "@/components/BookShelf";
import { Reveal, MaskLine } from "@/components/motion/Kinetic";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  if (!hasLocale(routing.locales, locale)) notFound();
  return pageMetadata(locale, "books", "/peng-edition/books");
}

// Book structured data with ISBNs (brief §10 SEO). Language-independent
// facts; descriptions come from the active locale's catalog.
const BOOK_FACTS = {
  fireside: { isbn: "9789956393008", price: "2000" },
  poems: { isbn: "9789956343046", price: "1800" },
} as const;

function BookJsonLd() {
  const t = useTranslations("pengEdition.books");
  const locale = useLocale();

  const data = BOOKS.map((book) => ({
    "@context": "https://schema.org",
    "@type": "Book",
    name: t(`${book.key}.title`),
    author: { "@type": "Person", name: "Befue Charlie-Bey" },
    isbn: BOOK_FACTS[book.key].isbn,
    inLanguage: "en",
    description: t(`${book.key}.description`),
    publisher: { "@type": "Organization", name: "Peng Edition" },
    image: `${SITE_URL}${book.cover}`,
    offers: {
      "@type": "Offer",
      price: BOOK_FACTS[book.key].price,
      priceCurrency: "XAF",
      availability: "https://schema.org/InStock",
      url: `${SITE_URL}/${locale}/peng-edition/books`,
    },
  }));

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(data) }}
    />
  );
}

export default function BooksPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = use(params);
  setRequestLocale(locale);
  const t = useTranslations("pengEdition");

  return (
    <>
      <BookJsonLd />

      {/* The shelf. A literary serif wordmark over a long row of the
          books — the one sub-brand page where the serif leads, because
          this is a publisher's shelf. */}
      {/* isolate keeps the stage's own layering (rail, pills, gradient,
          popped books) inside the section — without it those z-indexes
          competed with the sticky header and slid over it on scroll. */}
      <section className="kin-on-ink relative isolate overflow-hidden">
        {/* Phones get a shorter stage: at full height the smaller books
            left a band of empty black under the wordmark. */}
        <div className="relative min-h-[480px] sm:min-h-[max(600px,82svh)]">
          <div className="relative z-[90] mx-auto max-w-[1240px] px-4 sm:px-8">
            <div className="flex flex-wrap items-center justify-between gap-4 border-b border-paper/20 py-4">
              <span className="kin-mono flex items-center gap-2 text-paper/60">
                <span aria-hidden className="h-2.5 w-2.5 bg-lime" />
                {t("holdingMark")}
              </span>
              <span className="kin-mono text-orange">02 · Titles</span>
            </div>
          </div>

          <h1 className="relative z-[5] pt-[5svh] text-center font-serif text-[clamp(4rem,13vw,11.5rem)] font-normal leading-[0.9] tracking-[-0.035em] text-paper">
            <MaskLine>{t("booksHeading")}</MaskLine>
          </h1>

          <div className="absolute inset-x-0 bottom-0 top-[34%]">
            <BookShelf />
          </div>
        </div>
      </section>

      <section className="bg-paper py-16 sm:py-24">
        <div className="mx-auto max-w-[1240px] space-y-14 px-4 sm:px-8">
          {BOOKS.map((book, i) => (
            <Reveal key={book.key} delay={i * 0.08}>
              <BookCard
                bookKey={book.key}
                accent={i === 0 ? "orange" : "lime"}
                hasBlurb={book.hasBlurb}
              />
            </Reveal>
          ))}
        </div>
      </section>

      <SchoolsBand />
    </>
  );
}
