import { redirect } from "next/navigation";
import { logoutCustomer } from "@/app/(auth)/actions";
import { Button } from "@/components/ui/Button";
import { Container } from "@/components/ui/Container";
import { getCustomerSession } from "@/lib/customer-auth";
import { hasDatabase, prisma } from "@/lib/db";
import { formatPrice } from "@/lib/format";
import { getClientByPhone, tiyeToTenge } from "@/lib/poster/api";
import { isPosterConfigured } from "@/lib/poster/client";

export default async function AccountPage() {
  const session = await getCustomerSession();
  if (!session) redirect("/login");

  const orders = hasDatabase
    ? await prisma.order.findMany({
        where: { customerPhone: session.phone },
        orderBy: { createdAt: "desc" },
        take: 50,
      })
    : [];

  // Loyalty/cashback is unified across all 4 accounts via Connect — confirmed
  // by the CRM audit (docs/PROJECT_SPEC.md §1.4) — so one lookup is enough.
  const bonusTenge = isPosterConfigured(["connect"])
    ? tiyeToTenge((await getClientByPhone(session.phone))?.bonus)
    : null;

  return (
    <Container className="max-w-2xl py-10">
      <div className="mb-6 flex items-center justify-between">
        <h1 className="font-display text-2xl text-foreground">Личный кабинет</h1>
        <form action={logoutCustomer}>
          <Button variant="ghost" size="sm" type="submit">
            Выйти
          </Button>
        </form>
      </div>

      <p className="mb-6 font-body text-foreground-secondary">Телефон: {session.phone}</p>

      <div className="mb-8 rounded-md border border-border bg-surface-sunken p-5">
        <div className="mb-1 font-body text-xs tracking-wide text-foreground-secondary uppercase">
          Кэшбэк
        </div>
        <div className="font-display text-2xl text-foreground">
          {bonusTenge === null ? "Недоступно" : formatPrice(bonusTenge)}
        </div>
      </div>

      <h2 className="mb-4 font-display text-xl text-foreground">История заказов</h2>
      {orders.length === 0 ? (
        <p className="font-body text-foreground-muted">Заказов пока нет.</p>
      ) : (
        <ul className="flex flex-col gap-3">
          {orders.map((o) => (
            <li key={o.id} className="flex items-center justify-between rounded-md border border-border p-4">
              <div>
                <div className="font-body text-sm text-foreground">Заказ #{o.id}</div>
                <div className="font-body text-xs text-foreground-muted">
                  {o.createdAt.toLocaleDateString("ru-RU")} · {o.status}
                </div>
              </div>
              <div className="font-display text-lg text-foreground">{formatPrice(o.totalTenge)}</div>
            </li>
          ))}
        </ul>
      )}
    </Container>
  );
}
