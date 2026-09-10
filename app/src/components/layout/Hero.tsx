import Image from "next/image";
import Link from "next/link";
import { getCategoryImage } from "@/lib/category-images";

// Split-screen "Стык" hero — ported from the approved final prototype
// (contrast-mockup-design-alternatives-nine.vercel.app, read directly via its
// live computed styles 2026-09-10, not eyeballed): text left, 2x2 category
// photo grid right, dark background, gold-gradient primary CTA.
const GRID_CATEGORIES = ["Кальяны", "Табачные смеси для кальяна", "Чаши", "Аксессуары"];

export function Hero({ productCount }: { productCount: number }) {
  // Rounded down to a clean hundred, same convention as the "400+" it
  // replaces — was a hardcoded guess (real in-stock count is ~1700+, audit
  // 2026-09-10), now reads live so it can't drift stale again.
  const roundedCount = Math.floor(productCount / 100) * 100;

  return (
    <div className="grid bg-surface-inverse lg:min-h-[640px] lg:grid-cols-2">
      <div className="flex flex-col justify-center px-5 py-16 lg:px-16 lg:py-0">
        <div className="mb-4 font-body text-xs font-semibold tracking-[0.18em] text-gold-soft uppercase">
          Магазин + лаундж
        </div>
        <h1 className="font-display text-5xl leading-[1.06] font-bold text-foreground-on-dark lg:text-6xl">
          Всё для вечера.
          <br />
          На вашей стороне.
        </h1>
        <p className="mt-5 max-w-[440px] font-body text-base text-[#CFC5B2]">
          От первой пробы до полного сетапа — оригинальный табак, угли и аксессуары, {roundedCount}+
          позиций в наличии.
        </p>
        <div className="mt-8 flex flex-wrap items-center gap-3">
          <Link
            href="/catalog"
            className="inline-flex items-center justify-center rounded-sm px-7 py-[15px] font-body text-sm font-semibold text-ink-900 transition-transform duration-150 ease-standard hover:scale-[1.02] active:scale-[0.98]"
            style={{ background: "linear-gradient(135deg, var(--gold-300), var(--gold-700))" }}
          >
            В каталог
          </Link>
        </div>
      </div>

      <div className="grid h-full min-h-[280px] grid-cols-2 grid-rows-2 gap-0.5 lg:min-h-0">
        {GRID_CATEGORIES.map((category) => {
          const image = getCategoryImage(category);
          return (
            <div key={category} className="relative aspect-square overflow-hidden lg:aspect-auto">
              {image && (
                <Image
                  src={image.url}
                  alt={category}
                  fill
                  sizes="(min-width: 1024px) 25vw, 50vw"
                  className="object-cover"
                />
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
