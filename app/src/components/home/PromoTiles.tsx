import Link from "next/link";
import { Container } from "@/components/ui/Container";

// Two editorial cards under the category row — ported from the approved
// prototype's `.promo-wrap` (replaces the old unrelated "STEAM10" discount-code
// banner, which the client flagged as appearing with no explained context).
// The "Карта Contrast" copy is still placeholder scaffolding, not confirmed
// marketing content — swap for real current promos/loyalty terms once Алуа
// signs off on them. The "Ассортимент" count isn't: it's the live in-stock
// total (was hardcoded "400+", audit 2026-09-10 — real count is ~1700+).
export function PromoTiles({ productCount }: { productCount: number }) {
  const roundedCount = Math.floor(productCount / 100) * 100;

  return (
    <Container className="grid gap-3 pt-6 pb-10 sm:grid-cols-2 lg:pb-16">
      <Link
        href="/catalog"
        className="group flex items-start justify-between gap-4 rounded-md border border-border bg-surface p-6 transition-colors duration-150 ease-standard hover:border-border-strong"
      >
        <div>
          <div className="mb-2 font-body text-[11px] tracking-[0.12em] text-gold-strong uppercase">
            Ассортимент
          </div>
          <h3 className="font-display text-2xl font-semibold text-foreground">
            {roundedCount}+ позиций в наличии
          </h3>
        </div>
        <span className="shrink-0 font-body text-sm text-foreground-secondary group-hover:text-foreground">
          Смотреть →
        </span>
      </Link>
      <Link
        href="/account"
        className="group flex items-start justify-between gap-4 rounded-md border border-border bg-surface p-6 transition-colors duration-150 ease-standard hover:border-border-strong"
      >
        <div>
          <div className="mb-2 font-body text-[11px] tracking-[0.12em] text-gold-strong uppercase">
            Карта Contrast
          </div>
          <h3 className="font-display text-2xl font-semibold text-foreground">
            Кэшбэк за каждую покупку
          </h3>
        </div>
        <span className="shrink-0 font-body text-sm text-foreground-secondary group-hover:text-foreground">
          Подробнее →
        </span>
      </Link>
    </Container>
  );
}
