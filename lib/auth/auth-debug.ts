/**
 * Dev-only structured logs — never pass emails, tokens, or codes.
 * These logs help diagnose OAuth callback issues without leaking PII.
 */
export function authDebug(
  event: string,
  payload: Record<string, unknown>,
): void {
  if (process.env.NODE_ENV !== "development") return;
  console.debug(`[auth] ${event}`, payload);
}
