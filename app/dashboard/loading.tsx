export default function DashboardLoading() {
  return (
    <div
      style={{
        maxWidth: 1240,
        margin: "0 auto",
        padding: "40px 16px 100px",
        display: "flex",
        flexDirection: "column",
        gap: 24,
      }}
    >
      <div className="u-skeleton" style={{ height: 120, borderRadius: "var(--u-r-3)" }} />
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(2, 1fr)",
          gap: 12,
        }}
      >
        {Array.from({ length: 5 }).map((_, i) => (
          <div
            key={i}
            className="u-skeleton"
            style={{
              height: 140,
              borderRadius: "var(--u-r-3)",
              gridColumn: i === 4 ? "1 / -1" : undefined,
            }}
          />
        ))}
      </div>
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(200px, 1fr))", gap: 16 }}>
        {Array.from({ length: 3 }).map((_, i) => (
          <div key={i} className="u-skeleton" style={{ height: 220, borderRadius: "var(--u-r-3)" }} />
        ))}
      </div>
    </div>
  );
}
