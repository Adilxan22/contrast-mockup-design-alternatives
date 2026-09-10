"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { clearAdminSession, createAdminSession, requireAdmin, verifyAdminPassword } from "@/lib/admin-auth";
import { hasDatabase, prisma } from "@/lib/db";

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
