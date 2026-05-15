/**
 * Subscription status helpers.
 *
 * getEffectiveStatus() is the single source of truth for a user's access
 * level. It NEVER writes to the DB — the DB subscription_status may lag
 * behind the wall clock (e.g., subscription_status = 'active' but the
 * expiry date has passed).
 *
 * Always call this function instead of reading subscription_status
 * directly. This is the v1 rule that keeps drift between DB state and
 * wall clock from breaking access control (see plan §6).
 *
 * Note: v2 adds a separate subscription-expire cron that flips the column
 * to 'expired' once a day for clean state, but reads must still pass
 * through this helper to handle the up-to-24h gap.
 */

export type GateProfile = {
  role: "user" | "admin";
  subscription_status: "inactive" | "pending" | "active" | "denied" | "expired";
  subscription_expires_at: string | null;
};

export type EffectiveStatus =
  | "inactive"
  | "pending"
  | "active"
  | "denied"
  | "expired"
  | "admin";

/**
 * Derives the effective subscription status from a profile row.
 *
 * Rules:
 * - null profile          → 'pending'  (no session / profile missing)
 * - role = 'admin'        → 'admin'    (always bypasses subscriber gate)
 * - status = 'active' AND expiry has passed → 'expired' (drift correction)
 * - status = 'active' AND no expiry or expiry in future → 'active'
 * - any other status      → returned as-is
 */
export function getEffectiveStatus(profile: GateProfile | null): EffectiveStatus {
  if (!profile) return "pending";
  if (profile.role === "admin") return "admin";
  if (profile.subscription_status === "active") {
    if (
      profile.subscription_expires_at &&
      new Date(profile.subscription_expires_at) < new Date()
    ) {
      return "expired";
    }
    return "active";
  }
  return profile.subscription_status;
}

/**
 * Returns true when the user is allowed to access subscriber-only content.
 * Only 'active' and 'admin' statuses grant access.
 */
export function canAccessSubscriberContent(profile: GateProfile | null): boolean {
  const status = getEffectiveStatus(profile);
  return status === "active" || status === "admin";
}
