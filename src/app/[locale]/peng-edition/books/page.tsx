import type { Metadata } from "next";
import { use } from "react";
import { notFound } from "next/navigation";
import { hasLocale, useLocale, useTranslations } from "next-intl";
import { setRequestLocale } from "next-intl/server";
import { routing } from "@/i18n/routing";
import { pageMetadata, SITE_URL } from "@/lib/seo";
import { Link } from "@/i18n/navigation";
import BookCard, { BOOKS } from "@/components/BookCard";
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

      <section className="kin-on-ink kin-grain">
        <div className="mx-auto max-w-[1240px] px-4 sm:px-8">
          <div className="flex flex-wrap items-center justify-between gap-4 border-b border-paper/20 py-4">
            <span className="kin-mono flex items-center gap-2 text-paper/60">
              <span aria-hidden className="h-2.5 w-2.5 bg-lime" />
              {t("holdingMark")}
            </span>
            <span className="kin-mono text-orange">02 · Titles</span>
          </div>
          <h1 className="kin-display py-14 text-[clamp(2.4rem,8vw,5.4rem)] text-paper sm:py-20">
            <MaskLine>{t("booksHeading")}</MaskLine>
          </h1>
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

      <section className="bg-orange py-20 sm:py-28">
        <div className="mx-auto max-w-[1240px] px-4 sm:px-8">
          <Reveal>
            <span className="kin-mono text-ink/60">{t("schools.heading")}</span>
            <p className="kin-display mt-6 max-w-[18ch] text-[clamp(1.8rem,5vw,3.4rem)] text-ink">
              {t("schools.p1")}
            </p>
            <Link
              href={{ pathname: "/contact", query: { type: "books" } }}
              className="kin-btn mt-10"
            >
              {t("schools.cta")}
            </Link>
          </Reveal>
        </div>
      </section>
    </>
  );
}
