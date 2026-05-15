// Coaching list inside dashboard
function CoachingList() {
  const slots = [
    { id: 1, day: "Лха.", date: "16", month: "5-р сар", time: "10:00 — 11:00", state: "available" },
    { id: 2, day: "Лха.", date: "16", month: "5-р сар", time: "14:00 — 15:00", state: "available" },
    { id: 3, day: "Бя.", date: "18", month: "5-р сар", time: "09:00 — 10:00", state: "pending" },
    { id: 4, day: "Лха.", date: "23", month: "5-р сар", time: "11:00 — 12:00", state: "available" },
    { id: 5, day: "Ня.", date: "24", month: "5-р сар", time: "15:00 — 16:00", state: "booked" },
  ];
  const stateChip = {
    available: { bg: "transparent", fg: "var(--u-ember)", txt: "Захиалах →" },
    pending:   { bg: "var(--u-warn-soft)", fg: "#7A4F00", txt: "Хүлээгдэж буй" },
    booked:    { bg: "var(--u-rule)", fg: "var(--u-ink-3)", txt: "Захиалагдсан" },
  };
  return (
    <section>
      <div style={{ marginBottom: 28 }}>
        <div className="u-eyebrow">1:1 коучинг</div>
        <h2 style={{ font: "var(--u-display)", fontWeight: 700, fontSize: 56, letterSpacing: "-0.02em", margin: "8px 0 0" }}>
          Нээлттэй цаг<span style={{ color: "var(--u-ember)" }}>.</span>
        </h2>
      </div>
      <div style={{ border: "1px solid var(--u-rule)", borderRadius: "var(--u-r-3)", background: "var(--u-surface-2)", overflow: "hidden" }}>
        {slots.map((s, i) => {
          const c = stateChip[s.state];
          return (
            <div key={s.id} style={{
              display: "grid", gridTemplateColumns: "80px 1.5fr 1.4fr 1fr 160px",
              alignItems: "center", padding: "20px 28px",
              borderTop: i === 0 ? "none" : "1px solid var(--u-rule)",
              opacity: s.state === "booked" ? .55 : 1,
            }}>
              <div style={{ font: "var(--u-display)", fontWeight: 700, fontSize: 40, lineHeight: 1, letterSpacing: "-0.02em" }}>{s.date}</div>
              <div>
                <div style={{ font: "var(--u-body-s)", color: "var(--u-ink-3)" }}>{s.month} · {s.day}</div>
                <div style={{ font: "var(--u-h4)", marginTop: 2 }}>{s.time}</div>
              </div>
              <div style={{ font: "var(--u-body), color: var(--u-ink-2)", color: "var(--u-ink-2)" }}>1 цагийн уулзалт · онлайн</div>
              <div style={{ font: "var(--u-mono)", color: "var(--u-ink-2)" }}>150,000 ₮</div>
              <div style={{ textAlign: "right" }}>
                <span style={{
                  display: "inline-flex", alignItems: "center",
                  background: c.bg, color: c.fg,
                  font: "var(--u-body-s)", fontWeight: 500,
                  padding: "8px 14px", borderRadius: "var(--u-r-pill)",
                  border: s.state === "available" ? "1px solid var(--u-rule-2)" : "none",
                }}>{c.txt}</span>
              </div>
            </div>
          );
        })}
      </div>
    </section>
  );
}

window.CoachingList = CoachingList;
