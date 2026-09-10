import "server-only";
import { cookies } from "next/headers";
import { hasDatabase, prisma } from "./db";
import { sign, verify } from "./signed-token";

// Personal cabinet auth, matching docs/ARCHITECTURE.md §3: phone number is the
// identifier, no password. Real OTP delivery (SMS/WhatsApp) was explicitly
// deferred by the client — see OtpProvider below — so login currently succeeds
// immediately after a phone number is entered. Swapping in a real provider later
// only means implementing OtpProvider and changing one line in requestOtp/
// verifyOtp; nothing in the route/UI layer needs to change.
//
// The session itself lives in a signed cookie (like lib/admin-auth.ts), not a DB
// row — so login works even before DATABASE_URL is configured, same as every
// other part of the site. When a DB is available we additionally persist a
// CustomerSession row for future admin visibility, but it's never required to
// validate a session.

const COOKIE_NAME = "contrast_session";
const SESSION_DAYS = 30;

export interface OtpProvider {
  /** Sends (or, for the dev provider, skips sending) a one-time code. */
  send(phone: string): Promise<void>;
  /** Verifies a code the customer entered. Dev provider accepts anything. */
  verify(phone: string, code: string): Promise<boolean>;
}

class DevNoOpOtpProvider implements OtpProvider {
  async send(): Promise<void> {
    // Intentionally does nothing — see module doc comment.
  }
  async verify(): Promise<boolean> {
    return true;
  }
}

export const otpProvider: OtpProvider = new DevNoOpOtpProvider();

function normalizePhone(phone: string): string {
  const digits = phone.replace(/\D/g, "");
  return digits.startsWith("8") ? `7${digits.slice(1)}` : digits;
}

/** Called after the customer submits the phone (and, once real OTP lands, the code). */
export async function createCustomerSession(rawPhone: string): Promise<string> {
  const phone = normalizePhone(rawPhone);
  const expiresAt = Date.now() + SESSION_DAYS * 24 * 60 * 60 * 1000;
  const token = sign(`${phone}.${expiresAt}`);

  if (hasDatabase) {
    try {
      await prisma.customerSession.create({ data: { phone, token, expiresAt: new Date(expiresAt) } });
    } catch (err) {
      console.error("[customer-auth] failed to persist session row (non-fatal, cookie still valid):", err);
    }
  }

  const store = await cookies();
  store.set(COOKIE_NAME, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    expires: new Date(expiresAt),
    path: "/",
  });
  return phone;
}

export async function getCustomerSession(): Promise<{ phone: string } | null> {
  const store = await cookies();
  const token = store.get(COOKIE_NAME)?.value;
  if (!token) return null;

  const value = verify(token);
  if (!value) return null;

  const lastDot = value.lastIndexOf(".");
  if (lastDot === -1) return null;
  const phone = value.slice(0, lastDot);
  const expiresAt = Number(value.slice(lastDot + 1));
  if (!Number.isFinite(expiresAt) || Date.now() >= expiresAt) return null;

  return { phone };
}

export async function clearCustomerSession(): Promise<void> {
  const store = await cookies();
  const token = store.get(COOKIE_NAME)?.value;
  if (token && hasDatabase) {
    await prisma.customerSession.deleteMany({ where: { token } }).catch(() => {});
  }
  store.delete(COOKIE_NAME);
}
