// Admin sidebar — indigo
function AdminNav({ tab, setTab }) {
  const sections = [
    { h: "Хяналт", items: [
      { id: "overview", label: "Тойм", n: 0 },
      { id: "payments", label: "Төлбөр", n: 4 },
    ]},
    { h: "Коучинг", items: [
      { id: "slots", label: "Цаг хуваарь", n: 0 },
      { id: "bookings", label: "Захиалга", n: 2 },
    ]},
    { h: "Контент", items: [
      { id: "lessons", label: "Видео хичээл", n: 0 },
      { id: "readings", label: "Хамтын уншилт", n: 0 },
      { id: "articles", label: "Нийтлэл", n: 0 },
      { id: "tests", label: "Тест", n: 0 },
      { id: "community", label: "Нийгэмлэг", n: 1 },
    ]},
    { h: "Систем", items: [
      { id: "users", label: "Хэрэглэгчид", n: 0 },
    ]},
  ];
  return (
    <aside style={{
      width: 232, background: "var(--u-indigo)", color: "var(--u-indigo-ink)",
      position: "sticky", top: 0, height: "100vh", display: "flex", flexDirection: "column",
    }}>
      <div style={{ padding: "20px 22px 28px", borderBottom: "1px solid rgba(255,255,255,.08)" }}>
        <div style={{ display: "flex", alignItems: "baseline" }}>
          <span style={{ font: "var(--u-display)", fontWeight: 700, fontSize: 22, letterSpacing: "-0.04em", color: "var(--u-indigo-ink)" }}>Union</span>
          <span style={{ color: "var(--u-ember)", fontSize: 22, fontWeight: 700 }}>.</span>
        </div>
        <div style={{ font: "var(--u-mono)", fontSize: 11, color: "rgba(242,238,227,.55)", marginTop: 4, letterSpacing: ".06em" }}>ADMIN · v2</div>
      </div>
      <nav style={{ padding: "16px 12px", display: "flex", flexDirection: "column", gap: 18, flex: 1, overflow: "auto" }}>
        {sections.map(sec => (
          <div key={sec.h}>
            <div style={{
              font: "var(--u-label)", letterSpacing: ".14em", textTransform: "uppercase",
              color: "rgba(242,238,227,.45)", padding: "0 10px 8px",
            }}>{sec.h}</div>
            {sec.items.map(it => {
              const active = tab === it.id;
              return (
                <button key={it.id} onClick={() => setTab(it.id)} style={{
                  width: "100%", textAlign: "left",
                  background: active ? "rgba(255,255,255,.10)" : "transparent",
                  color: active ? "var(--u-indigo-ink)" : "rgba(242,238,227,.78)",
                  border: "none", cursor: "pointer",
                  font: "var(--u-body)", fontWeight: active ? 500 : 400,
                  padding: "8px 10px", borderRadius: "var(--u-r-2)",
                  display: "flex", justifyContent: "space-between", alignItems: "center",
                }}>
                  <span>{it.label}</span>
                  {it.n > 0 && <span style={{
                    background: "var(--u-ember)", color: "var(--u-ember-ink)",
                    font: "var(--u-mono)", fontSize: 10, fontWeight: 600,
                    padding: "1px 7px", borderRadius: 999,
                  }}>{it.n}</span>}
                </button>
              );
            })}
          </div>
        ))}
      </nav>
      <div style={{ padding: "16px 22px", borderTop: "1px solid rgba(255,255,255,.08)", display: "flex", gap: 10, alignItems: "center" }}>
        <div style={{ width: 28, height: 28, borderRadius: 999, background: "#D4B98C", display: "flex", alignItems: "center", justifyContent: "center", font: "var(--u-body-s)", fontWeight: 600, color: "var(--u-ink)" }}>A</div>
        <div>
          <div style={{ font: "var(--u-body-s)", fontWeight: 500, color: "var(--u-indigo-ink)" }}>altancog</div>
          <div style={{ font: "var(--u-mono)", fontSize: 10, color: "rgba(242,238,227,.55)" }}>admin</div>
        </div>
      </div>
    </aside>
  );
}

window.AdminNav = AdminNav;
