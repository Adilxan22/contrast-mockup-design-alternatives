import "server-only";

// Yandex Delivery integration. No token exists yet (client is still waiting on a
// callback from Yandex — see project memory) so this returns an explicitly
// approximate estimate instead of blocking checkout. Once YANDEX_DELIVERY_TOKEN
// is set, swap the body of estimateDelivery for a real call to Yandex Delivery's
// offer/pricing endpoint (docs at yandex.com/dev/delivery) — the call signature
// below is shaped so that swap doesn't touch any caller.

export interface DeliveryEstimateInput {
  address: string;
  city?: string;
}

export interface DeliveryEstimate {
  priceTenge: number;
  etaMinutes: number;
  approximate: boolean;
}

export function isYandexDeliveryConfigured(): boolean {
  return Boolean(process.env.YANDEX_DELIVERY_TOKEN);
}

const FALLBACK_PRICE_TENGE = 1500;
const FALLBACK_ETA_MINUTES = 90;

export async function estimateDelivery(input: DeliveryEstimateInput): Promise<DeliveryEstimate> {
  if (!isYandexDeliveryConfigured()) {
    return { priceTenge: FALLBACK_PRICE_TENGE, etaMinutes: FALLBACK_ETA_MINUTES, approximate: true };
  }

  // TODO(yandex-delivery): real offer request once YANDEX_DELIVERY_TOKEN exists.
  // Left as the fallback for now rather than guessing at an unverified request
  // shape — better to keep checkout working with an honest "approximate" flag
  // than to ship an untested integration.
  void input;
  return { priceTenge: FALLBACK_PRICE_TENGE, etaMinutes: FALLBACK_ETA_MINUTES, approximate: true };
}
