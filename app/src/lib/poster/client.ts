import "server-only";

// Thin client for the Poster POS API (dev.joinposter.com). Server-only: tokens
// must never reach a client bundle. See docs/PROJECT_SPEC.md §1.4 for the account
// structure (one Connect account for the shared catalog, three branch accounts
// for their own stock/orders) and docs/ARCHITECTURE.md for how each is used.

export type PosterAccount = "connect" | "left" | "centre" | "alfarabi";

const TOKEN_ENV_VAR: Record<PosterAccount, string> = {
  connect: "POSTER_CONNECT_TOKEN",
  left: "POSTER_API_TOKEN_LEFT",
  centre: "POSTER_API_TOKEN_CENTRE",
  alfarabi: "POSTER_API_TOKEN_ALFARABI",
};

const API_BASE = "https://joinposter.com/api";

export class PosterConfigError extends Error {}
export class PosterApiError extends Error {
  constructor(
    message: string,
    public readonly code?: number
  ) {
    super(message);
  }
}

export function getPosterToken(account: PosterAccount): string | null {
  const envVar = TOKEN_ENV_VAR[account];
  return process.env[envVar]?.trim() || null;
}

export function requirePosterToken(account: PosterAccount): string {
  const token = getPosterToken(account);
  if (!token) {
    throw new PosterConfigError(
      `${TOKEN_ENV_VAR[account]} is not set — add it to app/.env.local to use the "${account}" Poster account.`
    );
  }
  return token;
}

/** True once every account this deployment needs has a token configured. */
export function isPosterConfigured(accounts: PosterAccount[] = ["connect", "left", "centre", "alfarabi"]): boolean {
  return accounts.every((a) => getPosterToken(a) !== null);
}

interface PosterFetchOptions {
  method?: "GET" | "POST";
  params?: Record<string, string | number | undefined>;
  body?: unknown;
}

/**
 * Calls a single Poster API method against one account. Throws PosterConfigError
 * if the account's token is missing, PosterApiError if Poster returns an error
 * payload. Callers decide the fallback (mock data, skip, etc.) — this client
 * never silently swallows a failure.
 */
export async function posterFetch<T>(
  account: PosterAccount,
  method: string,
  { method: httpMethod = "GET", params = {}, body }: PosterFetchOptions = {}
): Promise<T> {
  const token = requirePosterToken(account);
  const search = new URLSearchParams({ token, format: "json" });
  for (const [key, value] of Object.entries(params)) {
    if (value !== undefined) search.set(key, String(value));
  }
  const url = `${API_BASE}/${method}?${search.toString()}`;

  const res = await fetch(url, {
    method: httpMethod,
    headers: body ? { "Content-Type": "application/json" } : undefined,
    body: body ? JSON.stringify(body) : undefined,
    cache: "no-store",
  });

  if (!res.ok) {
    throw new PosterApiError(`Poster API HTTP ${res.status} on ${method} (account: ${account})`, res.status);
  }

  const json = (await res.json()) as { response?: T; error?: string; code?: number };
  if (json.error) {
    throw new PosterApiError(`Poster API error on ${method} (account: ${account}): ${json.error}`, json.code);
  }
  return json.response as T;
}

export const BRANCH_ACCOUNTS: Extract<PosterAccount, "left" | "centre" | "alfarabi">[] = [
  "left",
  "centre",
  "alfarabi",
];
