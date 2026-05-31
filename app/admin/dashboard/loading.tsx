export default function AdminDashboardLoading() {
  return (
    <div className="u-admin-shell">
      <div
        className="u-admin-sidebar"
        style={{
          background: "var(--u-indigo)",
          opacity: 0.35,
        }}
      />
      <div style={{ flex: 1, display: "flex", flexDirection: "column", minWidth: 0 }}>
        <div style={{ padding: "16px 20px", borderBottom: "1px solid var(--u-rule)" }}>
          <div className="u-skeleton" style={{ height: 12, width: 120, marginBottom: 10 }} />
          <div className="u-skeleton" style={{ height: 34, width: 240 }} />
        </div>
        <div className="u-admin-main">
          <div className="u-admin-scroll-x" style={{ marginBottom: 28 }}>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(4, minmax(150px, 1fr))", gap: 16 }}>
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
          </div>
          <div
            style={{
              border: "1px solid var(--u-rule)",
              borderRadius: "var(--u-r-3)",
              overflow: "hidden",
            }}
          >
            {Array.from({ length: 8 }).map((_, i) => (
              <div
                key={i}
                style={{
                  height: 56,
                  borderTop: i === 0 ? "none" : "1px solid var(--u-rule)",
                  background: "var(--u-surface-2)",
                }}
              />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
