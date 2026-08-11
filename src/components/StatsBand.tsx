"use client";

import { useTranslations } from "next-intl";
import { Stagger, Item } from "./motion/Kinetic";

const STATS = [
  { value: "outletsValue", label: "outletsLabel" },
  { value: "staffValue", label: "staffLabel" },
  { value: "coverageValue", label: "coverageLabel" },
  { value: "ratingValue", label: "ratingLabel" },
] as const;

/**
 * Operating figures.
 *
 * Rendered as plain static text on purpose. The previous site animated
 * these with a count-up script, so they showed "0" whenever the script
 * failed or a crawler read the page — the exact failure this replaces.
 * The numbers are in the markup; motion only fades the cells in.
 */
export default function StatsBand() {
  const t = useTranslations("home.stats");

  return (
    <section className="kin-on-ink border-y-2 border-ink py-16 sm:py-20">
      <div className="mx-auto max-w-[1240px] px-4 sm:px-8">
        <div className="flex flex-wrap items-baseline justify-between gap-3 border-b border-paper/20 pb-4">
          <span className="kin-mono kin-green-mark">{t("eyebrow")}</span>
          <span className="kin-mono text-paper/40">{t("since")}</span>
        </div>

        <Stagger
          className="mt-10 grid gap-x-8 gap-y-10 sm:grid-cols-2 lg:grid-cols-4"
          gap={0.09}
        >
          {STATS.map(({ value, label }) => (
            <Item key={label}>
              <div className="border-t-2 border-lime pt-5">
                <p className="kin-display text-[clamp(2.6rem,6vw,4rem)] tabular-nums text-paper">
                  {t(value)}
                </p>
                <p className="kin-mono mt-3 text-paper/60">{t(label)}</p>
              </div>
            </Item>
          ))}
        </Stagger>
      </div>
    </section>
  );
}
