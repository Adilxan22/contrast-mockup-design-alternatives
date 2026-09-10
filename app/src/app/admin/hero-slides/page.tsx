import Link from "next/link";
import { redirect } from "next/navigation";
import { createHeroSlide, deleteHeroSlide, toggleHeroSlideActive } from "@/app/admin/actions";
import { Button } from "@/components/ui/Button";
import { Container } from "@/components/ui/Container";
import { Input } from "@/components/ui/Input";
import { requireAdmin } from "@/lib/admin-auth";
import { hasDatabase, prisma } from "@/lib/db";

export default async function AdminHeroSlidesPage() {
  if (!(await requireAdmin())) redirect("/admin/login");

  const slides = hasDatabase ? await prisma.heroSlide.findMany({ orderBy: { order: "asc" } }) : [];

  return (
    <Container className="max-w-2xl py-8">
      <Link href="/admin/catalog" className="mb-4 inline-block font-body text-sm text-foreground-secondary hover:text-foreground">
        ← Каталог
      </Link>
      <h1 className="mb-2 font-display text-2xl text-foreground">Слайды на главной</h1>
      <p className="mb-6 font-body text-sm text-foreground-muted">
        Промо-баннеры (акции, новости) на главной странице — картинка + ссылка, куда ведёт клик.
        Вставляй прямую ссылку на картинку (не страницу) — загрузки файлов пока нет, только по URL.
      </p>

      {!hasDatabase ? (
        <p className="font-body text-foreground-muted">DATABASE_URL не настроен — недоступно.</p>
      ) : (
        <>
          <form
            action={async (formData) => {
              "use server";
              await createHeroSlide(formData);
            }}
            className="mb-8 flex flex-col gap-4 rounded-md border border-border p-5"
          >
            <Input name="imageUrl" label="Ссылка на картинку" placeholder="https://..." required />
            <Input name="linkUrl" label="Куда ведёт клик" placeholder="/catalog?category=..." required />
            <Button type="submit" variant="primary">
              Добавить слайд
            </Button>
          </form>

          {slides.length === 0 ? (
            <p className="font-body text-foreground-muted">Слайдов пока нет.</p>
          ) : (
            <ul className="flex flex-col gap-3">
              {slides.map((slide) => (
                <li
                  key={slide.id}
                  className="flex items-center gap-4 rounded-md border border-border p-3"
                >
                  {/* eslint-disable-next-line @next/next/no-img-element -- admin-pasted arbitrary URLs, not worth a remotePatterns entry per domain */}
                  <img src={slide.imageUrl} alt="" className="h-16 w-24 shrink-0 rounded-sm object-cover" />
                  <div className="min-w-0 flex-1 font-body text-sm">
                    <div className="truncate text-foreground-muted">{slide.imageUrl}</div>
                    <div className="truncate text-foreground-secondary">→ {slide.linkUrl}</div>
                  </div>
                  <form
                    action={async () => {
                      "use server";
                      await toggleHeroSlideActive(slide.id, !slide.active);
                    }}
                  >
                    <Button type="submit" variant="ghost" size="sm">
                      {slide.active ? "Скрыть" : "Показать"}
                    </Button>
                  </form>
                  <form
                    action={async () => {
                      "use server";
                      await deleteHeroSlide(slide.id);
                    }}
                  >
                    <Button type="submit" variant="ghost" size="sm">
                      Удалить
                    </Button>
                  </form>
                </li>
              ))}
            </ul>
          )}
        </>
      )}
    </Container>
  );
}
