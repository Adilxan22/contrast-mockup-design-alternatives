import "server-only";
import type { PosterAccount } from "./poster/client";

// Manager order notifications via WhatsApp Cloud API (Meta) — decided over
// Telegram because it matches how managers already work day to day. Requires
// Meta business verification, which is a separate, slower-moving process; until
// WHATSAPP_CLOUD_API_TOKEN is set this logs instead of sending, so checkout is
// never blocked on it (same pattern as lib/yandex-delivery.ts and lib/poster).

const GRAPH_API_BASE = "https://graph.facebook.com/v20.0";

const MANAGER_PHONE_ENV_VAR: Record<Extract<PosterAccount, "left" | "centre" | "alfarabi">, string> = {
  left: "WHATSAPP_MANAGER_PHONE_LEFT",
  centre: "WHATSAPP_MANAGER_PHONE_CENTRE",
  alfarabi: "WHATSAPP_MANAGER_PHONE_ALFARABI",
};

export function isWhatsappConfigured(): boolean {
  return Boolean(process.env.WHATSAPP_CLOUD_API_TOKEN && process.env.WHATSAPP_PHONE_NUMBER_ID);
}

export interface OrderNotificationInput {
  branch: Extract<PosterAccount, "left" | "centre" | "alfarabi">;
  orderId: number;
  customerName: string;
  customerPhone: string;
  totalTenge: number;
  itemsSummary: string;
}

export async function sendOrderNotification(input: OrderNotificationInput): Promise<{ sent: boolean }> {
  const managerPhone = process.env[MANAGER_PHONE_ENV_VAR[input.branch]];
  const text =
    `Новый заказ #${input.orderId}\n` +
    `${input.customerName}, ${input.customerPhone}\n` +
    `${input.itemsSummary}\n` +
    `Итого: ${input.totalTenge.toLocaleString("ru-RU")} ₸`;

  if (!isWhatsappConfigured() || !managerPhone) {
    console.info(
      `[whatsapp] not configured — order #${input.orderId} notification not sent. Would have said:\n${text}`
    );
    return { sent: false };
  }

  const res = await fetch(`${GRAPH_API_BASE}/${process.env.WHATSAPP_PHONE_NUMBER_ID}/messages`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${process.env.WHATSAPP_CLOUD_API_TOKEN}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      messaging_product: "whatsapp",
      to: managerPhone,
      type: "text",
      text: { body: text },
    }),
  });

  if (!res.ok) {
    console.error(`[whatsapp] send failed for order #${input.orderId}: HTTP ${res.status}`);
    return { sent: false };
  }
  return { sent: true };
}
