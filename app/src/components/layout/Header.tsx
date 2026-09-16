"use client";

import { MessageCircle, Search, ShoppingBag, User } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Container } from "@/components/ui/Container";
import { Tooltip } from "@/components/ui/Tooltip";
import { useCart } from "@/lib/cart-context";

// Ported from the approved final prototype (contrast-mockup-design-alternatives-nine
// .vercel.app, 2026-09-10): nav with a circular gold "C" mark, fixed page links
// (not a category list — those live on the homepage's CategoryPills and
// /catalog itself), and a search field. The dark address/hours utility bar
// that used to sit above this was dropped (2026-09-10, on request) — it
// wasn't earning its space.
// "О нас"/"Доставка" don't have pages yet — left out of the nav rather than shipped
// as dead, styled-like-a-link placeholders (UI/UX audit, 2026-09-10); add them back
// as real <Link>s once that content exists.
export function Header({ isLoggedIn }: { isLoggedIn: boolean }) {
  const { count, open } = useCart();
  const whatsappNumber = process.env.NEXT_PUBLIC_WHATSAPP_NUMBER;
  // /catalog has its own live-filtering search in the sidebar (combines with
  // brand/price/strength facets) — showing this one too would be two search
  // boxes doing the same job on one screen, out of sync with each other
  // (UI/UX audit, 2026-09-17). Everywhere else this is the only way in.
  const isCatalogPage = usePathname().startsWith("/catalog");

  return (
    <header className="sticky top-0 z-40">
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

          {!isCatalogPage && (
            <form
              action="/catalog"
              className="hidden min-w-0 flex-1 items-center gap-2 rounded-sm border border-border bg-surface-sunken px-4 py-2.5 transition-colors duration-150 ease-standard focus-within:border-border-strong hover:border-border-strong lg:flex"
            >
              <Search className="size-4 shrink-0 text-foreground-muted" aria-hidden="true" />
              <input
                type="text"
                name="q"
                placeholder="Поиск по каталогу"
                aria-label="Поиск по каталогу"
                className="w-full min-w-0 bg-transparent font-body text-sm text-foreground placeholder:text-foreground-muted focus:outline-none"
              />
              <button type="submit" className="sr-only">
                Найти
              </button>
            </form>
          )}

          <div className="ml-auto flex items-center gap-2">
            {!isCatalogPage && (
              <Tooltip label="Поиск по каталогу">
                <Link
                  href="/catalog"
                  aria-label="Поиск по каталогу"
                  className="flex size-11 items-center justify-center rounded-sm text-foreground-secondary transition-colors duration-150 ease-standard hover:bg-surface-sunken hover:text-foreground lg:hidden"
                >
                  <Search className="size-[18px]" aria-hidden="true" />
                </Link>
              </Tooltip>
            )}
            {whatsappNumber && (
              <Tooltip label="Написать в WhatsApp">
                <a
                  href={`https://wa.me/${whatsappNumber}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label="Написать в WhatsApp"
                  className="flex size-11 items-center justify-center rounded-sm text-foreground-secondary transition-colors duration-150 ease-standard hover:bg-surface-sunken hover:text-foreground"
                >
                  <MessageCircle className="size-[18px]" aria-hidden="true" />
                </a>
              </Tooltip>
            )}
            <Tooltip label="Личный кабинет">
              <Link
                href={isLoggedIn ? "/account" : "/login"}
                aria-label="Личный кабинет"
                className="flex size-11 items-center justify-center rounded-sm text-foreground-secondary transition-colors duration-150 ease-standard hover:bg-surface-sunken hover:text-foreground"
              >
                <User className="size-[18px]" aria-hidden="true" />
              </Link>
            </Tooltip>
            <Tooltip label="Корзина">
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
            </Tooltip>
          </div>
        </Container>
      </div>
    </header>
  );
}
