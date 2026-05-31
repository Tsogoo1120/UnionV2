/**
 * Daily cron — flips active+past-expiry profiles to 'expired' and fires
 * the "your subscription just expired" email.
 *
 * NEW in v2 — v1 had no expiry cron and relied on getEffectiveStatus()
 * computing expired state at read time. v2 keeps both layers:
 *   - getEffectiveStatus() remains the source of truth for access checks
 *     (handles the up-to-24h window between actual expiry and the cron
 *     running).
 *   - This cron keeps the DB column accurate for admin views and so
 *     we can deliver a clean "you expired today" email.
 *
 * Schedule: vercel.json runs this once per day at 00:00 UTC.
 * Security: protected by CRON_SECRET.
 */
import { NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { sendSubscriptionExpiredEmails } from "@/lib/email/send";
import { authorizeCron } from "../_shared";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET(req: Request): Promise<NextResponse> {
  const auth = authorizeCron(req);
  if (!auth.ok) return auth.response;

  try {
    const admin = createAdminClient();
    const nowIso = new Date().toISOString();

    // Find rows that need flipping.
    const { data: expired, error: fetchErr } = await admin
      .from("profiles")
      .select("id")
      .eq("subscription_status", "active")
      .lt("subscription_expires_at", nowIso);

    if (fetchErr) {
      console.error("[cron] subscription-expire fetch failed:", fetchErr);
      return NextResponse.json({ error: fetchErr.message }, { status: 500 });
    }

    const userIds = (expired ?? []).map((r) => r.id);
    if (userIds.length === 0) {
      return NextResponse.json({ ok: true, flipped: 0, emailed: 0 });
    }

    // Flip in one bulk update.
    const { error: updateErr } = await admin
      .from("profiles")
      .update({ subscription_status: "expired" })
      .in("id", userIds);

    if (updateErr) {
      console.error("[cron] subscription-expire update failed:", updateErr);
      return NextResponse.json({ error: updateErr.message }, { status: 500 });
    }

    // Email each just-expired user.
    const emailResult = await sendSubscriptionExpiredEmails({ userIds });
    console.info("[cron] subscription-expire result:", {
      flipped: userIds.length,
      ...emailResult,
    });

    return NextResponse.json({
      ok: true,
      flipped: userIds.length,
      emailed: emailResult.sent,
      emailErrors: emailResult.errors,
    });
  } catch (err) {
    console.error("[cron] subscription-expire failed:", err);
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "unknown" },
      { status: 500 },
    );
  }
}
