import { CategoryPills } from "@/components/home/CategoryPills";
import { PromoSlides } from "@/components/home/PromoSlides";
import { PromoTiles } from "@/components/home/PromoTiles";
import { TrendingSection } from "@/components/home/TrendingSection";
import { Hero } from "@/components/layout/Hero";
import { getCategories, getProducts } from "@/lib/catalog";
import { getActiveHeroSlides } from "@/lib/hero-slides";

export default async function Home() {
  const [categories, products, heroSlides] = await Promise.all([
    getCategories(),
    getProducts(),
    getActiveHeroSlides(),
  ]);

  return (
    <>
      <Hero productCount={products.length} />
      <CategoryPills categories={categories} />
      <PromoTiles productCount={products.length} />
      <PromoSlides slides={heroSlides} />
      <TrendingSection products={products} />
    </>
  );
}
