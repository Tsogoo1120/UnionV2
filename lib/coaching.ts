/**
 * Coaching status helpers — pure functions, safe for both server and
 * client. Keep DB-agnostic so they can be used in the booking form,
 * landing page slot board, and admin UI without duplicating logic.
 */

import type { CoachingSlot, CoachingSlotStatus } from "@/lib/types";

/**
 * Returns true when the slot is bookable right now: status='available'
 * AND start_at is still in the future.
 *
 * The DB has the same predicate baked into the public RLS read policy
 * and the reserve_coaching_slot RPC, so this helper is the cosmetic
 * layer (e.g. "is the Book button enabled?").
 */
export function isSlotBookable(slot: Pick<CoachingSlot, "status" | "start_at">): boolean {
  return slot.status === "available" && new Date(slot.start_at) > new Date();
}

export function slotStatusLabel(status: CoachingSlotStatus): string {
  switch (status) {
    case "available":
      return "Available";
    case "pending":
      return "Pending";
    case "booked":
      return "Booked";
    case "expired":
      return "Expired";
    case "cancelled":
      return "Cancelled";
  }
}

/**
 * Formats a slot's time range in Asia/Ulaanbaatar timezone. Returns
 * a single string like "2026-05-20, 16:00–17:00 (UTC+8)".
 */
export function formatSlotRange(
  startIso: string,
  endIso: string,
  timeZone: string = "Asia/Ulaanbaatar",
): string {
  const start = new Date(startIso);
  const end = new Date(endIso);
  const dateFmt = new Intl.DateTimeFormat("en-US", {
    timeZone,
    year: "numeric",
    month: "long",
    day: "numeric",
  });
  const timeFmt = new Intl.DateTimeFormat("en-US", {
    timeZone,
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
  });
  const tzOffset = new Date(startIso)
    .toLocaleTimeString("en-US", { timeZone, timeZoneName: "short" })
    .split(" ")
    .pop();
  return `${dateFmt.format(start)}, ${timeFmt.format(start)}–${timeFmt.format(end)} (${tzOffset})`;
}
