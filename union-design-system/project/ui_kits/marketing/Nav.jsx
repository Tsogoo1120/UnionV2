// Marketing top nav
function Nav() {
  return (
    <header style={{
      position: "sticky", top: 0, zIndex: 10,
      background: "rgba(242,238,227,.85)",
      backdropFilter: "blur(10px)",
      borderBottom: "1px solid var(--u-rule)",
    }}>
      <div style={{
        maxWidth: 1240, margin: "0 auto", padding: "18px 32px",
        display: "flex", alignItems: "center", justifyContent: "space-between",
      }}>
        <a href="#" style={{ display: "flex", alignItems: "baseline", textDecoration: "none" }}>
          <span style={{ font: "var(--u-display)", fontWeight: 700, fontSize: 26, letterSpacing: "-0.04em", color: "var(--u-ink)" }}>Union</span>
          <span style={{ color: "var(--u-ember)", fontSize: 26, fontWeight: 700, marginLeft: 1 }}>.</span>
        </a>
        <nav style={{ display: "flex", gap: 28, font: "var(--u-body-s)", fontWeight: 500, color: "var(--u-ink-2)" }}>
          <a href="#services" style={{ color: "inherit", textDecoration: "none" }}>Үйлчилгээ</a>
          <a href="#articles" style={{ color: "inherit", textDecoration: "none" }}>Нийтлэл</a>
          <a href="#coaching" style={{ color: "inherit", textDecoration: "none" }}>1:1 коучинг</a>
          <a href="#about" style={{ color: "inherit", textDecoration: "none" }}>Тухай</a>
        </nav>
        <div style={{ display: "flex", gap: 12, alignItems: "center" }}>
          <a href="#" style={{ font: "var(--u-body-s)", fontWeight: 500, color: "var(--u-ink-2)", textDecoration: "none" }}>Нэвтрэх</a>
          <a href="#" style={{
            background: "var(--u-ink)", color: "var(--u-bg)", textDecoration: "none",
            font: "var(--u-body-s)", fontWeight: 500,
            padding: "9px 16px", borderRadius: "var(--u-r-2)",
          }}>Гишүүн болох →</a>
        </div>
      </div>
    </header>
  );
}

window.Nav = Nav;
