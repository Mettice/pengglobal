"use client";

import { useEffect, useState } from "react";
import { useTranslations } from "next-intl";

type Title = "fireside" | "poems";
type Side = "front" | "back";

/**
 * Copies of the two real titles, stocked the way a school order arrives.
 * Peng Edition publishes two books, and the shelf never implies more:
 * every volume here is one of them. Back covers are mixed in for rhythm
 * — they are the same books turned around, and they carry the spine on
 * the side facing the reader.
 */
const SHELF: { title: Title; side: Side }[] = [
  { title: "poems", side: "front" },
  { title: "fireside", side: "front" },
  { title: "poems", side: "back" },
  { title: "fireside", side: "front" },
  { title: "poems", side: "front" },
  { title: "fireside", side: "back" },
  { title: "poems", side: "front" },
  { title: "fireside", side: "front" },
  { title: "poems", side: "front" },
  { title: "poems", side: "back" },
  { title: "fireside", side: "front" },
  { title: "poems", side: "front" },
  { title: "fireside", side: "back" },
  { title: "fireside", side: "front" },
  { title: "poems", side: "front" },
  { title: "fireside", side: "front" },
  { title: "poems", side: "back" },
  { title: "fireside", side: "front" },
  { title: "poems", side: "front" },
  { title: "fireside", side: "back" },
];

/** Idle spotlight order — all within the part of the row phones render. */
const SPOTLIGHT = [3, 6, 9, 5, 8, 4, 7, 2];
const FIRST_MS = 1200;
const EVERY_MS = 2600;
/** Books at or beyond this index are not rendered on phones. */
const FAR = 10;

const face = (file: string): React.CSSProperties => ({
  backgroundImage: `url(/images/books/${file}.webp)`,
  backgroundSize: "cover",
  backgroundPosition: "center",
});

/**
 * The Peng Edition shelf: a long row of the books, one of which turns to
 * face the reader — the book under the pointer, or an idle spotlight
 * that walks the row so the interaction is visible before anyone moves.
 * Hovering a title pill leans every copy of that title out.
 *
 * Everything moves in CSS (.shelf in globals.css); this component only
 * chooses which book is in focus. With reduced motion there is no idle
 * spotlight, and a hovered book arrives rather than travels.
 *
 * The books are decorative copies, so they are hidden from assistive
 * tech and out of the tab order; the pills are the accessible route to
 * each title in the catalogue below.
 */
export default function BookShelf() {
  const t = useTranslations("pengEdition.books");
  const [active, setActive] = useState<number | null>(null);
  const [lit, setLit] = useState<Title | null>(null);

  useEffect(() => {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    let step = 0;
    let timer = window.setTimeout(function tick() {
      setActive(SPOTLIGHT[step++ % SPOTLIGHT.length]);
      timer = window.setTimeout(tick, EVERY_MS);
    }, FIRST_MS);
    return () => window.clearTimeout(timer);
  }, []);

  // A lit title takes over from the idle spotlight.
  const focus = lit ? null : active;

  return (
    <>
      <div className="shelf" aria-hidden>
        {SHELF.map((book, i) => (
          <a
            key={i}
            href={`#${book.title}`}
            tabIndex={-1}
            className="shelf-slot"
            data-active={focus === i || undefined}
            data-lit={lit === book.title || undefined}
            data-far={i >= FAR || undefined}
            style={{ "--i": i } as React.CSSProperties}
          >
            <span className="book3d">
              <span
                className={`book3d__face book3d__front ${
                  book.side === "back" ? "book3d__front--flip" : ""
                }`}
                style={face(`${book.title}-${book.side}`)}
              />
              {/* Left side: the spine on a front-facing copy; paper on a
                  copy turned around. */}
              <span
                className={`book3d__face book3d__spine ${
                  book.side === "back" ? "book3d__paper" : ""
                }`}
                style={book.side === "front" ? face(`${book.title}-spine`) : undefined}
              />
              {/* Right side, the one the reader sees: paper on a
                  front-facing copy; the spine on one turned around. */}
              <span
                className="book3d__face book3d__pages"
                style={book.side === "back" ? face(`${book.title}-spine`) : undefined}
              />
              <span className="book3d__face book3d__edge book3d__head" />
              <span className="book3d__face book3d__edge book3d__tail" />
            </span>
          </a>
        ))}
      </div>

      {/* Lets the row sink into the page, and seats the pills. */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-x-0 bottom-0 z-[70] h-28 bg-gradient-to-t from-ink to-transparent"
      />

      <nav
        aria-label={t("labels.titlesNav")}
        className="absolute inset-x-0 bottom-6 z-[80] flex flex-wrap justify-center gap-2 px-4"
      >
        {(["fireside", "poems"] as const).map((key) => (
          <a
            key={key}
            href={`#${key}`}
            onMouseEnter={() => setLit(key)}
            onMouseLeave={() => setLit(null)}
            onFocus={() => setLit(key)}
            onBlur={() => setLit(null)}
            className="kin-mono border border-paper/25 bg-ink/70 px-4 py-2.5 text-paper/85 backdrop-blur-[4px] transition-colors hover:border-paper/60 hover:text-paper"
          >
            {t(`${key}.title`)}
          </a>
        ))}
      </nav>
    </>
  );
}
