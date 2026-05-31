"use client";

import { useRouter } from "next/navigation";
import type { ExportFilters } from "./ExportButton";

function buildPath(filters: ExportFilters, page = 1): string {
  const p = new URLSearchParams();
  if (filters.from) p.set("from", filters.from);
  if (filters.to) p.set("to", filters.to);
  if (filters.statuses.length > 0) {
    p.set("status", filters.statuses.join(","));
  }
  if (filters.kind !== "all") p.set("kind", filters.kind);
  if (page > 1) p.set("page", String(page));
  const s = p.toString();
  return s ? `/transactions?${s}` : "/transactions";
}

const STATUS_KEYS = ["pending", "approved", "denied"] as const;

const STATUS_LABEL: Record<(typeof STATUS_KEYS)[number], string> = {
  pending: "Pending",
  approved: "Approved",
  denied: "Denied",
};

export function TransactionFilters({ filters }: { filters: ExportFilters }) {
  const router = useRouter();

  function navigate(next: Partial<ExportFilters>, page = 1) {
    const merged: ExportFilters = {
      from: next.from !== undefined ? next.from : filters.from,
      to: next.to !== undefined ? next.to : filters.to,
      statuses: next.statuses !== undefined ? next.statuses : filters.statuses,
      kind: next.kind !== undefined ? next.kind : filters.kind,
    };
    router.push(buildPath(merged, page));
  }

  function toggleStatus(key: (typeof STATUS_KEYS)[number]) {
    const set = new Set(filters.statuses);
    if (set.has(key)) set.delete(key);
    else set.add(key);
    navigate({ statuses: Array.from(set) }, 1);
  }

  function pillStyle(active: boolean) {
    return {
      border: active ? "1px solid var(--u-ink)" : "1px solid var(--u-rule-2)",
      background: active ? "var(--u-ink)" : "var(--u-surface-2)",
      color: active ? "var(--u-bg)" : "var(--u-ink-2)",
      font: "var(--u-body-s)",
      fontWeight: 500,
      padding: "8px 12px",
      borderRadius: "var(--u-r-pill)",
      cursor: "pointer",
      whiteSpace: "nowrap",
    } as const;
  }

  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        gap: 16,
        padding: "4px 0 8px",
      }}
    >
      <div>
        <div className="u-eyebrow" style={{ marginBottom: 8 }}>
          Date range
        </div>
        <div
          style={{
            display: "flex",
            flexWrap: "wrap",
            gap: 10,
            alignItems: "center",
          }}
        >
          <label style={{ display: "flex", flexDirection: "column", gap: 4, flex: "1 1 140px" }}>
            <span style={{ font: "var(--u-label)", color: "var(--u-ink-3)" }}>From</span>
            <input
              type="date"
              lang="en"
              value={filters.from ?? ""}
              onChange={(e) =>
                navigate({ from: e.target.value || undefined }, 1)
              }
              style={{
                width: "100%",
                minHeight: 44,
                borderRadius: "var(--u-r-2)",
                border: "1px solid var(--u-rule-2)",
                padding: "0 10px",
                font: "var(--u-body-s)",
                background: "var(--u-surface-2)",
              }}
            />
          </label>
          <label style={{ display: "flex", flexDirection: "column", gap: 4, flex: "1 1 140px" }}>
            <span style={{ font: "var(--u-label)", color: "var(--u-ink-3)" }}>To</span>
            <input
              type="date"
              lang="en"
              value={filters.to ?? ""}
              onChange={(e) =>
                navigate({ to: e.target.value || undefined }, 1)
              }
              style={{
                width: "100%",
                minHeight: 44,
                borderRadius: "var(--u-r-2)",
                border: "1px solid var(--u-rule-2)",
                padding: "0 10px",
                font: "var(--u-body-s)",
                background: "var(--u-surface-2)",
              }}
            />
          </label>
        </div>
      </div>

      <div>
        <div className="u-eyebrow" style={{ marginBottom: 8 }}>
          Status
        </div>
        <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
          <button
            type="button"
            onClick={() => navigate({ statuses: [] }, 1)}
            style={pillStyle(filters.statuses.length === 0)}
          >
            All
          </button>
          {STATUS_KEYS.map((key) => {
            const active = filters.statuses.includes(key);
            return (
              <button
                key={key}
                type="button"
                onClick={() => toggleStatus(key)}
                style={pillStyle(active)}
              >
                {STATUS_LABEL[key]}
              </button>
            );
          })}
        </div>
      </div>

      <div>
        <div className="u-eyebrow" style={{ marginBottom: 8 }}>
          Type
        </div>
        <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
          {(
            [
              ["all", "All"],
              ["subscription", "Membership"],
              ["coaching", "Coaching"],
            ] as const
          ).map(([k, label]) => (
            <button
              key={k}
              type="button"
              onClick={() => navigate({ kind: k }, 1)}
              style={pillStyle(filters.kind === k)}
            >
              {label}
            </button>
          ))}
        </div>
      </div>

      <button
        type="button"
        onClick={() =>
          router.push(
            buildPath(
              { from: undefined, to: undefined, statuses: [], kind: "all" },
              1,
            ),
          )
        }
        style={{
          alignSelf: "flex-start",
          border: "1px dashed var(--u-rule-2)",
          background: "transparent",
          color: "var(--u-ink-2)",
          font: "var(--u-body-s)",
          fontWeight: 500,
          padding: "10px 14px",
          borderRadius: "var(--u-r-2)",
          cursor: "pointer",
          minHeight: 44,
        }}
      >
        Clear filters
      </button>
    </div>
  );
}
