"use client";

import Link from "next/link";
import type { CSSProperties, ReactNode } from "react";

type Props = {
  href: string;
  locked: boolean;
  children: ReactNode;
  style?: CSSProperties;
  className?: string;
};

export function LockedContentLink({ href, locked, children, style, className }: Props) {
  const target = locked ? "/payment" : href;
  const unavailable = !locked && (!href || href === "#");

  if (unavailable) {
    return (
      <div
        className={className}
        aria-disabled="true"
        style={{
          ...style,
          position: "relative",
          display: style?.display ?? "block",
          opacity: 0.55,
          cursor: "not-allowed",
        }}
      >
        {children}
      </div>
    );
  }

  return (
    <Link
      href={target}
      className={className}
      style={{ ...style, position: "relative", display: style?.display ?? "block" }}
    >
      {children}
      {locked ? (
        <div
          style={{
            position: "absolute",
            inset: 0,
            background: "rgba(0,0,0,0.55)",
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
            gap: 8,
            borderRadius: "inherit",
            zIndex: 2,
          }}
        >
          <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#F2EEE3" strokeWidth="1.5">
            <rect x="5" y="11" width="14" height="10" rx="2" />
            <path d="M8 11V8a4 4 0 018 0v3" />
          </svg>
          <span style={{ font: "var(--u-body-s)", fontWeight: 600, color: "#F2EEE3" }}>Become a member</span>
        </div>
      ) : null}
    </Link>
  );
}
