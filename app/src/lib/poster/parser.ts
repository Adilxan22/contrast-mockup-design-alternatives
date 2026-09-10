// Attribute parser — implements the rules validated in docs/ATTRIBUTES_ANALYSIS.md
// against the real 04.09.2026 catalog export (export_products_260904.xlsx):
//
// - Brand + packaging (weight) come from the Poster *category name*, e.g.
//   "Black Burn 200гр" -> brand "Black Burn", packaging "200гр" (covers 73% of SKUs).
// - Flavor is free text in the *product name*, everything after the weight marker,
//   e.g. "Табак Blackburn 200 гр Cherry Garden" -> flavor "Cherry Garden"
//   (regex matched 98.2% of the 1424 SKUs that had a weight in their category).
// - Strength is only ever visible when a brand splits its own line by it
//   (Spectrum Classic/Hard/Mix, Сарма Легкая/Крепкая, Sebero Black/Classic/Arctic
//   Mix) — most brands don't expose it at all, so it stays null far more often
//   than brand/flavor/packaging.
//
// Anything this can't confidently parse is flagged needsManualReview so it shows
// up in /admin/catalog instead of silently shipping wrong data.

// One-off typos in the Poster category names themselves (confirmed against the
// live catalog, UI/UX audit 2026-09-10) — corrected here so they don't fragment
// the brand filter into near-duplicate facets ("Бестбачная смесь JAM" vs
// "Бестабачная смесь JAM").
const BRAND_TYPO_FIXES: Record<string, string> = {
  "Бестбачная смесь JAM": "Бестабачная смесь JAM",
};

export function normalizeBrandName(brand: string): string {
  return BRAND_TYPO_FIXES[brand] ?? brand;
}

const WEIGHT_IN_CATEGORY = /^(.+?)\s+(\d+\s?(?:гр|г|kg|кг))$/i;
// Two weight-marker spellings appear in product names: "200 гр" (majority) and
// "30 г" (Deus-only quirk, ~25 SKUs — see ATTRIBUTES_ANALYSIS.md §2).
const WEIGHT_IN_NAME = /(\d+\s?(?:гр|г|kg|кг))\s+(.+)$/i;

const STRENGTH_HINTS: { pattern: RegExp; strength: string }[] = [
  { pattern: /\bhard\b/i, strength: "Крепкий" },
  { pattern: /\bclassic\b/i, strength: "Классический" },
  { pattern: /\bmix\b/i, strength: "Mix" },
  { pattern: /крепк/i, strength: "Крепкий" },
  { pattern: /легк/i, strength: "Лёгкий" },
  { pattern: /arctic/i, strength: "Arctic Mix" },
];

export interface ParsedAttributes {
  brand: string | null;
  packaging: string | null;
  flavor: string | null;
  strength: string | null;
  needsManualReview: boolean;
}

export function parseProductAttributes(categoryName: string, productName: string): ParsedAttributes {
  const categoryMatch = categoryName.match(WEIGHT_IN_CATEGORY);
  const brand = categoryMatch ? normalizeBrandName(categoryMatch[1].trim()) : null;
  const packaging = categoryMatch ? categoryMatch[2].replace(/\s+/, "") : null;

  let flavor: string | null = null;
  const nameMatch = productName.match(WEIGHT_IN_NAME);
  if (nameMatch) {
    const rest = nameMatch[2].trim();
    flavor = rest.length > 0 ? rest : null;
  }

  let strength: string | null = null;
  for (const { pattern, strength: label } of STRENGTH_HINTS) {
    if (pattern.test(categoryName)) {
      strength = label;
      break;
    }
  }

  // No brand from the category means this is one of the ~580 general-purpose
  // accessory SKUs (bowls, cigars, spare parts, ...) from ATTRIBUTES_ANALYSIS.md
  // §4 — brand there is free text in the product name or not meaningful as a
  // filter, so it always needs a human to decide.
  const needsManualReview = brand === null;

  return { brand, packaging, flavor, strength, needsManualReview };
}
