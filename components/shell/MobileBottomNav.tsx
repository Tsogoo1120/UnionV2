"use client";

import Link from "next/link";
import type { CSSProperties, ReactNode } from "react";

const EASE = "cubic-bezier(0.2, 0.7, 0.2, 1)";
const DUR = "var(--u-dur-2)";

export type MobileBottomNavItem = {
  key: string;
  label: string;
  icon: ReactNode;
  href?: string;
  onClick?: () => void;
  active?: boolean;
};

export type MobileBottomNavProps = {
  items: MobileBottomNavItem[];
};

function NavCell({ item }: { item: MobileBottomNavItem }) {
  const active = Boolean(item.active);
  const color = active ? "var(--u-ember)" : "var(--u-ink-2)";

  const baseStyle: CSSProperties = {
    flex: "1 1 0",
    minWidth: 0,
    minHeight: 44,
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    justifyContent: "center",
    gap: 4,
    padding: "4px 4px 0",
    margin: 0,
    border: "none",
    background: "transparent",
    color,
    font: "var(--u-label)",
    fontWeight: 500,
    textDecoration: "none",
    cursor: "pointer",
    WebkitTapHighlightColor: "transparent",
    transition: `color ${DUR} ${EASE}`,
  };

  const iconWrap = (
    <span
      aria-hidden
      style={{
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        width: 44,
        height: 44,
        color: "inherit",
      }}
    >
      {item.icon}
    </span>
  );

  const label = (
    <span style={{ color: "inherit", lineHeight: 1.1, textAlign: "center" }}>{item.label}</span>
  );

  if (item.href) {
    return (
      <Link href={item.href} prefetch={false} style={baseStyle} aria-current={active ? "page" : undefined}>
        {iconWrap}
        {label}
      </Link>
    );
  }

  return (
    <button type="button" onClick={item.onClick} style={baseStyle} aria-current={active ? "page" : undefined}>
      {iconWrap}
      {label}
    </button>
  );
}

export function MobileBottomNav({ items }: MobileBottomNavProps) {
  const slice = items.slice(0, 5);

  return (
    <nav
      role="navigation"
      aria-label="Үндсэн навигаци"
      style={{
        position: "fixed",
        left: 0,
        right: 0,
        bottom: 0,
        zIndex: 30,
        minHeight: "calc(64px + env(safe-area-inset-bottom, 0px))",
        paddingBottom: "env(safe-area-inset-bottom, 0px)",
        boxSizing: "border-box",
        display: "flex",
        alignItems: "stretch",
        justifyContent: "space-around",
        background: "var(--u-surface)",
        borderTop: "1px solid var(--u-border-strong)",
        boxShadow: "var(--u-shadow-1)",
      }}
    >
      {slice.map((item) => (
        <NavCell key={item.key} item={item} />
      ))}
    </nav>
  );
}
