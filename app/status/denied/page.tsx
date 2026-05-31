import Link from "next/link";

export default function StatusDeniedPage() {
  return (
    <div
      style={{
        minHeight: "100vh",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        padding: 24,
        background: "var(--u-bg)",
        textAlign: "center",
      }}
    >
      <div
        aria-hidden
        style={{
          width: 72,
          height: 72,
          borderRadius: "50%",
          border: "3px solid var(--u-danger)",
          marginBottom: 24,
          display: "grid",
          placeItems: "center",
          fontSize: 32,
          color: "var(--u-danger)",
        }}
      >
        ×
      </div>
      <h1 style={{ font: "var(--u-display-xs)", margin: "0 0 12px" }}>
        Татгалзсан
      </h1>
      <p style={{ font: "var(--u-body)", color: "var(--u-ink-2)", maxWidth: 420, margin: "0 0 28px" }}>
        Уг төлбөрийг баталгаажуулах боломжгүй байна. Зөв шилжүүлгийн дэлгэцийн зурагтай дахин илгээнэ үү, эсвэл бидэнтэй холбогдоно уу.
      </p>
      <div style={{ display: "flex", flexDirection: "column", gap: 12, width: "100%", maxWidth: 320 }}>
        <Link
          href="/payment"
          style={{
            display: "inline-flex",
            minHeight: 48,
            padding: "0 22px",
            alignItems: "center",
            justifyContent: "center",
            borderRadius: "var(--u-r-2)",
            background: "var(--u-ember)",
            color: "var(--u-ember-ink)",
            font: "var(--u-body-s)",
            fontWeight: 600,
            textDecoration: "none",
          }}
        >
          Дахин илгээх
        </Link>
        <Link
          href="/dashboard"
          style={{
            display: "inline-flex",
            minHeight: 48,
            padding: "0 22px",
            alignItems: "center",
            justifyContent: "center",
            borderRadius: "var(--u-r-2)",
            border: "1px solid var(--u-rule-2)",
            color: "var(--u-ink)",
            font: "var(--u-body-s)",
            fontWeight: 600,
            textDecoration: "none",
          }}
        >
          Самбар руу
        </Link>
      </div>
    </div>
  );
}
