import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { ProductDetailClient } from "@/components/product/ProductDetailClient";
import { Container } from "@/components/ui/Container";
import { getProductById, getRelatedProducts } from "@/lib/catalog";

export async function generateMetadata({
  params,
}: PageProps<"/product/[id]">): Promise<Metadata> {
  const { id } = await params;
  const product = await getProductById(Number(id));
  if (!product) return { title: "Товар не найден — Contrast" };
  return {
    title: `${product.name} — Contrast`,
    description: `${product.name}, ${product.brand}. ${product.price} — Contrast, Astana.`,
  };
}

export default async function ProductPage({ params }: PageProps<"/product/[id]">) {
  const { id } = await params;
  const product = await getProductById(Number(id));
  if (!product) notFound();

  const related = await getRelatedProducts(product);

  return (
    <Container>
      <ProductDetailClient product={product} related={related} />
    </Container>
  );
}
