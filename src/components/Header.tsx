"use client";

import { useEffect, useState } from "react";
import { useTranslations } from "next-intl";
import { Link, usePathname } from "@/i18n/navigation";
import Image from "next/image";
import { HEADER_HEIGHT, HERO_ID } from "@/lib/hero";
import LocaleSwitcher from "./LocaleSwitcher";

const NAV_ITEMS = [
  { key: "home", href: "/" },
  { key: "about", href: "/about" },
  { key: "services", href: "/services" },
  { key: "pengEdition", href: "/peng-edition" },
  { key: "contact", href: "/contact" },
] as const;

/**
 * Site header.
 *
 * Inner pages: a sticky paper bar, unchanged.
 *
 * Home: fixed over the cinematic hero. While the hero is under it, the bar
 * is transparent with paper type and the nav sits in an ink-glass panel;
 * once the hero has scrolled past, it becomes the paper bar. Only colours
 * change between the two states — the structure is identical — so the
 * switch never moves anything. Being fixed rather than switching from
 * absolute to sticky is what avoids a layout jump at that moment.
 */
export default function Header() {
  const t = useTranslations("nav");
  const tHero = useTranslations("home.hero");
  const pathname = usePathname();
  const [open, setOpen] = useState(false);
  const [overHero, setOverHero] = useState(true);

  const isHome = pathname === "/";
  const dark = isHome && overHero;

  useEffect(() => {
    if (!isHome) return;
    const hero = document.getElementById(HERO_ID);
    if (!hero) return;
    // Treat the hero as gone once its bottom edge passes under the bar.
    const observer = new IntersectionObserver(
      ([entry]) => setOverHero(entry.isIntersecting),
      { rootMargin: `-${HEADER_HEIGHT}px 0px 0px 0px` },
    );
    observer.observe(hero);
    return () => observer.disconnect();
  }, [isHome]);

  const isActive = (href: string) =>
    href === "/" ? pathname === "/" : pathname.startsWith(href);

  const linkTone = (active: boolean) =>
    dark
      ? active
        ? "text-paper"
        : "text-paper/80 hover:text-paper"
      : active
        ? "text-orange-deep"
        : "text-ink hover:text-orange-deep";

  return (
    <header
      className={`top-0 z-40 border-b-2 transition-colors duration-300 ${
        isHome ? "fixed inset-x-0" : "sticky"
      } ${
        // kin-on-ink flips .kin-btn to its paper form; bg-transparent
        // overrides kin-on-ink's own ink ground.
        dark ? "kin-on-ink border-transparent bg-transparent" : "border-ink bg-paper"
      }`}
    >
      <div
        className="mx-auto flex max-w-[1240px] items-center justify-between gap-4 px-4 sm:px-8"
        style={{ height: HEADER_HEIGHT }}
      >
        {/* The brand lockup, cut to real transparency by
            scripts/prepare-logos.mjs — the green reads on paper and over
            the hero alike, so it needs no tile in either state. */}
        <Link
          href="/"
          className="flex shrink-0 items-center"
          onClick={() => setOpen(false)}
          aria-label="Peng Global Holding"
        >
          <Image
            src="/images/brand/peng-global-compact.png"
            alt="Peng Global Holding"
            width={959}
            height={218}
            priority
            sizes="200px"
            className="h-9 w-auto sm:h-10"
          />
        </Link>

        {isHome ? (
          <nav
            className={`hidden items-center gap-1 border px-2 py-2 transition-colors duration-300 md:flex ${
              dark
                ? "border-paper/20 bg-ink/40 backdrop-blur-[6px]"
                : "border-ink/15 bg-transparent"
            }`}
            aria-label="Main"
          >
            {NAV_ITEMS.map((item) => {
              const active = isActive(item.href);
              return (
                <Link
                  key={item.key}
                  href={item.href}
                  aria-current={active ? "page" : undefined}
                  className={`kin-mono relative px-3 py-1.5 transition-colors lg:px-4 ${linkTone(active)}`}
                >
                  {t(item.key)}
                  {active && (
                    <span
                      aria-hidden
                      className={`absolute inset-x-3 -bottom-0.5 h-[2px] lg:inset-x-4 ${
                        dark ? "bg-lime" : "bg-orange-deep"
                      }`}
                    />
                  )}
                </Link>
              );
            })}
          </nav>
        ) : (
          <nav className="hidden items-center gap-7 md:flex" aria-label="Main">
            {NAV_ITEMS.map((item) => (
              <Link
                key={item.key}
                href={item.href}
                aria-current={isActive(item.href) ? "page" : undefined}
                className={`kin-mono kin-link transition-colors ${linkTone(
                  isActive(item.href),
                )}`}
              >
                {t(item.key)}
              </Link>
            ))}
          </nav>
        )}

        <div className="flex items-center gap-3">
          {isHome && (
            <Link href="/contact" className="kin-btn hidden xl:inline-flex">
              {tHero("cta1")}
            </Link>
          )}
          <LocaleSwitcher onInk={dark} />
          <button
            type="button"
            className={`flex h-10 w-10 items-center justify-center border transition-colors duration-300 md:hidden ${
              dark ? "border-paper text-paper" : "border-ink text-ink"
            }`}
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
