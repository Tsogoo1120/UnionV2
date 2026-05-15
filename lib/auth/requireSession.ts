import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import {
  getCurrentProfile,
  type CurrentProfile,
} from "@/lib/queries/profile";
import { getEffectiveStatus } from "@/lib/auth/getEffectiveStatus";
import { pathForEffectiveStatus } from "@/lib/auth/redirectByEffectiveStatus";

/** Profile row fields used by protected server components (RLS-scoped). */
export type SessionProfile = CurrentProfile;

function redirectToSignInWithReturn(): never {
  const path =
    headers().get("x-union-request-path") ??
    headers().get("x-url") ??
    "/";
  redirect(`/?next=${encodeURIComponent(path)}`);
}

/**
 * Ensures a Supabase session + profiles row. Redirects to `/?next=` when
 * unauthenticated (path from middleware `x-union-request-path`, when set).
 */
export async function requireSession(): Promise<SessionProfile> {
  const supabase = await createClient();
  const profile = await getCurrentProfile(supabase);
  if (!profile) {
    redirectToSignInWithReturn();
  }
  return profile;
}

/** Subscriber app surfaces: must be active subscriber or admin. */
export async function requireActive(): Promise<SessionProfile> {
  const profile = await requireSession();
  const status = getEffectiveStatus(profile);
  if (status === "active" || status === "admin") {
    return profile;
  }
  redirect(pathForEffectiveStatus(status));
}

/** Admin dashboard and tools: admin role only. */
export async function requireAdmin(): Promise<SessionProfile> {
  const profile = await requireSession();
  if (getEffectiveStatus(profile) === "admin") {
    return profile;
  }
  redirect("/dashboard");
}
