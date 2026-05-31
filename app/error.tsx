"use client";

export default function RootError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
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
        <h1 style={{ font: "var(--u-h2)", margin: "0 0 12px" }}>Алдаа гарлаа</h1>
        <p style={{ color: "var(--u-ink-2)", margin: "0 0 8px", lineHeight: 1.55 }}>
          Уучлаарай, серверт эсвэл сүлжээнд түр саатал гарлаа. Хуудсыг дахин ачаалж үзнэ үү.
        </p>
        {process.env.NODE_ENV === "development" && error?.message ? (
          <pre
            style={{
              textAlign: "left",
              fontSize: 11,
              color: "var(--u-ink-3)",
              whiteSpace: "pre-wrap",
              wordBreak: "break-word",
              marginTop: 12,
            }}
          >
            {error.message}
          </pre>
        ) : null}
        <button
          type="button"
          onClick={() => reset()}
          style={{
            marginTop: 22,
            minHeight: 48,
            minWidth: 200,
            padding: "0 22px",
            borderRadius: "var(--u-r-2)",
            border: "none",
            background: "var(--u-ember)",
            color: "var(--u-ember-ink)",
            font: "var(--u-body)",
            fontWeight: 600,
            cursor: "pointer",
          }}
        >
          Дахин оролдох
        </button>
      </div>
    </div>
  );
}
