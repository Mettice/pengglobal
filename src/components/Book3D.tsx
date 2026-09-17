import Image from "next/image";
import { useTranslations } from "next-intl";
import { Link } from "@/i18n/navigation";

/**
 * The two Peng Edition titles, as solids.
 *
 * Faces are pre-cut from the print spreads by scripts/cut-book-covers.mjs
 * — the spine really is the book's spine. Everything moves in CSS: the
 * resting turn, the idle drift, and the turn-toward-you on hover. Nothing
 * here depends on JavaScript, so a book that never gets a script still
 * renders as a book rather than as empty space.
 */

export type BookFaces = {
  key: "fireside" | "poems";
  /** Widest board, in px, at the largest breakpoint. */
  width: number;
};

export const BOOK_FACES: readonly BookFaces[] = [
  { key: "fireside", width: 250 },
  { key: "poems", width: 250 },
] as const;

export default function Book3D({
  bookKey,
  width = 220,
  /** Staggers the idle drift so the two never bob in lockstep. */
  driftDelay = "0s",
  priority = false,
  className = "",
}: {
  bookKey: BookFaces["key"];
  width?: number;
  driftDelay?: string;
  priority?: boolean;
  className?: string;
}) {
  const t = useTranslations("pengEdition.books");
  const title = t(`${bookKey}.title`);
  const author = t(`${bookKey}.author`);
  const base = `/images/books/${bookKey}`;

  // The board is 2:3; faces are rendered at 2x for retina.
  const boardH = Math.round(width / 0.67);

  // Books are usually shown in pairs, so each is capped to 38vw: two plus
  // their gap still fit a 390px phone. A fixed width let the pair reach
  // 532px there, which widened its grid column and scrolled the page
  // sideways. Every face dimension derives from --board-w, so capping it
  // scales the whole solid.
  const boardW = `min(${width}px, 38vw)`;

  return (
    <div className={`book3d-float ${className}`} style={{ "--drift-delay": driftDelay } as React.CSSProperties}>
      <Link
        href="/peng-edition/books"
        aria-label={`${title} — ${author}`}
        className="book3d-scene relative"
      >
        <span aria-hidden className="book3d-shadow" />

        <span
          className="book3d"
          style={{ "--board-w": boardW } as React.CSSProperties}
        >
          <span className="book3d__face book3d__front">
            <Image
              src={`${base}-front.webp`}
              alt=""
              width={width * 2}
              height={boardH * 2}
              priority={priority}
              sizes={boardW}
            />
          </span>

          <span className="book3d__face book3d__spine">
            <Image
              src={`${base}-spine.webp`}
              alt=""
              width={64}
              height={boardH * 2}
              priority={priority}
              sizes="24px"
            />
          </span>

          {/* No back board is mounted. The object only ever turns between
              7° and 26°, so the back can never come into view — rendering
              it cost ~137KB and was being picked as the LCP element while
              facing away from the camera. scripts/cut-book-covers.mjs
              still emits it; the back cover's real value is its blurb and
              price, which belong in the catalogue as text. */}
          <span aria-hidden className="book3d__face book3d__pages" />
          <span aria-hidden className="book3d__face book3d__edge book3d__head" />
          <span aria-hidden className="book3d__face book3d__edge book3d__tail" />
        </span>
      </Link>
    </div>
  );
}
