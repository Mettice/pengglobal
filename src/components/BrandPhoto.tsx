import Image from "next/image";

/**
 * Photography, treated as a brand device.
 *
 * Every photograph on the site passes through here so a mixed bag of
 * sources (commissioned shots, product stills, licensed frames) reads as
 * one deliberate system rather than a stock library. `tone` selects the
 * duotone highlight; `trueColour` opts out for artwork that must stay
 * faithful, such as book covers and packaging.
 *
 * When no image has been supplied yet, the frame renders as a designed
 * placeholder instead of a broken box — honest about what is missing.
 */
export default function BrandPhoto({
  src,
  alt = "",
  tone = "lime",
  trueColour = false,
  priority = false,
  width = 900,
  height = 1100,
  className = "",
  pendingLabel,
  pendingNote,
  onInk = false,
}: {
  src?: string;
  alt?: string;
  tone?: "lime" | "orange" | "paper";
  trueColour?: boolean;
  priority?: boolean;
  width?: number;
  height?: number;
  className?: string;
  pendingLabel?: string;
  pendingNote?: string;
  onInk?: boolean;
}) {
  const toneClass =
    tone === "orange"
      ? "kin-photo--orange"
      : tone === "paper"
        ? "kin-photo--paper"
        : "";

  if (!src) {
    // Designed empty state: names the shot that belongs here so the gap
    // is legible as a decision, not an oversight.
    const edge = onInk ? "border-paper/30" : "border-ink/25";
    // Faint is still AA: an empty slot should read as quiet, not illegible.
    const strong = onInk ? "text-paper/70" : "text-ink/70";
    const faint = onInk ? "text-paper/55" : "text-ink/60";
    const ground = onInk ? "bg-paper/5" : "bg-paper-2";

    return (
      <div
        className={`relative flex flex-col items-center justify-center gap-2 border-2 border-dashed ${edge} ${ground} ${className}`}
      >
        <svg
          className={`h-8 w-8 ${faint}`}
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
          strokeWidth={1.4}
          aria-hidden
        >
          <path
            strokeLinecap="square"
            d="M3 5h18v14H3zM3 16l5-5 4 4 3-3 6 6"
          />
          <circle cx="8.5" cy="9" r="1.5" />
        </svg>
        {pendingLabel && (
          <span className={`kin-mono px-4 text-center ${strong}`}>
            {pendingLabel}
          </span>
        )}
        {pendingNote && (
          <span className={`kin-mono px-4 text-center ${faint}`}>
            {pendingNote}
          </span>
        )}
      </div>
    );
  }

  return (
    <div
      className={`kin-photo ${toneClass} ${trueColour ? "kin-photo--true" : ""} ${className}`}
    >
      <Image
        src={src}
        alt={alt}
        width={width}
        height={height}
        priority={priority}
        className="h-full w-full object-cover"
      />
    </div>
  );
}
