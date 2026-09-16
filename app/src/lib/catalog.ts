import "server-only";
import { unstable_cache } from "next/cache";
import { cache } from "react";
import { CATEGORIES as MOCK_CATEGORIES, PRODUCTS as MOCK_PRODUCTS } from "./data";
import { hasDatabase, prisma } from "./db";
import { formatPrice } from "./format";
import { normalizeBrandName } from "./poster/parser";
import type { Category, Product } from "./types";

// Public read API for catalog data. Poster remains the source of truth (synced
// into our DB by /api/admin/sync-catalog and /api/admin/sync-stock — see
// lib/poster/*), but every reader here falls back to the static mock catalog in
// lib/data.ts whenever there's no DB configured or it hasn't been synced yet, so
// the site is always browsable instead of ever rendering empty. Consumers
// (pages/components) should only ever import from here, not from lib/data.ts or
// @prisma/client directly.

// "Lounge" (drinks — Borjomi, Coca-Cola, Red Bull, wine...) is a real Poster
// category but not a real online-shop product line — confirmed against the
// client's existing site (hookahmarket.ps.me has no drinks in its catalog).
// It's for in-venue lounge service, not delivery/pickup orders — excluded
// from the public site entirely rather than built out as a category.
// "Top screen" is register-side POS scaffolding, not products — checked its
// two SKUs directly (audit 2026-09-10): "Доставка" (a delivery-fee line item)
// and "Табак Вес" (a per-gram loose-tobacco pricing helper for staff at the
// till). Neither is something a customer should be able to add to cart.
const EXCLUDED_CATEGORIES = new Set(["Lounge", "Top screen"]);

function toUiProduct(row: {
  id: number;
  posterId: number;
  categoryLabel: string;
  name: string;
  priceTenge: number;
  oldPriceTenge: number | null;
  brand: string | null;
  flavor: string | null;
  strength: string | null;
  packaging: string | null;
  imageUrl: string | null;
  needsManualReview: boolean;
  branchStock: { quantity: number }[];
}): Product {
  return {
    id: row.id,
    posterId: row.posterId,
    category: row.categoryLabel,
    name: row.name,
    price: formatPrice(row.priceTenge),
    oldPrice: row.oldPriceTenge ? formatPrice(row.oldPriceTenge) : undefined,
    stock: row.branchStock.reduce((sum, s) => sum + s.quantity, 0),
    brand: row.brand ? normalizeBrandName(row.brand) : "",
    flavor: row.flavor ?? undefined,
    strength: row.strength ?? undefined,
    packaging: row.packaging ?? undefined,
    imageUrl: row.imageUrl ?? undefined,
    needsManualReview: row.needsManualReview,
  };
}

let dbCatalogEmptyWarned = false;

// Full-catalog reads (home, catalog page, sitemap) are the only ones that
// legitimately need every row — cached for a short window so N visitors (or
// crawlers) hitting the site inside that window share one Postgres round
// trip instead of one each. Deliberately NOT wrapped around the mock
// fallback: the wrapped function must throw (not swallow) on a DB error, or
// Next would cache "failed, here's null" for the same window — see the
// try/catch in readDbProducts below, which stays outside the cache.
// Tagged "catalog" so admin mutations (photo/attribute edits, Poster syncs)
// can invalidate on demand with revalidateTag instead of waiting it out.
const getCachedCatalogRows = unstable_cache(
  () =>
    prisma.product.findMany({
      where: { active: true, categoryLabel: { notIn: [...EXCLUDED_CATEGORIES] } },
      include: { branchStock: true },
      orderBy: { id: "asc" },
    }),
  ["catalog-products"],
  { tags: ["catalog"], revalidate: 60 }
);

async function readDbProducts(): Promise<Product[] | null> {
  if (!hasDatabase) return null;
  try {
    const rows = await getCachedCatalogRows();
    if (rows.length === 0) {
      if (!dbCatalogEmptyWarned) {
        console.warn("[catalog] DATABASE_URL is set but no products are synced yet — serving mock catalog. Run /api/admin/sync-catalog once Poster tokens are configured.");
        dbCatalogEmptyWarned = true;
      }
      return null;
    }
    const products = rows.map(toUiProduct).filter((p) => p.stock > 0);
    return products;
  } catch (err) {
    console.error("[catalog] DB read failed, falling back to mock catalog:", err);
    return null;
  }
}

export async function getProducts(): Promise<Product[]> {
  return (await readDbProducts()) ?? MOCK_PRODUCTS;
}

// Looked up directly by primary key instead of scanning the full catalog —
// a product page used to cost a ~1700-row-with-joins query just to find one
// row (caught 2026-09-17 chasing a Neon data-transfer quota exhaustion).
// Wrapped in React's cache() so generateMetadata and the page body — both
// call this with the same id during one render — share a single query.
export const getProductById = cache(async (id: number): Promise<Product | undefined> => {
  if (!hasDatabase) return MOCK_PRODUCTS.find((p) => p.id === id);
  try {
    const row = await prisma.product.findUnique({ where: { id }, include: { branchStock: true } });
    if (!row || !row.active || EXCLUDED_CATEGORIES.has(row.categoryLabel)) return undefined;
    const product = toUiProduct(row);
    return product.stock > 0 ? product : undefined;
  } catch (err) {
    console.error("[catalog] DB product read failed, falling back to mock catalog:", err);
    return MOCK_PRODUCTS.find((p) => p.id === id);
  }
});

// Batched lookup for checkout, which needs several specific products by id
// in one request — one `IN` query instead of one full-catalog query per cart
// item (checkout used to call the old getProductById per item, see above).
export async function getProductsByIds(ids: number[]): Promise<Product[]> {
  if (ids.length === 0) return [];
  if (!hasDatabase) return MOCK_PRODUCTS.filter((p) => ids.includes(p.id));
  try {
    const rows = await prisma.product.findMany({
      where: { id: { in: ids }, active: true, categoryLabel: { notIn: [...EXCLUDED_CATEGORIES] } },
      include: { branchStock: true },
    });
    return rows.map(toUiProduct).filter((p) => p.stock > 0);
  } catch (err) {
    console.error("[catalog] DB batch product read failed, falling back to mock catalog:", err);
    return MOCK_PRODUCTS.filter((p) => ids.includes(p.id));
  }
}

// Same-category lookup instead of pulling the whole catalog to filter in
// JS — a product page no longer needs a second full-catalog query just to
// find 4 related items.
export async function getRelatedProducts(product: Product, limit = 4): Promise<Product[]> {
  if (!hasDatabase) {
    return MOCK_PRODUCTS.filter((p) => p.category === product.category && p.id !== product.id).slice(0, limit);
  }
  try {
    const rows = await prisma.product.findMany({
      where: { categoryLabel: product.category, active: true, id: { not: product.id } },
      include: { branchStock: true },
      orderBy: { id: "asc" },
      // over-fetch: some of these will be filtered out below for being
      // out of stock, so asking for exactly `limit` would under-fill
      take: limit * 5,
    });
    return rows.map(toUiProduct).filter((p) => p.stock > 0).slice(0, limit);
  } catch (err) {
    console.error("[catalog] DB related-products read failed, falling back to mock catalog:", err);
    return MOCK_PRODUCTS.filter((p) => p.category === product.category && p.id !== product.id).slice(0, limit);
  }
}

const BRANCHES = ["left", "centre", "alfarabi"] as const;

/**
 * Stock is per-branch (see project memory on why — the 4 Poster accounts were
 * never put through real Connect sync, so it's not just "the same total").
 * Without this, a customer could pick a branch for self-pickup (or delivery
 * dispatch) that doesn't actually have their items — the branch stock has to
 * gate which branches are even selectable at checkout, not just the
 * catalog-wide total shown on the product page.
 */
export async function getBranchAvailability(
  items: { productId: number; quantity: number }[]
): Promise<Record<string, boolean>> {
  if (!hasDatabase) {
    // Mock data has no per-branch breakdown — treat every branch as available
    // so the demo/dev checkout flow isn't blocked.
    return Object.fromEntries(BRANCHES.map((b) => [b, true]));
  }
  const stock = await prisma.branchStock.findMany({
    where: { productId: { in: items.map((it) => it.productId) } },
  });
  const quantityByProductBranch = new Map(stock.map((s) => [`${s.productId}:${s.branch}`, s.quantity]));

  return Object.fromEntries(
    BRANCHES.map((branch) => [
      branch,
      items.every((it) => (quantityByProductBranch.get(`${it.productId}:${branch}`) ?? 0) >= it.quantity),
    ])
  );
}

// Same short-lived cache + tag as getCachedCatalogRows above, for the same
// reason: every page that renders the category nav was re-querying this on
// every request.
const getCachedCategoryRows = unstable_cache(
  () => prisma.category.findMany({ orderBy: { label: "asc" } }),
  ["catalog-categories"],
  { tags: ["catalog"], revalidate: 60 }
);

export async function getCategories(): Promise<Category[]> {
  if (hasDatabase) {
    try {
      const rows = await getCachedCategoryRows();
      const filtered = rows.filter((r) => !EXCLUDED_CATEGORIES.has(r.label));
      if (filtered.length > 0) return filtered.map((r) => ({ id: r.slug, label: r.label }));
    } catch (err) {
      console.error("[catalog] DB category read failed, falling back to mock categories:", err);
    }
  }
  return MOCK_CATEGORIES;
}
