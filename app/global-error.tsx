"use client";

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <html lang="mn">
      <body>
        <div
          style={{
            minHeight: "100vh",
            display: "grid",
            placeItems: "center",
            padding: 32,
            fontFamily: "system-ui, -apple-system, sans-serif",
          }}
        >
          <div style={{ maxWidth: 440, textAlign: "center" }}>
            <h1 style={{ margin: "0 0 12px" }}>Алдаа гарлаа</h1>
            <p style={{ color: "#555", margin: "0 0 16px", lineHeight: 1.55 }}>
              Уучлаарай, серверт эсвэл сүлжээнд түр саатал гарлаа.
            </p>
            {process.env.NODE_ENV === "development" && error?.message ? (
              <pre
                style={{
                  textAlign: "left",
                  fontSize: 11,
                  whiteSpace: "pre-wrap",
                  wordBreak: "break-word",
                  background: "#f4f4f4",
                  padding: 12,
                  borderRadius: 8,
                  marginBottom: 16,
                }}
              >
                {error.message}
              </pre>
            ) : null}
            <button
              type="button"
              onClick={() => reset()}
              style={{
                marginTop: 6,
                minHeight: 48,
                minWidth: 200,
                padding: "12px 22px",
                borderRadius: 8,
                border: "none",
                background: "#E84A1F",
                color: "#fff",
                fontWeight: 600,
                cursor: "pointer",
              }}
            >
              Дахин оролдох
            </button>
          </div>
        </div>
      </body>
    </html>
  );
}
