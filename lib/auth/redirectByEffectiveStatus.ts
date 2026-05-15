import type { EffectiveStatus } from "@/lib/auth/getEffectiveStatus";

/**
 * Same-origin path after sign-in or when routing a signed-in user by
 * subscription state (mirrors app/auth/callback/route.ts).
 */
export function pathForEffectiveStatus(status: EffectiveStatus): string {
  if (status === "admin") return "/admin/dashboard";
  if (status === "active") return "/dashboard";
  if (status === "pending") return "/status/pending";
  if (status === "denied") return "/status/denied";
  if (status === "expired") return "/status/expired";
  return "/payment";
}
