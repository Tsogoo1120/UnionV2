// Dark footer
function Footer() {
  return (
    <footer style={{ background: "var(--u-ink)", color: "var(--u-dark-ink)", marginTop: 80 }}>
      <div style={{ maxWidth: 1240, margin: "0 auto", padding: "80px 32px 40px" }}>
        <div style={{ display: "grid", gridTemplateColumns: "1.6fr 1fr 1fr 1fr", gap: 40, alignItems: "start" }}>
          <div>
            <div style={{ display: "flex", alignItems: "baseline" }}>
              <span style={{ font: "var(--u-display)", fontWeight: 700, fontSize: 56, letterSpacing: "-0.04em" }}>Union</span>
              <span style={{ color: "var(--u-ember)", fontSize: 56, fontWeight: 700, marginLeft: 1, lineHeight: 1 }}>.</span>
            </div>
            <p style={{ font: "var(--u-body-l)", color: "var(--u-dark-ink-2)", marginTop: 20, maxWidth: 360 }}>
              Сэтгэл судлал, бичих дасгал, нийгмийн нэгдэлд зориулсан суурь платформ.
            </p>
          </div>
          {[
            { h: "Үйлчилгээ", l: ["Видео хичээл", "Хамтын уншилт", "Нийгэмлэг", "Тест", "Нийтлэл"] },
            { h: "Юнион", l: ["Тухай", "Холбоо барих", "Нууцлал", "Үйлчилгээний нөхцөл"] },
            { h: "Холбоос", l: ["Instagram", "Facebook", "YouTube", "Spotify"] },
          ].map((c, i) => (
            <div key={i}>
              <div className="u-eyebrow" style={{ color: "var(--u-dark-ink-2)", marginBottom: 16 }}>{c.h}</div>
              <ul style={{ listStyle: "none", padding: 0, margin: 0, display: "flex", flexDirection: "column", gap: 10 }}>
                {c.l.map((x) => (
                  <li key={x}><a href="#" style={{ color: "var(--u-dark-ink)", textDecoration: "none", font: "var(--u-body)" }}>{x}</a></li>
                ))}
              </ul>
            </div>
          ))}
        </div>
        <div style={{
          marginTop: 80, paddingTop: 24, borderTop: "1px solid var(--u-dark-rule)",
          display: "flex", justifyContent: "space-between", color: "var(--u-dark-ink-2)", font: "var(--u-body-s)",
        }}>
          <span>© 2026 Union · Улаанбаатар</span>
          <span>Сар бүрийн гишүүнчлэл · 50,000₮</span>
        </div>
      </div>
    </footer>
  );
}

window.Footer = Footer;
