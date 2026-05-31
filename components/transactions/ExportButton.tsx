"use client";

import { useState } from "react";
import { exportTransactionsCSV } from "@/app/actions/transactions";
import {
  parseDayToFromIso,
  parseDayToToIso,
} from "@/lib/transactions/parse-filters";

export type ExportFilters = {
  from?: string;
  to?: string;
  statuses: string[];
  kind: "all" | "subscription" | "coaching";
};

export function ExportButton({
  total,
  filters,
}: {
  total: number;
  filters: ExportFilters;
}) {
  const [busy, setBusy] = useState(false);

  async function onClick() {
    if (total <= 0 || busy) return;
    setBusy(true);
    const res = await exportTransactionsCSV({
      from: parseDayToFromIso(filters.from),
      to: parseDayToToIso(filters.to),
      statuses: filters.statuses.length > 0 ? filters.statuses : undefined,
      kind: filters.kind,
    });
    setBusy(false);
    if (res.error || !res.csv) return;

    const stamp = new Date();
    const y = stamp.getFullYear();
    const m = String(stamp.getMonth() + 1).padStart(2, "0");
    const d = String(stamp.getDate()).padStart(2, "0");
    const name = `union-transactions-${y}${m}${d}.csv`;
    const blob = new Blob([res.csv], { type: "text/csv;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = name;
    a.click();
    URL.revokeObjectURL(url);
  }

  const disabled = total <= 0 || busy;

  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      style={{
        border: "1px solid var(--u-rule-2)",
        background: disabled ? "var(--u-rule)" : "var(--u-surface-2)",
        color: disabled ? "var(--u-ink-4)" : "var(--u-ink)",
        font: "var(--u-body-s)",
        fontWeight: 500,
        padding: "10px 16px",
        borderRadius: "var(--u-r-2)",
        cursor: disabled ? "not-allowed" : "pointer",
        minHeight: 44,
      }}
    >
      {busy ? "Preparing…" : "Export CSV"}
    </button>
  );
}
