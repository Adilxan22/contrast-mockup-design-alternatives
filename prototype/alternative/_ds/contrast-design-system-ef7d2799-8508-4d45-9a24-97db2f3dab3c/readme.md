# Contrast Design System

Brand and UI foundation for **Contrast** — a premium hookah shop and lounge brand in Astana, Kazakhstan ("HOOKAH SHOP & LOUNGE" / "PREMIUM HOOKAH SHOP"). This system is built for the brand's **e-commerce website**: a hookah/tobacco retail catalog site.

## Sources provided
- `uploads/Бренд Бук Contrast2.pdf` — 15-page brand book: logo lockups, storefront signage photo, shop interior photo, and merchandise mockups (notebook, cups, lanyard, apparel, van/car livery templates — mostly blank template mockups, not brand-specific).
- `uploads/Лого Черный 2.pdf` — rasterized black-background logo file (Photoshop export, no vector data recovered).
- `uploads/Лого Черный.psd` — referenced by the user but not present in `uploads/` at build time; not read.
- No codebase, Figma file, or existing website was provided — this design system, its components, and its UI kit are original constructions from the brand book + the client's written direction below, not a copy of an existing product.

No embedded font files or a machine-readable color palette were recoverable from the PDFs (see CAVEATS below) — colors were sampled directly from the logo pixels, and typefaces are Google Fonts substitutes chosen to match the brand book's tone.

## Client direction (verbatim brief, translated context)
Two directions were explored with the client:
- **A** — dark background, gold/copper, large product photography — "expensive club" feeling.
- **B** — light background, dense product grid, fast search/filters — Kaspi.kz / Wildberries-style, convenience-first.

Client's decision: **not A in its pure form**. Avoid an overly dark site and avoid heavy gold/copper. The store still needs: an easy catalog, categories, search, filters, clear product cards, price + specs, and **stock/quantity remaining**. Reference given: aesop.com, for its blend of aesthetics and usability. The site should NOT be dark throughout — only the first screen/hero should be atmospheric and accented; the rest of the site should settle into a calm, neutral background. Priority order: readability, easy navigation, clear product presentation. Premium-ness comes from typography, photography, space and restrained accents — not from dark surfaces.

This system implements that: an atmospheric near-black hero token (`--surface-hero`) reserved for first-screen/moments only, and a calm warm-ivory page surface (`--surface-page`) for everything else, with the gold sampled from the real logo used sparingly (`--accent-gold`).

## What's in this project
- `styles.css` — root stylesheet, imports everything below.
- `tokens/` — `fonts.css`, `colors.css`, `typography.css`, `spacing.css`, `effects.css` (shadows/motion).
- `guidelines/` — specimen cards for the Design System tab (colors, type, spacing, logo usage, imagery).
- `assets/` — `logo-mark-on-black.png` (logo as found), `logo-mark-gold.png` (mark isolated on transparent background), `interior-shelving.jpg`, `storefront-sign.jpg` (brand photography extracted from the brand book).
- `components/` — React UI primitives (see Components below).
- `ui_kits/website/` — click-through recreation of the Contrast e-commerce site (homepage, catalog, product detail, cart).
- `SKILL.md` — portable skill file for use in Claude Code.

## Components (original set — no source codebase/Figma defined an inventory)
Grouped by concern:
- **core/** — Button, IconButton, Badge, Tag
- **forms/** — Input, Select, Checkbox, Radio
- **navigation/** — Tabs
- **feedback/** — Dialog, Toast, Tooltip
- **commerce/** — ProductCard, QuantityStepper

### Intentional additions
Every component above is an intentional addition sized to an e-commerce catalog site (no source defined a component inventory): Badge/Tag for stock and filter states, ProductCard/QuantityStepper for catalog + cart needs, Tabs for product-detail description/characteristics panels.

## Content fundamentals
Source copy is sparse (a brand book with mostly imagery, plus "HOOKAH SHOP & LOUNGE" and "PREMIUM HOOKAH SHOP" as the only repeated lines), so the following is inferred from the brand's visual register and the client's stated priorities — treat it as a starting proposal, not a transcribed style guide.
- **Language**: Russian-first (the client brief and store are Kazakhstan-based); Kazakh/English secondary. All UI copy in the kit is written in Russian.
- **Casing**: the wordmark and tagline are set in full caps with wide letter-spacing ("CONTRAST", "PREMIUM HOOKAH SHOP") — reserve full-caps + wide tracking for the wordmark, eyebrow labels, and category tags only. Body and product copy should be normal sentence case for readability (the client explicitly prioritized legibility over stylization).
- **Voice**: quietly confident, not hype-driven. Say what something is (origin, flavor profile, bowl material, coal count) rather than oversell it. No exclamation marks, no emoji.
- **Address**: neutral/formal "вы" register, typical of Russian retail copy — not the casual "ты".
- **Numbers**: prices in ₸ (tenge); always show remaining stock as a plain count or a "осталось N" (N left) label rather than vague scarcity language.

## Visual foundations
- **Color**: two-register system. `--surface-hero` (near-black, `#100e0b`–`#17140f`) is reserved for the first screen/hero moment only — atmospheric, not a whole-site dark mode. Everything below settles into `--surface-page` (warm ivory, `#fbf9f4`) and white cards. `--accent-gold` (`#a8906c`, sampled from the real logo) is used sparingly: small labels, dividers, icon accents, the odd rule — never large fills or gold text blocks. Avoid copper/bronze gradients.
- **Type**: two families. Cormorant (serif, has Cyrillic) for display headings, prices-as-headline, and the wordmark treatment; Jost (geometric sans, has Cyrillic) for everything functional — nav, buttons, product specs, filters, body copy. This mirrors the brand book's pairing of an ornate serif-feeling mark with a clean sans wordmark.
- **Spacing**: an 4/8-based scale (`--space-1` through `--space-10`, 4px–144px) with a generous `--gutter` (24px) and `--container-max` (1280px) — Aesop-style breathing room over density, even in the catalog grid.
- **Backgrounds**: full-bleed photography for the hero only; flat ivory/white elsewhere. No illustration, no repeating patterns/textures, no gradients (aside from a very subtle photo-darkening overlay behind hero text).
- **Corners**: sharp-to-slightly-rounded (`--radius-sm` 2px, `--radius-md` 4px, `--radius-lg` 8px) — never pill-shaped except true pills (`--radius-pill`) like filter chips and stock badges. No heavy rounded-rect "app" look.
- **Cards**: white surface, 1px `--border-subtle` hairline, `--shadow-sm` on rest / `--shadow-md` on hover — no colored left-border accent strips.
- **Shadows**: soft and low-contrast (`--shadow-sm/md/lg`), always neutral ink-tinted, never colored.
- **Motion**: minimal. Fades and gentle opacity/transform transitions only (`--duration-fast/base/slow`, `--ease-standard`), no bounce/spring easing. Hover = subtle lift (`translateY(-2px)` + shadow increase) or a slight image zoom on product photography; press = slight opacity dip, no scale-shrink.
- **Hover/press states**: primary buttons darken (`--action-primary-bg-hover`); links/text accents shift to `--accent-gold-strong`; focus uses a visible `--focus-ring` (gold) outline, never removed.
- **Transparency/blur**: used only for the hero's text-protection gradient (dark-to-transparent scrim over the photo) — no frosted-glass/blur panels elsewhere.
- **Imagery**: warm, natural light, real-world retail/product photography (per the brand book's own storefront and shelf photos) — not staged studio white-void shots. Avoid cool/blue color grading.
- **Layout**: sticky header with search always reachable; filters as a persistent left rail or top bar (not hidden behind a single "filter" button) so the catalog stays scannable, per the client's usability priority.

## Iconography
No icon font, SVG icon set, or icon usage was found anywhere in the brand book — the brand book is stationery/merch/signage focused. **Substitution**: this system uses the [Lucide](https://lucide.dev) icon set via CDN (`https://unpkg.com/lucide-static`) for functional UI icons (search, filter, cart, chevrons) — chosen for its light, single-weight stroke that matches the brand's restrained, uncluttered feel. No emoji or unicode glyphs are used as icons. Flag if the brand has its own icon system to substitute in.

## Index
- `styles.css` + `tokens/fonts.css,colors.css,typography.css,spacing.css,effects.css`
- `guidelines/` — 12 specimen cards (Colors ×4, Type ×3, Spacing ×2, Brand ×3)
- `assets/logo-mark-on-black.png`, `assets/logo-mark-gold.png`, `assets/interior-shelving.jpg`, `assets/storefront-sign.jpg`
- `components/core/` — Button, IconButton, Badge, Tag
- `components/forms/` — Input, Select, Checkbox, Radio
- `components/navigation/` — Tabs
- `components/feedback/` — Dialog, Toast, Tooltip
- `components/commerce/` — ProductCard, QuantityStepper
- `ui_kits/website/` — Homepage, Catalog, ProductDetail, Cart (click-through, `index.html`)
- `thumbnail.html`, `SKILL.md`

## CAVEATS — please help iterate
- **No vector logo file recovered.** Both uploaded PDFs are Photoshop-flattened rasters; `Лого Черный.psd` (which likely has the vector/layered version) was referenced in the brief but is not present in `uploads/`. The gold monogram + "CONTRAST" wordmark used across this system is a pixel-cropped extraction from the brand book photo mockups, at the resolution it was shot at (the storefront sign photo). **If you can re-upload the PSD or a vector/high-res logo export, I can swap in a crisp version everywhere.**
- **No brand fonts were supplied.** The wordmark in the storefront photo reads as a clean geometric sans; the tagline reads as a tracked-out small serif. I substituted **Cormorant** (display/headings) + **Jost** (UI/body) — both have full Cyrillic support for Russian/Kazakh copy. Flag if you have the real typeface names/files.
- **No product photography, real copy, or SKU data was supplied.** The UI kit uses placeholder product names/prices/stock counts and `<image-slot>`-style placeholders for product imagery — swap in real photos and catalog data when ready.
- The gold accent (`--accent-gold`, `#a8906c`) was sampled directly from logo pixels in the brand photo — it's a close approximation, not a certified brand color value.

**Ask:** tell me what to fix first — logo fidelity, font choice, the color balance between hero and body, or the catalog/product-card layout — and I'll iterate.
