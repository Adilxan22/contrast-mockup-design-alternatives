"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { ConsentCheckbox } from "@/components/checkout/ConsentCheckbox";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Select } from "@/components/ui/Select";
import { useCart } from "@/lib/cart-context";
import { formatPrice, parsePrice } from "@/lib/format";

type Branch = "left" | "centre" | "alfarabi";
type DeliveryType = "pickup" | "delivery";

// Real addresses, confirmed by Адилхан 2026-09-10.
const BRANCH_OPTIONS: { value: Branch; label: string }[] = [
  { value: "centre", label: "ул. Шокана Уалиханова, 1 (2 этаж) — Лаундж-бар и Hookah Market" },
  { value: "left", label: "ул. Кайыма Мухамедханова, 4В — Лаундж-бар" },
  { value: "alfarabi", label: "проспект Аль-Фараби, 9/2 — Лаундж-бар" },
];

interface CheckoutResult {
  orderId: number | null;
  posterOrderId: number | null;
  totalTenge: number;
  deliveryApproximate: boolean;
}

export function CheckoutClient() {
  const { items, clear } = useCart();
  const [customerName, setCustomerName] = useState("");
  const [phone, setPhone] = useState("");
  const [branch, setBranch] = useState<Branch>("centre");
  const [deliveryType, setDeliveryType] = useState<DeliveryType>("pickup");
  const [address, setAddress] = useState("");
  const [comment, setComment] = useState("");
  const [consent, setConsent] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<CheckoutResult | null>(null);
  // Stock is per-branch, not one shared total (see project notes on why) — a
  // branch the customer didn't actually check might not have every item, so
  // the branch picker has to be filtered to branches that do, for both
  // self-pickup and delivery dispatch alike.
  const [availability, setAvailability] = useState<Record<Branch, boolean> | null>(null);

  const subtotal = items.reduce((sum, it) => sum + parsePrice(it.product.price) * it.quantity, 0);

  const itemsKey = items.map((it) => `${it.product.id}:${it.quantity}`).join(",");
  useEffect(() => {
    if (items.length === 0) return;
    let cancelled = false;
    fetch("/api/branch-availability", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ items: items.map((it) => ({ productId: it.product.id, quantity: it.quantity })) }),
    })
      .then((res) => (res.ok ? res.json() : null))
      .then((data) => {
        if (!cancelled && data) setAvailability(data.availability);
      })
      .catch(() => {
        // Availability check failed — leave every branch selectable rather
        // than block checkout over a non-critical lookup.
      });
    return () => {
      cancelled = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps -- itemsKey is the intentional dependency, not items
  }, [itemsKey]);

  const availableBranches = BRANCH_OPTIONS.filter((b) => availability?.[b.value] !== false);

  // Re-pick the selected branch once availability narrows it out — adjusted
  // during render (React's recommended pattern for this) rather than in an
  // effect, matching CatalogClient's prevInitialCategory idiom.
  const [prevAvailability, setPrevAvailability] = useState(availability);
  if (availability !== prevAvailability) {
    setPrevAvailability(availability);
    if (availableBranches.length > 0 && !availableBranches.some((b) => b.value === branch)) {
      setBranch(availableBranches[0].value);
    }
  }

  if (result) {
    return (
      <div className="py-16 text-center">
        <h1 className="mb-3 font-display text-3xl text-foreground">Заказ принят</h1>
        <p className="mb-1 font-body text-foreground-secondary">
          {result.orderId ? `Номер заказа: ${result.orderId}` : "Заказ отправлен"}
        </p>
        <p className="mb-6 font-body text-foreground-secondary">
          Итого: {formatPrice(result.totalTenge)}
          {result.deliveryApproximate && " (стоимость доставки ориентировочная)"}
        </p>
        <Link href="/catalog">
          <Button variant="secondary">Вернуться в каталог</Button>
        </Link>
      </div>
    );
  }

  if (items.length === 0) {
    return (
      <div className="py-16 text-center font-body text-foreground-muted">
        Корзина пуста.{" "}
        <Link href="/catalog" className="underline">
          Перейти в каталог
        </Link>
      </div>
    );
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!consent) {
      setError("Нужно согласие на обработку персональных данных");
      return;
    }
    setSubmitting(true);
    setError(null);
    try {
      const res = await fetch("/api/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          customerName,
          phone,
          branch,
          deliveryType,
          address: deliveryType === "delivery" ? address : undefined,
          comment: comment || undefined,
          consent,
          items: items.map((it) => ({ productId: it.product.id, quantity: it.quantity })),
        }),
      });
      if (!res.ok) {
        const body = await res.json().catch(() => null);
        throw new Error(body?.error ?? "checkout_failed");
      }
      const data = (await res.json()) as CheckoutResult;
      setResult(data);
      clear();
    } catch (err) {
      setError(
        err instanceof Error && err.message === "branch_out_of_stock"
          ? "В выбранном филиале уже не хватает товара — выберите другой филиал."
          : "Не удалось оформить заказ. Попробуйте ещё раз или напишите нам в WhatsApp."
      );
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="grid gap-10 py-8 lg:grid-cols-[1fr_360px]">
      <form onSubmit={handleSubmit} className="flex flex-col gap-5">
        <h1 className="font-display text-3xl text-foreground">Оформление заказа</h1>

        <Input
          name="customerName"
          label="Имя"
          required
          value={customerName}
          onChange={(e) => setCustomerName(e.target.value)}
        />
        <Input
          name="phone"
          label="Телефон"
          type="tel"
          placeholder="+7 7XX XXX XX XX"
          required
          minLength={10}
          pattern="^\+?[\d\s()-]{10,20}$"
          title="Введите номер телефона, минимум 10 цифр"
          value={phone}
          onChange={(e) => setPhone(e.target.value)}
        />
        <Select
          name="deliveryType"
          label="Способ получения"
          value={deliveryType}
          onChange={(e) => setDeliveryType(e.target.value as DeliveryType)}
          options={[
            { value: "pickup", label: "Самовывоз" },
            { value: "delivery", label: "Доставка" },
          ]}
        />
        <Select
          name="branch"
          label="Филиал"
          value={branch}
          onChange={(e) => setBranch(e.target.value as Branch)}
          options={availableBranches.length > 0 ? availableBranches : BRANCH_OPTIONS}
          disabled={availableBranches.length === 0}
        />
        {availability && availableBranches.length === 0 && (
          <p className="font-body text-sm text-danger">
            Ни в одном филиале нет всех товаров из корзины сразу. Уберите часть товаров или напишите нам
            в WhatsApp — соберём заказ вручную.
          </p>
        )}
        {availability && availableBranches.length > 0 && availableBranches.length < BRANCH_OPTIONS.length && (
          <p className="font-body text-xs text-foreground-muted">
            Показаны только филиалы, где есть все товары из корзины.
          </p>
        )}
        {deliveryType === "delivery" && (
          <Input
            name="address"
            label="Адрес доставки"
            required
            value={address}
            onChange={(e) => setAddress(e.target.value)}
          />
        )}
        <Input
          name="comment"
          label="Комментарий к заказу (необязательно)"
          value={comment}
          onChange={(e) => setComment(e.target.value)}
        />

        <ConsentCheckbox checked={consent} onChange={setConsent} />

        {error && <p className="font-body text-sm text-danger">{error}</p>}

        <Button type="submit" variant="primary" size="lg" loading={submitting} disabled={submitting}>
          Подтвердить заказ
        </Button>
      </form>

      <aside className="h-fit rounded-md border border-border bg-surface-sunken p-6">
        <h2 className="mb-4 font-display text-xl text-foreground">Ваш заказ</h2>
        <ul className="mb-4 flex flex-col gap-2 font-body text-sm text-foreground-secondary">
          {items.map((it) => (
            <li key={it.product.id} className="flex justify-between gap-2">
              <span className="truncate">
                {it.product.name} × {it.quantity}
              </span>
              <span className="shrink-0">{formatPrice(parsePrice(it.product.price) * it.quantity)}</span>
            </li>
          ))}
        </ul>
        <div className="flex items-baseline justify-between border-t border-border pt-4 font-body">
          <span className="text-foreground-secondary">Итого</span>
          <span className="font-display text-2xl text-foreground">{formatPrice(subtotal)}</span>
        </div>
      </aside>
    </div>
  );
}
