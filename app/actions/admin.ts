"use server";

/**
 * Admin Server Actions — payment approval/denial + role management.
 *
 * Security contract (enforced by the order of operations in every action):
 *   1. Authenticate the caller via the anon-key client (JWT verified).
 *   2. Verify the caller is an admin via a profile query (DB, not JWT).
 *   3. ONLY AFTER both checks pass, instantiate the service-role client.
 *   4. Perform the mutation.
 *
 * Reversing steps 3 and 4 before steps 1+2 would let any caller execute
 * privileged operations. NEVER reorder this sequence.
 */

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import {
  sendPaymentApprovedEmail,
  sendPaymentDeniedEmail,
} from "@/lib/email/send";
import type { UserRole } from "@/lib/types";
import { SUBSCRIPTION_DURATION_DAYS } from "@/lib/constants";

// ─── Shared helper ──────────────────────────────────────────────────────────

/**
 * Authenticates the request and verifies the caller holds the admin role.
 * Throws on failure so callers can wrap in try/catch.
 * Returns the verified admin's user ID for use in `reviewed_by` columns.
 *
 * Exported because coaching.ts, video-lessons.ts, articles.ts, etc. all
 * reuse this check before touching the admin client.
 */
export async function verifyAdmin(): Promise<string> {
  // Step 1: authenticate via anon-key client — verifies the JWT.
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) throw new Error("Not authenticated.");

  // Step 2: check the profiles table — role is in the DB, not the JWT.
  const { data: profile } = await supabase
    .from("profiles")
    .select("role")
    .eq("id", user.id)
    .single();

  if (profile?.role !== "admin") throw new Error("Not authorized.");

  return user.id;
}

// ─── approvePayment ─────────────────────────────────────────────────────────

export async function approvePayment(
  paymentId: string,
): Promise<{ error?: string }> {
  try {
    // Steps 1 + 2: auth + role check before any privileged client.
    const adminUserId = await verifyAdmin();

    // Step 3: only now create the privileged client.
    const admin = createAdminClient();

    // Step 4a: fetch the target payment.
    const { data: payment, error: fetchErr } = await admin
      .from("payments")
      .select("id, user_id, status")
      .eq("id", paymentId)
      .single();

    if (fetchErr || !payment) return { error: "Payment not found." };
    if (payment.status !== "pending")
      return { error: "Payment is not in pending state." };

    // Step 4b: fetch the target user's profile for renewal-aware expiry.
    const { data: profile } = await admin
      .from("profiles")
      .select("subscription_expires_at")
      .eq("id", payment.user_id)
      .single();

    // Renewal-aware: extend from the later of (now, existing expiry).
    const now = new Date();
    const existing = profile?.subscription_expires_at
      ? new Date(profile.subscription_expires_at)
      : null;
    const base = existing && existing > now ? existing : now;
    const newExpiry = new Date(
      base.getTime() + SUBSCRIPTION_DURATION_DAYS * 24 * 60 * 60 * 1000,
    );

    // Step 5: update the payment record.
    const { error: paymentUpdateErr } = await admin
      .from("payments")
      .update({
        status: "approved",
        reviewed_by: adminUserId,
        reviewed_at: now.toISOString(),
      })
      .eq("id", paymentId);

    if (paymentUpdateErr) return { error: paymentUpdateErr.message };

    // Step 6: activate the user's subscription.
    // expiry_reminder_stage resets to 0 so the next cycle's 3-day and
    // 1-day expiry warnings fire fresh.
    const { error: profileUpdateErr } = await admin
      .from("profiles")
      .update({
        subscription_status: "active",
        subscription_expires_at: newExpiry.toISOString(),
        expiry_reminder_stage: 0,
      })
      .eq("id", payment.user_id);

    if (profileUpdateErr) return { error: profileUpdateErr.message };

    // Notify the user. Best-effort — sendPaymentApprovedEmail never throws,
    // so an email outage cannot roll back the approval above.
    await sendPaymentApprovedEmail({ userId: payment.user_id });

    revalidatePath("/admin/payments");
    revalidatePath("/admin/dashboard");
    return {};
  } catch (err) {
    return { error: err instanceof Error ? err.message : "Unexpected error." };
  }
}

// ─── denyPayment ────────────────────────────────────────────────────────────

export async function denyPayment(
  paymentId: string,
  adminNote: string,
): Promise<{ error?: string }> {
  try {
    const adminUserId = await verifyAdmin();
    const admin = createAdminClient();

    const { data: payment, error: fetchErr } = await admin
      .from("payments")
      .select("id, user_id, status")
      .eq("id", paymentId)
      .single();

    if (fetchErr || !payment) return { error: "Payment not found." };
    if (payment.status !== "pending")
      return { error: "Payment is not in pending state." };

    const now = new Date();
    const trimmedNote = adminNote.trim() || null;

    // Mark the payment as denied (row kept as permanent audit trail).
    const { error: paymentUpdateErr } = await admin
      .from("payments")
      .update({
        status: "denied",
        admin_note: trimmedNote,
        reviewed_by: adminUserId,
        reviewed_at: now.toISOString(),
      })
      .eq("id", paymentId);

    if (paymentUpdateErr) return { error: paymentUpdateErr.message };

    // Move the profile to 'denied' so /status/denied shows the admin note.
    // When the user submits a new payment, submitPayment() flips back to 'pending'.
    const { error: profileUpdateErr } = await admin
      .from("profiles")
      .update({ subscription_status: "denied" })
      .eq("id", payment.user_id);

    if (profileUpdateErr) return { error: profileUpdateErr.message };

    await sendPaymentDeniedEmail({
      userId: payment.user_id,
      adminNote: trimmedNote,
    });

    revalidatePath("/admin/payments");
    revalidatePath("/admin/dashboard");
    return {};
  } catch (err) {
    return { error: err instanceof Error ? err.message : "Unexpected error." };
  }
}

// ─── setUserRole ────────────────────────────────────────────────────────────

/**
 * Promote a user to admin (or demote an admin to a regular user).
 *
 * Guards:
 *   - Caller must already be an admin.
 *   - Cannot demote yourself (prevents accidentally removing the last admin).
 *
 * The first admin is bootstrapped via SQL (see plan §5.3); this action lets
 * existing admins promote teammates from the /admin/users page.
 */
export async function setUserRole(
  userId: string,
  role: UserRole,
): Promise<{ error?: string }> {
  try {
    const adminUserId = await verifyAdmin();

    if (userId === adminUserId && role !== "admin") {
      return { error: "You cannot remove your own admin role." };
    }

    const admin = createAdminClient();
    const { error } = await admin
      .from("profiles")
      .update({ role })
      .eq("id", userId);

    if (error) return { error: error.message };

    revalidatePath("/admin/users");
    revalidatePath("/admin/dashboard");
    return {};
  } catch (err) {
    return { error: err instanceof Error ? err.message : "Unexpected error." };
  }
}
