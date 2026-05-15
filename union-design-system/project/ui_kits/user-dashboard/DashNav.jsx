// Slim dashboard top chrome
function DashNav({ tab, setTab, days }) {
  const tabs = [
    { id: "hub", label: "Хяналт" },
    { id: "lessons", label: "Видео хичээл" },
    { id: "coaching", label: "Коучинг" },
    { id: "profile", label: "Профайл" },
  ];
  return (
    <header style={{
      position: "sticky", top: 0, zIndex: 10,
      background: "var(--u-surface)", borderBottom: "1px solid var(--u-rule)",
    }}>
      <div style={{ maxWidth: 1240, margin: "0 auto", padding: "12px 32px", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 24 }}>
          <a href="#" style={{ display: "flex", alignItems: "baseline", textDecoration: "none" }}>
            <span style={{ font: "var(--u-display)", fontWeight: 700, fontSize: 22, letterSpacing: "-0.04em", color: "var(--u-ink)" }}>Union</span>
            <span style={{ color: "var(--u-ember)", fontSize: 22, fontWeight: 700 }}>.</span>
          </a>
          <span style={{
            font: "var(--u-mono)", fontSize: 11, color: "var(--u-ink-3)",
            borderLeft: "1px solid var(--u-rule)", paddingLeft: 16,
          }}>Хяналтын самбар</span>
          <nav style={{ display: "flex", gap: 4, marginLeft: 16 }}>
            {tabs.map(t => (
              <button key={t.id} onClick={() => setTab(t.id)} style={{
                background: tab === t.id ? "var(--u-ink)" : "transparent",
                color: tab === t.id ? "var(--u-bg)" : "var(--u-ink-2)",
                border: "none", cursor: "pointer",
                font: "var(--u-body-s)", fontWeight: 500,
                padding: "8px 14px", borderRadius: "var(--u-r-pill)",
              }}>{t.label}</button>
            ))}
          </nav>
        </div>
        <div style={{ display: "flex", gap: 12, alignItems: "center" }}>
          <span style={{
            display: "inline-flex", alignItems: "center", gap: 6,
            background: "var(--u-success-soft)", color: "var(--u-success)",
            font: "var(--u-body-s)", fontWeight: 500,
            padding: "6px 12px", borderRadius: "var(--u-r-pill)",
          }}><span style={{ width: 6, height: 6, borderRadius: 999, background: "currentColor" }}/>Active · {days} days</span>
          <div style={{ width: 32, height: 32, borderRadius: 999, background: "#D4B98C", display: "flex", alignItems: "center", justifyContent: "center", font: "var(--u-body-s)", fontWeight: 600 }}>А</div>
        </div>
      </div>
    </header>
  );
}

window.DashNav = DashNav;
