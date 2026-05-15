export default function AdminDashboardLoading() {
  return (
    <div style={{ display: "flex", minHeight: "100vh", background: "var(--u-bg)" }}>
      <div
        style={{
          width: 232,
          flexShrink: 0,
          background: "var(--u-indigo)",
          opacity: 0.35,
        }}
      />
      <div style={{ flex: 1, padding: "32px 28px" }}>
        <div style={{ height: 36, width: 280, background: "var(--u-rule-2)", borderRadius: 8, marginBottom: 24 }} />
        <div style={{ display: "grid", gridTemplateColumns: "repeat(4, minmax(0, 1fr))", gap: 16, marginBottom: 28 }}>
          {Array.from({ length: 4 }).map((_, i) => (
            <div
              key={i}
              style={{
                height: 110,
                background: "var(--u-surface-2)",
                border: "1px solid var(--u-rule)",
                borderRadius: "var(--u-r-3)",
              }}
            />
          ))}
        </div>
        <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
          {Array.from({ length: 10 }).map((_, i) => (
            <div
              key={i}
              style={{
                height: 44,
                background: "var(--u-surface-2)",
                border: "1px solid var(--u-rule)",
                borderRadius: "var(--u-r-2)",
              }}
            />
          ))}
        </div>
      </div>
    </div>
  );
}
