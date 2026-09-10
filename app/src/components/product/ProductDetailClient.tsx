"use client";

import { Check, PackageSearch } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { useState } from "react";
import { ProductCard } from "@/components/commerce/ProductCard";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { QuantityStepper } from "@/components/ui/QuantityStepper";
import { Tabs } from "@/components/ui/Tabs";
import { useCart } from "@/lib/cart-context";
import { getCategoryImage } from "@/lib/category-images";
import type { Product } from "@/lib/types";

const TABS = [
  { id: "desc", label: "Описание" },
  { id: "specs", label: "Характеристики" },
  { id: "reviews", label: "Отзывы" },
];

export function ProductDetailClient({
  product,
  related,
}: {
  product: Product;
  related: Product[];
}) {
  const [qty, setQty] = useState(1);
  const [tab, setTab] = useState("desc");
  const [justAdded, setJustAdded] = useState(false);
  const { addItem } = useCart();
  const categoryImage = getCategoryImage(product.category);

  const handleAddToCart = () => {
    addItem(product, qty);
    setJustAdded(true);
    window.setTimeout(() => setJustAdded(false), 2000);
  };

  return (
    <div className="py-6 lg:py-8">
      <Link href="/catalog" className="font-body text-sm text-foreground-secondary">
        ← Назад в каталог
      </Link>

      <div className="mt-6 grid gap-7 lg:grid-cols-2 lg:gap-14">
        <div className="relative aspect-square overflow-hidden rounded-md bg-surface-sunken">
          {product.imageUrl ? (
            // Real per-product photo from an arbitrary supplier/brand site —
            // plain <img>, see ProductCard.tsx for why.
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={product.imageUrl}
              alt={product.category}
              className="absolute inset-0 size-full object-cover"
            />
          ) : categoryImage ? (
            <Image
              src={categoryImage.url}
              alt={product.category}
              fill
              priority
              sizes="(min-width: 1024px) 50vw, 100vw"
              className="object-cover"
            />
          ) : (
            <div className="flex size-full items-center justify-center text-foreground-muted">
              <PackageSearch className="size-16" strokeWidth={1} aria-hidden="true" />
            </div>
          )}
        </div>

        <div>
          <div className="mb-2 font-body text-xs tracking-wide text-foreground-muted uppercase">
            {product.category} · {product.brand}
          </div>
          <h1 className="mb-4 font-display text-3xl text-foreground lg:text-4xl">
            {product.name}
          </h1>
          <div className="mb-4 flex items-baseline gap-3">
            <span className="font-display text-3xl text-foreground">{product.price}</span>
            {product.oldPrice && (
              <span className="font-body text-base text-foreground-muted line-through">
                {product.oldPrice}
              </span>
            )}
          </div>
          <div className="mb-6">
            <Badge tone={product.stock <= 5 ? "danger" : "success"}>
              {product.stock <= 5 ? `Осталось ${product.stock} шт` : "В наличии"}
            </Badge>
          </div>
          <div className="mb-8 flex flex-wrap items-center gap-4">
            <QuantityStepper value={qty} onChange={setQty} max={product.stock} />
            <Button variant="primary" size="lg" onClick={handleAddToCart}>
              {justAdded ? (
                <>
                  <Check className="size-4" aria-hidden="true" /> Добавлено
                </>
              ) : (
                "В корзину"
              )}
            </Button>
          </div>
          <Tabs tabs={TABS} active={tab} onChange={setTab} />
          <div className="py-5 font-body text-base leading-relaxed text-foreground-secondary">
            {tab === "desc" && (
              <p>
                Товар проходит проверку качества перед поступлением в продажу. Насыщенный вкус,
                стабильные характеристики.
              </p>
            )}
            {tab === "specs" && (
              <ul className="list-disc space-y-1 pl-5">
                <li>Бренд: {product.brand}</li>
                {product.flavor && <li>Вкус: {product.flavor}</li>}
                {product.strength && <li>Крепость: {product.strength}</li>}
                {product.packaging && <li>Фасовка: {product.packaging}</li>}
                <li>Остаток: {product.stock} шт</li>
              </ul>
            )}
            {tab === "reviews" && <p>Пока нет отзывов.</p>}
          </div>
        </div>
      </div>

      {related.length > 0 && (
        <section className="mt-16 lg:mt-24">
          <h2 className="mb-5 font-display text-2xl text-foreground">Похожие товары</h2>
          <div className="grid grid-cols-2 gap-3 lg:grid-cols-4 lg:gap-5">
            {related.map((p) => (
              <ProductCard key={p.id} product={p} />
            ))}
          </div>
        </section>
      )}
    </div>
  );
}
