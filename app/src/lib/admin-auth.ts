import { timingSafeEqual } from "node:crypto";
import { cookies } from "next/headers";
import { sign, verify } from "./signed-token";

const COOKIE_NAME = "contrast_admin";
const MAX_AGE_SECONDS = 60 * 60 * 12; // 12h — single-operator admin panel, not a public login

export async function verifyAdminPassword(password: string): Promise<boolean> {
  const expected = process.env.ADMIN_PASSWORD;
  if (!expected) {
    throw new Error(
      "ADMIN_PASSWORD is not set — add it to app/.env.local before using admin auth."
    );
  }
  const a = Buffer.from(password);
  const b = Buffer.from(expected);
  return a.length === b.length && timingSafeEqual(a, b);
}

export async function createAdminSession(): Promise<void> {
  const expiresAt = Date.now() + MAX_AGE_SECONDS * 1000;
  const token = sign(`admin.${expiresAt}`);
  const store = await cookies();
  store.set(COOKIE_NAME, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    maxAge: MAX_AGE_SECONDS,
    // Must cover /api/admin/* too, not just /admin/* pages — a narrower path
    // here silently drops the cookie on API route fetches.
    path: "/",
  });
}

export async function clearAdminSession(): Promise<void> {
  const store = await cookies();
  store.delete(COOKIE_NAME);
}

export async function isAdminAuthenticated(): Promise<boolean> {
  const store = await cookies();
  const token = store.get(COOKIE_NAME)?.value;
  if (!token) return false;
  const value = verify(token);
  if (!value) return false;
  const expiresAt = Number(value.split(".")[1]);
  return Number.isFinite(expiresAt) && Date.now() < expiresAt;
}

/** Throws-free guard for use at the top of admin server components/route handlers. */
export async function requireAdmin(): Promise<boolean> {
  return isAdminAuthenticated();
}
