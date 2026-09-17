"use client";

import { useLocale, useTranslations } from "next-intl";
import { usePathname, useRouter } from "@/i18n/navigation";
import { routing } from "@/i18n/routing";

export default function LocaleSwitcher({
  onInk = false,
}: {
  /** Invert for use over the ink hero. */
  onInk?: boolean;
}) {
  const t = useTranslations("langSwitcher");
  const locale = useLocale();
  const pathname = usePathname();
  const router = useRouter();

  const active = onInk ? "bg-paper text-ink" : "bg-ink text-paper";
  const idle = onInk
    ? "bg-transparent text-paper hover:bg-lime hover:text-ink"
    : "bg-paper text-ink hover:bg-lime hover:text-ink";

  return (
    <div
      className={`flex items-center border-2 transition-colors duration-300 ${
        onInk ? "border-paper" : "border-ink"
      }`}
      role="group"
      aria-label={t("label")}
    >
      {routing.locales.map((l) => (
        <button
          key={l}
          type="button"
          onClick={() => router.replace(pathname, { locale: l })}
          aria-pressed={l === locale}
          aria-label={t(l)}
          className={`kin-mono px-2.5 py-1.5 transition-colors ${
            l === locale ? active : idle
          }`}
        >
          {l}
        </button>
      ))}
    </div>
  );
}
