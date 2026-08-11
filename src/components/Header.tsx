"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import { Link, usePathname } from "@/i18n/navigation";
import Image from "next/image";
import LocaleSwitcher from "./LocaleSwitcher";

const NAV_ITEMS = [
  { key: "home", href: "/" },
  { key: "about", href: "/about" },
  { key: "services", href: "/services" },
  { key: "pengEdition", href: "/peng-edition" },
  { key: "contact", href: "/contact" },
] as const;

export default function Header() {
  const t = useTranslations("nav");
  const pathname = usePathname();
  const [open, setOpen] = useState(false);

  const isActive = (href: string) =>
    href === "/" ? pathname === "/" : pathname.startsWith(href);

  return (
    <header className="sticky top-0 z-40 border-b-2 border-ink bg-paper">
      <div className="mx-auto flex h-[68px] max-w-[1240px] items-center justify-between gap-4 px-4 sm:px-8">
        {/* The supplied wordmark is already green type on white; multiply
            drops the white so it prints straight onto the paper ground. */}
        <Link
          href="/"
          className="flex items-center"
          onClick={() => setOpen(false)}
          aria-label="Peng Global Holding"
        >
          <Image
            src="/images/LOGO.jpg"
            alt="Peng Global Holding"
            width={200}
            height={120}
            priority
            className="kin-logo h-11 w-auto"
          />
        </Link>

        <nav className="hidden items-center gap-7 md:flex" aria-label="Main">
          {NAV_ITEMS.map((item) => (
            <Link
              key={item.key}
              href={item.href}
              aria-current={isActive(item.href) ? "page" : undefined}
              className={`kin-mono kin-link transition-colors ${
                isActive(item.href)
                  ? "text-orange-deep"
                  : "text-ink hover:text-orange-deep"
              }`}
            >
              {t(item.key)}
            </Link>
          ))}
        </nav>

        <div className="flex items-center gap-3">
          <LocaleSwitcher />
          <button
            type="button"
            className="flex h-10 w-10 items-center justify-center border border-ink text-ink md:hidden"
            aria-expanded={open}
            aria-label={open ? t("closeMenu") : t("menu")}
            onClick={() => setOpen((v) => !v)}
          >
            <svg
              className="h-5 w-5"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth={2}
              aria-hidden
            >
              {open ? (
                <path strokeLinecap="square" d="M6 6l12 12M18 6L6 18" />
              ) : (
                <path strokeLinecap="square" d="M4 7h16M4 12h16M4 17h16" />
              )}
            </svg>
          </button>
        </div>
      </div>

      {open && (
        <nav
          className="border-t-2 border-ink bg-paper px-4 pb-4 pt-2 md:hidden"
          aria-label="Main"
        >
          {NAV_ITEMS.map((item) => (
            <Link
              key={item.key}
              href={item.href}
              onClick={() => setOpen(false)}
              aria-current={isActive(item.href) ? "page" : undefined}
              className={`kin-mono block border-b border-ink/15 py-4 ${
                isActive(item.href) ? "text-orange-deep" : "text-ink"
              }`}
            >
              {t(item.key)}
            </Link>
          ))}
        </nav>
      )}
    </header>
  );
}
