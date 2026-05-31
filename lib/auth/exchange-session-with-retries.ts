import type { AuthError, SupabaseClient } from "@supabase/supabase-js";
import {
  getAuthErrorStatus,
  parseRetryAfterSeconds,
  sleepMs,
} from "@/lib/auth/supabase-auth-errors";
import { authDebug } from "@/lib/auth/auth-debug";

const MAX_ATTEMPTS = 3;

function backoffDelayMs(attemptIndex: number, error: unknown): number {
  const retryAfterSec = parseRetryAfterSeconds(error);
  if (retryAfterSec !== null) return retryAfterSec * 1000;
  const base = Math.min(1000 * 2 ** (attemptIndex - 1), 8000);
  const jitter = Math.floor(Math.random() * 250);
  return base + jitter;
}

function isTransientRetryable(error: unknown): boolean {
  const status = getAuthErrorStatus(error);
  return status === 429 || status === 503 || status === 504 || status === 408;
}

/**
 * Retries `exchangeCodeForSession` for transient failures (429/503/504/408).
 * Code exchange is idempotent and does not send email, so retrying is safe.
 */
export async function exchangeCodeForSessionWithRetries(
  supabase: SupabaseClient,
  code: string,
): Promise<{ error: AuthError | null }> {
  let lastError: AuthError | null = null;

  for (let attempt = 1; attempt <= MAX_ATTEMPTS; attempt++) {
    const { error } = await supabase.auth.exchangeCodeForSession(code);

    if (!error) {
      authDebug("exchangeCodeForSession.ok", { attempt });
      return { error: null };
    }

    lastError = error;
    const retryable = isTransientRetryable(error);

    authDebug("exchangeCodeForSession.error", {
      attempt,
      status: getAuthErrorStatus(error),
      retryable,
      messageLen: typeof error.message === "string" ? error.message.length : 0,
    });

    if (!retryable || attempt === MAX_ATTEMPTS) break;

    await sleepMs(backoffDelayMs(attempt, error));
  }

  return { error: lastError };
}
