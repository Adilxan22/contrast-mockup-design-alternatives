import { NextResponse } from "next/server";
import { z } from "zod";
import { getBranchAvailability, getProductById } from "@/lib/catalog";
import { hasDatabase, prisma } from "@/lib/db";
import { parsePrice } from "@/lib/format";
import { isPosterConfigured } from "@/lib/poster/client";
import { createIncomingOrder } from "@/lib/poster/api";
import { sendOrderNotification } from "@/lib/whatsapp";
import { estimateDelivery } from "@/lib/yandex-delivery";

const BRANCHES = ["left", "centre", "alfarabi"] as const;
const CONSENT_TEXT_VERSION = "2026-09-10";

// At least 10 digits once separators/spaces are stripped — accepts any
// reasonable local/international format without pinning to +7 specifically
// (staff sometimes take orders for customers calling from other countries).
const PHONE_DIGITS_RE = /^\+?[\d\s()-]{10,20}$/;

const checkoutSchema = z.object({
  customerName: z
    .string()
    .trim()
    .min(2)
    .max(100)
    .refine((v) => /\p{L}/u.test(v), { message: "Введите настоящее имя" }),
  phone: z
    .string()
    .trim()
    .min(6)
    .max(20)
    .refine((v) => PHONE_DIGITS_RE.test(v) && v.replace(/\D/g, "").length >= 10, {
      message: "Введите настоящий номер телефона",
    }),
  branch: z.enum(BRANCHES),
  deliveryType: z.enum(["pickup", "delivery"]),
  address: z.string().trim().max(300).optional(),
  comment: z.string().trim().max(300).optional(),
  consent: z.literal(true, { message: "Нужно согласие на обработку персональных данных" }),
  items: z
    .array(
      z.object({
        productId: z.number().int().positive(),
        quantity: z.number().int().positive().max(99),
      })
    )
    .min(1),
});

export async function POST(req: Request) {
  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "invalid_json" }, { status: 400 });
  }

  const parsed = checkoutSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: "invalid_input", details: parsed.error.flatten() }, { status: 400 });
  }
  const input = parsed.data;

  if (input.deliveryType === "delivery" && !input.address) {
    return NextResponse.json({ error: "address_required" }, { status: 400 });
  }

  // Re-resolve every item against the real catalog server-side — the client
  // sends only ids/quantities, never trusted for price or stock.
  const resolvedItems = await Promise.all(
    input.items.map(async (it) => {
      const product = await getProductById(it.productId);
      if (!product) return null;
      return { product, quantity: Math.min(it.quantity, product.stock) };
    })
  );
  if (resolvedItems.some((r) => r === null || r.quantity <= 0)) {
    return NextResponse.json({ error: "product_unavailable" }, { status: 400 });
  }
  const items = resolvedItems as { product: NonNullable<Awaited<ReturnType<typeof getProductById>>>; quantity: number }[];

  // Stock is per-branch (see BranchProductId's schema comment for why) — the
  // client already filters the branch picker to ones with full availability,
  // but re-check here since the cart/branch can change between fetches.
  const availability = await getBranchAvailability(items.map((it) => ({ productId: it.product.id, quantity: it.quantity })));
  if (!availability[input.branch]) {
    return NextResponse.json({ error: "branch_out_of_stock" }, { status: 409 });
  }

  const itemsTotalTenge = items.reduce((sum, it) => sum + parsePrice(it.product.price) * it.quantity, 0);
  const delivery = input.deliveryType === "delivery" ? await estimateDelivery({ address: input.address! }) : null;
  const totalTenge = itemsTotalTenge + (delivery?.priceTenge ?? 0);

  const orderItemsJson = items.map((it) => ({
    productId: it.product.id,
    name: it.product.name,
    quantity: it.quantity,
    price: it.product.price,
  }));

  const order = hasDatabase
    ? await prisma.order.create({
        data: {
          branch: input.branch,
          customerName: input.customerName,
          customerPhone: input.phone,
          items: orderItemsJson,
          deliveryType: input.deliveryType,
          address: input.address,
          totalTenge,
          status: "new",
        },
      })
    : null;

  if (hasDatabase) {
    await prisma.consent.create({
      data: { phone: input.phone, textVersion: CONSENT_TEXT_VERSION },
    });
  }

  // The catalog is synced from the connect account, but product_id is NOT
  // shared across Poster accounts — confirmed on real data, each branch has
  // its own numbering (see BranchProductId's schema comment). Creating an
  // order on a branch needs THAT branch's own product_id, resolved via
  // BranchProductId (matched by name at stock-sync time), not product.posterId.
  let posterOrderId: number | null = null;
  const branchProductIds = hasDatabase
    ? await prisma.branchProductId.findMany({
        where: { branch: input.branch, productId: { in: items.map((it) => it.product.id) } },
      })
    : [];
  const branchProductIdByProductId = new Map(branchProductIds.map((b) => [b.productId, b.posterProductId]));
  const postable = items.every((it) => branchProductIdByProductId.has(it.product.id));

  if (postable && isPosterConfigured([input.branch])) {
    try {
      const result = await createIncomingOrder({
        branch: input.branch,
        phone: input.phone,
        customerName: input.customerName,
        comment: input.comment,
        items: items.map((it) => ({
          productId: branchProductIdByProductId.get(it.product.id)!,
          quantity: it.quantity,
        })),
      });
      posterOrderId = Number(result.incoming_order_id);
      if (hasDatabase && order) {
        await prisma.order.update({ where: { id: order.id }, data: { posterOrderId } });
      }
    } catch (err) {
      console.error(`[checkout] Poster order creation failed for branch "${input.branch}":`, err);
    }
  } else {
    console.info(
      `[checkout] Order for branch "${input.branch}" not pushed to Poster (not configured, or one or more items have no known product_id on that branch yet — run /api/admin/sync-stock) — logged locally only. Manager still gets the WhatsApp notification.`
    );
  }

  const itemsSummary = items.map((it) => `${it.product.name} × ${it.quantity}`).join(", ");
  const notification = await sendOrderNotification({
    branch: input.branch,
    orderId: order?.id ?? 0,
    customerName: input.customerName,
    customerPhone: input.phone,
    totalTenge,
    itemsSummary,
  });
  if (hasDatabase && order && notification.sent) {
    await prisma.order.update({ where: { id: order.id }, data: { whatsappNotified: true } });
  }

  return NextResponse.json({
    orderId: order?.id ?? null,
    posterOrderId,
    totalTenge,
    deliveryApproximate: delivery?.approximate ?? false,
  });
}
