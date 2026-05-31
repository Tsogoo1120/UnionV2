"use client";

import type { ReactNode } from "react";

const EASE = "cubic-bezier(0.2, 0.7, 0.2, 1)";
const DUR = "var(--u-dur-2)";

export type MobileTopBarProps = {
  title: string;
  onMenuClick: () => void;
  rightSlot?: ReactNode;
};

export function MobileTopBar({ title, onMenuClick, rightSlot }: MobileTopBarProps) {
  return (
    <header
      style={{
        position: "sticky",
        top: 0,
        zIndex: 20,
        height: 56,
        minHeight: 56,
        display: "flex",
        alignItems: "center",
        gap: 8,
        padding: "0 12px",
        background: "var(--u-surface)",
        borderBottom: "1px solid var(--u-border-strong)",
        boxSizing: "border-box",
      }}
    >
      <button
        type="button"
        aria-label="Open menu"
        onClick={onMenuClick}
        style={{
          flex: "0 0 auto",
          width: 44,
          height: 44,
          minWidth: 44,
          minHeight: 44,
          display: "grid",
          placeItems: "center",
          margin: 0,
          padding: 0,
          border: "none",
          borderRadius: "var(--u-r-2)",
          background: "transparent",
          color: "var(--u-ink)",
          cursor: "pointer",
          transition: `background-color ${DUR} ${EASE}`,
        }}
      >
        <span aria-hidden style={{ display: "grid", gap: 5, width: 20 }}>
          <span style={{ height: 2, borderRadius: 1, background: "currentColor" }} />
          <span style={{ height: 2, borderRadius: 1, background: "currentColor" }} />
          <span style={{ height: 2, borderRadius: 1, background: "currentColor" }} />
        </span>
      </button>
      <div
        style={{
          flex: 1,
          minWidth: 0,
          font: "var(--u-h4)",
          fontWeight: 600,
          textAlign: "center",
          color: "var(--u-ink)",
          overflow: "hidden",
          textOverflow: "ellipsis",
          whiteSpace: "nowrap",
        }}
      >
        {title}
      </div>
      <div
        style={{
          flex: "0 0 auto",
          width: 44,
          minWidth: 44,
          minHeight: 44,
          display: "flex",
          alignItems: "center",
          justifyContent: rightSlot ? "flex-end" : "center",
        }}
      >
        {rightSlot ?? null}
      </div>
    </header>
  );
}
