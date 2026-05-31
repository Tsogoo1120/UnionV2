// Coaching slots view + new-slot drawer
function SlotsView() {
  const [draw, setDraw] = React.useState(false);
  const slots = [
    { date: "16", month: "5-р сар", day: "Лха.", time: "10:00 — 11:00", state: "available" },
    { date: "16", month: "5-р сар", day: "Лха.", time: "14:00 — 15:00", state: "pending" },
    { date: "18", month: "5-р сар", day: "Бя.", time: "09:00 — 10:00", state: "available" },
    { date: "23", month: "5-р сар", day: "Лха.", time: "11:00 — 12:00", state: "booked" },
    { date: "24", month: "5-р сар", day: "Ня.", time: "15:00 — 16:00", state: "available" },
  ];
  return (
    <div style={{ position: "relative" }}>
      <div style={{ display: "flex", justifyContent: "flex-end", marginBottom: 16 }}>
        <button onClick={() => setDraw(true)} style={{
          background: "var(--u-ink)", color: "var(--u-bg)", border: "none",
          font: "var(--u-body-s)", fontWeight: 500,
          padding: "10px 16px", borderRadius: "var(--u-r-2)", cursor: "pointer",
          display: "inline-flex", gap: 6, alignItems: "center",
        }}>+ Шинэ цаг</button>
      </div>
      <div style={{ background: "var(--u-surface-2)", border: "1px solid var(--u-rule)", borderRadius: "var(--u-r-3)", overflow: "hidden" }}>
        <div style={{ display: "grid", gridTemplateColumns: "100px 1.4fr 1fr 1fr 120px", padding: "10px 22px", background: "var(--u-surface)", borderBottom: "1px solid var(--u-rule)", font: "var(--u-label)", letterSpacing: ".12em", textTransform: "uppercase", color: "var(--u-ink-3)" }}>
          <div>Огноо</div><div>Цаг</div><div>Үнэ</div><div>Статус</div><div></div>
        </div>
        {slots.map((s, i) => (
          <div key={i} style={{ display: "grid", gridTemplateColumns: "100px 1.4fr 1fr 1fr 120px", padding: "16px 22px", borderTop: i === 0 ? "none" : "1px solid var(--u-rule)", alignItems: "center" }}>
            <div style={{ display: "flex", alignItems: "baseline", gap: 6 }}>
              <span style={{ font: "var(--u-display)", fontWeight: 700, fontSize: 28, lineHeight: 1, letterSpacing: "-0.02em" }}>{s.date}</span>
              <span style={{ font: "var(--u-body-s)", color: "var(--u-ink-3)" }}>{s.day}</span>
            </div>
            <div>
              <div style={{ font: "var(--u-h4)" }}>{s.time}</div>
              <div style={{ font: "var(--u-body-s)", color: "var(--u-ink-3)" }}>{s.month} · Улаанбаатарын цаг</div>
            </div>
            <div style={{ fontFamily: "var(--u-mono)" }}>150,000 ₮</div>
            <div>
              {s.state === "available" && <span style={{ background: "var(--u-success-soft)", color: "var(--u-success)", padding: "2px 10px", borderRadius: 999, fontWeight: 500, font: "var(--u-body-s)" }}>Available</span>}
              {s.state === "pending"   && <span style={{ background: "var(--u-warn-soft)", color: "#7A4F00", padding: "2px 10px", borderRadius: 999, fontWeight: 500, font: "var(--u-body-s)" }}>Pending</span>}
              {s.state === "booked"    && <span style={{ background: "var(--u-rule)", color: "var(--u-ink-2)", padding: "2px 10px", borderRadius: 999, fontWeight: 500, font: "var(--u-body-s)" }}>Booked</span>}
            </div>
            <div style={{ textAlign: "right" }}>
              <button style={{ background: "transparent", border: "1px solid var(--u-rule-2)", padding: "6px 12px", borderRadius: "var(--u-r-1)", font: "var(--u-body-s)", color: "var(--u-ink-2)", cursor: "pointer" }}>Засах</button>
            </div>
          </div>
        ))}
      </div>

      {draw && (
        <div onClick={() => setDraw(false)} style={{ position: "fixed", inset: 0, background: "rgba(20,17,13,.32)", zIndex: 50 }}>
          <div onClick={(e) => e.stopPropagation()} style={{
            position: "absolute", top: 0, right: 0, height: "100%", width: 440,
            background: "var(--u-surface)", borderLeft: "1px solid var(--u-rule)",
            boxShadow: "var(--u-shadow-3)", padding: 32,
            display: "flex", flexDirection: "column", gap: 16,
          }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <div className="u-eyebrow">Шинэ коучингын цаг</div>
              <button onClick={() => setDraw(false)} style={{ background: "transparent", border: "none", cursor: "pointer", fontSize: 22, color: "var(--u-ink-3)" }}>×</button>
            </div>
            <h3 style={{ font: "var(--u-display)", fontWeight: 700, fontSize: 32, letterSpacing: "-0.015em", margin: 0 }}>Нээлттэй цаг<br/><span style={{ fontWeight: 300, color: "var(--u-ink-2)" }}>үүсгэх.</span></h3>
            <Field label="Огноо" value="2026.05.16"/>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
              <Field label="Эхлэх" value="10:00"/>
              <Field label="Дуусах" value="11:00"/>
            </div>
            <Field label="Үнэ (MNT)" value="150,000"/>
            <Field label="Тайлбар" value="1:1 уулзалт · онлайн" multi/>
            <div style={{ marginTop: "auto", display: "flex", gap: 10 }}>
              <button onClick={() => setDraw(false)} style={{ flex: 1, background: "transparent", border: "1px solid var(--u-rule-2)", color: "var(--u-ink-2)", font: "var(--u-body-s)", fontWeight: 500, padding: "12px", borderRadius: "var(--u-r-2)", cursor: "pointer" }}>Хүчингүй</button>
              <button style={{ flex: 1, background: "var(--u-ink)", color: "var(--u-bg)", border: "none", font: "var(--u-body-s)", fontWeight: 500, padding: "12px", borderRadius: "var(--u-r-2)", cursor: "pointer" }}>Нийтлэх</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function Field({ label, value, multi }) {
  return (
    <label style={{ display: "flex", flexDirection: "column", gap: 4 }}>
      <span className="u-eyebrow" style={{ letterSpacing: ".10em" }}>{label}</span>
      {multi ? (
        <textarea defaultValue={value} style={{ background: "var(--u-surface-2)", border: "1px solid var(--u-rule-2)", borderRadius: "var(--u-r-2)", padding: "10px 14px", font: "var(--u-body)", color: "var(--u-ink)", resize: "vertical", outline: "none" }} rows={2}/>
      ) : (
        <input defaultValue={value} style={{ background: "var(--u-surface-2)", border: "1px solid var(--u-rule-2)", borderRadius: "var(--u-r-2)", padding: "10px 14px", font: "var(--u-body)", color: "var(--u-ink)", outline: "none" }}/>
      )}
    </label>
  );
}

window.SlotsView = SlotsView;
