import Link from "next/link";
import { redirect } from "next/navigation";
import { PaymentSubmitForm } from "@/components/payment/PaymentSubmitForm";
import { PAYMENT_INFO } from "@/lib/constants";
import { requireSession } from "@/lib/auth/requireSession";

export default async function PaymentPage() {
  const profile = await requireSession();

  if (!profile.phone || profile.phone.trim().length === 0) {
    redirect("/auth/onboarding");
  }

  return (
    <div style={{ minHeight: "100vh", background: "var(--u-bg)", padding: "24px 16px 64px" }}>
      <div style={{ maxWidth: 560, margin: "0 auto" }}>

        {/* Back button */}
        <Link
          href="/dashboard"
          style={{
            display: "inline-flex",
            alignItems: "center",
            gap: 6,
            marginBottom: 32,
            padding: "8px 16px",
            borderRadius: "var(--u-r-2)",
            border: "1px solid var(--u-rule-2)",
            background: "var(--u-surface-2)",
            font: "var(--u-body-s)",
            fontWeight: 600,
            color: "var(--u-ink-2)",
            textDecoration: "none",
            transition: "border-color 0.15s, color 0.15s",
          }}
        >
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden>
            <path d="M19 12H5M12 19l-7-7 7-7" />
          </svg>
          Back to dashboard
        </Link>

        <div className="u-eyebrow" style={{ marginBottom: 8 }}>Membership</div>
        <h1 style={{ font: "var(--u-display-s)", margin: "0 0 8px", letterSpacing: "-0.02em" }}>
          Submit payment
        </h1>
        <p style={{ font: "var(--u-body)", color: "var(--u-ink-2)", margin: "0 0 32px" }}>
          Transfer to the account below, then upload a screenshot of the receipt.
          An admin will review it <strong style={{ color: "var(--u-ink)" }}>within 8 hours</strong> and unlock your access.
        </p>

        {/* Bank info card */}
        <div
          style={{
            marginBottom: 24,
            borderRadius: "var(--u-r-3)",
            border: "1px solid var(--u-rule)",
            background: "var(--u-surface-2)",
            overflow: "hidden",
          }}
        >
          <div
            style={{
              padding: "12px 20px",
              borderBottom: "1px solid var(--u-rule)",
              display: "flex",
              alignItems: "center",
              gap: 8,
            }}
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" style={{ color: "var(--u-ember)", flexShrink: 0 }} aria-hidden>
              <rect x="2" y="5" width="20" height="14" rx="2" /><path d="M2 10h20" />
            </svg>
            <span className="u-eyebrow">Bank details</span>
          </div>

          {/* Account number — prominent */}
          <div
            style={{
              padding: "20px 20px 16px",
              borderBottom: "1px solid var(--u-rule)",
              background: "var(--u-surface)",
            }}
          >
            <div style={{ font: "var(--u-body-s)", color: "var(--u-ink-3)", marginBottom: 4 }}>Account number</div>
            <div
              style={{
                fontFamily: "var(--u-mono)",
                fontSize: "clamp(1.5rem, 5vw, 2rem)",
                fontWeight: 700,
                letterSpacing: "0.05em",
                color: "var(--u-ink)",
                lineHeight: 1.2,
              }}
            >
              {PAYMENT_INFO.accountNumber}
            </div>
            <div style={{ marginTop: 4, font: "var(--u-body-s)", color: "var(--u-ink-2)" }}>
              {PAYMENT_INFO.bankName} · {PAYMENT_INFO.accountName}
            </div>
          </div>

          {/* Other details */}
          <dl
            style={{
              display: "grid",
              gridTemplateColumns: "auto 1fr",
              columnGap: 20,
              rowGap: 12,
              margin: 0,
              padding: "16px 20px 20px",
              font: "var(--u-body-s)",
            }}
          >
            <dt style={{ color: "var(--u-ink-3)" }}>IBAN</dt>
            <dd style={{ margin: 0, fontFamily: "var(--u-mono)", fontWeight: 600 }}>{PAYMENT_INFO.iban}</dd>

            <dt style={{ color: "var(--u-ink-3)" }}>Account holder</dt>
            <dd style={{ margin: 0, fontWeight: 600 }}>{PAYMENT_INFO.accountName}</dd>

            <dt style={{ color: "var(--u-ink-3)" }}>Amount</dt>
            <dd
              style={{
                margin: 0,
                fontFamily: "var(--u-mono)",
                fontWeight: 700,
                color: "var(--u-ember)",
                fontSize: "1.05em",
              }}
            >
              {PAYMENT_INFO.amount.toLocaleString("en-US")} {PAYMENT_INFO.currency}
            </dd>
          </dl>
        </div>

        {/* Upload form */}
        <div
          style={{
            borderRadius: "var(--u-r-3)",
            border: "1px solid var(--u-rule)",
            background: "var(--u-surface-2)",
            overflow: "hidden",
          }}
        >
          <div
            style={{
              padding: "12px 20px",
              borderBottom: "1px solid var(--u-rule)",
              display: "flex",
              alignItems: "center",
              gap: 8,
            }}
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" style={{ color: "var(--u-ember)", flexShrink: 0 }} aria-hidden>
              <path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4M17 8l-5-5-5 5M12 3v12" />
            </svg>
            <span className="u-eyebrow">Upload receipt image</span>
          </div>
          <div style={{ padding: 20 }}>
            <PaymentSubmitForm />
          </div>
        </div>

      </div>
    </div>
  );
}
