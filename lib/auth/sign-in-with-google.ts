import type { SupabaseClient } from "@supabase/supabase-js";

/**
 * Client-only: redirects to Google then back to /auth/callback.
 *
 * Setup checklist (Supabase Dashboard):
 *   1. Authentication → Providers → Google: enable + paste client ID/secret.
 *   2. Authentication → URL Configuration → Redirect URLs: add
 *      `<NEXT_PUBLIC_SITE_URL>/auth/callback` for both staging and production
 *      (see plan §18.3 — list both from day one).
 *
 * `options.next` is the path the user should land on after successful sign-in;
 * the callback handler will override this with /status/* or /dashboard
 * depending on the user's effective subscription status.
 */
export async function signInWithGoogle(
  supabase: SupabaseClient,
  options?: { next?: string },
) {
  const next = options?.next ?? "/payment";
  const redirectTo = `${window.location.origin}/auth/callback?next=${encodeURIComponent(next)}`;

  return supabase.auth.signInWithOAuth({
    provider: "google",
    options: { redirectTo },
  });
}
