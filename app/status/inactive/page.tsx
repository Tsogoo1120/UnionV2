import Link from "next/link";

export default function InactiveStatusPage() {
  return (
    <div
      style={{
        minHeight: "60vh",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        padding: 32,
        textAlign: "center",
        gap: 16,
      }}
    >
      <h1
        style={{
          fontFamily: "var(--u-display)",
          fontWeight: 700,
          fontSize: 32,
          letterSpacing: "-0.02em",
          margin: 0,
        }}
      >
        Гишүүнчлэл шаардлагатай
      </h1>
      <p style={{ font: "var(--u-body)", color: "var(--u-ink-2)", maxWidth: 420, margin: 0 }}>
        Энэ контентыг үзэхийн тулд идэвхтэй гишүүнчлэлтэй байх эсвэл төлбөрөө баталгаажуулах шаардлагатай.
      </p>
      <Link
        href="/payment"
        style={{
          marginTop: 8,
          background: "var(--u-ink)",
          color: "var(--u-bg)",
          padding: "12px 22px",
          borderRadius: "var(--u-r-2)",
          textDecoration: "none",
          font: "var(--u-body-s)",
          fontWeight: 600,
        }}
      >
        Төлбөр төлөх →
      </Link>
    </div>
  );
}
