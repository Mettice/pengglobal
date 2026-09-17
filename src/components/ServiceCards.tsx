"use client";

import { useTranslations } from "next-intl";
import { Stagger, Item } from "./motion/Kinetic";

export const SERVICE_KEYS = [
  "representation",
  "importExport",
  "contracts",
  "machinery",
] as const;

const ICONS: Record<(typeof SERVICE_KEYS)[number], React.ReactNode> = {
  representation: (
    <path
      strokeLinecap="square"
      d="M12 21a9 9 0 100-18 9 9 0 000 18zm0-18c2.5 2.4 3.8 5.6 3.8 9s-1.3 6.6-3.8 9m0-18c-2.5 2.4-3.8 5.6-3.8 9s1.3 6.6 3.8 9M3.5 9h17M3.5 15h17"
    />
  ),
  importExport: (
    <path strokeLinecap="square" d="M16 3l4 4-4 4M20 7H8M8 13l-4 4 4 4M4 17h12" />
  ),
  contracts: (
    <path
      strokeLinecap="square"
      d="M9 12h6m-6 4h6M7 3h7l5 5v13H7a1 1 0 01-1-1V4a1 1 0 011-1zm7 0v5h5"
    />
  ),
  machinery: (
    <path
      strokeLinecap="square"
      d="M7 17a2 2 0 100 4 2 2 0 000-4zm10 0a2 2 0 100 4 2 2 0 000-4zM3 17V9h9l2-5h3l2 5h2v8m-14 2h8"
    />
  ),
};

export default function ServiceCards({
  showPractice = false,
}: {
  showPractice?: boolean;
}) {
  const t = useTranslations("services");

  return (
    <Stagger className="grid gap-px bg-ink/15 sm:grid-cols-2" gap={0.09}>
      {SERVICE_KEYS.map((key) => (
        <Item key={key}>
          {/* Full-height so the inverting hover fills the whole cell */}
          <article className="group h-full bg-paper p-7 transition-colors duration-300 hover:bg-ink sm:p-9">
            <div className="flex items-start justify-between gap-4">
              <span className="kin-mono text-ink-faint transition-colors group-hover:text-orange">
                {t(`${key}.label`)}
              </span>
              <svg
                className="h-7 w-7 shrink-0 text-ink transition-colors group-hover:text-paper"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                strokeWidth={1.4}
                aria-hidden
              >
                {ICONS[key]}
              </svg>
            </div>

            <h3 className="kin-display mt-6 text-2xl leading-[0.88] text-ink transition-colors group-hover:text-paper sm:text-[1.7rem]">
              {t(`${key}.title`)}
            </h3>

            <p className="mt-4 max-w-[46ch] text-[0.95rem] leading-relaxed text-ink-soft transition-colors group-hover:text-paper/70">
              {t(`${key}.description`)}
            </p>

            {showPractice && (
              <p className="mt-6 border-t border-ink/15 pt-4 text-[0.9rem] leading-relaxed text-ink-soft transition-colors group-hover:border-paper/20 group-hover:text-paper/70">
                <span className="kin-mono mr-2 text-orange-deep transition-colors group-hover:text-orange">
                  {t("inPractice")}
                </span>
                {t(`${key}.practice`)}
              </p>
            )}
          </article>
        </Item>
      ))}
    </Stagger>
  );
}
