const THIN_SPACE = "\u202f";

const MN_MONTHS_ORDINAL = [
  "\u043d\u044d\u0433\u0434\u04af\u0433\u044d\u044d\u0440",
  "\u0445\u043e\u0451\u0440\u0434\u0443\u0433\u0430\u0430\u0440",
  "\u0433\u0443\u0440\u0430\u0432\u0434\u0443\u0433\u0430\u0430\u0440",
  "\u0434\u04e9\u0440\u04e9\u0432\u0434\u04af\u0433\u044d\u044d\u0440",
  "\u0442\u0430\u0432\u0434\u0443\u0433\u0430\u0430\u0440",
  "\u0437\u0443\u0440\u0433\u0430\u0430\u0434\u0443\u0433\u0430\u0430\u0440",
  "\u0434\u043e\u043b\u0434\u0443\u0433\u0430\u0430\u0440",
  "\u043d\u0430\u0439\u043c\u0434\u0443\u0433\u0430\u0430\u0440",
  "\u0435\u0441\u0434\u04af\u0433\u044d\u044d\u0440",
  "\u0430\u0440\u0430\u0432\u0434\u0443\u0433\u0430\u0430\u0440",
  "\u0430\u0440\u0432\u0430\u043d \u043d\u044d\u0433\u0434\u04af\u0433\u044d\u044d\u0440",
  "\u0430\u0440\u0432\u0430\u043d \u0445\u043e\u0451\u0440\u0434\u0443\u0433\u0430\u0430\u0440",
];

const MN_WEEKDAYS_SHORT = ["\u041d\u044f", "\u0414\u0430", "\u041c\u044f", "\u041b\u0445", "\u041f\u04af", "\u0411\u0430", "\u0411\u044f"];

export function formatMongolianLongDate(date: Date): string {
  return `${date.getFullYear()} \u043e\u043d\u044b ${MN_MONTHS_ORDINAL[date.getMonth()]} \u0441\u0430\u0440\u044b\u043d ${date.getDate()}`;
}

export function formatMongolianShortWeekday(date: Date): string {
  return MN_WEEKDAYS_SHORT[date.getDay()] ?? "";
}

export function formatHM(date: Date): string {
  const pad = (n: number) => String(n).padStart(2, "0");
  return `${pad(date.getHours())}:${pad(date.getMinutes())}`;
}

export function formatMNT(amount: number): string {
  const formatted = new Intl.NumberFormat("mn-MN", {
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

const relativeTimeFormatter = new Intl.RelativeTimeFormat("mn", {
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
  active: { label: "Идэвхтэй", tone: "success" },
  pending: { label: "Хүлээгдэж байна", tone: "pending" },
  denied: { label: "Татгалзсан", tone: "danger" },
  expired: { label: "Хугацаа дууссан", tone: "warn" },
  inactive: { label: "Идэвхгүй", tone: "neutral" },
};

const paymentLabelMap: Record<string, { label: string; tone: StatusTone }> = {
  pending: { label: "Хүлээгдэж байна", tone: "pending" },
  approved: { label: "Зөвшөөрсөн", tone: "success" },
  denied: { label: "Татгалзсан", tone: "danger" },
};

/** Coaching slot statuses (`coaching_slots.status`). */
const slotLabelMap: Record<string, { label: string; tone: StatusTone }> = {
  available: { label: "Боломжтой", tone: "success" },
  pending: { label: "Хүлээгдэж байна", tone: "pending" },
  booked: { label: "Захиалсан", tone: "warn" },
  expired: { label: "Хугацаа дууссан", tone: "danger" },
  cancelled: { label: "Цуцалсан", tone: "danger" },
};

const defaultLabel = { label: "Тодорхойгүй", tone: "neutral" as StatusTone };

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
