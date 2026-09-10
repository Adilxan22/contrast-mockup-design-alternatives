/**
 * Stand-in category photography from Unsplash (images.unsplash.com), used until
 * real product photography exists. One photo per category — not literal photos
 * of each SKU. Every photoId below was visually verified (screenshotted, not
 * just read from page metadata) before being assigned to a category. Credits
 * kept here per Unsplash's attribution guidelines (https://unsplash.com/license):
 * a link back is appreciated, not required.
 */
export interface CategoryImage {
  url: string;
  credit: string;
  creditHref: string;
}

function unsplash(photoId: string, width: number) {
  return `https://images.unsplash.com/${photoId}?auto=format&fit=crop&w=${width}&q=80`;
}

export const CATEGORY_IMAGES: Record<string, CategoryImage> = {
  "Кальяны": {
    url: unsplash("photo-1574751749605-0f1e41b6cf67", 1200),
    credit: "Awesome Sauce Creative",
    creditHref: "https://unsplash.com/@awesomesauce_creative",
  },
  "Бестабачные смеси для кальяна": {
    url: unsplash("photo-1709203429049-16eef01f3b70", 1200),
    credit: "Cachimberos",
    creditHref: "https://unsplash.com/@cachimberos",
  },
  "Табачные смеси для кальяна": {
    url: unsplash("photo-1706525454548-aaf26970ddfa", 1200),
    credit: "Cachimberos",
    creditHref: "https://unsplash.com/@cachimberos",
  },
  "Угли и мундштуки": {
    url: unsplash("photo-1708427450831-c3b82ce38e0f", 1200),
    credit: "Cachimberos",
    creditHref: "https://unsplash.com/@cachimberos",
  },
  "Чаши": {
    url: unsplash("photo-1683231098629-7f5084073997", 1200),
    credit: "Cachimberos",
    creditHref: "https://unsplash.com/@cachimberos",
  },
  "Колбы": {
    url: unsplash("photo-1747812750221-160934af5254", 1200),
    credit: "Cachimberos",
    creditHref: "https://unsplash.com/@cachimberos",
  },
  "Аксессуары": {
    url: unsplash("photo-1696491815162-6b1068425afb", 1200),
    credit: "Logistic Hookah",
    creditHref: "https://unsplash.com/@logistichookah",
  },
  "Табаки для сигар, трубки и зажигалки": {
    url: unsplash("photo-1493328628492-54491d37daba", 1200),
    credit: "Jeff Brown",
    creditHref: "https://unsplash.com/@jbrown1276",
  },
};

export function getCategoryImage(category: string): CategoryImage | undefined {
  if (CATEGORY_IMAGES[category]) return CATEGORY_IMAGES[category];
  // Real Poster category names ("Табачные смеси для кальяна") are longer than
  // the mock catalog's short-hand ones ("Табачные смеси") — match either
  // direction so both the DB-backed and mock-fallback catalogs resolve.
  const key = Object.keys(CATEGORY_IMAGES).find(
    (k) => category.includes(k) || k.includes(category)
  );
  return key ? CATEGORY_IMAGES[key] : undefined;
}

export const HERO_IMAGE: CategoryImage = {
  url: unsplash("photo-1681219577911-1fcb5a4e353e", 1920),
  credit: "Cachimberos",
  creditHref: "https://unsplash.com/@cachimberos",
};
