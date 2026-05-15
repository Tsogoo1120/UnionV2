import Link from "next/link";
import { redirect } from "next/navigation";
import { PaymentSubmitForm } from "@/components/payment/PaymentSubmitForm";
import { PAYMENT_INFO } from "@/lib/constants";
import { requireSession } from "@/lib/auth/requireSession";

export default async function PaymentPage() {
  const profile = await requireSession();

  // Gate: profile must be onboarded (phone captured on /auth/onboarding).
  if (!profile.phone || profile.phone.trim().length === 0) {
    redirect("/auth/onboarding");
  }

  return (
    <div style={{ minHeight: "100vh", background: "var(--u-bg)", padding: "24px 16px 48px" }}>
      <div style={{ maxWidth: 560, margin: "0 auto" }}>
        <Link
          href="/dashboard"
          style={{
            display: "inline-block",
            marginBottom: 20,
            font: "var(--u-body-s)",
            fontWeight: 600,
            color: "var(--u-ember)",
            textDecoration: "none",
          }}
        >
          ← Самбар
        </Link>
        <div className="u-eyebrow">Гишүүнчлэл</div>
        <h1 style={{ font: "var(--u-display-s)", margin: "8px 0 12px", letterSpacing: "-0.02em" }}>
          Төлбөр илгээх
        </h1>
        <p
          style={{
            font: "var(--u-body)",
            color: "var(--u-ink-2)",
            margin: "0 0 20px",
          }}
        >
          Таны хүсэлтийг хүлээн авлаа. Таны төлбөрийг админ 8 цагийн дотор
          шалгаад эрхийг нээх болно.
        </p>

        <div
          style={{
            padding: 20,
            marginBottom: 24,
            borderRadius: "var(--u-r-3)",
            border: "1px solid var(--u-rule)",
            background: "var(--u-surface-2)",
          }}
        >
          <div className="u-eyebrow" style={{ marginBottom: 12 }}>
            Банкны мэдээлэл
          </div>
          <dl
            style={{
              display: "grid",
              gridTemplateColumns: "auto 1fr",
              columnGap: 16,
              rowGap: 10,
              margin: 0,
              font: "var(--u-body-s)",
            }}
          >
            <dt style={{ color: "var(--u-ink-3)" }}>Банк</dt>
            <dd style={{ margin: 0 }}>{PAYMENT_INFO.bankName}</dd>

            <dt style={{ color: "var(--u-ink-3)" }}>IBAN</dt>
            <dd style={{ margin: 0, fontFamily: "var(--u-mono)" }}>
              {PAYMENT_INFO.iban}
            </dd>

            <dt style={{ color: "var(--u-ink-3)" }}>Данс</dt>
            <dd style={{ margin: 0, fontFamily: "var(--u-mono)" }}>
              {PAYMENT_INFO.accountNumber}
            </dd>

            <dt style={{ color: "var(--u-ink-3)" }}>Эзэмшигч</dt>
            <dd style={{ margin: 0 }}>{PAYMENT_INFO.accountName}</dd>

            <dt style={{ color: "var(--u-ink-3)" }}>Дүн</dt>
            <dd style={{ margin: 0, fontFamily: "var(--u-mono)" }}>
              {PAYMENT_INFO.amount.toLocaleString("en-US")} {PAYMENT_INFO.currency}
            </dd>
          </dl>
        </div>

        <div
          style={{
            padding: 20,
            marginBottom: 24,
            borderRadius: "var(--u-r-3)",
            border: "1px solid var(--u-rule)",
            background: "var(--u-surface-2)",
          }}
        >
          <PaymentSubmitForm />
        </div>
      </div>
    </div>
  );
}
