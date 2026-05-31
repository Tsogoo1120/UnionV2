import Link from "next/link";

export default function StatusExpiredPage() {
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
          fontSize: 32,
        }}
      >
        ⏱
      </div>
      <h1 style={{ font: "var(--u-display-xs)", margin: "0 0 12px" }}>
        Хугацаа дууссан
      </h1>
      <p style={{ font: "var(--u-body)", color: "var(--u-ink-2)", maxWidth: 420, margin: "0 0 28px" }}>
        Таны гишүүнчлэлийн хугацаа дууссан байна. Үйлчилгээг үргэлжлүүлэхийн тулд дахин төлбөр төлнө үү.
      </p>
      <Link
        href="/payment"
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
        Дахин төлбөр төлөх
      </Link>
    </div>
  );
}
