// Coaching strip — available 1:1 slots
function CoachingStrip() {
  const slots = [
    { day: "Лха.", date: "16", month: "5-р сар", time: "10:00 — 11:00", price: "150,000₮" },
    { day: "Лха.", date: "16", month: "5-р сар", time: "14:00 — 15:00", price: "150,000₮" },
    { day: "Бя.", date: "18", month: "5-р сар", time: "09:00 — 10:00", price: "150,000₮" },
    { day: "Лха.", date: "23", month: "5-р сар", time: "11:00 — 12:00", price: "150,000₮" },
  ];
  return (
    <section id="coaching" style={{ background: "var(--u-ink)", color: "var(--u-dark-ink)" }}>
      <div style={{ maxWidth: 1240, margin: "0 auto", padding: "80px 32px" }}>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 60, marginBottom: 40, alignItems: "end" }}>
          <div>
            <div className="u-eyebrow" style={{ color: "var(--u-dark-ink-2)" }}>1:1 коучинг</div>
            <h2 style={{
              font: "var(--u-display)", fontWeight: 700,
              fontSize: "clamp(40px, 5vw, 64px)", lineHeight: 1.02,
              letterSpacing: "-0.02em", margin: "12px 0 0",
            }}>Нээлттэй цаг.<br/>
              <span style={{ fontWeight: 300, color: "var(--u-dark-ink-2)" }}>сонгож захиал.</span>
            </h2>
          </div>
          <p style={{ font: "var(--u-body-l)", color: "var(--u-dark-ink-2)", maxWidth: 420, margin: 0 }}>
            1 цагийн ганцаарчилсан уулзалт. Зөвлөгөө, оношилгоо, эсвэл зүгээр л сонсох — таны сонголтоор.
          </p>
        </div>

        <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 16 }}>
          {slots.map((s, i) => (
            <a key={i} href="#" style={{
              background: "var(--u-dark-2)", borderRadius: "var(--u-r-3)",
              padding: 24, textDecoration: "none", color: "inherit",
              border: "1px solid var(--u-dark-rule)", display: "block",
            }}>
              <div style={{ display: "flex", alignItems: "baseline", gap: 8, marginBottom: 24 }}>
                <span style={{ font: "var(--u-display)", fontWeight: 700, fontSize: 56, lineHeight: 1, color: "var(--u-dark-ink)", letterSpacing: "-0.02em" }}>{s.date}</span>
                <div style={{ display: "flex", flexDirection: "column" }}>
                  <span style={{ font: "var(--u-body-s)", color: "var(--u-dark-ink-2)" }}>{s.month}</span>
                  <span style={{ font: "var(--u-body-s)", color: "var(--u-dark-ink)", fontWeight: 600 }}>{s.day}</span>
                </div>
              </div>
              <div style={{ font: "var(--u-body), color: var(--u-dark-ink)", color: "var(--u-dark-ink)", fontWeight: 500 }}>{s.time}</div>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginTop: 16, paddingTop: 16, borderTop: "1px solid var(--u-dark-rule)" }}>
                <span style={{ font: "var(--u-body-s)", color: "var(--u-dark-ink-2)" }}>{s.price}</span>
                <span style={{ color: "var(--u-ember)", fontSize: 13, fontWeight: 500 }}>Захиалах →</span>
              </div>
            </a>
          ))}
        </div>
      </div>
    </section>
  );
}

window.CoachingStrip = CoachingStrip;
