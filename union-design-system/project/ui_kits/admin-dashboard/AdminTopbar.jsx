// Admin topbar — page title + search
function AdminTopbar({ title, subtitle, action }) {
  return (
    <div style={{
      padding: "24px 36px", borderBottom: "1px solid var(--u-rule)",
      background: "var(--u-bg)", display: "flex", justifyContent: "space-between", alignItems: "flex-end",
    }}>
      <div>
        <div className="u-eyebrow">{subtitle}</div>
        <h1 style={{ font: "var(--u-display)", fontWeight: 700, fontSize: 40, letterSpacing: "-0.02em", margin: "8px 0 0" }}>{title}</h1>
      </div>
      <div style={{ display: "flex", gap: 10, alignItems: "center" }}>
        <div style={{
          display: "flex", alignItems: "center", gap: 8,
          background: "var(--u-surface-2)", border: "1px solid var(--u-rule-2)",
          padding: "8px 12px", borderRadius: "var(--u-r-2)", minWidth: 240,
        }}>
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6"><circle cx="11" cy="11" r="7"/><path d="M20 20l-3-3"/></svg>
          <input placeholder="Хайх…" style={{ border: "none", outline: "none", background: "transparent", font: "var(--u-body-s)", flex: 1, color: "var(--u-ink)" }}/>
          <span style={{ font: "var(--u-mono)", fontSize: 10, color: "var(--u-ink-3)", padding: "2px 6px", border: "1px solid var(--u-rule-2)", borderRadius: 4 }}>⌘K</span>
        </div>
        {action}
      </div>
    </div>
  );
}

window.AdminTopbar = AdminTopbar;
