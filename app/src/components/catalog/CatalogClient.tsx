"use client";

import { Search } from "lucide-react";
import { useMemo, useState } from "react";
import { ProductCard } from "@/components/commerce/ProductCard";
import { Checkbox } from "@/components/ui/Checkbox";
import { Input } from "@/components/ui/Input";
import { Select } from "@/components/ui/Select";
import { Tag } from "@/components/ui/Tag";
import { parsePrice } from "@/lib/format";
import type { Category, Product } from "@/lib/types";

type SortOption = "popular" | "price_asc" | "price_desc";

const SORT_OPTIONS: { value: SortOption; label: string }[] = [
  { value: "popular", label: "По популярности" },
  { value: "price_asc", label: "Цена: сначала дешёвые" },
  { value: "price_desc", label: "Цена: сначала дорогие" },
];

export function CatalogClient({
  initialCategory,
  categories,
  products,
}: {
  initialCategory?: string;
  categories: Category[];
  products: Product[];
}) {
  const [category, setCategory] = useState<string | null>(initialCategory ?? null);
  const [brands, setBrands] = useState<string[]>([]);
  const [strengths, setStrengths] = useState<string[]>([]);
  const [packagings, setPackagings] = useState<string[]>([]);
  const [priceMin, setPriceMin] = useState("");
  const [priceMax, setPriceMax] = useState("");
  const [query, setQuery] = useState("");
  const [sort, setSort] = useState<SortOption>("popular");
  const [brandQuery, setBrandQuery] = useState("");
  const [brandsExpanded, setBrandsExpanded] = useState(false);

  const BRAND_COLLAPSE_COUNT = 8;

  // Re-derive the selected tag when the URL's ?category= changes (e.g. clicking a
  // header/footer category link while already on /catalog) — adjusted during
  // render, per React's guidance, instead of in an effect.
  const [prevInitialCategory, setPrevInitialCategory] = useState(initialCategory);
  if (initialCategory !== prevInitialCategory) {
    setPrevInitialCategory(initialCategory);
    setCategory(initialCategory ?? null);
    setBrands([]);
    setStrengths([]);
    setPackagings([]);
  }

  // Facet options scoped to the selected category, not the whole catalog —
  // otherwise picking "Кальяны" still listed tobacco brands (Al Fakher,
  // Adalya...) that don't exist on a single hookah, while accessories/bowls/
  // hookahs/cigars/coals never got a brand parsed from Poster at all (see
  // lib/poster/parser.ts) and so always showed an empty, useless "Бренд"
  // list (audit 2026-09-10). Hiding the section when it has no options, and
  // resetting stale brand/strength/packaging picks on category change (below),
  // are the other halves of this fix — a leftover pick from a previous
  // category would otherwise silently zero out every result.
  const categoryProducts = useMemo(
    () => (category ? products.filter((p) => p.category === category) : products),
    [products, category]
  );

  const allBrands = useMemo(
    () => [...new Set(categoryProducts.map((p) => p.brand).filter(Boolean))],
    [categoryProducts]
  );
  const matchingBrands = useMemo(
    () => allBrands.filter((b) => b.toLowerCase().includes(brandQuery.toLowerCase())),
    [allBrands, brandQuery]
  );
  const visibleBrands =
    brandsExpanded || brandQuery ? matchingBrands : matchingBrands.slice(0, BRAND_COLLAPSE_COUNT);
  const allStrengths = useMemo(
    () => [...new Set(categoryProducts.map((p) => p.strength).filter((v): v is string => Boolean(v)))],
    [categoryProducts]
  );
  const allPackagings = useMemo(
    () => [...new Set(categoryProducts.map((p) => p.packaging).filter((v): v is string => Boolean(v)))],
    [categoryProducts]
  );

  const toggle = (setter: (updater: (prev: string[]) => string[]) => void, value: string) =>
    setter((prev) => (prev.includes(value) ? prev.filter((v) => v !== value) : [...prev, value]));

  const changeCategory = (value: string | null) => {
    setCategory(value);
    setBrands([]);
    setStrengths([]);
    setPackagings([]);
    setBrandQuery("");
    setBrandsExpanded(false);
  };

  const min = priceMin ? Number(priceMin) : null;
  const max = priceMax ? Number(priceMax) : null;

  const filtered = useMemo(() => {
    const result = products.filter((p) => {
      const price = parsePrice(p.price);
      return (
        (!category || p.category === category) &&
        (brands.length === 0 || brands.includes(p.brand)) &&
        (strengths.length === 0 || (p.strength && strengths.includes(p.strength))) &&
        (packagings.length === 0 || (p.packaging && packagings.includes(p.packaging))) &&
        (min === null || price >= min) &&
        (max === null || price <= max) &&
        (!query || p.name.toLowerCase().includes(query.toLowerCase()))
      );
    });
    if (sort === "price_asc") result.sort((a, b) => parsePrice(a.price) - parsePrice(b.price));
    if (sort === "price_desc") result.sort((a, b) => parsePrice(b.price) - parsePrice(a.price));
    return result;
  }, [category, brands, strengths, packagings, min, max, query, sort, products]);

  return (
    <div className="py-6 lg:py-8">
      <div className="mb-6">
        <h1 className="mb-4 font-display text-3xl text-foreground lg:text-5xl">Каталог</h1>
        <div className="flex gap-2.5 overflow-x-auto pb-1" style={{ scrollbarWidth: "thin" }}>
          <Tag selected={!category} onClick={() => changeCategory(null)}>
            Все
          </Tag>
          {categories.map((c) => (
            <Tag key={c.id} selected={category === c.label} onClick={() => changeCategory(c.label)}>
              {c.label}
            </Tag>
          ))}
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-[240px_1fr] lg:gap-10">
        <aside className="flex flex-row flex-wrap gap-6 lg:flex-col">
          <div className="flex-1 basis-full lg:flex-none lg:basis-auto">
            <Input
              name="catalog-search"
              placeholder="Поиск по каталогу"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              icon={<Search className="size-4" aria-hidden="true" />}
            />
          </div>
          {allBrands.length > 0 && (
            <div>
              <div className="mb-3 font-body text-xs tracking-wide text-foreground-secondary uppercase">
                Бренд
              </div>
              {allBrands.length > BRAND_COLLAPSE_COUNT && (
                <div className="mb-3">
                  <Input
                    name="brand-search"
                    placeholder="Поиск по бренду"
                    value={brandQuery}
                    onChange={(e) => setBrandQuery(e.target.value)}
                    icon={<Search className="size-4" aria-hidden="true" />}
                  />
                </div>
              )}
              <div className="flex flex-row flex-wrap gap-3 lg:flex-col">
                {visibleBrands.map((b) => (
                  <Checkbox
                    key={b}
                    label={b}
                    checked={brands.includes(b)}
                    onChange={() => toggle(setBrands, b)}
                    count={categoryProducts.filter((p) => p.brand === b).length}
                  />
                ))}
                {visibleBrands.length === 0 && (
                  <span className="font-body text-sm text-foreground-muted">Бренды не найдены</span>
                )}
              </div>
              {!brandQuery && matchingBrands.length > BRAND_COLLAPSE_COUNT && (
                <button
                  type="button"
                  onClick={() => setBrandsExpanded((prev) => !prev)}
                  className="mt-3 font-body text-sm text-foreground-secondary underline underline-offset-2 transition-colors duration-150 ease-standard hover:text-foreground"
                >
                  {brandsExpanded ? "Свернуть" : `Показать все (${matchingBrands.length})`}
                </button>
              )}
            </div>
          )}

          {allStrengths.length > 0 && (
            <div>
              <div className="mb-3 font-body text-xs tracking-wide text-foreground-secondary uppercase">
                Крепость
              </div>
              <div className="flex flex-row flex-wrap gap-3 lg:flex-col">
                {allStrengths.map((s) => (
                  <Checkbox
                    key={s}
                    label={s}
                    checked={strengths.includes(s)}
                    onChange={() => toggle(setStrengths, s)}
                  />
                ))}
              </div>
            </div>
          )}

          {allPackagings.length > 0 && (
            <div>
              <div className="mb-3 font-body text-xs tracking-wide text-foreground-secondary uppercase">
                Фасовка
              </div>
              <div className="flex flex-row flex-wrap gap-3 lg:flex-col">
                {allPackagings.map((p) => (
                  <Checkbox
                    key={p}
                    label={p}
                    checked={packagings.includes(p)}
                    onChange={() => toggle(setPackagings, p)}
                  />
                ))}
              </div>
            </div>
          )}

          <div>
            <div className="mb-3 font-body text-xs tracking-wide text-foreground-secondary uppercase">
              Цена, ₸
            </div>
            <div className="flex gap-2">
              <Input
                name="price-min"
                type="number"
                placeholder="От"
                value={priceMin}
                onChange={(e) => setPriceMin(e.target.value)}
              />
              <Input
                name="price-max"
                type="number"
                placeholder="До"
                value={priceMax}
                onChange={(e) => setPriceMax(e.target.value)}
              />
            </div>
          </div>
        </aside>

        <div>
          <div className="mb-5 flex flex-wrap items-center justify-between gap-3">
            <span className="font-body text-sm text-foreground-secondary">
              {filtered.length} товаров
            </span>
            <div className="w-full sm:w-[220px]">
              <Select
                options={SORT_OPTIONS}
                value={sort}
                onChange={(e) => setSort(e.target.value as SortOption)}
              />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:gap-5">
            {filtered.map((p) => (
              <ProductCard key={p.id} product={p} />
            ))}
          </div>
          {filtered.length === 0 && (
            <div className="py-16 text-center font-body text-foreground-muted">
              Ничего не найдено
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
