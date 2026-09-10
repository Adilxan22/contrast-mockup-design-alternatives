import { NextResponse } from "next/server";
import { requireAdmin } from "@/lib/admin-auth";
import { hasDatabase, prisma } from "@/lib/db";
import {
  getCategories,
  getProducts,
  normalizedPrice,
  resolveTopLevelCategory,
  type PosterCategory,
  type PosterProduct,
} from "@/lib/poster/api";
import { PosterConfigError } from "@/lib/poster/client";
import { parseProductAttributes } from "@/lib/poster/parser";

function slugify(label: string): string {
  return label
    .toLowerCase()
    .replace(/[^a-zа-я0-9]+/gi, "-")
    .replace(/^-+|-+$/g, "");
}

const BATCH_SIZE = 25;

async function upsertProduct(
  p: PosterProduct,
  categoriesById: Map<string, PosterCategory>,
  dbCategoryByPosterId: Map<number, { id: number }>,
  existingByPosterId: Map<number, { needsManualReview: boolean }>
): Promise<"created" | "updated" | { flagged: boolean }> {
  const leafCategoryName = p.category_name ?? "";
  const { brand, packaging, flavor, strength, needsManualReview } = parseProductAttributes(
    leafCategoryName,
    p.product_name
  );

  const topCategory = resolveTopLevelCategory(p.menu_category_id, categoriesById);
  const dbCategory = topCategory ? dbCategoryByPosterId.get(Number(topCategory.category_id)) : undefined;
  const categoryLabel = (topCategory?.category_name ?? leafCategoryName).trim();
  const productName = p.product_name.trim();

  const existing = existingByPosterId.get(Number(p.product_id));
  // A row an admin already fixed (needsManualReview cleared to false) keeps
  // its manual brand/flavor/strength/packaging on re-sync — only rows still
  // flagged get overwritten with a fresh parse.
  const keepManualFix = existing && !existing.needsManualReview;

  await prisma.product.upsert({
    where: { posterId: Number(p.product_id) },
    create: {
      posterId: Number(p.product_id),
      ingredientId: p.ingredient_id ? Number(p.ingredient_id) : null,
      categoryId: dbCategory?.id,
      categoryLabel,
      name: productName,
      priceTenge: normalizedPrice(p),
      brand,
      packaging,
      flavor,
      strength,
      needsManualReview,
      active: p.hidden !== "1",
    },
    update: {
      ingredientId: p.ingredient_id ? Number(p.ingredient_id) : null,
      categoryId: dbCategory?.id,
      categoryLabel,
      name: productName,
      priceTenge: normalizedPrice(p),
      ...(keepManualFix ? {} : { brand, packaging, flavor, strength, needsManualReview }),
      active: p.hidden !== "1",
    },
  });

  return existing ? "updated" : "created";
}

export async function POST() {
  if (!(await requireAdmin())) {
    return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  }
  if (!hasDatabase) {
    return NextResponse.json({ error: "database_not_configured" }, { status: 400 });
  }

  try {
    const [categories, products] = await Promise.all([getCategories(), getProducts()]);
    const categoriesById = new Map(categories.map((c) => [c.category_id, c]));

    // Only top-level categories (e.g. "Кальяны") become nav/Category rows —
    // the rest are per-brand leaves (e.g. "Black Burn 25гр") that exist only
    // to drive attribute parsing, see lib/poster/api.ts's doc comment.
    const topLevel = categories.filter((c) => c.parent_category === "0");
    for (const c of topLevel) {
      const label = c.category_name.trim();
      await prisma.category.upsert({
        where: { posterId: Number(c.category_id) },
        create: { posterId: Number(c.category_id), label, slug: slugify(label) },
        update: { label },
      });
    }
    const dbCategoryByPosterId = new Map((await prisma.category.findMany()).map((c) => [c.posterId, c]));
    const existingByPosterId = new Map(
      (await prisma.product.findMany({ select: { posterId: true, needsManualReview: true } })).map((p) => [
        p.posterId,
        p,
      ])
    );

    let created = 0;
    let updated = 0;
    const flaggedForReview = products.filter(
      (p) => parseProductAttributes(p.category_name ?? "", p.product_name).needsManualReview
    ).length;

    for (let i = 0; i < products.length; i += BATCH_SIZE) {
      const batch = products.slice(i, i + BATCH_SIZE);
      const results = await Promise.all(
        batch.map((p) => upsertProduct(p, categoriesById, dbCategoryByPosterId, existingByPosterId))
      );
      for (const r of results) {
        if (r === "created") created++;
        else updated++;
      }
    }

    return NextResponse.json({
      ok: true,
      categoriesSynced: topLevel.length,
      productsSynced: products.length,
      created,
      updated,
      flaggedForReview,
    });
  } catch (err) {
    if (err instanceof PosterConfigError) {
      return NextResponse.json({ error: "poster_not_configured", message: err.message }, { status: 400 });
    }
    console.error("[sync-catalog] failed:", err);
    return NextResponse.json({ error: "sync_failed" }, { status: 500 });
  }
}
