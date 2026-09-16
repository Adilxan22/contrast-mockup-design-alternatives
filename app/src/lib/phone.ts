/**
 * Normalizes a phone number to bare digits with a "7" country code, e.g.
 * "+7 701 888 07-57" and "8 701 888 0757" both become "77018880757". This is
 * the one canonical format used everywhere a phone number is stored or
 * compared (CustomerSession, Order.customerPhone, Consent.phone, Poster
 * lookups) — comparing un-normalized strings across these call sites was
 * silently failing to match the same customer typed differently at login vs.
 * checkout.
 */
export function normalizePhone(phone: string): string {
  const digits = phone.replace(/\D/g, "");
  if (digits.startsWith("8") && digits.length === 11) return `7${digits.slice(1)}`;
  // A bare 10-digit local number (no country/trunk digit) is always typed as
  // "7XX XXX XX XX" in KZ — the leading digit is part of the mobile prefix,
  // not a stand-in for the country code, so prepend "7" rather than treating
  // it as already-complete (it can't collide with the 11-digit case above,
  // since KZ landline/mobile prefixes never start with "0" or "8").
  if (digits.length === 10) return `7${digits}`;
  return digits;
}
