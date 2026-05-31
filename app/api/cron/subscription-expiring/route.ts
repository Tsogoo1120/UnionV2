/**
 * Daily cron — sends 3-day and 1-day subscription-expiry reminders.
 *
 * Schedule: vercel.json runs this once per day at 09:00 UTC.
 * Idempotency: per-user via profiles.expiry_reminder_stage, so this
 * endpoint is safe to hit manually or to retry.
 *
 * Security: protected by CRON_SECRET (see _shared.ts).
 */
import { NextResponse } from "next/server";
import { sendExpiryReminders } from "@/lib/email/send";
import { authorizeCron } from "../_shared";

// Node.js runtime — Resend SDK + admin Supabase client both need it.
export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET(req: Request): Promise<NextResponse> {
  const auth = authorizeCron(req);
  if (!auth.ok) return auth.response;

  const result = await sendExpiryReminders();
  console.info("[cron] subscription-expiring result:", result);
  return NextResponse.json({ ok: true, ...result });
}
