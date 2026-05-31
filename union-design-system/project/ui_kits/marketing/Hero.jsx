// Hero — editorial serif headline + single CTA
function Hero() {
  return (
    <section style={{ maxWidth: 1240, margin: "0 auto", padding: "100px 32px 80px" }}>
      <div style={{
        font: "var(--u-label)", letterSpacing: ".16em", textTransform: "uppercase",
        color: "var(--u-ink-3)", display: "flex", gap: 14, alignItems: "center", marginBottom: 36,
      }}>
        <span>Vol. II · 2026</span>
        <span style={{ width: 24, height: 1, background: "var(--u-rule-2)" }} />
        <span>Сар бүрийн гишүүнчлэл</span>
      </div>

      <h1 style={{
        font: "var(--u-display)", fontWeight: 700,
        fontSize: "clamp(56px, 9vw, 132px)", lineHeight: 0.92,
        letterSpacing: "-0.035em", margin: 0, maxWidth: 1100,
      }}>
        Дотоод гэрэл,<br/>
        <span style={{ fontWeight: 300 }}>гадаад үйл.</span>
      </h1>

      <div style={{
        marginTop: 40, display: "grid",
        gridTemplateColumns: "1fr 1fr", gap: 60, alignItems: "end",
      }}>
        <p style={{ font: "var(--u-body-l)", color: "var(--u-ink-2)", maxWidth: 480, margin: 0 }}>
          Видео хичээл, хамтын уншилт, сэтгэл судлалын тест, эссэ, өөрийн нийгэмлэг.
          Нэг гишүүнчлэл — таван үйлчилгээ. Сард 50,000₮.
        </p>
        <div style={{ display: "flex", gap: 12, justifyContent: "flex-end" }}>
          <a href="#" style={{
            display: "inline-flex", alignItems: "center", gap: 10,
            background: "var(--u-ink)", color: "var(--u-bg)",
            padding: "16px 26px", borderRadius: "var(--u-r-2)",
            font: "var(--u-body)", fontWeight: 500, textDecoration: "none",
          }}>Гишүүн болох
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M5 12h14M13 6l6 6-6 6"/></svg>
          </a>
          <a href="#" style={{
            display: "inline-flex", alignItems: "center", gap: 10,
            background: "var(--u-surface-2)", color: "var(--u-ink)", border: "1px solid var(--u-rule-2)",
            padding: "16px 26px", borderRadius: "var(--u-r-2)",
            font: "var(--u-body)", fontWeight: 500, textDecoration: "none",
          }}>Үйлчилгээ үзэх</a>
        </div>
      </div>
    </section>
  );
}

window.Hero = Hero;
