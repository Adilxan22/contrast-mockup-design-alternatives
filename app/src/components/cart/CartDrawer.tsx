"use client";

import { Minus, Plus, ShoppingBag, Trash2, X } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { useEffect } from "react";
import { Button } from "@/components/ui/Button";
import { useCart } from "@/lib/cart-context";
import { getCategoryImage } from "@/lib/category-images";
import { formatPrice, parsePrice } from "@/lib/format";

export function CartDrawer() {
  const { items, isOpen, close, removeItem, setQuantity } = useCart();

  useEffect(() => {
    if (!isOpen) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") close();
    };
    document.addEventListener("keydown", onKey);
    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = prevOverflow;
    };
  }, [isOpen, close]);

  const subtotal = items.reduce(
    (sum, it) => sum + parsePrice(it.product.price) * it.quantity,
    0
  );

  return (
    <div
      className={`fixed inset-0 z-50 ${isOpen ? "" : "pointer-events-none"}`}
      aria-hidden={!isOpen}
    >
      <div
        onClick={close}
        className={`absolute inset-0 transition-opacity duration-300 ease-standard ${
          isOpen ? "opacity-100" : "opacity-0"
        }`}
        style={{ background: "rgba(16,14,11,0.5)" }}
      />
      <aside
        role="dialog"
        aria-modal="true"
        aria-label="Корзина"
        className={`absolute inset-y-0 right-0 flex w-full max-w-md flex-col bg-surface shadow-lg transition-transform duration-300 ease-standard ${
          isOpen ? "translate-x-0" : "translate-x-full"
        }`}
      >
        <div className="flex items-center justify-between border-b border-border px-6 py-5">
          <h2 className="font-display text-2xl text-foreground">Корзина</h2>
          <button
            type="button"
            onClick={close}
            aria-label="Закрыть корзину"
            className="flex size-10 items-center justify-center rounded-sm text-foreground-secondary transition-colors duration-150 ease-standard hover:bg-surface-sunken"
          >
            <X className="size-5" aria-hidden="true" />
          </button>
        </div>

        {items.length === 0 ? (
          <div className="flex flex-1 flex-col items-center justify-center gap-3 px-6 text-center text-foreground-muted">
            <ShoppingBag className="size-10" strokeWidth={1.25} aria-hidden="true" />
            <p className="font-body text-base">Корзина пуста</p>
          </div>
        ) : (
          <ul className="flex-1 overflow-y-auto px-6 py-4">
            {items.map((it) => {
              const image = getCategoryImage(it.product.category);
              return (
              <li key={it.product.id} className="flex gap-4 border-b border-border py-4 last:border-none">
                <div className="relative size-16 shrink-0 overflow-hidden rounded-sm bg-surface-sunken">
                  {image && (
                    <Image
                      src={image.url}
                      alt=""
                      fill
                      sizes="64px"
                      className="object-cover"
                    />
                  )}
                </div>
                <div className="min-w-0 flex-1">
                  <div className="mb-1 truncate font-body text-sm text-foreground">
                    {it.product.name}
                  </div>
                  <div className="mb-2 font-display text-lg text-foreground">
                    {it.product.price}
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="inline-flex items-center rounded-sm border border-border">
                      <button
                        type="button"
                        aria-label="Уменьшить количество"
                        onClick={() => setQuantity(it.product.id, it.quantity - 1)}
                        className="flex size-8 items-center justify-center text-foreground hover:bg-surface-sunken"
                      >
                        <Minus className="size-3.5" aria-hidden="true" />
                      </button>
                      <span className="w-7 text-center text-sm tabular-nums">{it.quantity}</span>
                      <button
                        type="button"
                        aria-label="Увеличить количество"
                        onClick={() => setQuantity(it.product.id, it.quantity + 1)}
                        className="flex size-8 items-center justify-center text-foreground hover:bg-surface-sunken"
                      >
                        <Plus className="size-3.5" aria-hidden="true" />
                      </button>
                    </div>
                    <button
                      type="button"
                      aria-label="Удалить из корзины"
                      onClick={() => removeItem(it.product.id)}
                      className="flex size-8 items-center justify-center rounded-sm text-foreground-muted transition-colors duration-150 ease-standard hover:bg-danger-soft hover:text-danger"
                    >
                      <Trash2 className="size-4" aria-hidden="true" />
                    </button>
                  </div>
                </div>
              </li>
              );
            })}
          </ul>
        )}

        {items.length > 0 && (
          <div className="border-t border-border px-6 py-5">
            <div className="mb-4 flex items-baseline justify-between font-body">
              <span className="text-foreground-secondary">Итого</span>
              <span className="font-display text-2xl text-foreground">
                {formatPrice(subtotal)}
              </span>
            </div>
            <Link href="/checkout" onClick={close} className="block">

              <Button variant="primary" size="lg" className="w-full">
                Оформить заказ
              </Button>
            </Link>
          </div>
        )}
      </aside>
    </div>
  );
}
