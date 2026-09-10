import Link from "next/link";
import { Container } from "@/components/ui/Container";
import type { Category } from "@/lib/types";

// Thin quick-nav row directly under the hero — ported from the approved
// prototype's `.cat-row` (plain text links, no boxes/borders). Replaces the
// old boxed CategoryGrid, which the client called out as "just text in a box."
export function CategoryPills({ categories }: { categories: Category[] }) {
  return (
    <div className="border-b border-border bg-surface">
      <Container className="scrollbar-none flex gap-6 overflow-x-auto py-3">
        {categories.map((c) => (
          <Link
            key={c.id}
            href={`/catalog?category=${encodeURIComponent(c.label)}`}
            className="shrink-0 whitespace-nowrap font-body text-[13px] text-foreground-secondary transition-colors duration-150 ease-standard hover:text-foreground"
          >
            {c.label}
          </Link>
        ))}
      </Container>
    </div>
  );
}
