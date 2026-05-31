"use server";

/**
 * Server actions for the coaching service.
 *
 * The booking flow is race-safe by construction: bookCoachingSlot() calls
 * the reserve_coaching_slot Postgres RPC (SECURITY DEFINER) which atomically
 * flips status='available'→'pending' and raises 'slot_unavailable' if the
 * slot is gone or has started. If anything later in the flow fails after
 * the RPC succeeded, we call release_coaching_slot to revert.
 */

import { revalidatePath } from "next/cache";
import { verifyAdmin } from "./admin";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import {
  sendCoachingApprovedEmail,
  sendCoachingDeniedEmail,
} from "@/lib/email/send";
import {
  DEFAULT_COACHING_PRICE,
  DEFAULT_COACHING_CURRENCY,
  MAX_SCREENSHOT_BYTES,
  ALLOWED_SCREENSHOT_TYPES,
  COACHING_SERVICE_TYPES,
  type CoachingServiceType,
} from "@/lib/constants";

// ─── Admin: slot CRUD ───────────────────────────────────────────────────────

export type CoachingSlotInput = {
  startAt: string; // ISO timestamp
  endAt: string; // ISO timestamp
  price?: number;
  currency?: string;
  description?: string | null;
  serviceType?: CoachingServiceType;
};

export async function createCoachingSlot(
  input: CoachingSlotInput,
): Promise<{ id?: string; error?: string }> {
  try {
    const adminId = await verifyAdmin();

    // Basic sanity (DB also enforces end_at > start_at).
    const start = new Date(input.startAt);
    const end = new Date(input.endAt);
    if (Number.isNaN(start.getTime()) || Number.isNaN(end.getTime())) {
      return { error: "Invalid start_at / end_at." };
    }
    if (end <= start) return { error: "end_at must be after start_at." };
    if (start <= new Date()) {
      return { error: "Cannot create a slot in the past." };
    }

    const admin = createAdminClient();
    const { data, error } = await admin
      .from("coaching_slots")
      .insert({
        start_at: input.startAt,
        end_at: input.endAt,
        price: input.price ?? DEFAULT_COACHING_PRICE,
        currency: input.currency ?? DEFAULT_COACHING_CURRENCY,
        description: input.description ?? null,
        service_type: input.serviceType ?? "1vs1_coaching",
        status: "available",
        created_by: adminId,
      })
      .select("id")
      .single();

    if (error) return { error: error.message };
    revalidatePath("/admin/coaching/slots");
    revalidatePath("/coaching");
    revalidatePath("/dashboard/coaching");
    revalidatePath("/admin/dashboard");
    return { id: data.id };
  } catch (err) {
    return { error: err instanceof Error ? err.message : "Unexpected error." };
  }
}

export async function deleteCoachingSlot(
  id: string,
): Promise<{ error?: string }> {
  try {
    await verifyAdmin();
    const admin = createAdminClient();

    // Refuse to delete a slot that has any booking — keep the audit trail.
    const { count } = await admin
      .from("coaching_bookings")
      .select("id", { count: "exact", head: true })
      .eq("slot_id", id);
    if ((count ?? 0) > 0) {
      return { error: "Cannot delete a slot with bookings. Cancel instead." };
    }

    const { error } = await admin.from("coaching_slots").delete().eq("id", id);
    if (error) return { error: error.message };
    revalidatePath("/admin/coaching/slots");
    revalidatePath("/coaching");
    revalidatePath("/dashboard/coaching");
    revalidatePath("/admin/dashboard");
    return {};
  } catch (err) {
    return { error: err instanceof Error ? err.message : "Unexpected error." };
  }
}

// ─── Admin: bulk slot creation ──────────────────────────────────────────────

/**
 * Creates multiple coaching slots at once.
 * Input: a service type + arrays of dates (YYYY-MM-DD) and start times (HH:MM).
 * Every date × time combination becomes one slot. Price and duration are
 * derived from the service type config — no manual entry needed.
 */
export async function createCoachingSlots(input: {
  serviceType: CoachingServiceType;
  dates: string[]; // ['YYYY-MM-DD', ...]
  startTimes: string[]; // ['HH:MM', ...]
}): Promise<{ count?: number; errors?: string[] }> {
  try {
    const adminId = await verifyAdmin();
    const svc = COACHING_SERVICE_TYPES[input.serviceType];

    const validDates = input.dates.filter(Boolean);
    const validTimes = input.startTimes.filter(Boolean);
    if (validDates.length === 0) return { errors: ["Please select a date."] };
    if (validTimes.length === 0) return { errors: ["Please enter a time."] };
    if (validDates.length * validTimes.length > 50) {
      return { errors: ["You can create at most 50 slots at once."] };
    }

    const now = new Date();
    const rows: {
      start_at: string;
      end_at: string;
      price: number;
      currency: string;
      service_type: string;
      status: string;
      created_by: string;
    }[] = [];
    const skipped: string[] = [];

    for (const date of validDates) {
      for (const time of validTimes) {
        const startAt = new Date(`${date}T${time}:00`);
        if (Number.isNaN(startAt.getTime())) {
          skipped.push(`Invalid date/time: ${date} ${time}`);
          continue;
        }
        if (startAt <= now) {
          skipped.push(`Skipped past slot: ${date} ${time}`);
          continue;
        }
        const endAt = new Date(startAt.getTime() + svc.durationMinutes * 60_000);
        rows.push({
          start_at: startAt.toISOString(),
          end_at: endAt.toISOString(),
          price: svc.price,
          currency: svc.currency,
          service_type: input.serviceType,
          status: "available",
          created_by: adminId,
        });
      }
    }

    if (rows.length === 0) {
      return {
        errors: [
          "No valid slots could be created.",
          ...skipped,
        ],
      };
    }

    const admin = createAdminClient();
    const { error } = await admin.from("coaching_slots").insert(rows);
    if (error) return { errors: [error.message] };

    revalidatePath("/admin/dashboard");
    revalidatePath("/coaching");
    revalidatePath("/dashboard/coaching");

    return { count: rows.length, errors: skipped.length ? skipped : undefined };
  } catch (err) {
    return { errors: [err instanceof Error ? err.message : "Unexpected error."] };
  }
}

// ─── User: book a slot ──────────────────────────────────────────────────────

/**
 * Books a coaching slot. Race-safe:
 *   1. Atomic RPC reserves the slot (or raises slot_unavailable).
 *   2. Validate + upload screenshot.
 *   3. Insert booking row.
 * If steps 2 or 3 fail, the slot is released back to 'available' so the
 * next user can try.
 */
export async function bookCoachingSlot(
  slotId: string,
  formData: FormData,
): Promise<{ bookingId?: string; error?: string }> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { error: "Not authenticated." };

  // Validate screenshot before reserving the slot — fail fast.
  const file = formData.get("screenshot") as File | null;
  if (!file || file.size === 0) return { error: "Screenshot required." };
  if (!ALLOWED_SCREENSHOT_TYPES.includes(file.type as never))
    return { error: "Screenshot must be JPEG, PNG, or WebP." };
  if (file.size > MAX_SCREENSHOT_BYTES)
    return { error: "Screenshot must be under 5 MB." };

  // ─── Step 1: atomic reservation via RPC ─────────────────────────────
  const { data: slot, error: rpcError } = await supabase
    .rpc("reserve_coaching_slot", { p_slot_id: slotId })
    .single<{
      id: string;
      price: number;
      currency: string;
    }>();

  if (rpcError) {
    if (
      rpcError.message?.includes("slot_unavailable") ||
      rpcError.code === "P0001"
    ) {
      return {
        error:
          "This slot was just booked. Please choose another time.",
      };
    }
    return { error: rpcError.message };
  }
  if (!slot) {
    return { error: "Slot not available." };
  }

  // ─── Step 2: upload screenshot ──────────────────────────────────────
  const ext = (file.name.split(".").pop() ?? "jpg").toLowerCase();
  const storagePath = `${user.id}/${Date.now()}-${crypto.randomUUID()}.${ext}`;

  const { error: uploadError } = await supabase.storage
    .from("coaching-screenshots")
    .upload(storagePath, file, { contentType: file.type, upsert: false });

  if (uploadError) {
    // Release the slot so the next user can book.
    await supabase.rpc("release_coaching_slot", { p_slot_id: slotId });
    return { error: `Upload failed: ${uploadError.message}` };
  }

  // ─── Step 3: insert booking row ─────────────────────────────────────
  const bankReference =
    ((formData.get("bank_reference") as string) ?? "").trim() || null;

  const { data: booking, error: insertError } = await supabase
    .from("coaching_bookings")
    .insert({
      slot_id: slotId,
      user_id: user.id,
      amount: slot.price,
      currency: slot.currency,
      screenshot_path: storagePath,
      bank_reference: bankReference,
      status: "pending",
    })
    .select("id")
    .single();

  if (insertError) {
    // Roll back the screenshot AND release the slot.
    await supabase.storage
      .from("coaching-screenshots")
      .remove([storagePath]);
    await supabase.rpc("release_coaching_slot", { p_slot_id: slotId });
    return { error: `Booking failed: ${insertError.message}` };
  }

  revalidatePath("/coaching");
  revalidatePath("/dashboard/coaching");
  revalidatePath("/admin/dashboard");
  return { bookingId: booking.id };
}

// ─── Admin: approve / deny bookings ─────────────────────────────────────────

export async function approveCoachingBooking(
  bookingId: string,
  adminNote: string = "",
): Promise<{ error?: string }> {
  try {
    const adminUserId = await verifyAdmin();
    const admin = createAdminClient();

    const { data: booking, error: fetchErr } = await admin
      .from("coaching_bookings")
      .select("id, slot_id, status")
      .eq("id", bookingId)
      .single();

    if (fetchErr || !booking) return { error: "Booking not found." };
    if (booking.status !== "pending")
      return { error: "Booking is not in pending state." };

    const now = new Date().toISOString();
    const trimmedNote = adminNote.trim() || null;

    // Booking → approved.
    const { error: bookErr } = await admin
      .from("coaching_bookings")
      .update({
        status: "approved",
        admin_note: trimmedNote,
        reviewed_at: now,
        reviewed_by: adminUserId,
      })
      .eq("id", bookingId);
    if (bookErr) return { error: bookErr.message };

    // Slot → booked.
    const { error: slotErr } = await admin
      .from("coaching_slots")
      .update({ status: "booked" })
      .eq("id", booking.slot_id);
    if (slotErr) return { error: slotErr.message };

    await sendCoachingApprovedEmail({
      bookingId: booking.id,
      adminNote: trimmedNote,
    });

    revalidatePath("/admin/coaching/bookings");
    revalidatePath("/admin/coaching/slots");
    revalidatePath("/coaching");
    revalidatePath("/dashboard/coaching");
    revalidatePath("/admin/dashboard");
    return {};
  } catch (err) {
    return { error: err instanceof Error ? err.message : "Unexpected error." };
  }
}

export async function denyCoachingBooking(
  bookingId: string,
  adminNote: string,
): Promise<{ error?: string }> {
  try {
    const adminUserId = await verifyAdmin();
    const admin = createAdminClient();

    const { data: booking, error: fetchErr } = await admin
      .from("coaching_bookings")
      .select("id, slot_id, status")
      .eq("id", bookingId)
      .single();

    if (fetchErr || !booking) return { error: "Booking not found." };
    if (booking.status !== "pending")
      return { error: "Booking is not in pending state." };

    const now = new Date().toISOString();
    const trimmedNote = adminNote.trim() || null;

    // Booking → denied (audit trail preserved).
    const { error: bookErr } = await admin
      .from("coaching_bookings")
      .update({
        status: "denied",
        admin_note: trimmedNote,
        reviewed_at: now,
        reviewed_by: adminUserId,
      })
      .eq("id", bookingId);
    if (bookErr) return { error: bookErr.message };

    // Slot → back to available so someone else can book.
    // Only flip if the slot is still 'pending' (it might have been
    // independently cancelled or expired by the cron).
    const { error: slotErr } = await admin
      .from("coaching_slots")
      .update({ status: "available" })
      .eq("id", booking.slot_id)
      .eq("status", "pending");
    if (slotErr) return { error: slotErr.message };

    await sendCoachingDeniedEmail({
      bookingId: booking.id,
      adminNote: trimmedNote,
    });

    revalidatePath("/admin/coaching/bookings");
    revalidatePath("/admin/coaching/slots");
    revalidatePath("/coaching");
    revalidatePath("/dashboard/coaching");
    revalidatePath("/admin/dashboard");
    return {};
  } catch (err) {
    return { error: err instanceof Error ? err.message : "Unexpected error." };
  }
}

/** Alias for marketing/booking flows. */
export { bookCoachingSlot as submitCoachingBooking };
