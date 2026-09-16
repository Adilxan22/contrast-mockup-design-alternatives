import "server-only";
import { timingSafeEqual } from "node:crypto";

/**
 * Authenticates a scheduled trigger (Vercel Cron, or any external scheduler
 * hitting the route directly) via `Authorization: Bearer <CRON_SECRET>` —
 * separate from the admin cookie, since a cron job has no browser session.
 * Vercel's own Cron Jobs send this header automatically using the project's
 * CRON_SECRET env var; an external scheduler needs it set explicitly.
 */
export function isCronAuthenticated(req: Request): boolean {
  const secret = process.env.CRON_SECRET;
  if (!secret) return false;
  const header = req.headers.get("authorization") ?? "";
  const expected = `Bearer ${secret}`;
  const a = Buffer.from(header);
  const b = Buffer.from(expected);
  return a.length === b.length && timingSafeEqual(a, b);
}
