"use client";

import { Search, ShoppingBag, User } from "lucide-react";
import Link from "next/link";
import { Container } from "@/components/ui/Container";
import { useCart } from "@/lib/cart-context";

// Ported from the approved final prototype (contrast-mockup-design-alternatives-nine
// .vercel.app, 2026-09-10): dark utility bar (address/hours + delivery note) above a
// nav with a circular gold "C" mark, fixed page links (not a category list — those
// live on the homepage's CategoryPills and /catalog itself), and a search field.
// "О нас"/"Доставка" don't have pages yet — left out of the nav rather than shipped
// as dead, styled-like-a-link placeholders (UI/UX audit, 2026-09-10); add them back
// as real <Link>s once that content exists.
export function Header({ isLoggedIn }: { isLoggedIn: boolean }) {
  const { count, open } = useCart();
  const whatsappNumber = process.env.NEXT_PUBLIC_WHATSAPP_NUMBER;

  return (
    <header className="sticky top-0 z-40">
      <div className="bg-ink-800 px-5 py-2.5 font-body text-xs text-foreground-on-dark/75 lg:px-10">
        <div className="mx-auto flex max-w-[1400px] flex-wrap items-center justify-between gap-x-6 gap-y-1">
          <span>Astana · ежедневно 10:00–02:00</span>
          {whatsappNumber ? (
            <a
              href={`https://wa.me/${whatsappNumber}`}
              target="_blank"
              rel="noopener noreferrer"
              className="text-gold-soft underline-offset-2 hover:underline"
            >
              Доставка по городу — написать в WhatsApp
            </a>
          ) : (
            <span className="text-gold-soft">Доставка по городу — уточняйте у менеджера</span>
          )}
        </div>
      </div>

      <div className="border-b border-border bg-surface/95 backdrop-blur">
        <Container className="flex h-[72px] items-center gap-6">
          <Link href="/" className="flex shrink-0 items-center gap-2.5">
            <span className="flex size-[30px] items-center justify-center rounded-full border border-gold font-display text-sm text-gold">
              C
            </span>
            <span className="font-body text-lg font-medium tracking-wider text-foreground uppercase">
              Contrast
            </span>
          </Link>

          <nav
            aria-label="Основная навигация"
            className="hidden shrink-0 items-center gap-5 lg:flex"
          >
            <Link
              href="/catalog"
              className="font-body text-sm text-foreground-secondary transition-colors duration-150 ease-standard hover:text-foreground"
            >
              Каталог
            </Link>
          </nav>

          <Link
            href="/catalog"
            className="hidden min-w-0 flex-1 items-center gap-2 rounded-sm border border-border bg-surface-sunken px-4 py-2.5 font-body text-sm text-foreground-muted transition-colors duration-150 ease-standard hover:border-border-strong lg:flex"
          >
            <Search className="size-4 shrink-0" aria-hidden="true" />
            Поиск по каталогу
          </Link>

          <div className="ml-auto flex items-center gap-2 lg:ml-0">
            <Link
              href="/catalog"
              aria-label="Поиск по каталогу"
              className="flex size-11 items-center justify-center rounded-sm text-foreground-secondary transition-colors duration-150 ease-standard hover:bg-surface-sunken hover:text-foreground lg:hidden"
            >
              <Search className="size-[18px]" aria-hidden="true" />
            </Link>
            <Link
              href={isLoggedIn ? "/account" : "/login"}
              aria-label="Личный кабинет"
              className="flex size-11 items-center justify-center rounded-sm text-foreground-secondary transition-colors duration-150 ease-standard hover:bg-surface-sunken hover:text-foreground"
            >
              <User className="size-[18px]" aria-hidden="true" />
            </Link>
            <button
              type="button"
              onClick={open}
              aria-label={`Корзина${count > 0 ? `, товаров: ${count}` : ""}`}
              className="relative flex size-11 items-center justify-center rounded-sm text-foreground-secondary transition-colors duration-150 ease-standard hover:bg-surface-sunken hover:text-foreground"
            >
              <ShoppingBag className="size-[18px]" aria-hidden="true" />
              {count > 0 && (
                <span className="absolute top-1.5 right-1.5 flex size-4 items-center justify-center rounded-full bg-gold-strong text-[10px] font-medium text-white">
                  {count > 9 ? "9+" : count}
                </span>
              )}
            </button>
          </div>
        </Container>
      </div>
    </header>
  );
}
