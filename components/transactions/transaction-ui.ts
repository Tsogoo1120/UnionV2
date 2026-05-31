import type { CSSProperties } from "react";
import type { StatusTone } from "@/lib/format";

export function toneToBadgeStyle(tone: StatusTone): CSSProperties {
  switch (tone) {
    case "success":
      return {
        background: "var(--u-success-soft)",
        color: "var(--u-success)",
      };
    case "warn":
      return { background: "var(--u-warn-soft)", color: "var(--u-warn)" };
    case "danger":
      return { background: "var(--u-danger-soft)", color: "var(--u-danger)" };
    case "pending":
      return {
        background: "var(--u-warn-soft)",
        color: "#5a4300",
      };
    default:
      return {
        background: "var(--u-rule-2)",
        color: "var(--u-ink-2)",
      };
  }
}

export function transactionKindShort(kind: "subscription" | "coaching"): string {
  return kind === "subscription" ? "Membership" : "Coaching";
}

export function transactionKindDetailTitle(
  kind: "subscription" | "coaching",
  slotDescription: string | null | undefined,
): string {
  if (kind === "subscription") return "Membership payment";
  const d = slotDescription?.trim();
  return d && d.length > 0
    ? `Personal coaching — ${d}`
    : "Personal coaching";
}
