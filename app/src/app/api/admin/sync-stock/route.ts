import { NextResponse } from "next/server";
import { requireAdmin } from "@/lib/admin-auth";
import { hasDatabase, prisma } from "@/lib/db";
import { getAllBranchData } from "@/lib/poster/api";
import { PosterConfigError } from "@/lib/poster/client";

// Matched by normalized product name, NOT ingredient_id/product_id — confirmed
// against real data (2026-09-10) that contrast-left/-centre/-al-farabi are
// independent Poster accounts that were never actually put through Poster's
// franchise/Connect sync, so the same physical product has a different
// ingredient_id AND product_id in every account (e.g. "Borjomi 0,5L" is
// product_id 1107 on connect/centre but 3590 on left). Name is the only value
// that's consistent across accounts, and a check of the left account's 1209
// products found zero name collisions — worth re-verifying if the catalog
// ever balloons, but safe today. The real fix is having Adilkhan/Алуа turn on
// proper Connect sync in Poster itself so branches share IDs; this is a
// working stand-in until then. Resolving each branch's own product_id here
// (into BranchProductId) also unblocks real order creation — see
// api/checkout/route.ts, which needs the branch's own id, not connect's.
function normalizeName(name: string): string {
  return name.trim().toLowerCase().replace(/\s+/g, " ");
}

const BATCH_SIZE = 25;

async function runBatched<T>(items: T[], worker: (item: T) => Promise<boolean>): Promise<number> {
  let matched = 0;
  for (let i = 0; i < items.length; i += BATCH_SIZE) {
    const batch = items.slice(i, i + BATCH_SIZE);
    const results = await Promise.all(batch.map(worker));
    matched += results.filter(Boolean).length;
  }
  return matched;
}

export async function POST() {
  if (!(await requireAdmin())) {
    return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  }
  if (!hasDatabase) {
    return NextResponse.json({ error: "database_not_configured" }, { status: 400 });
  }

  try {
    const { byBranch, skipped } = await getAllBranchData();
    const productsByName = new Map((await prisma.product.findMany()).map((p) => [normalizeName(p.name), p]));

    let stockRowsWritten = 0;
    let stockTotal = 0;
    let productIdRowsWritten = 0;
    let productIdTotal = 0;

    for (const [branch, data] of Object.entries(byBranch)) {
      stockTotal += data.leftovers.length;
      stockRowsWritten += await runBatched(data.leftovers, async (leftover) => {
        const product = leftover.ingredient_name
          ? productsByName.get(normalizeName(leftover.ingredient_name))
          : undefined;
        if (!product) return false;
        await prisma.branchStock.upsert({
          where: { productId_branch: { productId: product.id, branch } },
          create: { productId: product.id, branch, quantity: Math.floor(Number(leftover.ingredient_left)) },
          update: { quantity: Math.floor(Number(leftover.ingredient_left)) },
        });
        return true;
      });

      productIdTotal += data.products.length;
      productIdRowsWritten += await runBatched(data.products, async (branchProduct) => {
        const product = productsByName.get(normalizeName(branchProduct.product_name));
        if (!product) return false;
        await prisma.branchProductId.upsert({
          where: { productId_branch: { productId: product.id, branch } },
          create: { productId: product.id, branch, posterProductId: Number(branchProduct.product_id) },
          update: { posterProductId: Number(branchProduct.product_id) },
        });
        return true;
      });
    }

    return NextResponse.json({
      ok: true,
      stockRowsWritten,
      stockUnmatched: stockTotal - stockRowsWritten,
      productIdRowsWritten,
      productIdUnmatched: productIdTotal - productIdRowsWritten,
      skippedBranches: skipped,
    });
  } catch (err) {
    if (err instanceof PosterConfigError) {
      return NextResponse.json({ error: "poster_not_configured", message: err.message }, { status: 400 });
    }
    console.error("[sync-stock] failed:", err);
    return NextResponse.json({ error: "sync_failed" }, { status: 500 });
  }
}
