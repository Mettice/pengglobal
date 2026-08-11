import type { Metadata } from "next";
import { Archivo, IBM_Plex_Mono } from "next/font/google";
import en from "../../messages/en.json";
import fr from "../../messages/fr.json";
import "./globals.css";

/**
 * 404 for URLs that match no route at all.
 *
 * Next skips rendering entirely for this file, so it gets no layout, no
 * provider, and no locale — hence the full HTML document, the local font
 * setup, and the messages imported straight from the catalogues rather
 * than read through next-intl.
 *
 * Because there is no locale to read, the page answers in both. That is
 * honest for a site where neither language is a fallback for the other,
 * and it avoids guessing wrong at the one moment a visitor is already
 * lost. Copy stays in sync with the localized not-found via the shared
 * `notFound` keys.
 */

// Two families, not three: this page loads outside the normal document,
// so every byte here is additional.
const archivo = Archivo({
  variable: "--font-archivo",
  subsets: ["latin"],
  weight: ["400", "800"],
  display: "swap",
});

const plexMono = IBM_Plex_Mono({
  variable: "--font-plex-mono",
  subsets: ["latin"],
  weight: ["500"],
  display: "swap",
});

export const metadata: Metadata = {
  title: "404 · Peng Global Holding",
  description: en.notFound.text,
};

const LANGUAGES = [
  { code: "en", label: "English", href: "/en", copy: en.notFound },
  { code: "fr", label: "Français", href: "/fr", copy: fr.notFound },
] as const;

export default function GlobalNotFound() {
  return (
    <html
      lang="en"
      className={`${archivo.variable} ${plexMono.variable} h-full antialiased`}
    >
      {/* kin-on-ink carries the ground colour and flips .kin-btn polarity */}
      <body className="kin-on-ink flex min-h-full flex-col">
        <main className="mx-auto flex w-full max-w-[1240px] flex-1 flex-col justify-center px-4 py-20 sm:px-8">
          <span className="kin-mono text-orange">Peng Global Holding</span>

          <p
            aria-hidden
            className="kin-display mt-6 text-[clamp(5rem,22vw,14rem)] leading-none text-paper"
          >
            404
          </p>

          <hr className="mt-8 h-[5px] border-0 bg-orange sm:w-40" />

          <div className="mt-12 grid gap-10 sm:grid-cols-2 sm:gap-14">
            {LANGUAGES.map(({ code, label, href, copy }) => (
              <div key={code} lang={code}>
                <span className="kin-mono text-paper/50">{label}</span>
                <h1 className="kin-display mt-3 text-[clamp(1.5rem,3.4vw,2.2rem)] text-paper">
                  {copy.heading}
                </h1>
                <p className="mt-4 max-w-[38ch] leading-relaxed text-paper/70">
                  {copy.text}
                </p>
                {/* Plain anchors: next/link needs a router this page has no
                    access to, and a 404 must work as raw HTML anyway. */}
                <a href={href} className="kin-btn mt-7">
                  {copy.cta}
                </a>
              </div>
            ))}
          </div>
        </main>
      </body>
    </html>
  );
}
