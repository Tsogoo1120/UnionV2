// Payment approval queue with side preview
function PaymentsQueue() {
  const rows = [
    { id: 1, user: "Алтан-Оч", email: "altanoch@gmail.com", ref: "GLM-784521", amt: "50,000 ₮", time: "2 цаг өмнө", state: "pending" },
    { id: 2, user: "Цэцэгмаа Г.", email: "tsetseg@gmail.com", ref: "GLM-784518", amt: "50,000 ₮", time: "5 цаг өмнө", state: "pending" },
    { id: 3, user: "Болд Д.", email: "boldd@gmail.com", ref: "GLM-784511", amt: "50,000 ₮", time: "өчигдөр", state: "pending" },
    { id: 4, user: "Хулан О.", email: "hulan@gmail.com", ref: "GLM-784496", amt: "50,000 ₮", time: "өчигдөр", state: "pending" },
    { id: 5, user: "Энхтуяа Б.", email: "enkhtuya@gmail.com", ref: "GLM-784521", amt: "50,000 ₮", time: "өчигдөр", state: "approved" },
    { id: 6, user: "Сэлэнгэ Н.", email: "selenge@gmail.com", ref: "GLM-784492", amt: "50,000 ₮", time: "2 өдрийн өмнө", state: "denied" },
  ];
  const [sel, setSel] = React.useState(1);
  const cur = rows.find(r => r.id === sel);
  return (
    <div style={{ display: "grid", gridTemplateColumns: "1.4fr 1fr", gap: 24 }}>
      <div style={{ background: "var(--u-surface-2)", border: "1px solid var(--u-rule)", borderRadius: "var(--u-r-3)", overflow: "hidden" }}>
        <div style={{ display: "flex", gap: 4, padding: "10px 12px", borderBottom: "1px solid var(--u-rule)" }}>
          {[["Хүлээгдэж буй", 4, true], ["Зөвшөөрсөн", 132, false], ["Татгалзсан", 6, false]].map(([l, n, on]) => (
            <button key={l} style={{
              background: on ? "var(--u-ink)" : "transparent",
              color: on ? "var(--u-bg)" : "var(--u-ink-2)",
              border: "none", cursor: "pointer",
              font: "var(--u-body-s)", fontWeight: 500,
              padding: "8px 14px", borderRadius: "var(--u-r-pill)",
            }}>{l} · {n}</button>
          ))}
        </div>
        <div style={{ display: "grid", gridTemplateColumns: "1.6fr 1fr 1fr .8fr 1fr", padding: "10px 22px", background: "var(--u-surface)", borderBottom: "1px solid var(--u-rule)", font: "var(--u-label)", letterSpacing: ".12em", textTransform: "uppercase", color: "var(--u-ink-3)" }}>
          <div>Хэрэглэгч</div><div>Дүн</div><div>Лавлагаа</div><div>Статус</div><div>Огноо</div>
        </div>
        {rows.map(r => (
          <button key={r.id} onClick={() => setSel(r.id)} style={{
            width: "100%", textAlign: "left", border: "none", cursor: "pointer",
            display: "grid", gridTemplateColumns: "1.6fr 1fr 1fr .8fr 1fr",
            alignItems: "center", padding: "14px 22px",
            borderTop: "1px solid var(--u-rule)", font: "var(--u-body-s)",
            background: sel === r.id ? "var(--u-ember-soft)" : "var(--u-surface-2)",
          }}>
            <div style={{ display: "flex", gap: 10, alignItems: "center" }}>
              <div style={{ width: 26, height: 26, borderRadius: 999, background: "#A89F8E" }}/>
              <div><div style={{ fontWeight: 500, color: "var(--u-ink)" }}>{r.user}</div><div style={{ fontSize: 11, color: "var(--u-ink-3)" }}>{r.email}</div></div>
            </div>
            <div style={{ fontFamily: "var(--u-mono)" }}>{r.amt}</div>
            <div style={{ fontFamily: "var(--u-mono)", color: "var(--u-ink-2)" }}>{r.ref}</div>
            <div>
              {r.state === "pending"  && <span style={{ background: "var(--u-warn-soft)",   color: "#7A4F00",        padding: "2px 10px", borderRadius: 999, fontWeight: 500 }}>Pending</span>}
              {r.state === "approved" && <span style={{ background: "var(--u-success-soft)", color: "var(--u-success)", padding: "2px 10px", borderRadius: 999, fontWeight: 500 }}>Approved</span>}
              {r.state === "denied"   && <span style={{ background: "var(--u-danger-soft)",  color: "var(--u-danger)",  padding: "2px 10px", borderRadius: 999, fontWeight: 500 }}>Denied</span>}
            </div>
            <div style={{ color: "var(--u-ink-3)" }}>{r.time}</div>
          </button>
        ))}
      </div>

      {/* Preview panel */}
      <div style={{ background: "var(--u-surface-2)", border: "1px solid var(--u-rule)", borderRadius: "var(--u-r-3)", padding: 24, display: "flex", flexDirection: "column", gap: 16, position: "sticky", top: 24, height: "fit-content" }}>
        <div className="u-eyebrow">Шалгалт</div>
        <div>
          <div style={{ font: "var(--u-h3)" }}>{cur.user}</div>
          <div style={{ font: "var(--u-body-s)", color: "var(--u-ink-3)" }}>{cur.email}</div>
        </div>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
          <div><div className="u-eyebrow">Дүн</div><div style={{ font: "var(--u-h4)", fontFamily: "var(--u-mono)", marginTop: 4 }}>{cur.amt}</div></div>
          <div><div className="u-eyebrow">Лавлагаа</div><div style={{ font: "var(--u-h4)", fontFamily: "var(--u-mono)", marginTop: 4 }}>{cur.ref}</div></div>
        </div>
        <div>
          <div className="u-eyebrow" style={{ marginBottom: 6 }}>Дансны мэдээлэл</div>
          <div style={{ font: "var(--u-body-s)", color: "var(--u-ink-2)" }}>Голомт банк · 2705130475 · Юнион ХХК</div>
        </div>
        <div style={{
          aspectRatio: "4/3", background: "var(--u-bg)", borderRadius: "var(--u-r-2)",
          border: "1px dashed var(--u-rule-2)", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: 6,
        }}>
          <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="var(--u-ink-3)" strokeWidth="1.2"><rect x="3" y="3" width="18" height="18" rx="2"/><circle cx="9" cy="9" r="2"/><path d="M21 15l-5-5L5 21"/></svg>
          <div style={{ font: "var(--u-body-s)", color: "var(--u-ink-3)" }}>Дансны баримтын зураг</div>
          <div style={{ font: "var(--u-mono)", fontSize: 11, color: "var(--u-ink-4)" }}>screenshot-{cur.id}.jpg · 1 цагийн URL</div>
        </div>
        <textarea placeholder="Админ тэмдэглэл (хэрэв татгалзвал)" style={{
          background: "var(--u-surface)", border: "1px solid var(--u-rule-2)", borderRadius: "var(--u-r-2)",
          padding: "10px 14px", font: "var(--u-body)", color: "var(--u-ink)", resize: "vertical", minHeight: 64, outline: "none",
        }}/>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
          <button style={{ background: "var(--u-surface)", border: "1px solid var(--u-rule-2)", color: "var(--u-danger)", font: "var(--u-body-s)", fontWeight: 500, padding: "12px", borderRadius: "var(--u-r-2)", cursor: "pointer" }}>Татгалзах</button>
          <button style={{ background: "var(--u-ink)", color: "var(--u-bg)", border: "none", font: "var(--u-body-s)", fontWeight: 500, padding: "12px", borderRadius: "var(--u-r-2)", cursor: "pointer" }}>Зөвшөөрөх →</button>
        </div>
      </div>
    </div>
  );
}

window.PaymentsQueue = PaymentsQueue;
