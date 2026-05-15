// Latest articles section
function ArticleRow() {
  const articles = [
    { date: "Бямба, 5/10", min: "7 мин", title: "Зорилго — тэвчээрийн уртын асуудал", cat: "Эссэ" },
    { date: "Мяг., 5/06", min: "4 мин", title: "Өглөөний 20 минут — өдрийн архитектур", cat: "Дадал" },
    { date: "Пүр., 5/01", min: "9 мин", title: "Уур уцаар, мэдрэлийн систем, амьсгал", cat: "Сэтгэл судлал" },
  ];
  return (
    <section id="articles" style={{ maxWidth: 1240, margin: "0 auto", padding: "100px 32px" }}>
      <div style={{ display: "flex", alignItems: "baseline", justifyContent: "space-between", marginBottom: 32 }}>
        <div>
          <div className="u-eyebrow">Сүүлийн нийтлэл</div>
          <h2 style={{
            font: "var(--u-display)", fontWeight: 700,
            fontSize: 64, lineHeight: 1, letterSpacing: "-0.02em", marginTop: 8,
          }}>Долоон минут,<br/><span style={{ fontWeight: 300 }}>нэг бодол.</span></h2>
        </div>
        <a href="#" style={{
          font: "var(--u-body-s)", fontWeight: 500, color: "var(--u-ink-2)",
          textDecoration: "none", display: "inline-flex", alignItems: "center", gap: 6,
          padding: "10px 14px", border: "1px solid var(--u-rule-2)", borderRadius: "var(--u-r-pill)",
        }}>Бүгдийг үзэх <span>→</span></a>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "1.4fr 1fr 1fr", gap: 24 }}>
        {articles.map((a, i) => (
          <a key={i} href="#" style={{
            textDecoration: "none", color: "inherit",
            background: "var(--u-surface-2)", borderRadius: "var(--u-r-3)",
            border: "1px solid var(--u-rule)", overflow: "hidden",
            display: "flex", flexDirection: "column",
          }}>
            <div style={{
              aspectRatio: i === 0 ? "16/10" : "16/9",
              background: i === 0
                ? "linear-gradient(135deg, #E84A1F, #B8341A)"
                : i === 1
                  ? "linear-gradient(135deg, #1F2B4C, #262220)"
                  : "linear-gradient(135deg, #4A453E, #262220)",
            }}/>
            <div style={{ padding: "20px 24px 24px", display: "flex", flexDirection: "column", gap: 10, flex: 1 }}>
              <div style={{ font: "var(--u-body-s)", color: "var(--u-ink-3)", display: "flex", gap: 10 }}>
                <span style={{ color: "var(--u-ember)", fontWeight: 500 }}>{a.cat}</span>
                <span>·</span><span>{a.date}</span><span>·</span><span>{a.min}</span>
              </div>
              <div style={{
                font: "var(--u-display)", fontWeight: 700,
                fontSize: i === 0 ? 36 : 26, letterSpacing: "-0.015em", lineHeight: 1.05,
              }}>{a.title}</div>
            </div>
          </a>
        ))}
      </div>
    </section>
  );
}

window.ArticleRow = ArticleRow;
