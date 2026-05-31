/**
 * SERVER-ONLY MODULE — NEVER import this file from a Client Component.
 * ─────────────────────────────────────────────────────────────────────
 * The service-role key bypasses ALL Row Level Security policies.
 * Importing it inside a 'use client' file would embed the key in the
 * browser bundle, compromising every row in the database.
 *
 * Safe usage: Server Components, Server Actions, Route Handlers only.
 *
 * Always call verifyAdmin() before createAdminClient() in user-triggered
 * paths — the admin client itself doesn't enforce any role check.
 * ─────────────────────────────────────────────────────────────────────
 */
import "server-only";
import { createClient } from "@supabase/supabase-js";

export function createAdminClient() {
  // Runtime guard: catches accidental client-side imports at the moment
  // the function is called, even if tree-shaking fails to remove it.
  if (typeof window !== "undefined") {
    throw new Error(
      "[createAdminClient] Called on the client. " +
        "Never import lib/supabase/admin.ts into a Client Component — " +
        "it exposes the service-role key.",
    );
  }

  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    { auth: { autoRefreshToken: false, persistSession: false } },
  );
}
