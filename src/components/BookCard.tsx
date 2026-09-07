import { useTranslations } from "next-intl";
import Book3D from "./Book3D";

// `cover` is the cut front board, not the original spread: it is what
// structured data should advertise, since a search result showing a
// flattened back-and-front spread reads as a printing error.
// `hasBlurb` is a fact about the printed object, not a display option:
// Fireside Tales carries a publisher's blurb on its back board, My
// Cameroon and Other Poems carries only the biography. Recording it here
// keeps us from inventing one for the book that has none.
export const BOOKS = [
  { key: "fireside", cover: "/images/books/fireside-front.webp", hasBlurb: true },
  { key: "poems", cover: "/images/books/poems-front.webp", hasBlurb: false },
] as const;

export default function BookCard({
  bookKey,
  accent = "orange",
  hasBlurb = false,
}: {
  bookKey: (typeof BOOKS)[number]["key"];
  accent?: "orange" | "lime";
  hasBlurb?: boolean;
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
    <article className="grid gap-10 border-t-2 border-ink pt-8 sm:grid-cols-[210px_1fr] sm:gap-12">
      {/* A colour block behind the object, set on the ground plane rather
          than offset like a flat card's drop shadow — the book already
          casts its own. */}
      <div className="relative">
        <span
          aria-hidden
          className={`absolute bottom-0 left-0 h-[62%] w-[74%] ${
            accent === "orange" ? "bg-orange" : "bg-lime"
          }`}
        />
        <div className="relative pl-4 pt-4">
          <Book3D
            bookKey={bookKey}
            width={170}
            driftDelay={accent === "orange" ? "0s" : "-4.5s"}
          />
        </div>
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

        {/* The publisher's own blurb, as printed on the back board. Set in
            the serif italic — the one soft moment in the system — because
            this is the book's literary voice, not ours. */}
        {hasBlurb && (
          <blockquote className="mt-7 border-l-2 border-orange pl-5">
            <p className="kin-italic max-w-[52ch] text-[1.15rem] leading-snug text-ink">
              {t(`${bookKey}.blurb`)}
            </p>
          </blockquote>
        )}

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
