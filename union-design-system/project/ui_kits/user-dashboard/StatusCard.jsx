// Subscription status card
function StatusCard({ days = 24 }) {
  return (
    <section style={{
      background: "var(--u-surface-2)", border: "1px solid var(--u-rule)",
      borderRadius: "var(--u-r-3)", padding: "28px 32px",
      display: "grid", gridTemplateColumns: "1.4fr 1fr 1fr 180px", gap: 32, alignItems: "center",
    }}>
      <div>
        <div className="u-eyebrow">Гишүүнчлэл</div>
        <div style={{ font: "var(--u-display)", fontWeight: 700, fontSize: 32, letterSpacing: "-0.015em", marginTop: 6 }}>
          Идэвхтэй · <span style={{ fontWeight: 300, color: "var(--u-ink-2)" }}>{days} өдөр үлдсэн</span>
        </div>
      </div>
      <div>
        <div className="u-eyebrow">Дараагийн төлбөр</div>
        <div style={{ font: "var(--u-h3)", marginTop: 6 }}>2026.06.09</div>
      </div>
      <div>
        <div className="u-eyebrow">Дүн</div>
        <div style={{ font: "var(--u-h3)", marginTop: 6, fontFamily: "var(--u-mono)" }}>50,000 ₮</div>
      </div>
      <a href="#" style={{
        background: "var(--u-ink)", color: "var(--u-bg)", padding: "12px 18px",
        textAlign: "center", borderRadius: "var(--u-r-2)", textDecoration: "none",
        font: "var(--u-body-s)", fontWeight: 500,
      }}>Сунгах</a>
    </section>
  );
}

window.StatusCard = StatusCard;
