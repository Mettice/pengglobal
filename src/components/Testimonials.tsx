"use client";

import { useTranslations } from "next-intl";
import { Stagger, Item, Reveal } from "./motion/Kinetic";

/**
 * Client testimonials, carried over from the current site — real named
 * people, published as they gave them. Nothing here is written for them:
 * the quotes are verbatim, and the only editorial choice is the order.
 *
 * Laid out as three cards of equal weight rather than a carousel: there
 * are three, they are short, and a reader should be able to take all of
 * them in without waiting for a slide. The quote mark is set large and
 * faint so it reads as a mark on the page, not as punctuation competing
 * with the words.
 */
const VOICES = ["tunisia", "germany", "turkey"] as const;

export default function Testimonials() {
  const t = useTranslations("home.voices");

  return (
    <section className="bg-paper py-16 sm:py-24">
      <div className="mx-auto max-w-[1240px] px-4 sm:px-8">
        <Reveal>
          <span className="kin-mono text-ink-faint">{t("label")}</span>
          <h2 className="kin-display mt-4 max-w-[16ch] text-[clamp(1.9rem,5vw,3.4rem)] text-ink">
            {t("heading")}
          </h2>
        </Reveal>

        <Stagger className="mt-10 grid gap-px bg-ink/15 md:grid-cols-3">
          {VOICES.map((key) => (
            <Item key={key}>
              {/* Full height so the three cards square off against each
                  other however long the quotes run. */}
              <figure className="flex h-full flex-col bg-paper-2 p-7 sm:p-8">
                <span
                  aria-hidden
                  className="kin-display text-6xl leading-[0.7] text-lime"
                >
                  &ldquo;
                </span>

                <blockquote className="mt-6 flex-1 text-[0.95rem] leading-relaxed text-ink-soft">
                  {t(`${key}.quote`)}
                </blockquote>

                <figcaption className="mt-7 border-t border-ink/15 pt-5">
                  <span className="kin-display block text-xl leading-[0.95] text-ink">
                    {t(`${key}.name`)}
                  </span>
                  <span className="kin-mono mt-2 block text-ink-faint">
                    {t(`${key}.place`)}
                  </span>
                </figcaption>
              </figure>
            </Item>
          ))}
        </Stagger>
      </div>
    </section>
  );
}
