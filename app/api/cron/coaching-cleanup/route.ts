/**
 * Every-15-minutes cron — flips coaching_slots whose end_at has passed
 * from 'available' or 'pending' to 'expired'.
 *
 * NEW in v2. Per plan §7.4, this is *only* for DB hygiene — the user-
 * facing slot lists already filter `status='available' AND start_at > now()`
 * so a slot disappears from the UI the moment its start time passes,
 * without any cron lag.
 *
 * The cron also gives admins a clean view ("expired" slots stop cluttering
 * the active list) and keeps the partial unique index on coaching_bookings
 * accurate by closing out abandoned pending slots.
 *
 * Schedule: vercel.json runs every 15 minutes.
 * Security: protected by CRON_SECRET.
 */
import { NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { authorizeCron } from "../_shared";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET(req: Request): Promise<NextResponse> {
  const auth = authorizeCron(req);
  if (!auth.ok) return auth.response;

  try {
    const admin = createAdminClient();
    const nowIso = new Date().toISOString();

    const { data, error } = await admin
      .from("coaching_slots")
      .update({ status: "expired" })
      .in("status", ["available", "pending"])
      .lt("end_at", nowIso)
      .select("id");

    if (error) {
      console.error("[cron] coaching-cleanup update failed:", error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    const flipped = data?.length ?? 0;
    if (flipped > 0) {
      console.info("[cron] coaching-cleanup flipped", flipped, "slots");
    }
    return NextResponse.json({ ok: true, flipped });
  } catch (err) {
    console.error("[cron] coaching-cleanup failed:", err);
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "unknown" },
      { status: 500 },
    );
  }
}
