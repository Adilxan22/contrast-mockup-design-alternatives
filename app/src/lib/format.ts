/** Parses a formatted price like "32 000 ₸" back into a plain number. */
export function parsePrice(price: string): number {
  const digits = price.replace(/[^\d]/g, "");
  return digits ? Number(digits) : 0;
}

export function formatPrice(amount: number): string {
  return `${new Intl.NumberFormat("ru-RU").format(Math.round(amount))} ₸`;
}
