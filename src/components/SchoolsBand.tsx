import { useTranslations } from "next-intl";
import { Link } from "@/i18n/navigation";
import { Reveal } from "./motion/Kinetic";

/**
 * The schools & bookshops call to action, shared by the Peng Edition
 * pages.
 *
 * Display type carries only the short headline. It used to carry the
 * whole two-sentence paragraph in 800-weight capitals — eleven lines that
 * read as a wall — so the supporting sentences now sit beside it in
 * sentence case.
 */
export default function SchoolsBand() {
  const t = useTranslations("pengEdition.schools");

  return (
    <section className="bg-orange py-20 sm:py-28">
      <div className="mx-auto grid max-w-[1240px] gap-10 px-4 sm:px-8 lg:grid-cols-[1.15fr_0.85fr] lg:items-end">
        <Reveal>
          <span className="kin-mono text-ink/80">{t("heading")}</span>
          <h2 className="kin-display mt-6 max-w-[18ch] text-[clamp(1.9rem,4.2vw,3.2rem)] text-ink">
            {t("headline")}
          </h2>
        </Reveal>
        <Reveal delay={0.1}>
          <p className="max-w-[46ch] text-lg leading-relaxed text-ink">{t("p1")}</p>
          <p className="mt-4 max-w-[46ch] leading-relaxed text-ink/80">{t("p2")}</p>
          <Link
            href={{ pathname: "/contact", query: { type: "books" } }}
            className="kin-btn mt-8"
          >
            {t("cta")}
          </Link>
        </Reveal>
      </div>
    </section>
  );
}
