// Profile / billing screen
function ProfileScreen() {
  const history = [
    { date: "2026.05.09", ref: "GLM-784521", amt: "50,000 ₮", state: "Approved" },
    { date: "2026.04.09", ref: "GLM-731118", amt: "50,000 ₮", state: "Approved" },
    { date: "2026.03.11", ref: "GLM-687234", amt: "50,000 ₮", state: "Approved" },
  ];
  return (
    <section>
      <div className="u-eyebrow">Профайл</div>
      <h2 style={{ font: "var(--u-display)", fontWeight: 700, fontSize: 56, letterSpacing: "-0.02em", margin: "8px 0 32px" }}>
        Алтан-Оч <span style={{ fontWeight: 300, color: "var(--u-ink-2)" }}>· altanoch@gmail.com</span>
      </h2>

      <div style={{ display: "grid", gridTemplateColumns: "1.6fr 1fr", gap: 24 }}>
        <div style={{ background: "var(--u-surface-2)", border: "1px solid var(--u-rule)", borderRadius: "var(--u-r-3)", overflow: "hidden" }}>
          <div style={{ padding: "20px 28px", borderBottom: "1px solid var(--u-rule)", display: "flex", justifyContent: "space-between", alignItems: "baseline" }}>
            <div style={{ font: "var(--u-h3)" }}>Төлбөрийн түүх</div>
            <span style={{ font: "var(--u-body-s)", color: "var(--u-ink-3)" }}>Сүүлийн 3 сар</span>
          </div>
          {history.map((h, i) => (
            <div key={i} style={{ display: "grid", gridTemplateColumns: "1.2fr 1.4fr 1fr 1fr", padding: "16px 28px", borderTop: i === 0 ? "none" : "1px solid var(--u-rule)", alignItems: "center", font: "var(--u-body-s)" }}>
              <span>{h.date}</span>
              <span style={{ fontFamily: "var(--u-mono)", color: "var(--u-ink-2)" }}>{h.ref}</span>
              <span style={{ fontFamily: "var(--u-mono)" }}>{h.amt}</span>
              <span style={{ textAlign: "right" }}>
                <span style={{ background: "var(--u-success-soft)", color: "var(--u-success)", padding: "3px 10px", borderRadius: 999, fontWeight: 500 }}>{h.state}</span>
              </span>
            </div>
          ))}
        </div>

        <div style={{ background: "var(--u-surface-2)", border: "1px solid var(--u-rule)", borderRadius: "var(--u-r-3)", padding: 28, display: "flex", flexDirection: "column", gap: 18 }}>
          <div className="u-eyebrow">Тохиргоо</div>
          <Toggle label="И-мэйл сануулга" defaultOn />
          <Toggle label="Шинэ нийтлэлийн мэдэгдэл" defaultOn />
          <Toggle label="Коучингын сануулга" />
          <button style={{
            marginTop: 12, background: "transparent", border: "1px solid var(--u-rule-2)",
            color: "var(--u-danger)", font: "var(--u-body-s)", fontWeight: 500,
            padding: "12px 16px", borderRadius: "var(--u-r-2)", cursor: "pointer",
          }}>Гарах</button>
        </div>
      </div>
    </section>
  );
}

function Toggle({ label, defaultOn }) {
  const [on, setOn] = React.useState(!!defaultOn);
  return (
    <label style={{ display: "flex", justifyContent: "space-between", alignItems: "center", cursor: "pointer" }}>
      <span style={{ font: "var(--u-body)", color: "var(--u-ink)" }}>{label}</span>
      <span onClick={() => setOn(v => !v)} style={{
        width: 38, height: 22, borderRadius: 999, background: on ? "var(--u-ink)" : "var(--u-rule-2)",
        position: "relative", transition: "background 160ms",
      }}>
        <span style={{ position: "absolute", top: 2, left: on ? 18 : 2, width: 18, height: 18, borderRadius: 999, background: "var(--u-bg)", transition: "left 160ms" }}/>
      </span>
    </label>
  );
}

window.ProfileScreen = ProfileScreen;
