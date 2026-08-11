import { useTranslations } from "next-intl";
import { Link } from "@/i18n/navigation";

export default function NotFound() {
  const t = useTranslations("notFound");

  return (
    <section className="mx-auto max-w-3xl px-4 py-24 text-center sm:px-6">
      <h1 className="text-4xl font-bold tracking-tight text-ink">
        {t("heading")}
      </h1>
      <p className="mt-4 text-ink-soft">{t("text")}</p>
      <Link
        href="/"
        className="kin-btn mt-8"
      >
        {t("cta")}
      </Link>
    </section>
  );
}
