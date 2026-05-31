// Editorial service index — numbered table of contents
function ServiceList() {
  const items = [
    { n: "01", title: "Видео хичээл", italic: "video lessons", body: "Сэтгэл судлал, бичих дасгал, өдөр тутмын дадал — 24+ хичээл, шинэ нь сар бүр." },
    { n: "02", title: "Хамтын уншилт", italic: "collective readings", body: "Бүх гишүүнд нийтлэг утгат уншилт — 7 хоног тутамд шинэчилнэ. Зурхайн оронд нэгдмэл өгүүлэмж." },
    { n: "03", title: "Нийгэмлэг", italic: "community", body: "Зөвхөн гишүүдэд нээлттэй нийтлэлүүд, хариултууд. Чимээгүй модератортой." },
    { n: "04", title: "Сэтгэл судлалын тест", italic: "psychology tests", body: "Богино, эрдэм шинжилгээний үндэстэй өөрийгөө шалгах ажлууд." },
    { n: "05", title: "Нийтлэлүүд", italic: "essays", body: "7 минутын уншлага. Шууд утга, дэлгэрэнгүй жишээ." },
  ];
  return (
    <section id="services" style={{ borderTop: "1px solid var(--u-rule)", borderBottom: "1px solid var(--u-rule)" }}>
      <div style={{ maxWidth: 1240, margin: "0 auto", padding: "60px 32px 20px" }}>
        <div style={{ display: "flex", alignItems: "baseline", justifyContent: "space-between" }}>
          <div className="u-eyebrow">Үйлчилгээ — 5</div>
          <div style={{ font: "var(--u-body-s)", color: "var(--u-ink-3)" }}>Нэг гишүүнчлэл</div>
        </div>
      </div>
      <div style={{ maxWidth: 1240, margin: "0 auto", padding: "0 32px 40px" }}>
        {items.map((it, i) => (
          <a key={it.n} href="#" style={{
            display: "grid", gridTemplateColumns: "80px 1.2fr 2fr 40px", gap: 32, alignItems: "baseline",
            padding: "32px 0", borderTop: i === 0 ? "none" : "1px solid var(--u-rule)",
            textDecoration: "none", color: "inherit",
          }}>
            <div style={{ font: "var(--u-mono)", color: "var(--u-ink-3)", fontSize: 13 }}>{it.n}</div>
            <div>
              <div style={{ font: "var(--u-display)", fontWeight: 700, fontSize: 40, letterSpacing: "-0.02em", lineHeight: 1.05 }}>{it.title}</div>
              <div style={{ font: "var(--u-display)", fontWeight: 300, fontSize: 20, color: "var(--u-ink-3)", marginTop: 4 }}>{it.italic}</div>
            </div>
            <div style={{ font: "var(--u-body-l)", color: "var(--u-ink-2)", maxWidth: 540 }}>{it.body}</div>
            <div style={{ textAlign: "right", color: "var(--u-ink-3)" }}>
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.4"><path d="M7 17L17 7M10 7h7v7"/></svg>
            </div>
          </a>
        ))}
      </div>
    </section>
  );
}

window.ServiceList = ServiceList;
