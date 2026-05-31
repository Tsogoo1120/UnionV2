/** Narrow helpers for @supabase/supabase-js Auth errors — no PII in logs. */

export function getAuthErrorStatus(error: unknown): number | undefined {
  if (typeof error !== "object" || error === null) return undefined;
  const status = (error as { status?: unknown }).status;
  return typeof status === "number" ? status : undefined;
}

export function getAuthErrorMessage(error: unknown): string {
  if (typeof error !== "object" || error === null) return "";
  const msg = (error as { message?: unknown }).message;
  return typeof msg === "string" ? msg : "";
}

/** True when Supabase Auth rejected the call due to too many email sends / HTTP 429. */
export function isAuthEmailRateLimited(error: unknown): boolean {
  const status = getAuthErrorStatus(error);
  const msg = getAuthErrorMessage(error).toLowerCase();
  return (
    status === 429 ||
    msg.includes("rate limit") ||
    msg.includes("too many") ||
    msg.includes("email rate limit")
  );
}

/** Parse Retry-After from error if a library layer exposes headers (seconds). */
export function parseRetryAfterSeconds(error: unknown): number | null {
  if (typeof error !== "object" || error === null) return null;
  const e = error as Record<string, unknown>;
  const headers = e.headers;
  if (headers && typeof headers === "object") {
    const h = headers as Record<string, unknown>;
    const raw = h["retry-after"] ?? h["Retry-After"];
    if (typeof raw === "string") {
      const n = parseInt(raw, 10);
      return Number.isFinite(n) && n > 0 ? n : null;
    }
    if (typeof raw === "number" && raw > 0) return Math.floor(raw);
  }
  return null;
}

/** Suggested wait before another user-triggered attempt (capped). */
export function suggestedWaitSecondsFromAuthError(error: unknown): number {
  const fromHeader = parseRetryAfterSeconds(error);
  if (fromHeader !== null) return Math.min(Math.max(fromHeader, 1), 3600);
  if (getAuthErrorStatus(error) === 429) return 60;
  return 30;
}

export function formatTooManyAttemptsMessage(
  seconds: number,
  locale: "mn" | "en" = "mn",
): string {
  const s = Math.ceil(Math.max(1, seconds));
  if (locale === "en") {
    return `Too many attempts. Please wait ${s} seconds and try again.`;
  }
  return `Хэт олон оролдлого хийгдлээ. ${s} секундын дараа дахин оролдоно уу.`;
}

export async function sleepMs(ms: number): Promise<void> {
  await new Promise<void>((resolve) => setTimeout(resolve, ms));
}
