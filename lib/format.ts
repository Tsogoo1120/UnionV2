const THIN_SPACE = "\u202f";

const MONTHS_LONG = [
  "January",
  "February",
  "March",
  "April",
  "May",
  "June",
  "July",
  "August",
  "September",
  "October",
  "November",
  "December",
];

const WEEKDAYS_SHORT = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

export function formatMongolianLongDate(date: Date): string {
  return `${MONTHS_LONG[date.getMonth()]} ${date.getDate()}, ${date.getFullYear()}`;
}

export function formatMongolianShortWeekday(date: Date): string {
  return WEEKDAYS_SHORT[date.getDay()] ?? "";
}

export function formatMonthLong(date: Date): string {
  return MONTHS_LONG[date.getMonth()] ?? "";
}

export function formatHM(date: Date): string {
  const pad = (n: number) => String(n).padStart(2, "0");
  return `${pad(date.getHours())}:${pad(date.getMinutes())}`;
}

export function formatMNT(amount: number): string {
  const formatted = new Intl.NumberFormat("en-US", {
    maximumFractionDigits: 2,
    minimumFractionDigits: 0,
  }).format(amount);

  return `${formatted}${THIN_SPACE}₮`;
}

export function formatDate(
  iso: string,
  opts?: { withTime?: boolean },
): string {
  const date = new Date(iso);
  if (Number.isNaN(date.getTime())) return iso;

  const pad = (value: number) => String(value).padStart(2, "0");
  const datePart = `${date.getFullYear()}.${pad(date.getMonth() + 1)}.${pad(
    date.getDate(),
  )}`;

  if (opts?.withTime) {
    return `${datePart} ${pad(date.getHours())}:${pad(date.getMinutes())}`;
  }

  return datePart;
}

const relativeTimeFormatter = new Intl.RelativeTimeFormat("en", {
  numeric: "auto",
});

/** Whole days from now until `iso` (0 if already passed). */
export function subscriptionDaysRemaining(iso: string | null): number | null {
  if (!iso) return null;
  const end = new Date(iso).getTime();
  if (Number.isNaN(end)) return null;
  return Math.max(0, Math.ceil((end - Date.now()) / 86400000));
}

export function formatRelative(iso: string): string {
  const target = new Date(iso);
  if (Number.isNaN(target.getTime())) return iso;

  const seconds = Math.round((target.getTime() - Date.now()) / 1000);
  const absSeconds = Math.abs(seconds);

  if (absSeconds < 60) {
    return relativeTimeFormatter.format(seconds, "second");
  }
  if (absSeconds < 3600) {
    return relativeTimeFormatter.format(Math.round(seconds / 60), "minute");
  }
  if (absSeconds < 86400) {
    return relativeTimeFormatter.format(Math.round(seconds / 3600), "hour");
  }
  if (absSeconds < 86400 * 7) {
    return relativeTimeFormatter.format(Math.round(seconds / 86400), "day");
  }
  if (absSeconds < 86400 * 31) {
    return relativeTimeFormatter.format(Math.round(seconds / (86400 * 7)), "week");
  }
  if (absSeconds < 86400 * 365) {
    return relativeTimeFormatter.format(Math.round(seconds / (86400 * 30)), "month");
  }

  return relativeTimeFormatter.format(Math.round(seconds / (86400 * 365)), "year");
}

export type StatusTone = "success" | "warn" | "danger" | "neutral" | "pending";

const subscriptionLabelMap: Record<string, { label: string; tone: StatusTone }> = {
  active: { label: "Active", tone: "success" },
  pending: { label: "Pending", tone: "pending" },
  denied: { label: "Denied", tone: "danger" },
  expired: { label: "Expired", tone: "warn" },
  inactive: { label: "Inactive", tone: "neutral" },
};

const paymentLabelMap: Record<string, { label: string; tone: StatusTone }> = {
  pending: { label: "Pending", tone: "pending" },
  approved: { label: "Approved", tone: "success" },
  denied: { label: "Denied", tone: "danger" },
};

/** Coaching slot statuses (`coaching_slots.status`). */
const slotLabelMap: Record<string, { label: string; tone: StatusTone }> = {
  available: { label: "Available", tone: "success" },
  pending: { label: "Pending", tone: "pending" },
  booked: { label: "Booked", tone: "warn" },
  expired: { label: "Expired", tone: "danger" },
  cancelled: { label: "Cancelled", tone: "danger" },
};

const defaultLabel = { label: "Unknown", tone: "neutral" as StatusTone };

export function statusLabel(
  status: string,
  kind: "subscription" | "payment" | "booking" | "slot",
): { label: string; tone: StatusTone } {
  switch (kind) {
    case "subscription":
      return subscriptionLabelMap[status] ?? defaultLabel;
    case "payment":
      return paymentLabelMap[status] ?? defaultLabel;
    case "booking":
      return paymentLabelMap[status] ?? defaultLabel;
    case "slot":
      return slotLabelMap[status] ?? defaultLabel;
    default:
      return defaultLabel;
  }
}
