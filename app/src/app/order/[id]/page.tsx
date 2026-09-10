import type { Metadata } from "next";
import Link from "next/link";
import { Container } from "@/components/ui/Container";
import { hasDatabase, prisma } from "@/lib/db";
import { formatPrice } from "@/lib/format";

export const metadata: Metadata = { title: "Заказ — Contrast" };

interface OrderItem {
  productId: number;
  name: string;
  quantity: number;
  price: string;
}

export default async function OrderPage({ params }: PageProps<"/order/[id]">) {
  const { id } = await params;
  const order = hasDatabase ? await prisma.order.findUnique({ where: { id: Number(id) } }) : null;

  if (!order) {
    return (
      <Container className="py-16 text-center">
        <h1 className="mb-3 font-display text-2xl text-foreground">Заказ не найден</h1>
        <p className="mb-6 font-body text-foreground-muted">
          {hasDatabase
            ? "Проверьте номер заказа."
            : "БД не подключена (демо-режим) — подробности заказов недоступны по прямой ссылке."}
        </p>
        <Link href="/catalog" className="font-body underline">
          Вернуться в каталог
        </Link>
      </Container>
    );
  }

  const items = order.items as unknown as OrderItem[];

  return (
    <Container className="max-w-xl py-10">
      <h1 className="mb-2 font-display text-3xl text-foreground">Заказ #{order.id}</h1>
      <p className="mb-6 font-body text-sm text-foreground-muted">
        Статус: {order.status} · {order.createdAt.toLocaleDateString("ru-RU")}
      </p>
      <ul className="mb-6 flex flex-col gap-2 font-body text-sm text-foreground-secondary">
        {items.map((it) => (
          <li key={it.productId} className="flex justify-between gap-2">
            <span>
              {it.name} × {it.quantity}
            </span>
            <span>{it.price}</span>
          </li>
        ))}
      </ul>
      <div className="flex items-baseline justify-between border-t border-border pt-4 font-body">
        <span className="text-foreground-secondary">Итого</span>
        <span className="font-display text-2xl text-foreground">{formatPrice(order.totalTenge)}</span>
      </div>
    </Container>
  );
}
