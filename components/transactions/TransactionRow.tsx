"use client";

import type { CSSProperties } from "react";
import type { TransactionRow as TRow } from "@/lib/queries/transactions";
import { formatDate, formatMNT, statusLabel } from "@/lib/format";
import { toneToBadgeStyle, transactionKindShort } from "./transaction-ui";

function KindIcon({ kind }: { kind: TRow["kind"] }) {
  const stroke = "currentColor";
  if (kind === "subscription") {
    return (
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none" aria-hidden>
        <path
          d="M12 3v18M7 8h10M7 16h10"
          stroke={stroke}
          strokeWidth="1.6"
          strokeLinecap="round"
        />
      </svg>
    );
  }
  return (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" aria-hidden>
      <circle cx="12" cy="12" r="8" stroke={stroke} strokeWidth="1.6" />
      <path
        d="M12 8v4l2.5 2.5"
        stroke={stroke}
        strokeWidth="1.6"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

export function TransactionRow({
  row,
  layout,
  onOpen,
}: {
  row: TRow;
  layout: "mobile" | "desktop";
  onOpen: (row: TRow) => void;
}) {
  const { label, tone } = statusLabel(row.status, "payment");
  const badgeStyle = toneToBadgeStyle(tone);
  const kindLabel = transactionKindShort(row.kind);
  const dateStr = formatDate(row.submitted_at, { withTime: true });

  const rowBase: CSSProperties = {
    cursor: "pointer",
    border: "1px solid var(--u-rule)",
    background: "var(--u-surface-2)",
    borderRadius: "var(--u-r-3)",
    textAlign: "left",
    width: "100%",
    WebkitTapHighlightColor: "transparent",
    transition: "border-color var(--u-dur-2) var(--u-ease), box-shadow var(--u-dur-2) var(--u-ease)",
  };

  if (layout === "mobile") {
    return (
      <button
        type="button"
        onClick={() => onOpen(row)}
        style={{
          ...rowBase,
          padding: "14px 16px",
          display: "flex",
          flexDirection: "column",
          gap: 12,
        }}
      >
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            gap: 12,
          }}
        >
          <span style={{ color: "var(--u-ink-2)", display: "flex" }}>
            <KindIcon kind={row.kind} />
          </span>
          <span
            style={{
              font: "var(--u-h4)",
              fontFamily: "var(--u-mono)",
              fontWeight: 600,
              flex: 1,
              textAlign: "right",
            }}
          >
            {formatMNT(row.amount)}
          </span>
          <span
            style={{
              ...badgeStyle,
              font: "var(--u-label)",
              fontWeight: 600,
              padding: "4px 10px",
              borderRadius: "var(--u-r-pill)",
              flexShrink: 0,
            }}
          >
            {label}
          </span>
        </div>
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            gap: 8,
            font: "var(--u-body-s)",
            color: "var(--u-ink-2)",
          }}
        >
          <span>{dateStr}</span>
          <span style={{ fontWeight: 500, color: "var(--u-ink)" }}>{kindLabel}</span>
          <span aria-hidden style={{ color: "var(--u-ink-3)" }}>
            →
          </span>
        </div>
      </button>
    );
  }

  return (
    <button
      type="button"
      onClick={() => onOpen(row)}
      style={{
        ...rowBase,
        display: "grid",
        gridTemplateColumns: "minmax(0,1.1fr) minmax(0,0.9fr) minmax(0,1fr) auto 28px",
        gap: 12,
        alignItems: "center",
        padding: "16px 20px",
      }}
      onMouseEnter={(e) => {
        e.currentTarget.style.borderColor = "var(--u-rule-2)";
        e.currentTarget.style.boxShadow = "var(--u-shadow-1)";
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.borderColor = "var(--u-rule)";
        e.currentTarget.style.boxShadow = "none";
      }}
    >
      <span style={{ font: "var(--u-body-s)", color: "var(--u-ink-2)" }}>{dateStr}</span>
      <span style={{ font: "var(--u-body-s)", fontWeight: 500 }}>{kindLabel}</span>
      <span style={{ font: "var(--u-body)", fontFamily: "var(--u-mono)", fontWeight: 600 }}>
        {formatMNT(row.amount)}
      </span>
      <span
        style={{
          ...badgeStyle,
          font: "var(--u-label)",
          fontWeight: 600,
          padding: "4px 10px",
          borderRadius: "var(--u-r-pill)",
          justifySelf: "end",
        }}
      >
        {label}
      </span>
      <span aria-hidden style={{ color: "var(--u-ink-3)", textAlign: "right" }}>
        →
      </span>
    </button>
  );
}
