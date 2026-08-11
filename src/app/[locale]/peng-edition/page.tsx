import type { Metadata } from "next";
import Image from "next/image";
import { use } from "react";
import { notFound } from "next/navigation";
import { hasLocale, useTranslations } from "next-intl";
import { setRequestLocale } from "next-intl/server";
import { routing } from "@/i18n/routing";
import { pageMetadata } from "@/lib/seo";
import { Link } from "@/i18n/navigation";
import { BOOKS } from "@/components/BookCard";
import { Reveal, Stagger, Item, MaskLine } from "@/components/motion/Kinetic";

const CAPABILITY_INDEXES = [0, 1, 2, 3] as const;

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  if (!hasLocale(routing.locales, locale)) notFound();
  return pageMetadata(locale, "pengEdition", "/peng-edition");
}

export default function PengEditionPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = use(params);
  setRequestLocale(locale);
  const t = useTranslations("pengEdition");
  const tBooks = useTranslations("pengEdition.books");

  return (
    <>
      {/* Sub-brand masthead: Peng Edition owns orange/black, with the
          holding's green kept as the parentage mark. */}
      <section className="kin-on-ink kin-grain">
        <div className="mx-auto max-w-[1240px] px-4 sm:px-8">
          <div className="flex flex-wrap items-center justify-between gap-4 border-b border-paper/20 py-4">
            <span className="kin-mono flex items-center gap-2 text-paper/60">
              <span aria-hidden className="h-2.5 w-2.5 bg-lime" />
              {t("holdingMark")}
            </span>
            <span className="kin-mono text-orange">Douala · Cameroon</span>
          </div>

          <div className="grid items-center gap-10 py-14 sm:py-20 lg:grid-cols-[1.1fr_0.9fr]">
            <div>
              <span className="inline-block bg-paper p-3">
                <Image
                  src="/images/peng edition logo.jpeg"
                  alt="Peng Edition"
                  width={180}
                  height={180}
                  priority
                  className="kin-logo h-20 w-auto"
                />
              </span>
              <h1 className="kin-display mt-8 text-[clamp(2.2rem,7vw,4.6rem)] text-paper">
                <MaskLine>{t("heading")}</MaskLine>
              </h1>
              <p className="kin-italic mt-4 text-[clamp(1.2rem,3vw,2rem)] text-orange">
                {t("tagline")}
              </p>
              <div className="mt-8 flex flex-wrap gap-3">
                <Link href="/peng-edition/books" className="kin-btn">
                  {t("booksCta")}
                </Link>
                <Link
                  href={{ pathname: "/contact", query: { type: "books" } }}
                  className="kin-btn kin-btn--ghost"
                >
                  {t("schools.cta")}
                </Link>
              </div>
            </div>

            {/* The two titles, front boards only */}
            <Stagger className="flex justify-center gap-5" gap={0.12}>
              {BOOKS.map((book, i) => (
                <Item key={book.key}>
                  <div className="relative">
                    <span
                      aria-hidden
                      className={`absolute -bottom-2 -left-2 h-full w-full ${
                        i === 0 ? "bg-orange" : "bg-lime"
                      }`}
                    />
                    <span
                      className={`relative block w-[140px] border-2 border-paper sm:w-[186px] ${
                        i === 1 ? "mt-10" : ""
                      }`}
                    >
                      <Image
                        src={book.cover}
                        alt={`${tBooks(`${book.key}.title`)} — ${tBooks(`${book.key}.author`)}`}
                        width={372}
                        height={524}
                        className="book-front"
                      />
                    </span>
                  </div>
                </Item>
              ))}
            </Stagger>
          </div>
        </div>
      </section>

      {/* About */}
      <section className="bg-paper py-20 sm:py-28">
        <div className="mx-auto grid max-w-[1240px] gap-10 px-4 sm:px-8 lg:grid-cols-[0.8fr_1.2fr]">
          <Reveal>
            <span className="kin-mono text-orange-deep">
              {t("booksHeading")}
            </span>
          </Reveal>
          <Reveal delay={0.1} className="space-y-5 leading-relaxed text-ink-soft">
            <p className="kin-display text-[clamp(1.4rem,3.2vw,2.2rem)] normal-case text-ink">
              {t("about.p1")}
            </p>
            <p>{t("about.p2")}</p>
          </Reveal>
        </div>
      </section>

      {/* Capabilities — labelled as capability, never as track record */}
      <section className="bg-paper-2 py-20 sm:py-28">
        <div className="mx-auto max-w-[1240px] px-4 sm:px-8">
          <Reveal>
            <span className="kin-mono text-ink-faint">
              {t("capabilities.heading")}
            </span>
            <hr className="kin-rule mt-4 w-16" />
          </Reveal>
          <Stagger className="mt-10 grid gap-px bg-ink/15 sm:grid-cols-2 lg:grid-cols-4">
            {CAPABILITY_INDEXES.map((i) => (
              <Item key={i}>
                <div className="group h-full bg-paper p-7 transition-colors duration-300 hover:bg-ink">
                  <span className="kin-mono text-orange">
                    {String(i + 1).padStart(2, "0")}
                  </span>
                  <h3 className="kin-display mt-5 text-xl text-ink transition-colors group-hover:text-paper">
                    {t(`capabilities.items.${i}`)}
                  </h3>
                </div>
              </Item>
            ))}
          </Stagger>
        </div>
      </section>

      {/* Author */}
      <section className="bg-paper py-20 sm:py-28">
        <div className="mx-auto grid max-w-[1240px] gap-10 px-4 sm:px-8 lg:grid-cols-[0.8fr_1.2fr]">
          <Reveal>
            <span className="kin-mono text-ink-faint">
              {t("authorHeading")}
            </span>
            <h2 className="kin-display mt-4 text-[clamp(1.7rem,4vw,2.8rem)] text-ink">
              {t("author.name")}
            </h2>
          </Reveal>
          <Reveal delay={0.1}>
            <p className="leading-relaxed text-ink-soft">{t("author.bio")}</p>
          </Reveal>
        </div>
      </section>

      {/* Schools & bookshops */}
      <section className="bg-orange py-20 sm:py-28">
        <div className="mx-auto max-w-[1240px] px-4 sm:px-8">
          <Reveal>
            <span className="kin-mono text-ink/60">{t("schools.heading")}</span>
            <p className="kin-display mt-6 max-w-[18ch] text-[clamp(1.8rem,5.4vw,3.6rem)] text-ink">
              {t("schools.p1")}
            </p>
            <p className="mt-6 max-w-[54ch] leading-relaxed text-ink/80">
              {t("schools.p2")}
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
