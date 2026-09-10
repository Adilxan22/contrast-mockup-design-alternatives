import { PackageSearch } from "lucide-react";
import Link from "next/link";
import { Container } from "@/components/ui/Container";

export default function NotFound() {
  return (
    <Container className="flex flex-col items-center gap-4 py-24 text-center">
      <PackageSearch className="size-12 text-foreground-muted" strokeWidth={1.25} aria-hidden="true" />
      <h1 className="font-display text-3xl text-foreground">Страница не найдена</h1>
      <p className="max-w-md font-body text-foreground-secondary">
        Похоже, этот товар или страница больше не существует.
      </p>
      <Link
        href="/"
        className="mt-2 inline-flex items-center justify-center rounded-sm bg-action-bg px-6 py-3 font-body text-base text-action-fg transition-colors duration-150 ease-standard hover:bg-action-bg-hover"
      >
        На главную
      </Link>
    </Container>
  );
}
