import Image from "next/image";
import { useTranslations } from "next-intl";

/**
 * The group, drawn as a structure: the holding above, its publishing
 * subsidiary and the brands it works with below, joined by rules that
 * draw themselves in.
 *
 * Every mark is a real, supplied asset (scripts/prepare-logos.mjs). The
 * brands branch is labelled "brands we work with", matching the partners
 * strip — it does not claim a representation agreement for every brand.
 *
 * Above the fold, so nothing here depends on a script: pieces rise with
 * .kin-rise and rules draw with .kin-draw-*, both finished by default.
 *
 * Connector geometry follows the two columns (38% and 58%, pushed apart):
 * their centres sit at 19% and 71%, and the holding's stem at 50% lands
 * on the bar between them.
 */
const BRANDS = [
  { name: "PENSAN", src: "/images/partners/pensan.webp", w: 614, h: 172, size: "h-6" },
  { name: "PENSAN Kidz", src: "/images/partners/pensan-kidz.webp", w: 398, h: 240, size: "h-10" },
  { name: "Flexoffice", src: "/images/partners/flexoffice.webp", w: 297, h: 240, size: "h-10" },
] as const;

const rise = (s: number) => ({ "--rise-delay": `${s}s` }) as React.CSSProperties;
const draw = (s: number) => ({ "--draw-delay": `${s}s` }) as React.CSSProperties;

export default function GroupMap() {
  const t = useTranslations("about.group");

  return (
    <div className="relative">
      {/* The holding */}
      <div
        className="kin-rise flex items-center gap-5 border-2 border-ink bg-paper px-5 py-4 sm:px-6 sm:py-5"
        style={rise(0.25)}
      >
        <Image
          src="/images/partners/peng-p.png"
          alt=""
          width={241}
          height={240}
          priority
          className="h-14 w-14 shrink-0 sm:h-16 sm:w-16"
        />
        <div>
          <span className="kin-mono block text-ink-faint">{t("holding")}</span>
          <span className="kin-display mt-1.5 block text-[clamp(1.25rem,2.2vw,1.75rem)] leading-[0.95] text-ink">
            Peng Global Holding
          </span>
        </div>
      </div>

      <div className="relative grid grid-cols-[38%_58%] justify-between pt-14">
        {/* Rules: stem from the holding, bar, and a drop to each branch. */}
        <span
          aria-hidden
          className="kin-draw-y absolute left-1/2 top-0 h-7 w-0.5 -translate-x-1/2 bg-ink"
          style={draw(0.55)}
        />
        <span
          aria-hidden
          className="kin-draw-x absolute left-[19%] right-[29%] top-7 h-0.5 bg-ink"
          style={draw(0.75)}
        />
        <span
          aria-hidden
          className="kin-draw-y absolute left-[19%] top-7 h-7 w-0.5 -translate-x-1/2 bg-ink"
          style={draw(1.0)}
        />
        <span
          aria-hidden
          className="kin-draw-y absolute left-[71%] top-7 h-7 w-0.5 -translate-x-1/2 bg-ink"
          style={draw(1.0)}
        />

        {/* Subsidiary */}
        <div className="kin-rise flex flex-col" style={rise(1.15)}>
          <div className="flex flex-1 flex-col items-center justify-center gap-3 border border-ink/20 bg-paper px-3 py-4">
            <Image
              src="/images/peng edition logo.jpeg"
              alt="Peng Edition"
              width={1254}
              height={1254}
              sizes="120px"
              className="kin-logo h-20 w-auto sm:h-24"
            />
          </div>
          <span className="kin-mono mt-3 block text-center text-ink-faint">
            {t("subsidiary")}
          </span>
        </div>

        {/* Brands */}
        <div className="flex flex-col">
          <div className="grid flex-1 grid-cols-2 gap-2 sm:grid-cols-3">
            {BRANDS.map((b, i) => (
              <div
                key={b.name}
                className="kin-rise flex min-h-20 items-center justify-center border border-ink/20 bg-paper px-2 py-3"
                style={rise(1.25 + i * 0.08)}
              >
                <Image
                  src={b.src}
                  alt={b.name}
                  title={b.name}
                  width={b.w}
                  height={b.h}
                  sizes="120px"
                  className={`kin-logo ${b.size} w-auto max-w-full object-contain`}
                />
              </div>
            ))}
          </div>
          <span className="kin-mono mt-3 block text-center text-ink-faint">
            {t("brands")}
          </span>
        </div>
      </div>
    </div>
  );
}
