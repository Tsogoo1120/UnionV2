import Link from "next/link";

export default function NotFound() {
  return (
    <div
      style={{
        minHeight: "60vh",
        display: "grid",
        placeItems: "center",
        padding: 32,
        background: "var(--u-bg)",
        color: "var(--u-ink)",
        font: "var(--u-body)",
      }}
    >
      <div
        style={{
          maxWidth: 440,
          textAlign: "center",
          background: "var(--u-surface-2)",
          border: "1px solid var(--u-rule)",
          borderRadius: "var(--u-r-3)",
          padding: "28px 24px 32px",
          boxShadow: "var(--u-shadow-2)",
        }}
      >
        <h1 style={{ font: "var(--u-h2)", margin: "0 0 12px" }}>Page not found</h1>
        <p style={{ color: "var(--u-ink-2)", margin: "0 0 16px", lineHeight: 1.55 }}>
          The page you&apos;re looking for doesn&apos;t exist or has been removed.
        </p>
        <Link
          href="/"
          style={{
            display: "inline-block",
            marginTop: 6,
            minHeight: 48,
            padding: "12px 22px",
            borderRadius: "var(--u-r-2)",
            background: "var(--u-ember)",
            color: "var(--u-ember-ink)",
            font: "var(--u-body)",
            fontWeight: 600,
            textDecoration: "none",
          }}
        >
          Back to home
        </Link>
      </div>
    </div>
  );
}
