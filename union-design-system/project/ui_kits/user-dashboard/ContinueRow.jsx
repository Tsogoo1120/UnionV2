// Continue-watching strip
function ContinueRow() {
  const items = [
    { n: "01", title: "Хүний дотоод үүрэг", progress: 0.62, time: "5 мин үлдсэн", grad: "linear-gradient(135deg,#3A352E,#262220)" },
    { n: "07", title: "Уур уцаар ба амьсгал", progress: 0.18, time: "16 мин үлдсэн", grad: "linear-gradient(135deg,#1F2B4C,#262220)" },
    { n: "12", title: "Зорилго гэдэг юу вэ", progress: 0.85, time: "2 мин үлдсэн", grad: "linear-gradient(135deg,#E84A1F,#B8341A)" },
  ];
  return (
    <section style={{ marginTop: 48 }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", marginBottom: 14 }}>
        <div className="u-eyebrow">Үргэлжлүүлэх</div>
        <a href="#" style={{ font: "var(--u-body-s)", color: "var(--u-ink-2)" }}>Бүх хичээл →</a>
      </div>
      <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 16 }}>
        {items.map((it, i) => (
          <a key={i} href="#" style={{ textDecoration: "none", color: "inherit", borderRadius: "var(--u-r-3)", overflow: "hidden", border: "1px solid var(--u-rule)", background: "var(--u-surface-2)", display: "flex", flexDirection: "column" }}>
            <div style={{ aspectRatio: "16/9", background: it.grad, position: "relative", display: "flex", alignItems: "flex-end", padding: 16 }}>
              <span style={{ position: "absolute", top: 12, left: 14, font: "var(--u-mono)", fontSize: 11, color: "var(--u-dark-ink-2)" }}>Хичээл {it.n}</span>
              <div style={{ font: "var(--u-display)", fontWeight: 700, fontSize: 24, letterSpacing: "-0.015em", color: "var(--u-dark-ink)", lineHeight: 1.05 }}>{it.title}</div>
              <svg style={{ position: "absolute", right: 14, top: 14 }} width="22" height="22" viewBox="0 0 32 32"><circle cx="16" cy="16" r="15" fill="none" stroke="#F2EEE3" strokeWidth="1.2"/><path d="M13 11l8 5-8 5z" fill="#F2EEE3"/></svg>
            </div>
            <div style={{ padding: "12px 16px 14px" }}>
              <div style={{ height: 3, background: "var(--u-rule)", borderRadius: 2, overflow: "hidden" }}>
                <div style={{ width: `${it.progress * 100}%`, height: "100%", background: "var(--u-ember)" }}/>
              </div>
              <div style={{ font: "var(--u-body-s)", color: "var(--u-ink-3)", marginTop: 8 }}>{it.time}</div>
            </div>
          </a>
        ))}
      </div>
    </section>
  );
}

window.ContinueRow = ContinueRow;
