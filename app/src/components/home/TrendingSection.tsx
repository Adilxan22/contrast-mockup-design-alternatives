import Link from "next/link";
import { ProductCard } from "@/components/commerce/ProductCard";
import { Container } from "@/components/ui/Container";
import type { Product } from "@/lib/types";

export function TrendingSection({ products }: { products: Product[] }) {
  const trending = products.slice(0, 8);

  return (
    <Container className="pb-16 lg:pb-24">
      <div className="mb-6 flex items-baseline justify-between">
        <h2 className="font-display text-3xl text-foreground lg:text-4xl">Популярное</h2>
        <Link href="/catalog" className="font-body text-sm">
          Весь каталог →
        </Link>
      </div>
      <div className="grid grid-cols-2 gap-3 lg:grid-cols-4 lg:gap-5">
        {trending.map((p) => (
          <ProductCard key={p.id} product={p} />
        ))}
      </div>
    </Container>
  );
}
