export default function TransactionsLoading() {
  return (
    <div style={{ minHeight: "100vh", background: "var(--u-bg)", padding: "72px 16px 96px" }}>
      <div style={{ maxWidth: 1100, margin: "0 auto" }}>
        <div
          style={{
            height: 28,
            width: 180,
            borderRadius: 8,
            background: "var(--u-rule-2)",
            marginBottom: 20,
            opacity: 0.75,
          }}
        />
        <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
          {Array.from({ length: 8 }).map((_, i) => (
            <div
              key={i}
              style={{
                display: "grid",
                gridTemplateColumns: "1fr 1fr 1fr auto",
                gap: 12,
                padding: "16px 18px",
                background: "var(--u-surface-2)",
                border: "1px solid var(--u-rule)",
                borderRadius: "var(--u-r-2)",
              }}
            >
              <div style={{ height: 14, background: "var(--u-rule)", borderRadius: 4 }} />
              <div style={{ height: 14, background: "var(--u-rule)", borderRadius: 4 }} />
              <div style={{ height: 14, background: "var(--u-rule)", borderRadius: 4 }} />
              <div style={{ height: 24, width: 72, background: "var(--u-rule-2)", borderRadius: 999 }} />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
