import Image from "next/image";
import { useTranslations } from "next-intl";

// Covers are supplied as wraparound spreads; .book-front crops each to
// its front board. Swap these paths if front-only files arrive.
export const BOOKS = [
  { key: "fireside", cover: "/images/firesidetales.jpeg" },
  { key: "poems", cover: "/images/my%20cameroon.jpg" },
] as const;

export default function BookCard({
  bookKey,
  cover,
  accent = "orange",
}: {
  bookKey: (typeof BOOKS)[number]["key"];
  cover: string;
  accent?: "orange" | "lime";
}) {
  const t = useTranslations("pengEdition.books");
  const tPe = useTranslations("pengEdition");

  const facts = [
    ["author", t(`${bookKey}.author`)],
    ["level", t(`${bookKey}.level`)],
    ["isbn", t(`${bookKey}.isbn`)],
    ["price", t(`${bookKey}.price`)],
  ] as const;

  return (
    <article className="grid gap-8 border-t-2 border-ink pt-8 sm:grid-cols-[186px_1fr] sm:gap-10">
      <div className="relative w-[150px] sm:w-[186px]">
        <span
          aria-hidden
          className={`absolute -bottom-2 -left-2 h-full w-full ${
            accent === "orange" ? "bg-orange" : "bg-lime"
          }`}
        />
        <span className="relative block border-2 border-ink">
          <Image
            src={cover}
            alt={`${t(`${bookKey}.title`)} — ${t(`${bookKey}.author`)}`}
            width={372}
            height={524}
            className="book-front"
          />
        </span>
      </div>

      <div>
        <span className="kin-mono text-orange-deep">
          {t(`${bookKey}.subject`)}
        </span>
        <h3 className="kin-display mt-3 text-[clamp(1.5rem,3.6vw,2.4rem)] text-ink">
          {t(`${bookKey}.title`)}
        </h3>
        <p className="mt-4 max-w-[54ch] leading-relaxed text-ink-soft">
          {t(`${bookKey}.description`)}
        </p>

        <dl className="mt-7 grid grid-cols-2 gap-x-8 gap-y-4 sm:grid-cols-4">
          {facts.map(([label, value]) => (
            <div key={label} className="border-t border-ink/20 pt-2.5">
              <dt className="kin-mono text-ink-faint">
                {t(`labels.${label}`)}
              </dt>
              <dd className="mt-1 font-semibold tabular-nums text-ink">
                {value}
              </dd>
            </div>
          ))}
        </dl>

        <p className="kin-chip kin-chip--fill mt-7">{tPe("prescribed")}</p>
      </div>
    </article>
  );
}
