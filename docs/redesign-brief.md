# Peng Global Holding — Website Redesign Brief

**Prepared:** July 2026
**Current site:** penglobalholding.com
**Scope:** Full redesign and rebuild — corporate site + Peng Edition subsidiary section

---

## 1. Why this redesign exists

The current site undermines the company's credibility with its two most important audiences: foreign manufacturers evaluating a market-entry partner, and institutional buyers. This is not a cosmetic refresh. The rebuild must fix the following documented failures:

1. **Dead links to the developer's machine.** All "Read More" buttons point to `http://localhost/peng/...` and fail for every visitor.
2. **Unedited copy.** Phrases like "leading and leading companies," "covertly navigate these diverse regions" (covertly = secretly/deceptively), and "In these dark hours of Dreams" must never reappear. All copy in this brief replaces the old copy entirely.
3. **Statistics render as zeros** ("0/5 Customer Rating") when the animation script fails or for search crawlers. The new site uses static, verifiable figures or none at all.
4. **The hero message is off-brand** ("Let's take the stress out of your move" reads as a moving company).
5. **Peng Edition is invisible.** The group's most verifiable achievement — two titles on Cameroon's official secondary school textbook list — appears nowhere.
6. **English only.** Cameroon is majority francophone; ministry and school audiences work primarily in French. The new site is bilingual EN/FR from day one.
7. Broken team profile URLs, the website address listed under "Email Address" in the footer, pinch-zoom disabled (accessibility failure), and identifiable stock photography unrelated to the business.

## 2. Objectives and success measures

Each of the two brands has one primary conversion goal. Every page must serve one of them.

- **Peng Global Holding:** qualified partnership/representation inquiries from foreign manufacturers and brand owners. Measured by contact form submissions tagged "Partnership."
- **Peng Edition:** book orders and adoption inquiries from schools, bookshops, and parents. Measured by contact form submissions tagged "Books / Commande de livres."

Secondary: the site must survive due diligence. A prospective foreign partner who spends five minutes on it should find nothing broken, nothing unverifiable, and nothing that reads as filler.

## 3. Audiences

1. **Foreign manufacturers and brand owners** (Turkey, Europe, Asia) evaluating Cameroon/CEMAC market entry. English-first, professionally skeptical, will verify claims.
2. **Government and institutional buyers** (ministries, development organizations) for public and private contracts. French-first.
3. **Schools, teachers, parents, and bookshops** for Peng Edition. French and English, predominantly mobile, often on slow and expensive data connections.

Audience 3 dictates the performance budget. Audience 1 dictates the standard of proof.

## 4. The story the site must tell

Lead with what is provable, in this order:

1. **PENSAN exclusivity.** Peng Global Holding is the sole representative of the Turkish stationery brands PENSAN Kalem and PENSAN Kidz for Cameroon and the CEMAC region. This is the anchor case study for the "we bring foreign brands into this market" claim. *(Client to supply proof: authorization letter or reference from PENSAN.)*
2. **Peng Edition's national approval.** Two titles on Cameroon's official secondary school textbook list, with real ISBNs, prices, and a credentialed author.
3. The holding structure and full service range are framed on top of these two pillars — as the growth vehicle, not the headline.

Anything that cannot be verified is cut. This explicitly includes the three testimonials on the current site (Tunisia, Germany, Turkey) unless the client can name and confirm those clients.

## 5. Sitemap (bilingual, EN/FR)

```
/                     Home                        Accueil
/about                About Us                    À propos
/services             Services                    Services
/peng-edition         Peng Edition                Peng Edition
/peng-edition/books   Our Books                   Nos livres
/contact              Contact                     Contact
```

Deliberate cuts from the earlier plan:

- **No "Subsidiaries" index page.** A directory with one entry plus placeholders makes the group look aspirational rather than established. Peng Edition gets a top-level nav item. When a second subsidiary genuinely exists, add the index then.
- **No "Industries" page.** Fold industry coverage into the Services page.
- **No News section at launch.** A news page whose last post is eight months old is worse than none. Add it only when someone commits to at least one post per quarter.
- **No blog, no team page** until real photography and correct profile links exist.

Legal pages required: Mentions légales / Legal notice, Politique de confidentialité / Privacy policy (include company registration: RCCM number, registered address — client to supply).

## 6. Page-by-page requirements

### Home
- **Hero:** one strong static image (real, licensed, or commissioned — no identifiable stock from unrelated contexts). Dark green overlay. Headline + subtitle + two CTAs (below). No slider, no carousel.
- **Proof strip:** PENSAN logo + "Exclusive representative, Cameroon & CEMAC" and Peng Edition + "2 titles on the official national textbook list." These replace the animated counters.
- **Services overview:** four cards matching the real service lines (Section 7 copy).
- **Peng Edition feature block:** orange/black sub-brand, the two book covers, one-line proof, CTA to the Peng Edition page.
- **Contact CTA** with the form's two inquiry types pre-signposted.

### About
Condensed company story, the CEMAC market-entry value proposition, commitment statement. Registration details in the footer of the page. No team section until content exists.

### Services
Four services, each with a short concrete description and a "what this looks like in practice" line. The PENSAN case sits inside Brand Representation & Distribution as the worked example.

### Peng Edition
About (max ~150 words), the two books with full data, author profile, "For schools & bookshops" section (how to order, distribution coverage), contact block routed to the Books inquiry type. Orange/black palette with a small green holding-company mark ("A Peng Global Holding company / Une société du groupe Peng Global Holding").

### Contact
One form: name, organization, email, phone, inquiry type (Partnership / Books / Other), message. Submissions via Resend to a monitored company inbox (not a personal Gmail — client to confirm address). Honeypot + rate limiting for spam. Physical address, phone/WhatsApp number, and a map if the office is presentable.

## 7. Replacement copy — English

> All French copy in Section 8 was drafted for this brief and **must be reviewed by a native French speaker** before launch.

### Home — hero
**Headline:** Connecting Global Brands with Central Africa
**Subtitle:** Peng Global Holding represents, imports, and distributes trusted international brands across Cameroon and the CEMAC region.
**CTA 1:** Partner With Us  **CTA 2:** Discover Peng Edition

### Home — introduction
Peng Global Holding is a Cameroonian company specializing in the exclusive representation and distribution of international brands across Cameroon and the CEMAC region. We give foreign manufacturers a reliable local partner: market knowledge, regulatory compliance, and an established distribution network.

We are the sole representative of the Turkish stationery brands PENSAN Kalem and PENSAN Kidz for Cameroon and CEMAC, and the parent company of Peng Edition, a publisher with two titles on Cameroon's official secondary school textbook list.

### Services (four cards)
**Brand Representation & Distribution** — Exclusive representation of international brands, from import and regulatory compliance to retail distribution across Cameroon and CEMAC. *In practice: sole representative of PENSAN Kalem and PENSAN Kidz.*

**Import & Export** — End-to-end international trade services: sourcing, customs, logistics, and supply-chain management in full compliance with local regulations.

**Public & Private Contracts** — Supply of quality products and services to government institutions, development organizations, and private-sector clients.

**Heavy Machinery & Vehicle Rental** — Modern equipment and transport solutions for infrastructure, construction, mining, agriculture, and industrial projects across Central Africa.

### Peng Edition — about (replaces the 700-word draft)
**Tagline:** Educating the World, One Book at a Time

Peng Edition is the publishing subsidiary of Peng Global Holding, based in Cameroon. We develop and distribute educational and literary works for the national school system, and two of our titles are prescribed on Cameroon's official secondary school textbook list.

We work with authors, schools, and bookshops across Cameroon and the CEMAC region, and we are expanding our catalogue in literature and education. Publishers, institutions, and authors interested in working with us can reach our editorial team through the contact page.

*(Capabilities such as digital publishing, academic publishing, and editorial services may be listed under a clearly labeled "Our capabilities" subsection — not presented as track record.)*

### Peng Edition — the books
**Fireside Tales** — Charlie-Bey · Literature in English · Form One · ISBN 978-9956-39-300-8 · 2,000 FCFA
A collection of nine tales drawn from the grassfield, coastal, and forest regions of Cameroon, written in accessible English. Officially prescribed on the Cameroon secondary school textbook list.

**My Cameroon and Other Poems** — Charlie-Bey · Literature in English · Form Three · ISBN 978-9956-34-304-6 · 1,800 FCFA
An anthology of poems celebrating Cameroon's heritage while building skills in literary analysis and language. Officially prescribed for Form Three.

**Author — Charlie-Bey:** Born in the South West Region of Cameroon, Befue Charlie-Bey studied Literature in English and Performing and Visual Arts at the University of Buea, graduating top of his class. A poet, novelist, and playwright, he has taught English language and literature at secondary and high school level and currently serves as principal of Collège Protestant Luc Bell in Douala.

## 8. Replacement copy — French (draft, requires native review)

### Accueil — hero
**Titre :** Connecter les marques internationales à l'Afrique centrale
**Sous-titre :** Peng Global Holding représente, importe et distribue des marques internationales de confiance au Cameroun et dans la zone CEMAC.
**CTA 1 :** Devenir partenaire  **CTA 2 :** Découvrir Peng Edition

### Accueil — introduction
Peng Global Holding est une société camerounaise spécialisée dans la représentation exclusive et la distribution de marques internationales au Cameroun et dans la zone CEMAC. Nous offrons aux fabricants étrangers un partenaire local fiable : connaissance du marché, conformité réglementaire et réseau de distribution établi.

Nous sommes le représentant exclusif des marques de papeterie turques PENSAN Kalem et PENSAN Kidz pour le Cameroun et la CEMAC, et la maison mère de Peng Edition, éditeur dont deux ouvrages figurent sur la liste officielle des manuels scolaires du secondaire au Cameroun.

### Services
**Représentation de marques & distribution** — Représentation exclusive de marques internationales : importation, conformité réglementaire et distribution au Cameroun et dans la zone CEMAC. *Exemple concret : représentant exclusif de PENSAN Kalem et PENSAN Kidz.*

**Import & export** — Services complets de commerce international : approvisionnement, douanes, logistique et gestion de la chaîne d'approvisionnement, en conformité avec la réglementation locale.

**Marchés publics & privés** — Fourniture de produits et de services de qualité aux institutions publiques, aux organisations de développement et aux clients du secteur privé.

**Location d'engins lourds & de véhicules** — Équipements modernes et solutions de transport pour les projets d'infrastructures, de construction, miniers, agricoles et industriels en Afrique centrale.

### Peng Edition — à propos
**Devise :** Éduquer le monde, un livre à la fois

Peng Edition est la filiale d'édition de Peng Global Holding, basée au Cameroun. Nous développons et distribuons des ouvrages éducatifs et littéraires pour le système scolaire national ; deux de nos titres sont inscrits sur la liste officielle des manuels scolaires du secondaire au Cameroun.

Nous collaborons avec des auteurs, des établissements scolaires et des librairies au Cameroun et dans la zone CEMAC, et nous élargissons notre catalogue en littérature et en éducation. Les éditeurs, institutions et auteurs souhaitant travailler avec nous peuvent contacter notre équipe éditoriale via la page contact.

### Peng Edition — les livres
**Fireside Tales** — Charlie-Bey · Littérature anglaise · Form One (6e/5e) · ISBN 978-9956-39-300-8 · 2 000 FCFA
Un recueil de neuf contes issus des régions des Grassfields, du littoral et de la forêt du Cameroun, rédigés dans un anglais accessible. Manuel officiellement prescrit sur la liste des manuels scolaires du secondaire au Cameroun.

**My Cameroon and Other Poems** — Charlie-Bey · Littérature anglaise · Form Three (4e/3e) · ISBN 978-9956-34-304-6 · 1 800 FCFA
Une anthologie de poèmes célébrant le patrimoine camerounais tout en développant l'analyse littéraire et les compétences linguistiques. Officiellement prescrit pour la Form Three.

*(Note : vérifier avec le client l'équivalence exacte des niveaux Form One / Form Three dans le sous-système francophone avant publication.)*

## 9. Design system

**Peng Global Holding:** primary green `#78BE20` (carried over from the current brand for continuity), dark gray text on white, soft green gradient accents, subtle shadows.
**Peng Edition:** orange and black per the existing PE logo, white background, small green holding-group accent.
**Typography:** Inter or Manrope. Bold headings, generous spacing, no decorative fonts.
**Imagery:** real photography only where people or premises are shown. Book covers as supplied. If corporate photography doesn't exist yet, use abstract/product imagery rather than recognizable stock people.

**Motion, strictly budgeted:** subtle entrance fades only, disabled under `prefers-reduced-motion`, nothing blocking first paint. No sliders, no parallax, no count-up counters.

## 10. Technical requirements

- **Stack:** Next.js (App Router) + TypeScript + Tailwind CSS, hosted on Vercel.
- **i18n:** EN/FR routing with `hreflang` tags; every string and CMS field localized. French is not an afterthought bolted on later.
- **CMS:** Sanity **only if** a named person will maintain content. If not, hardcode the content and skip the CMS — no custom admin dashboard in either case.
- **Email:** Resend for the contact form (server-side; no client-exposed keys — this rules out EmailJS). Deliverability: verified sending domain (SPF/DKIM).
- **Performance budget:** test on throttled 3G. Largest Contentful Paint under 2.5 s on mobile; images in AVIF/WebP via `next/image`; total JS kept minimal.
- **Accessibility:** pinch-zoom enabled (no `user-scalable=0`), WCAG AA contrast, alt text in both languages, keyboard-navigable forms.
- **SEO:** localized metadata, Organization structured data for the holding, `Book` structured data (with ISBN) for both titles, XML sitemap, redirect map from all old URLs.
- **Analytics:** Plausible or GA4, with form-submission events per inquiry type.

## 11. Content the client must supply before build starts

1. PENSAN authorization proof (letter or written confirmation) — required to state exclusivity.
2. Official reference for the textbook list approvals (ministry list edition/year) — link or scan.
3. High-resolution logos (holding + Peng Edition) and book cover files.
4. Real photography (office, warehouse, products, books in use) — or a decision to commission it.
5. Confirmed contact details: monitored email inbox, phone/WhatsApp, physical address.
6. Company registration details for legal pages (RCCM, tax ID, registered address).
7. Verification or removal decision on the existing testimonials.
8. Native French speaker sign-off on all Section 8 copy.
9. A named content owner (decides whether Sanity is included).

## 12. Out of scope for this phase

E-commerce/online book sales, News/blog, team page, additional subsidiary pages, French sub-system (EGEF) catalogue pages. Each can be added later without restructuring.