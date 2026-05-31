import type { CSSProperties, ReactNode } from "react";
import Link from "next/link";

export const emptyStateContainerStyle: CSSProperties = {
  padding: "48px 24px",
  textAlign: "center",
  background: "var(--u-surface-2)",
  border: "1px dashed var(--u-rule-2)",
  borderRadius: "var(--u-r-3)",
};

export function EmptyState({
  icon,
  title,
  body,
  ctaHref,
  ctaLabel,
  onCtaClick,
}: {
  icon?: ReactNode;
  title: string;
  body: string;
  ctaHref?: string;
  ctaLabel?: string;
  onCtaClick?: () => void;
}) {
  const ctaStyle: CSSProperties = {
    display: "inline-flex",
    alignItems: "center",
    justifyContent: "center",
    minHeight: 52,
    padding: "0 22px",
    borderRadius: "var(--u-r-2)",
    background: "var(--u-ink)",
    color: "var(--u-bg)",
    font: "var(--u-body-s)",
    fontWeight: 600,
    textDecoration: "none",
    border: "none",
    cursor: "pointer",
  };

  return (
    <div style={emptyStateContainerStyle}>
      {icon ? (
        <div style={{ marginBottom: 16, color: "var(--u-ink-4)", display: "flex", justifyContent: "center" }}>
          {icon}
        </div>
      ) : null}
      <div style={{ font: "var(--u-h3)", fontWeight: 600, marginBottom: 8 }}>{title}</div>
      <p style={{ font: "var(--u-body)", color: "var(--u-ink-2)", margin: "0 0 18px", lineHeight: 1.55 }}>{body}</p>
      {ctaLabel && ctaHref ? (
        <Link href={ctaHref} style={ctaStyle}>
          {ctaLabel}
        </Link>
      ) : ctaLabel && onCtaClick ? (
        <button type="button" onClick={onCtaClick} style={ctaStyle}>
          {ctaLabel}
        </button>
      ) : null}
    </div>
  );
}
