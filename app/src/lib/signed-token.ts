import { createHmac, timingSafeEqual } from "node:crypto";

// Shared HMAC-signing helper for cookie session tokens (admin-auth.ts and
// customer-auth.ts). Kept dependency-free (node:crypto only) since these are
// simple "value + expiry, signed" tokens, not full JWTs.

function getSecret(): string {
  const secret = process.env.SESSION_SECRET;
  if (!secret) {
    throw new Error("SESSION_SECRET is not set — add it to app/.env.local before using session auth.");
  }
  return secret;
}

export function sign(value: string): string {
  const mac = createHmac("sha256", getSecret()).update(value).digest("hex");
  return `${value}.${mac}`;
}

/** Returns the original value if the signature is valid, otherwise null. */
export function verify(token: string): string | null {
  const separatorIndex = token.lastIndexOf(".");
  if (separatorIndex === -1) return null;
  const value = token.slice(0, separatorIndex);
  const mac = token.slice(separatorIndex + 1);
  const expected = createHmac("sha256", getSecret()).update(value).digest("hex");
  const macBuf = Buffer.from(mac);
  const expectedBuf = Buffer.from(expected);
  if (macBuf.length !== expectedBuf.length || !timingSafeEqual(macBuf, expectedBuf)) {
    return null;
  }
  return value;
}
