// Content management — video lessons CMS list
function ContentList() {
  const items = [
    { n: "01", title: "Хүний дотоод үүрэг", cat: "Анхан шат", state: "published", views: 184, date: "2026.05.01" },
    { n: "02", title: "Сар бүрийн зорилго", cat: "Анхан шат", state: "published", views: 142, date: "2026.04.18" },
    { n: "03", title: "Өглөөний 20 минут", cat: "Дасгал", state: "published", views: 121, date: "2026.04.04" },
    { n: "04", title: "Анхаарлын сонголт", cat: "Дунд шат", state: "draft", views: 0, date: "—" },
    { n: "05", title: "Бичих дасгал I", cat: "Дасгал", state: "draft", views: 0, date: "—" },
  ];
  return (
    <div>
      <div style={{ display: "flex", justifyContent: "flex-end", marginBottom: 16, gap: 10 }}>
        <button style={{ background: "transparent", border: "1px solid var(--u-rule-2)", color: "var(--u-ink-2)", font: "var(--u-body-s)", fontWeight: 500, padding: "10px 14px", borderRadius: "var(--u-r-2)", cursor: "pointer" }}>R2 файл харах</button>
        <button style={{ background: "var(--u-ink)", color: "var(--u-bg)", border: "none", font: "var(--u-body-s)", fontWeight: 500, padding: "10px 16px", borderRadius: "var(--u-r-2)", cursor: "pointer" }}>+ Шинэ хичээл</button>
      </div>
      <div style={{ background: "var(--u-surface-2)", border: "1px solid var(--u-rule)", borderRadius: "var(--u-r-3)", overflow: "hidden" }}>
        <div style={{ display: "grid", gridTemplateColumns: "60px 80px 1.6fr 1fr 1fr .8fr 100px", padding: "10px 22px", background: "var(--u-surface)", borderBottom: "1px solid var(--u-rule)", font: "var(--u-label)", letterSpacing: ".12em", textTransform: "uppercase", color: "var(--u-ink-3)" }}>
          <div>#</div><div>Шторкэ</div><div>Гарчиг</div><div>Ангилал</div><div>Үзэлт</div><div>Статус</div><div></div>
        </div>
        {items.map((it, i) => (
          <div key={i} style={{ display: "grid", gridTemplateColumns: "60px 80px 1.6fr 1fr 1fr .8fr 100px", padding: "14px 22px", borderTop: i === 0 ? "none" : "1px solid var(--u-rule)", alignItems: "center", font: "var(--u-body-s)" }}>
            <div style={{ fontFamily: "var(--u-mono)", color: "var(--u-ink-3)" }}>{it.n}</div>
            <div style={{ width: 56, height: 36, borderRadius: 6, background: `linear-gradient(135deg, ${["#3A352E","#1F2B4C","#E84A1F","#4A453E","#3D2A1A"][i]}, #262220)` }}/>
            <div style={{ fontWeight: 500, color: "var(--u-ink)" }}>{it.title}</div>
            <div style={{ color: "var(--u-ink-2)" }}>{it.cat}</div>
            <div style={{ fontFamily: "var(--u-mono)", color: "var(--u-ink-2)" }}>{it.views}</div>
            <div>
              {it.state === "published"
                ? <span style={{ background: "var(--u-success-soft)", color: "var(--u-success)", padding: "2px 10px", borderRadius: 999, fontWeight: 500 }}>Published</span>
                : <span style={{ background: "var(--u-rule)", color: "var(--u-ink-2)", padding: "2px 10px", borderRadius: 999, fontWeight: 500 }}>Draft</span>}
            </div>
            <div style={{ textAlign: "right", color: "var(--u-ink-3)", fontFamily: "var(--u-mono)", fontSize: 11 }}>{it.date}</div>
          </div>
        ))}
      </div>
    </div>
  );
}

window.ContentList = ContentList;
