"use client";

import { useLocale, useTranslations } from "next-intl";
import { usePathname, useRouter } from "@/i18n/navigation";
import { routing } from "@/i18n/routing";

export default function LocaleSwitcher() {
  const t = useTranslations("langSwitcher");
  const locale = useLocale();
  const pathname = usePathname();
  const router = useRouter();

  return (
    <div
      className="flex items-center border-2 border-ink"
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
            l === locale
              ? "bg-ink text-paper"
              : "bg-paper text-ink hover:bg-lime hover:text-ink"
          }`}
        >
          {l}
        </button>
      ))}
    </div>
  );
}
