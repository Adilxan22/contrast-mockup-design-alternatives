import "server-only";
import { BRANCH_ACCOUNTS, getPosterToken, type PosterAccount, posterFetch } from "./client";

// Field shapes below were corrected against a real response from the
// contrast-centre account (2026-09-10) — the first pass had three real bugs,
// left here as a reminder to verify against real data before trusting a guess:
//   1. A product's category is `menu_category_id`, not `category_id`.
//   2. Categories are a 2-level tree (113 total, 9 top-level e.g. "Кальяны";
//      the rest are per-brand leaves like "Black Burn 25гр" that
//      lib/poster/parser.ts parses). Only the 9 top-level ones belong in the
//      site's nav/Category table — see resolveTopLevelCategory below.
//   3. Stock (storage.getStorageLeftovers) is keyed by ingredient_id /
//      ingredient_left, not product_id / product_count — a product's own
//      ingredient_id is the real join key.

export interface PosterCategory {
  category_id: string;
  category_name: string;
  parent_category: string; // "0" for a top-level category
}

export interface PosterProduct {
  product_id: string;
  product_name: string;
  menu_category_id: string;
  category_name?: string; // the product's own (leaf) category name
  ingredient_id?: string; // join key into storage.getStorageLeftovers
  price: string | Record<string, string> | null; // tenge * 100 (tiyn); per-spot object, single value, or null
  photo?: string;
  photo_origin?: string;
  hidden?: string; // "0" | "1"
}

export interface PosterStorageLeftover {
  ingredient_id: string;
  ingredient_name?: string;
  ingredient_left: string; // decimal string, e.g. "14.0000000"
}

export interface PosterClient {
  client_id: string;
  phone?: string;
  bonus?: string; // tiyn
  firstname?: string;
  lastname?: string;
}

/** Poster stores money as an integer in the currency's minor unit (tiyn for KZT). */
export function tiyeToTenge(value: string | number | undefined): number {
  if (value === undefined) return 0;
  return Math.round(Number(value) / 100);
}

function firstPrice(price: PosterProduct["price"]): number {
  // Confirmed against real data: some products (e.g. inactive/service rows)
  // come back with a null price rather than a string or per-spot object.
  if (price === null || price === undefined) return 0;
  if (typeof price === "string" || typeof price === "number") return tiyeToTenge(price);
  const first = Object.values(price)[0];
  return tiyeToTenge(first);
}

export async function getCategories(account: PosterAccount = "connect"): Promise<PosterCategory[]> {
  return posterFetch<PosterCategory[]>(account, "menu.getCategories", { params: { type: "products" } });
}

export async function getProducts(account: PosterAccount = "connect"): Promise<PosterProduct[]> {
  return posterFetch<PosterProduct[]>(account, "menu.getProducts");
}

export function normalizedPrice(product: PosterProduct): number {
  return firstPrice(product.price);
}

/**
 * Walks a leaf category up its parent chain to the top-level ancestor (the
 * one customers actually navigate by, e.g. "Табачные смеси для кальяна") —
 * the site's Category table stores only these, not all ~100+ Poster leaves.
 * Falls back to the category itself if it has no resolvable parent chain.
 */
export function resolveTopLevelCategory(
  categoryId: string,
  byId: Map<string, PosterCategory>
): PosterCategory | undefined {
  let current = byId.get(categoryId);
  const seen = new Set<string>();
  while (current && current.parent_category !== "0" && !seen.has(current.category_id)) {
    seen.add(current.category_id);
    const parent = byId.get(current.parent_category);
    if (!parent) break;
    current = parent;
  }
  return current;
}

export async function getStorageLeftovers(account: PosterAccount): Promise<PosterStorageLeftover[]> {
  return posterFetch<PosterStorageLeftover[]>(account, "storage.getStorageLeftovers");
}

export interface BranchData {
  leftovers: PosterStorageLeftover[];
  products: PosterProduct[];
}

export interface BranchDataResult {
  byBranch: Record<string, BranchData>;
  /** Branches skipped because that account's token isn't set yet — not fatal. */
  skipped: PosterAccount[];
}

/**
 * Fetches stock AND that branch's own product list, for every branch that
 * currently has a token configured. The product list is needed alongside
 * stock because a branch account's product_id is local to that account (not
 * shared with connect or any other branch — confirmed on real data), so
 * resolving each branch's own product_id for a catalog item (by name, see
 * sync-stock's route) has to happen here too. Deliberately per-branch
 * fault-tolerant: onboarding branches one Poster token at a time (as this
 * client is doing) shouldn't make the whole sync fail just because a sibling
 * branch's token isn't in .env.local yet.
 */
export async function getAllBranchData(): Promise<BranchDataResult> {
  const skipped: PosterAccount[] = [];
  const entries: [PosterAccount, BranchData][] = [];

  for (const account of BRANCH_ACCOUNTS) {
    if (!getPosterToken(account)) {
      skipped.push(account);
      continue;
    }
    const [leftovers, products] = await Promise.all([getStorageLeftovers(account), getProducts(account)]);
    entries.push([account, { leftovers, products }]);
  }

  return { byBranch: Object.fromEntries(entries), skipped };
}

export interface CreateIncomingOrderInput {
  branch: Extract<PosterAccount, "left" | "centre" | "alfarabi">;
  phone: string;
  customerName: string;
  comment?: string;
  items: { productId: number; quantity: number }[];
}

/**
 * Guest checkout, per docs/ARCHITECTURE.md §1: no client_id — Poster finds or
 * creates the client by phone on its own.
 */
export async function createIncomingOrder(input: CreateIncomingOrderInput): Promise<{ incoming_order_id: string }> {
  return posterFetch<{ incoming_order_id: string }>(input.branch, "incomingOrders.createIncomingOrder", {
    method: "POST",
    body: {
      phone: input.phone,
      client_name: input.customerName,
      comment: input.comment,
      products: input.items.map((it) => ({ product_id: it.productId, count: it.quantity })),
    },
  });
}

export async function getClientByPhone(phone: string, account: PosterAccount = "connect"): Promise<PosterClient | null> {
  const clients = await posterFetch<PosterClient[]>(account, "clients.getClients", { params: { phone } });
  return clients[0] ?? null;
}
