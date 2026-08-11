# Photography specification — Peng Global Holding

Every photograph on the site passes through `<BrandPhoto>`, which applies a
duotone treatment (ink shadows + brand-hue highlights). That is what stops a
licensed frame from reading as a stock-library plate: it becomes an
art-directed brand asset rather than a photo of strangers.

Because of the treatment, **composition and subject matter matter far more
than colour, styling, or model attractiveness.** Buy for shape, not polish.

---

## What to license

Five images cover the whole site. Landscape unless noted.

| # | Slot | Subject | Notes |
|---|------|---------|-------|
| 1 | Home hero | Cargo containers, port quay, or stacked freight | **Portrait or square** (4:5). No faces. Strong diagonal or grid structure duotones best. |
| 2 | About | Warehouse interior — racking, pallets, stock depth | Wide. Suggests scale without claiming a specific site. |
| 3 | Services · representation | Stationery/office products on a retail shelf | Close crop. Product, not people. |
| 4 | Services · logistics | Truck loading, or freight moving through a yard | Motion helps. Avoid recognisable foreign branding. |
| 5 | Contact | Douala or Central African cityscape / port skyline | Geographic honesty — this is the market being served. |

### Hard rules

- **No identifiable faces.** A recognisable stranger presented as Peng staff is
  the exact failure the redesign exists to fix, and it survives duotoning.
- **No visible competitor or unrelated brand marks** on crates, trucks, or
  packaging.
- **Nothing captioned or implied to be Peng's own premises** unless it is.
  Treat these as illustrative of the sector, not documentary.
- **No Western office-stock clichés** (handshakes, boardroom pointing, headsets).
- Prefer **high contrast with clear light and shadow separation** — flat, evenly
  lit frames turn to mud under duotone.

### Licensing

Standard royalty-free commercial licence is sufficient. Keep the licence
receipts with the project; a due-diligence request for image provenance is
plausible given the audience. Unsplash/Pexels are acceptable but check each
file's licence individually and avoid the most-downloaded frames.

---

## How to install an image

1. Drop the file in `public/images/` with a descriptive name
   (`warehouse-racking.jpg`, not `pexels-12345.jpg`).
2. Resize to **max 2000px on the long edge** before committing. `next/image`
   optimises delivery, but oversized sources bloat the repo and slow builds.
   Target under 400KB per file.
3. Wire it up:

   - **Home hero** — set `HERO_PHOTO` in `src/components/KineticHero.tsx`:
     ```ts
     const HERO_PHOTO: string | null = "/images/containers.jpg";
     ```
     The panel switches from the product still-life to a full-bleed duotone.

   - **Anywhere else** — use the component:
     ```tsx
     <BrandPhoto
       src="/images/warehouse-racking.jpg"
       alt="Warehouse racking stacked with palletised stock"
       tone="lime"                     // "orange" inside Peng Edition
       className="aspect-[4/5] w-full border-2 border-ink"
     />
     ```

### Tone selection

- `tone="lime"` — Peng Global Holding pages (default)
- `tone="orange"` — Peng Edition pages
- `trueColour` — artwork that must stay faithful: book covers, logos, packaging

### Alt text

Write what is in the frame, in the page's language, for a reader who cannot see
it. Never write "stock photo of warehouse". Decorative images take `alt=""`.
Remember every alt string needs an FR counterpart.
