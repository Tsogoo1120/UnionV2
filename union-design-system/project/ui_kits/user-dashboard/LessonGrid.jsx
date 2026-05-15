// Full video lesson library view
function LessonGrid() {
  const cats = ["Бүгд", "Анхан шат", "Дунд шат", "Дасгал", "Лекц"];
  const [active, setActive] = React.useState("Бүгд");
  const lessons = [
    { n: "01", t: "Хүний дотоод үүрэг", lvl: "Анхан шат", mins: 12, grad: "linear-gradient(135deg,#3A352E,#262220)", progress: 0.62 },
    { n: "02", t: "Сар бүрийн зорилго", lvl: "Анхан шат", mins: 14, grad: "linear-gradient(135deg,#1F2B4C,#262220)" },
    { n: "03", t: "Өглөөний 20 минут", lvl: "Дасгал", mins: 18, grad: "linear-gradient(135deg,#E84A1F,#B8341A)" },
    { n: "04", t: "Анхаарлын сонголт", lvl: "Дунд шат", mins: 22, grad: "linear-gradient(135deg,#4A453E,#262220)" },
    { n: "05", t: "Бичих дасгал I", lvl: "Дасгал", mins: 16, grad: "linear-gradient(135deg,#3D2A1A,#262220)" },
    { n: "06", t: "Эмоцийн архитектур", lvl: "Лекц", mins: 28, grad: "linear-gradient(135deg,#1F2B4C,#3A352E)" },
  ];
  return (
    <section>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-end", marginBottom: 24 }}>
        <div>
          <div className="u-eyebrow">Видео хичээл · 01</div>
          <h2 style={{ font: "var(--u-display)", fontWeight: 700, fontSize: 56, letterSpacing: "-0.02em", margin: "8px 0 0" }}>
            Хичээлүүд<span style={{ color: "var(--u-ember)" }}>.</span>
          </h2>
        </div>
        <div style={{ display: "flex", gap: 6 }}>
          {cats.map(c => (
            <button key={c} onClick={() => setActive(c)} style={{
              border: "1px solid var(--u-rule-2)",
              background: active === c ? "var(--u-ink)" : "transparent",
              color: active === c ? "var(--u-bg)" : "var(--u-ink-2)",
              font: "var(--u-body-s)", fontWeight: 500,
              padding: "8px 14px", borderRadius: "var(--u-r-pill)", cursor: "pointer",
            }}>{c}</button>
          ))}
        </div>
      </div>
      <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 18 }}>
        {lessons.map(l => (
          <a key={l.n} href="#" style={{ textDecoration: "none", color: "inherit", background: "var(--u-surface-2)", borderRadius: "var(--u-r-3)", border: "1px solid var(--u-rule)", overflow: "hidden", display: "flex", flexDirection: "column" }}>
            <div style={{ aspectRatio: "16/9", background: l.grad, position: "relative", display: "flex", alignItems: "flex-end", padding: 16 }}>
              <span style={{ position: "absolute", top: 12, left: 14, font: "var(--u-mono)", fontSize: 11, color: "var(--u-dark-ink-2)" }}>Хичээл {l.n}</span>
              <span style={{ position: "absolute", top: 12, right: 14, font: "var(--u-body-s)", color: "var(--u-dark-ink-2)" }}>{l.mins} мин</span>
              <div style={{ font: "var(--u-display)", fontWeight: 700, fontSize: 28, letterSpacing: "-0.015em", color: "var(--u-dark-ink)", lineHeight: 1.02 }}>{l.t}</div>
              <svg style={{ position: "absolute", right: 14, bottom: 14 }} width="28" height="28" viewBox="0 0 32 32"><circle cx="16" cy="16" r="15" fill="none" stroke="#F2EEE3" strokeWidth="1.2"/><path d="M13 11l8 5-8 5z" fill="#F2EEE3"/></svg>
            </div>
            <div style={{ padding: "14px 18px 16px", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <span style={{ font: "var(--u-body-s)", color: "var(--u-ink-3)" }}>{l.lvl}</span>
              {l.progress
                ? <span style={{ font: "var(--u-body-s)", color: "var(--u-ember)" }}>{Math.round(l.progress * 100)}%</span>
                : <span style={{ font: "var(--u-body-s)", color: "var(--u-ink-3)" }}>Шинэ</span>}
            </div>
          </a>
        ))}
      </div>
    </section>
  );
}

window.LessonGrid = LessonGrid;
