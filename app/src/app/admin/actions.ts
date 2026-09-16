"use server";

import { redirect } from "next/navigation";
import { revalidatePath, updateTag } from "next/cache";
import { clearAdminSession, createAdminSession, requireAdmin, verifyAdminPassword } from "@/lib/admin-auth";
import { hasDatabase, prisma } from "@/lib/db";
import { getProducts, posterPhotoUrl } from "@/lib/poster/api";

export async function loginAdmin(formData: FormData): Promise<{ error?: string }> {
  const password = String(formData.get("password") ?? "");
  const ok = await verifyAdminPassword(password);
  if (!ok) return { error: "Неверный пароль" };
  await createAdminSession();
  redirect("/admin/catalog");
}

export async function logoutAdmin(): Promise<void> {
  await clearAdminSession();
  redirect("/admin/login");
}

export async function updateProductAttributes(
  productId: number,
  fields: { brand?: string; flavor?: string; strength?: string; packaging?: string }
): Promise<void> {
  if (!(await requireAdmin())) redirect("/admin/login");
  if (!hasDatabase) return;

  await prisma.product.update({
    where: { id: productId },
    data: {
      brand: fields.brand?.trim() || null,
      flavor: fields.flavor?.trim() || null,
      strength: fields.strength?.trim() || null,
      packaging: fields.packaging?.trim() || null,
      needsManualReview: false,
    },
  });
  revalidatePath("/admin/catalog");
  revalidatePath("/catalog");
  // /catalog, / and sitemap.ts read through a 60s cache (see lib/catalog.ts)
  // that revalidatePath alone doesn't touch — bust it so the edit shows up
  // immediately instead of up to a minute later.
  updateTag("catalog");
}

export async function setProductImage(productId: number, imageUrl: string): Promise<void> {
  if (!(await requireAdmin())) redirect("/admin/login");
  if (!hasDatabase) return;

  await prisma.product.update({
    where: { id: productId },
    // Tagged "manual" so a later Poster catalog sync never overwrites it —
    // see the schema comment on Product.imageSource.
    data: { imageUrl: imageUrl.trim() || null, imageSource: "manual" },
  });
  revalidatePath("/admin/products");
  revalidatePath("/catalog");
  revalidatePath("/product/[id]", "page");
  updateTag("catalog");
}

/**
 * Un-does setProductImage's "manual" tag so the next catalog sync is free to
 * overwrite this product's photo again. Also pulls the product's current
 * photo from Poster right away, rather than leaving the row photo-less (or
 * stale) until the nightly cron runs — see the schema comment on
 * Product.imageSource for why manual rows are otherwise protected.
 */
export async function resetProductImageToPoster(productId: number): Promise<{ imageUrl: string | null }> {
  if (!(await requireAdmin())) redirect("/admin/login");
  if (!hasDatabase) return { imageUrl: null };

  const product = await prisma.product.findUnique({ where: { id: productId }, select: { posterId: true } });
  if (!product) return { imageUrl: null };

  const products = await getProducts();
  const posterProduct = products.find((p) => Number(p.product_id) === product.posterId);
  const photoUrl = posterProduct ? posterPhotoUrl(posterProduct) : null;

  await prisma.product.update({
    where: { id: productId },
    data: { imageUrl: photoUrl, imageSource: photoUrl ? "poster" : null },
  });
  revalidatePath("/admin/products");
  revalidatePath("/catalog");
  revalidatePath("/product/[id]", "page");
  updateTag("catalog");
  return { imageUrl: photoUrl };
}

export async function createHeroSlide(formData: FormData): Promise<{ error?: string }> {
  if (!(await requireAdmin())) redirect("/admin/login");
  if (!hasDatabase) return { error: "database_not_configured" };

  const imageUrl = String(formData.get("imageUrl") ?? "").trim();
  const linkUrl = String(formData.get("linkUrl") ?? "").trim();
  if (!imageUrl || !linkUrl) return { error: "Нужны и картинка, и ссылка" };

  const maxOrder = await prisma.heroSlide.aggregate({ _max: { order: true } });
  await prisma.heroSlide.create({
    data: { imageUrl, linkUrl, order: (maxOrder._max.order ?? -1) + 1 },
  });
  revalidatePath("/admin/hero-slides");
  revalidatePath("/");
  return {};
}

export async function toggleHeroSlideActive(id: number, active: boolean): Promise<void> {
  if (!(await requireAdmin())) redirect("/admin/login");
  if (!hasDatabase) return;
  await prisma.heroSlide.update({ where: { id }, data: { active } });
  revalidatePath("/admin/hero-slides");
  revalidatePath("/");
}

export async function deleteHeroSlide(id: number): Promise<void> {
  if (!(await requireAdmin())) redirect("/admin/login");
  if (!hasDatabase) return;
  await prisma.heroSlide.delete({ where: { id } });
  revalidatePath("/admin/hero-slides");
  revalidatePath("/");
}
