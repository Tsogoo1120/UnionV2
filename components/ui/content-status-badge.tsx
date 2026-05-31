import type { CSSProperties, ReactNode } from "react";

const publishedStyle: CSSProperties = {
  background: "var(--u-success-soft)",
  color: "var(--u-success)",
  padding: "2px 8px",
  borderRadius: "var(--u-r-pill)",
  font: "var(--u-body-s)",
  fontWeight: 500,
  display: "inline-block",
};

const draftStyle: CSSProperties = {
  background: "var(--u-surface)",
  color: "var(--u-ink-3)",
  border: "1px solid var(--u-rule-2)",
  padding: "2px 8px",
  borderRadius: "var(--u-r-pill)",
  font: "var(--u-body-s)",
  fontWeight: 500,
  display: "inline-block",
};

export function ContentStatusBadge({ published }: { published: boolean }): ReactNode {
  return (
    <span style={published ? publishedStyle : draftStyle}>
      {published ? "Published" : "Draft"}
    </span>
  );
}
