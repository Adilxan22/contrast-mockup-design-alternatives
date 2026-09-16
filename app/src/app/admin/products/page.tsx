import Link from "next/link";
import { redirect } from "next/navigation";
import { logoutAdmin } from "@/app/admin/actions";
import { ProductImageRow } from "@/components/admin/ProductImageRow";
import { Button } from "@/components/ui/Button";
import { Container } from "@/components/ui/Container";
import { Input } from "@/components/ui/Input";
import { requireAdmin } from "@/lib/admin-auth";
import { hasDatabase, prisma } from "@/lib/db";

const PAGE_SIZE = 30;

export default async function AdminProductsPage({ searchParams }: PageProps<"/admin/products">) {
  if (!(await requireAdmin())) redirect("/admin/login");

  const params = await searchParams;
  const q = typeof params.q === "string" ? params.q.trim() : "";
  const missingOnly = params.missing === "1";
  const page = Math.max(1, Number(params.page) || 1);

  const where = {
    ...(q ? { name: { contains: q, mode: "insensitive" as const } } : {}),
    ...(missingOnly ? { imageUrl: null } : {}),
  };

  const [products, total] = hasDatabase
    ? await Promise.all([
        prisma.product.findMany({
          where,
          orderBy: { id: "asc" },
          skip: (page - 1) * PAGE_SIZE,
          take: PAGE_SIZE,
          select: { id: true, name: true, categoryLabel: true, imageUrl: true },
        }),
        prisma.product.count({ where }),
      ])
    : [[], 0];

  const totalPages = Math.max(1, Math.ceil(total / PAGE_SIZE));
  const buildHref = (overrides: Record<string, string>) => {
    const next = new URLSearchParams();
    if (q) next.set("q", q);
    if (missingOnly) next.set("missing", "1");
    for (const [k, v] of Object.entries(overrides)) {
      if (v) next.set(k, v);
      else next.delete(k);
    }
    return `/admin/products?${next.toString()}`;
  };

  return (
    <Container className="py-8">
      <div className="mb-6 flex items-center justify-between">
        <h1 className="font-display text-2xl text-foreground">Фото товаров</h1>
        <div className="flex items-center gap-4">
          <Link href="/admin/catalog" className="font-body text-sm text-foreground-secondary hover:text-foreground">
            Доразметка
          </Link>
          <Link href="/admin/hero-slides" className="font-body text-sm text-foreground-secondary hover:text-foreground">
            Слайды на главной
          </Link>
          <form action={logoutAdmin}>
            <Button variant="ghost" size="sm" type="submit">
              Выйти
            </Button>
          </form>
        </div>
      </div>

      {!hasDatabase ? (
        <p className="font-body text-foreground-muted">
          DATABASE_URL не настроен — админка недоступна в этом окружении.
        </p>
      ) : (
        <>
          <form action="/admin/products" className="mb-4 flex flex-wrap items-end gap-3">
            <div className="w-full max-w-sm">
              <Input name="q" label="Поиск по названию" defaultValue={q} placeholder="Например: Black Burn" />
            </div>
            {missingOnly && <input type="hidden" name="missing" value="1" />}
            <Button type="submit" variant="secondary" size="md">
              Найти
            </Button>
            <Link href={buildHref({ missing: missingOnly ? "" : "1", page: "" })}>
              <Button type="button" variant={missingOnly ? "primary" : "ghost"} size="md">
                {missingOnly ? "Показаны только без фото" : "Показать только без фото"}
              </Button>
            </Link>
          </form>

          <p className="mb-4 font-body text-sm text-foreground-muted">
            Найдено товаров: {total}. Страница {page} из {totalPages}.
          </p>

          {products.length === 0 ? (
            <p className="font-body text-foreground-muted">Ничего не найдено.</p>
          ) : (
            <ul className="flex flex-col gap-3">
              {products.map((p) => (
                <ProductImageRow
                  key={p.id}
                  productId={p.id}
                  categoryLabel={p.categoryLabel}
                  name={p.name}
                  imageUrl={p.imageUrl}
                />
              ))}
            </ul>
          )}

          {totalPages > 1 && (
            <div className="mt-6 flex items-center gap-2">
              {page > 1 && (
                <Link href={buildHref({ page: String(page - 1) })}>
                  <Button type="button" variant="ghost" size="sm">
                    ← Назад
                  </Button>
                </Link>
              )}
              {page < totalPages && (
                <Link href={buildHref({ page: String(page + 1) })}>
                  <Button type="button" variant="ghost" size="sm">
                    Вперёд →
                  </Button>
                </Link>
              )}
            </div>
          )}
        </>
      )}
    </Container>
  );
}
