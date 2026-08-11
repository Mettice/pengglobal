import { useTranslations } from "next-intl";
import { Link } from "@/i18n/navigation";

export default function Footer() {
  const t = useTranslations("footer");
  const tNav = useTranslations("nav");
  const tContact = useTranslations("contact.details");

  return (
    <footer className="kin-on-ink border-t-2 border-ink">
      <div className="mx-auto max-w-[1240px] px-4 sm:px-8">
        {/* Oversized wordmark as the closing statement */}
        <div className="border-b border-paper/20 py-12">
          <p className="kin-display text-[clamp(2.4rem,10vw,7rem)] leading-[0.85] text-paper">
            Peng <span className="kin-accent-green">Global</span>
            <span className="text-orange">.</span>
          </p>
          {/* The company's own strapline, taken from the supplied logo */}
          <p className="kin-italic mt-5 text-[clamp(1.1rem,2.4vw,1.6rem)] text-paper/80">
            Holding your hands in a changing world
          </p>
          <p className="mt-3 max-w-[40ch] text-paper/60">{t("tagline")}</p>
        </div>

        <div className="grid gap-10 py-12 md:grid-cols-3">
          <nav aria-label={t("navHeading")}>
            <h2 className="kin-mono text-paper/50">{t("navHeading")}</h2>
            <ul className="mt-4 space-y-2.5">
              {(
                [
                  ["about", "/about"],
                  ["services", "/services"],
                  ["pengEdition", "/peng-edition"],
                  ["books", "/peng-edition/books"],
                  ["contact", "/contact"],
                ] as const
              ).map(([key, href]) => (
                <li key={key}>
                  <Link href={href} className="kin-link text-paper/85">
                    {tNav(key)}
                  </Link>
                </li>
              ))}
            </ul>
          </nav>

          <div>
            <h2 className="kin-mono text-paper/50">{t("contactHeading")}</h2>
            <ul className="mt-4 space-y-3 text-paper/85">
              <li>
                <span className="kin-mono block text-paper/40">
                  {tContact("emailLabel")}
                </span>
                <a href={`mailto:${tContact("email")}`} className="kin-link">
                  {tContact("email")}
                </a>
              </li>
              <li>
                <span className="kin-mono block text-paper/40">
                  {tContact("phoneLabel")}
                </span>
                {tContact("phone")}
              </li>
              <li>
                <span className="kin-mono block text-paper/40">
                  {tContact("addressLabel")}
                </span>
                {tContact("address")}
              </li>
            </ul>
          </div>

          <div>
            <h2 className="kin-mono text-paper/50">{t("legalHeading")}</h2>
            <ul className="mt-4 space-y-2.5">
              <li>
                <Link href="/legal-notice" className="kin-link text-paper/85">
                  {t("legalNotice")}
                </Link>
              </li>
              <li>
                <Link href="/privacy" className="kin-link text-paper/85">
                  {t("privacy")}
                </Link>
              </li>
            </ul>
          </div>
        </div>

        <p className="kin-mono border-t border-paper/20 py-6 text-paper/40">
          {t("copyright", { year: new Date().getFullYear() })}
        </p>
      </div>
    </footer>
  );
}
