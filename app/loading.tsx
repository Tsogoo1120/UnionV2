export default function RootLoading() {
  return (
    <div
      style={{
        minHeight: "100vh",
        background: "var(--u-bg)",
        padding: "24px 20px 48px",
        boxSizing: "border-box",
      }}
    >
      <div style={{ maxWidth: 1240, margin: "0 auto", display: "flex", flexDirection: "column", gap: 20 }}>
        <div
          style={{
            height: 48,
            maxWidth: 200,
            borderRadius: "var(--u-r-2)",
            background: "linear-gradient(90deg, var(--u-rule-2), var(--u-rule), var(--u-rule-2))",
            backgroundSize: "200% 100%",
            animation: "u-shimmer 1.2s ease-in-out infinite",
          }}
        />
        <div
          style={{
            height: 56,
            maxWidth: "min(100%, 720px)",
            borderRadius: "var(--u-r-2)",
            background: "linear-gradient(90deg, var(--u-rule-2), var(--u-rule), var(--u-rule-2))",
            backgroundSize: "200% 100%",
            animation: "u-shimmer 1.2s ease-in-out infinite",
          }}
        />
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fill, minmax(160px, 1fr))",
            gap: 16,
          }}
        >
          {Array.from({ length: 6 }).map((_, i) => (
            <div
              key={i}
              style={{
                height: 140,
                borderRadius: "var(--u-r-3)",
                border: "1px solid var(--u-rule)",
                background: "var(--u-surface-2)",
                opacity: 0.85,
              }}
            />
          ))}
        </div>
      </div>
      <style>{`@keyframes u-shimmer { 0% { background-position: 100% 0; } 100% { background-position: -100% 0; } }`}</style>
    </div>
  );
}
