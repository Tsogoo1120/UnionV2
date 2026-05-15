import type { SupabaseClient } from "@supabase/supabase-js";
import type {
  Article,
  CoachingBooking,
  CoachingSlot,
  CollectiveReading,
  Payment,
  Profile,
  PsychologyTest,
  VideoLesson,
} from "@/lib/types";

export type AdminOverviewKpis = {
  activeMembers: number;
  pendingPayments: number;
  monthlyRevenueMnt: number;
  upcomingAvailableSlots: number;
};

export async function getAdminOverviewKpis(
  admin: SupabaseClient,
): Promise<AdminOverviewKpis> {
  const nowIso = new Date().toISOString();
  const monthStart = new Date();
  monthStart.setDate(1);
  monthStart.setHours(0, 0, 0, 0);
  const monthStartIso = monthStart.toISOString();

  const [{ count: activeMembers }, { count: pendingPayments }, upcomingRes] =
    await Promise.all([
      admin
        .from("profiles")
        .select("id", { count: "exact", head: true })
        .eq("subscription_status", "active")
        .gt("subscription_expires_at", nowIso),
      admin
        .from("payments")
        .select("id", { count: "exact", head: true })
        .eq("status", "pending"),
      admin
        .from("coaching_slots")
        .select("id", { count: "exact", head: true })
        .eq("status", "available")
        .gt("start_at", nowIso),
    ]);

  const { data: revenueRows, error: revErr } = await admin
    .from("payments")
    .select("amount")
    .eq("status", "approved")
    .gte("reviewed_at", monthStartIso);

  if (revErr) throw new Error(revErr.message);

  const monthlyRevenueMnt = (revenueRows ?? []).reduce(
    (acc, row) => acc + Number(row.amount),
    0,
  );

  return {
    activeMembers: activeMembers ?? 0,
    pendingPayments: pendingPayments ?? 0,
    monthlyRevenueMnt,
    upcomingAvailableSlots: upcomingRes.count ?? 0,
  };
}

export type PendingPaymentRow = Payment & {
  user_email: string | null;
  user_full_name: string | null;
  screenshot_url: string | null;
};

export async function listPendingPaymentsWithProfiles(
  admin: SupabaseClient,
  limit = 50,
): Promise<PendingPaymentRow[]> {
  const { data: payments, error } = await admin
    .from("payments")
    .select("*")
    .eq("status", "pending")
    .order("submitted_at", { ascending: false })
    .limit(limit);

  if (error) throw new Error(error.message);
  const rows = payments ?? [];
  if (rows.length === 0) return [];

  const userIds = Array.from(new Set(rows.map((p) => p.user_id)));
  const { data: profiles, error: pErr } = await admin
    .from("profiles")
    .select("id, email, full_name")
    .in("id", userIds);

  if (pErr) throw new Error(pErr.message);
  const byId = new Map((profiles ?? []).map((p) => [p.id, p]));

  const out: PendingPaymentRow[] = [];
  for (const p of rows) {
    const prof = byId.get(p.user_id);
    let screenshot_url: string | null = null;
    const { data: signed } = await admin.storage
      .from("payment-screenshots")
      .createSignedUrl(p.screenshot_path, 3600);
    screenshot_url = signed?.signedUrl ?? null;

    out.push({
      ...p,
      user_email: prof?.email ?? null,
      user_full_name: prof?.full_name ?? null,
      screenshot_url,
    });
  }
  return out;
}

export async function listCoachingSlotsAdmin(
  admin: SupabaseClient,
  limit = 50,
): Promise<CoachingSlot[]> {
  const { data, error } = await admin
    .from("coaching_slots")
    .select("*")
    .order("start_at", { ascending: true })
    .limit(limit);

  if (error) throw new Error(error.message);
  return data ?? [];
}

export async function listVideoLessonsAdmin(
  admin: SupabaseClient,
  limit = 50,
): Promise<VideoLesson[]> {
  const { data, error } = await admin
    .from("video_lessons")
    .select("*")
    .order("updated_at", { ascending: false })
    .limit(limit);

  if (error) throw new Error(error.message);
  return data ?? [];
}

export async function listCollectiveReadingsAdmin(
  admin: SupabaseClient,
  limit = 50,
): Promise<CollectiveReading[]> {
  const { data, error } = await admin
    .from("collective_readings")
    .select("*")
    .order("updated_at", { ascending: false })
    .limit(limit);

  if (error) throw new Error(error.message);
  return data ?? [];
}

export async function listArticlesAdmin(
  admin: SupabaseClient,
  limit = 50,
): Promise<Article[]> {
  const { data, error } = await admin
    .from("articles")
    .select("*")
    .order("updated_at", { ascending: false })
    .limit(limit);

  if (error) throw new Error(error.message);
  return data ?? [];
}

export async function listPsychologyTestsAdmin(
  admin: SupabaseClient,
  limit = 50,
): Promise<PsychologyTest[]> {
  const { data, error } = await admin
    .from("psychology_tests")
    .select("*")
    .order("updated_at", { ascending: false })
    .limit(limit);

  if (error) throw new Error(error.message);
  return data ?? [];
}

export type CoachingBookingAdminDetail = CoachingBooking & {
  slot: CoachingSlot | null;
  user_email: string | null;
  user_full_name: string | null;
  screenshot_url: string | null;
};

export async function listCoachingBookingsAdminDetail(
  admin: SupabaseClient,
  opts: { status?: string; limit?: number; offset?: number } = {},
): Promise<CoachingBookingAdminDetail[]> {
  const limit = opts.limit ?? 50;
  const offset = opts.offset ?? 0;

  let q = admin
    .from("coaching_bookings")
    .select("*")
    .order("submitted_at", { ascending: false })
    .range(offset, offset + limit - 1);

  if (opts.status) q = q.eq("status", opts.status);

  const { data: bookings, error } = await q;
  if (error) throw new Error(error.message);
  const list = bookings ?? [];
  if (list.length === 0) return [];

  const slotIds = Array.from(new Set(list.map((b) => b.slot_id)));
  const userIds = Array.from(new Set(list.map((b) => b.user_id)));

  const [{ data: slots }, { data: profiles }] = await Promise.all([
    admin.from("coaching_slots").select("*").in("id", slotIds),
    admin.from("profiles").select("id, email, full_name").in("id", userIds),
  ]);

  const slotById = new Map((slots ?? []).map((s) => [s.id, s as CoachingSlot]));
  const profById = new Map((profiles ?? []).map((p) => [p.id, p]));

  const out: CoachingBookingAdminDetail[] = [];
  for (const b of list) {
    const prof = profById.get(b.user_id);
    const { data: signed } = await admin.storage
      .from("coaching-screenshots")
      .createSignedUrl(b.screenshot_path, 3600);
    out.push({
      ...b,
      slot: slotById.get(b.slot_id) ?? null,
      user_email: prof?.email ?? null,
      user_full_name: prof?.full_name ?? null,
      screenshot_url: signed?.signedUrl ?? null,
    });
  }
  return out;
}

export type AdminUserListRow = Pick<
  Profile,
  | "id"
  | "email"
  | "full_name"
  | "role"
  | "subscription_status"
  | "subscription_expires_at"
>;

export async function searchProfilesForAdmin(
  admin: SupabaseClient,
  opts: { q: string; limit?: number; offset?: number },
): Promise<AdminUserListRow[]> {
  const limit = opts.limit ?? 25;
  const offset = opts.offset ?? 0;
  const q = opts.q.trim();

  let query = admin
    .from("profiles")
    .select("id, email, full_name, role, subscription_status, subscription_expires_at")
    .order("created_at", { ascending: false })
    .range(offset, offset + limit - 1);

  if (q.length > 0) {
    const esc = q.replace(/%/g, "\\%").replace(/_/g, "\\_");
    query = query.or(`email.ilike.%${esc}%,full_name.ilike.%${esc}%`);
  }

  const { data, error } = await query;
  if (error) throw new Error(error.message);
  return (data ?? []) as AdminUserListRow[];
}

export async function countProfilesForAdminSearch(
  admin: SupabaseClient,
  q: string,
): Promise<number> {
  const trimmed = q.trim();
  let query = admin
    .from("profiles")
    .select("id", { count: "exact", head: true });

  if (trimmed.length > 0) {
    const esc = trimmed.replace(/%/g, "\\%").replace(/_/g, "\\_");
    query = query.or(`email.ilike.%${esc}%,full_name.ilike.%${esc}%`);
  }

  const { count, error } = await query;
  if (error) throw new Error(error.message);
  return count ?? 0;
}
