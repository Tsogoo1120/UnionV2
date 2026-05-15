"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import {
  PAYMENT_INFO,
  MAX_SCREENSHOT_BYTES,
  ALLOWED_SCREENSHOT_TYPES,
} from "@/lib/constants";
import {
  sendAdminNewPaymentEmail,
  sendPaymentReceivedEmail,
} from "@/lib/email/send";

/**
 * Submits a manual subscription payment for review.
 *
 * Flow:
 *   1. Validate auth + file (type, size, presence).
 *   2. Upload screenshot to `payment-screenshots/{user_id}/{...}.ext`.
 *   3. Insert a `payments` row with status='pending'.
 *   4. Flip the user's profile to `subscription_status='pending'`.
 *
 * Step 4 is the §17.2 fix relative to v1: v1 only flipped the status when
 * the user was previously 'denied', leaving first-time submitters stuck on
 * 'inactive' even though their payment row was pending. v2 always flips,
 * so /status/pending is reachable on first submit.
 */
export async function submitPayment(
  formData: FormData,
): Promise<{ error?: string }> {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { error: "You must be logged in." };

  // ── File validation ────────────────────────────────────────────────
  const file = formData.get("screenshot") as File | null;
  if (!file || file.size === 0)
    return { error: "Please attach a screenshot of your bank transfer." };

  if (!ALLOWED_SCREENSHOT_TYPES.includes(file.type as never))
    return { error: "Only JPEG, PNG, or WebP images are allowed." };

  if (file.size > MAX_SCREENSHOT_BYTES)
    return { error: "File must be under 5 MB." };

  // ── Amount + bank reference ────────────────────────────────────────
  const rawAmount = Number(formData.get("amount"));
  const amount =
    Number.isFinite(rawAmount) && rawAmount > 0 ? rawAmount : PAYMENT_INFO.amount;

  const bankReference =
    ((formData.get("bank_reference") as string) ?? "").trim() || null;

  // ── Upload screenshot ──────────────────────────────────────────────
  // Path scoped to user folder — matches the bucket RLS policy.
  const ext = (file.name.split(".").pop() ?? "jpg").toLowerCase();
  const storagePath = `${user.id}/${Date.now()}-${crypto.randomUUID()}.${ext}`;

  const { error: uploadError } = await supabase.storage
    .from("payment-screenshots")
    .upload(storagePath, file, { contentType: file.type, upsert: false });

  if (uploadError) return { error: `Upload failed: ${uploadError.message}` };

  // ── Insert payment row ─────────────────────────────────────────────
  const { data: insertedPayment, error: insertError } = await supabase
    .from("payments")
    .insert({
      user_id: user.id,
      screenshot_path: storagePath,
      amount,
      currency: PAYMENT_INFO.currency,
      status: "pending",
      bank_reference: bankReference,
    })
    .select("id")
    .single();

  if (insertError) {
    // Roll back the uploaded file so storage doesn't accumulate orphans.
    await supabase.storage.from("payment-screenshots").remove([storagePath]);
    return { error: `Could not save payment: ${insertError.message}` };
  }

  // ── Flip profile to 'pending' (v2 fix, plan §17.2) ─────────────────
  // The DB trigger blocks regular users from changing subscription_status,
  // so we use the service-role admin client. The payment row already
  // exists, so even if this fails, the admin can still approve — log
  // the inconsistency for diagnosis.
  const admin = createAdminClient();
  const { error: statusErr } = await admin
    .from("profiles")
    .update({ subscription_status: "pending" })
    .eq("id", user.id);

  if (statusErr) {
    console.error(
      "[submitPayment] profile status flip failed:",
      statusErr.message,
    );
    // Non-fatal — proceed.
  }

  try {
    await sendAdminNewPaymentEmail({
      userId: user.id,
      paymentId: insertedPayment.id,
    });
  } catch (err) {
    console.error("[submitPayment] admin notification email failed:", err);
  }

  try {
    await sendPaymentReceivedEmail({
      userId: user.id,
      amount,
      currency: PAYMENT_INFO.currency,
    });
  } catch (err) {
    console.error("[submitPayment] payment received email failed:", err);
  }

  revalidatePath("/payment");
  revalidatePath("/status/pending");
  revalidatePath("/dashboard");
  revalidatePath("/transactions");
  return {};
}
