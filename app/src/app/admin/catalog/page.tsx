import Link from "next/link";
import { redirect } from "next/navigation";
import { logoutAdmin } from "@/app/admin/actions";
import { EditableProductRow } from "@/components/admin/EditableProductRow";
import { SyncButtons } from "@/components/admin/SyncButtons";
import { Button } from "@/components/ui/Button";
import { Container } from "@/components/ui/Container";
import { requireAdmin } from "@/lib/admin-auth";
import { hasDatabase, prisma } from "@/lib/db";

const REVIEW_PAGE_SIZE = 200;

export default async function AdminCatalogPage() {
  if (!(await requireAdmin())) redirect("/admin/login");

  const [needsReview, totalReview, totalProducts] = hasDatabase
    ? await Promise.all([
        prisma.product.findMany({
          where: { needsManualReview: true },
          take: REVIEW_PAGE_SIZE,
          orderBy: { id: "asc" },
        }),
        prisma.product.count({ where: { needsManualReview: true } }),
        prisma.product.count(),
      ])
    : [[], 0, 0];

  return (
    <Container className="py-8">
      <div className="mb-6 flex items-center justify-between">
        <h1 className="font-display text-2xl text-foreground">Каталог — ручная доразметка</h1>
        <div className="flex items-center gap-4">
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
          DATABASE_URL не настроен — синхронизация и админка недоступны в этом окружении. Сайт
          работает на мок-каталоге.
        </p>
      ) : (
        <>
          <SyncButtons />
          <p className="mb-4 font-body text-sm text-foreground-muted">
            Всего товаров: {totalProducts}. Требуют ручной доразметки: {totalReview}
            {totalReview > REVIEW_PAGE_SIZE && ` (показаны первые ${REVIEW_PAGE_SIZE})`}.
          </p>
          {needsReview.length === 0 ? (
            <p className="font-body text-foreground-muted">
              Каталог не синхронизирован или всё разметилось автоматически.
            </p>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left">
                <thead>
                  <tr className="border-b border-border text-xs tracking-wide text-foreground-secondary uppercase">
                    <th className="py-2 pr-4">Товар</th>
                    <th className="py-2 pr-2">Бренд</th>
                    <th className="py-2 pr-2">Вкус</th>
                    <th className="py-2 pr-2">Крепость</th>
                    <th className="py-2 pr-2">Фасовка</th>
                    <th className="py-2" />
                  </tr>
                </thead>
                <tbody>
                  {needsReview.map((p) => (
                    <EditableProductRow
                      key={p.id}
                      productId={p.id}
                      categoryLabel={p.categoryLabel}
                      name={p.name}
                      brand={p.brand}
                      flavor={p.flavor}
                      strength={p.strength}
                      packaging={p.packaging}
                    />
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </>
      )}
    </Container>
  );
}
