import type { Metadata } from "next";
import { CatalogClient } from "@/components/catalog/CatalogClient";
import { Container } from "@/components/ui/Container";
import { getCategories, getProducts } from "@/lib/catalog";

export async function generateMetadata({
  searchParams,
}: PageProps<"/catalog">): Promise<Metadata> {
  const params = await searchParams;
  const categoryParam = params.category;
  const category = Array.isArray(categoryParam) ? categoryParam[0] : categoryParam;
  return {
    title: category ? `${category} — Каталог — Contrast` : "Каталог — Contrast",
    description: "Кальяны, табак, бестабачные смеси и аксессуары в Contrast — Astana.",
  };
}

export default async function CatalogPage({
  searchParams,
}: PageProps<"/catalog">) {
  const params = await searchParams;
  const categoryParam = params.category;
  const initialCategory = Array.isArray(categoryParam) ? categoryParam[0] : categoryParam;
  const [categories, products] = await Promise.all([getCategories(), getProducts()]);

  return (
    <Container>
      <CatalogClient initialCategory={initialCategory} categories={categories} products={products} />
    </Container>
  );
}
