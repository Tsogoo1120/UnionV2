// 5-service hub tiles
function ServiceHub({ setTab }) {
  const services = [
    { n: "01", id: "lessons", title: "Видео хичээл", meta: "24 хичээл", inverted: false },
    { n: "02", id: "readings", title: "Хамтын уншилт", meta: "Шинэ · 7 хоног", inverted: true },
    { n: "03", id: "community", title: "Нийгэмлэг", meta: "● 3 шинэ", emberMeta: true },
    { n: "04", id: "tests", title: "Тест", meta: "6 ажил" },
    { n: "05", id: "articles", title: "Нийтлэл", meta: "12 эссэ" },
  ];
  return (
    <section>
      <div style={{ display: "flex", alignItems: "baseline", justifyContent: "space-between", marginBottom: 20 }}>
        <h2 style={{ font: "var(--u-display)", fontWeight: 700, fontSize: 48, letterSpacing: "-0.02em", margin: 0 }}>
          Сайн уу,<br/><span style={{ fontWeight: 300, color: "var(--u-ink-2)", whiteSpace: "nowrap" }}>Алтан&#8209;Оч.</span>
        </h2>
        <div style={{ font: "var(--u-body-s)", color: "var(--u-ink-3)" }}>2026 оны 5-р сарын 15</div>
      </div>
      <div style={{ display: "grid", gridTemplateColumns: "repeat(5, 1fr)", gap: 12 }}>
        {services.map(s => (
          <a key={s.n} href="#"
             onClick={(e) => { e.preventDefault(); s.id === "lessons" && setTab?.("lessons"); }}
             style={{
            textDecoration: "none", color: "inherit",
            background: s.inverted ? "var(--u-ink)" : "var(--u-surface-2)",
            border: s.inverted ? "none" : "1px solid var(--u-rule)",
            borderRadius: "var(--u-r-3)", padding: "20px 22px",
            display: "flex", flexDirection: "column", gap: 12, minHeight: 180,
          }}>
            <div style={{ font: "var(--u-mono)", fontSize: 11, color: s.inverted ? "var(--u-dark-ink-2)" : "var(--u-ink-3)" }}>{s.n} / 05</div>
            <div style={{
              font: "var(--u-display)", fontWeight: 700, fontSize: 30, letterSpacing: "-0.015em", lineHeight: 1.02,
              color: s.inverted ? "var(--u-dark-ink)" : "var(--u-ink)", flex: 1,
            }}>{s.title}</div>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <span style={{
                font: "var(--u-body-s)",
                color: s.emberMeta ? "var(--u-ember)" : (s.inverted ? "var(--u-dark-ink-2)" : "var(--u-ink-3)"),
                fontWeight: s.emberMeta ? 500 : 400,
              }}>{s.meta}</span>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none"
                   stroke={s.inverted ? "var(--u-dark-ink)" : "currentColor"} strokeWidth="1.5"><path d="M7 17L17 7M10 7h7v7"/></svg>
            </div>
          </a>
        ))}
      </div>
    </section>
  );
}

window.ServiceHub = ServiceHub;
