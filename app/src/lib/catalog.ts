import "server-only";
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

async function readDbProducts(): Promise<Product[] | null> {
  if (!hasDatabase) return null;
  try {
    const rows = await prisma.product.findMany({
      where: { active: true, categoryLabel: { notIn: [...EXCLUDED_CATEGORIES] } },
      include: { branchStock: true },
      orderBy: { id: "asc" },
    });
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

export async function getProductById(id: number): Promise<Product | undefined> {
  const dbProducts = await readDbProducts();
  if (dbProducts) return dbProducts.find((p) => p.id === id);
  return MOCK_PRODUCTS.find((p) => p.id === id);
}

export async function getRelatedProducts(product: Product, limit = 4): Promise<Product[]> {
  const all = await getProducts();
  return all.filter((p) => p.category === product.category && p.id !== product.id).slice(0, limit);
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

export async function getCategories(): Promise<Category[]> {
  if (hasDatabase) {
    try {
      const rows = await prisma.category.findMany({ orderBy: { label: "asc" } });
      const filtered = rows.filter((r) => !EXCLUDED_CATEGORIES.has(r.label));
      if (filtered.length > 0) return filtered.map((r) => ({ id: r.slug, label: r.label }));
    } catch (err) {
      console.error("[catalog] DB category read failed, falling back to mock categories:", err);
    }
  }
  return MOCK_CATEGORIES;
}
