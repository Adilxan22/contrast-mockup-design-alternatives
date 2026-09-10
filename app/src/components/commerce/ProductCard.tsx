import { PackageSearch } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { Badge } from "@/components/ui/Badge";
import { getCategoryImage } from "@/lib/category-images";
import type { Product } from "@/lib/types";

export function ProductCard({ product }: { product: Product }) {
  const lowStock = product.stock <= 5;
  const categoryImage = getCategoryImage(product.category);

  return (
    <Link
      href={`/product/${product.id}`}
      className="group block overflow-hidden rounded-md border border-border bg-surface font-body shadow-sm transition-[box-shadow,transform] duration-200 ease-standard hover:-translate-y-0.5 hover:shadow-card-hover focus-visible:-translate-y-0.5 focus-visible:shadow-card-hover"
    >
      <div className="relative aspect-square overflow-hidden bg-surface-sunken">
        {product.imageUrl ? (
          // Real per-product photo, sourced from arbitrary supplier/brand
          // sites — plain <img>, not next/image, so a new source domain
          // doesn't need a next.config.ts + redeploy before it shows up.
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={product.imageUrl}
            alt={product.category}
            className="absolute inset-0 size-full object-cover transition-transform duration-300 ease-standard group-hover:scale-105"
          />
        ) : categoryImage ? (
          <Image
            src={categoryImage.url}
            alt={product.category}
            fill
            sizes="(min-width: 1024px) 22vw, 45vw"
            className="object-cover transition-transform duration-300 ease-standard group-hover:scale-105"
          />
        ) : (
          <div className="flex size-full items-center justify-center text-foreground-muted transition-transform duration-300 ease-standard group-hover:scale-105">
            <PackageSearch className="size-10" strokeWidth={1.25} aria-hidden="true" />
          </div>
        )}
        {lowStock && (
          <div className="absolute left-2.5 top-2.5">
            <Badge tone="danger">Осталось {product.stock}</Badge>
          </div>
        )}
      </div>
      <div className="p-4">
        <div className="mb-1 truncate text-xs tracking-wide text-foreground-muted uppercase">
          {product.category}
        </div>
        <div className="mb-2 line-clamp-2 min-h-10 text-base text-foreground">{product.name}</div>
        <div className="flex items-baseline gap-2">
          <span className="font-display text-2xl text-foreground">{product.price}</span>
          {product.oldPrice && (
            <span className="text-sm text-foreground-muted line-through">{product.oldPrice}</span>
          )}
        </div>
      </div>
    </Link>
  );
}
