import Link from "next/link";

export default function StatusPendingPage() {
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
          border: "3px solid var(--u-warn)",
          marginBottom: 24,
          display: "grid",
          placeItems: "center",
          fontSize: 36,
        }}
      >
        …
      </div>
      <h1 style={{ font: "var(--u-display-xs)", margin: "0 0 12px" }}>
        Төлбөр хүлээгдэж байна
      </h1>
      <p style={{ font: "var(--u-body)", color: "var(--u-ink-2)", maxWidth: 420, margin: "0 0 28px" }}>
        Бид таны шилжүүлгийг шалгаж байна. Батлагдсаны дараа имэйлээр мэдэгдэнэ.
      </p>
      <Link
        href="/dashboard"
        style={{
          display: "inline-flex",
          minHeight: 48,
          padding: "0 22px",
          alignItems: "center",
          borderRadius: "var(--u-r-2)",
          background: "var(--u-ember)",
          color: "var(--u-ember-ink)",
          font: "var(--u-body-s)",
          fontWeight: 600,
          textDecoration: "none",
        }}
      >
        Самбар руу буцах
      </Link>
    </div>
  );
}
