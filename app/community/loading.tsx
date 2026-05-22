export default function CommunityLoading() {
  return (
    <div style={{ maxWidth: 720, margin: "0 auto", padding: "24px 16px 48px" }}>
      <div className="u-skeleton" style={{ height: 40, width: 180, marginBottom: 20 }} />
      <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i} className="u-skeleton" style={{ height: 160, borderRadius: "var(--u-r-3)" }} />
        ))}
      </div>
    </div>
  );
}
