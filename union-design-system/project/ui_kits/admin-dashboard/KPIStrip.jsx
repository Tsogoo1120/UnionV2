// Overview KPI strip + recent activity
function KPIStrip() {
  const kpis = [
    { l: "Идэвхтэй гишүүн", v: "284", d: "+12 энэ сар", up: true },
    { l: "Хүлээгдэж буй төлбөр", v: "4", d: "Шалгах хэрэгтэй", ember: true },
    { l: "Сарын орлого", v: "14.2M₮", d: "Apr → May +6%", up: true },
    { l: "Захиалгатай коучинг", v: "9", d: "Энэ долоо хоног", up: true },
  ];
  return (
    <section>
      <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 16 }}>
        {kpis.map(k => (
          <div key={k.l} style={{
            background: "var(--u-surface-2)", border: "1px solid var(--u-rule)",
            borderRadius: "var(--u-r-3)", padding: "20px 22px",
          }}>
            <div className="u-eyebrow">{k.l}</div>
            <div style={{ font: "var(--u-display)", fontWeight: 700, fontSize: 44, letterSpacing: "-0.02em", marginTop: 8 }}>{k.v}</div>
            <div style={{ font: "var(--u-body-s)", color: k.ember ? "var(--u-ember)" : (k.up ? "var(--u-success)" : "var(--u-ink-3)"), marginTop: 6 }}>{k.d}</div>
          </div>
        ))}
      </div>

      <div style={{ marginTop: 32, display: "grid", gridTemplateColumns: "1.4fr 1fr", gap: 24 }}>
        <div style={{ background: "var(--u-surface-2)", border: "1px solid var(--u-rule)", borderRadius: "var(--u-r-3)", overflow: "hidden" }}>
          <div style={{ padding: "16px 22px", borderBottom: "1px solid var(--u-rule)", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            <span style={{ font: "var(--u-h4)" }}>Сүүлийн үйлдэл</span>
            <span style={{ font: "var(--u-body-s)", color: "var(--u-ink-3)" }}>Сүүлийн 24 цаг</span>
          </div>
          {[
            { t: "Төлбөр зөвшөөрөгдсөн", who: "Энхтуяа Б.", time: "08:24" },
            { t: "Шинэ коучинг захиалга", who: "Цэцэгмаа Г.", time: "07:11" },
            { t: "Шинэ гишүүн", who: "Болд Д.", time: "өчигдөр 22:40" },
            { t: "Төлбөр илгээгдсэн (waiting)", who: "Алтан-Оч", time: "өчигдөр 19:02" },
          ].map((e, i) => (
            <div key={i} style={{ display: "grid", gridTemplateColumns: "1.6fr 1fr 100px", padding: "14px 22px", borderTop: i === 0 ? "none" : "1px solid var(--u-rule)", font: "var(--u-body-s)", alignItems: "center" }}>
              <span>{e.t}</span><span style={{ color: "var(--u-ink-2)" }}>{e.who}</span>
              <span style={{ textAlign: "right", color: "var(--u-ink-3)", fontFamily: "var(--u-mono)", fontSize: 11 }}>{e.time}</span>
            </div>
          ))}
        </div>
        <div style={{ background: "var(--u-ink)", color: "var(--u-dark-ink)", border: "none", borderRadius: "var(--u-r-3)", padding: 24, display: "flex", flexDirection: "column", gap: 16 }}>
          <div className="u-eyebrow" style={{ color: "var(--u-dark-ink-2)" }}>Анхаарал хандуул</div>
          <div style={{ font: "var(--u-display)", fontWeight: 700, fontSize: 28, letterSpacing: "-0.015em", lineHeight: 1.1 }}>
            4 төлбөр баталгаажуулалт <span style={{ fontWeight: 300, color: "var(--u-dark-ink-2)" }}>хүлээж байна.</span>
          </div>
          <a href="#" style={{
            background: "var(--u-ember)", color: "var(--u-ember-ink)",
            padding: "12px 16px", borderRadius: "var(--u-r-2)",
            font: "var(--u-body-s)", fontWeight: 500, textDecoration: "none", textAlign: "center", marginTop: "auto",
          }}>Цэглэх →</a>
        </div>
      </div>
    </section>
  );
}

window.KPIStrip = KPIStrip;
