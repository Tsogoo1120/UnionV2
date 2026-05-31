import type { SupabaseClient } from "@supabase/supabase-js";
import type { CoachingBooking, CoachingSlot } from "@/lib/types";

export interface ListAvailableSlotsOpts {
  from?: string;
  limit?: number;
  offset?: number;
}

export async function getCoachingSlotById(
  supabase: SupabaseClient,
  id: string,
): Promise<CoachingSlot | null> {
  const { data, error } = await supabase
    .from("coaching_slots")
    .select("*")
    .eq("id", id)
    .maybeSingle();

  if (error) throw new Error(error.message);
  return data ?? null;
}

export async function listAvailableSlots(
  supabase: SupabaseClient,
  opts: ListAvailableSlotsOpts = {},
): Promise<CoachingSlot[]> {
  let query = supabase
    .from("coaching_slots")
    .select("*")
    .eq("status", "available")
    .order("start_at", { ascending: true });

  if (opts.from) {
    query = query.gte("start_at", opts.from);
  }

  const { data, error } = await query.range(
    opts.offset ?? 0,
    (opts.offset ?? 0) + (opts.limit ?? 50) - 1,
  );

  if (error) {
    throw new Error(error.message);
  }

  return data ?? [];
}

export async function listMyBookings(
  supabase: SupabaseClient,
  opts: { limit?: number } = {},
): Promise<CoachingBooking[]> {
  const limit = opts.limit ?? 50;
  const { data, error } = await supabase
    .from("coaching_bookings")
    .select("*")
    .order("submitted_at", { ascending: false })
    .range(0, limit - 1);

  if (error) {
    throw new Error(error.message);
  }

  return data ?? [];
}

export interface ListAllBookingsForAdminOpts {
  status?: string;
  limit?: number;
  offset?: number;
}

/**
 * All coaching bookings (every user). RLS allows admins with the anon
 * server client; for service-role access, call `verifyAdmin()` then pass
 * `createAdminClient()` from `@/lib/supabase/admin`.
 */
export async function listAllBookingsForAdmin(
  supabase: SupabaseClient,
  opts: ListAllBookingsForAdminOpts = {},
): Promise<CoachingBooking[]> {
  let query = supabase
    .from("coaching_bookings")
    .select("*")
    .order("submitted_at", { ascending: false })
    .range(opts.offset ?? 0, (opts.offset ?? 0) + (opts.limit ?? 50) - 1);

  if (opts.status) {
    query = query.eq("status", opts.status);
  }

  const { data, error } = await query;
  if (error) {
    throw new Error(error.message);
  }

  return data ?? [];
}
