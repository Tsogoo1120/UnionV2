import Link from "next/link";
import { redirect } from "next/navigation";
import { CoachingSlotBookForm } from "@/components/coaching/CoachingSlotBookForm";
import { requireSession } from "@/lib/auth/requireSession";
import { getCoachingSlotById } from "@/lib/queries/coaching";
import { createClient } from "@/lib/supabase/server";
import { PAYMENT_INFO } from "@/lib/constants";
import { formatDate, formatMNT } from "@/lib/format";

export default async function CoachingBookPage({
  params,
}: {
  params: { slotId: string };
}) {
  await requireSession();
  const supabase = await createClient();

  const slot = await getCoachingSlotById(supabase, params.slotId);
  if (!slot || slot.status !== "available") {
    redirect("/?#coaching");
  }

  return (
    <div style={{ minHeight: "100vh", background: "var(--u-bg)", padding: "24px 16px 64px" }}>
      <div style={{ maxWidth: 560, margin: "0 auto" }}>

        {/* Back button */}
        <Link
          href="/#coaching"
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
          }}
        >
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden>
            <path d="M19 12H5M12 19l-7-7 7-7" />
          </svg>
          Буцах
        </Link>

        <div className="u-eyebrow" style={{ marginBottom: 8 }}>1:1 коучинг</div>
        <h1 style={{ font: "var(--u-display-s)", margin: "0 0 4px", letterSpacing: "-0.02em" }}>
          Захиалга баталгаажуулах
        </h1>
        <p style={{ font: "var(--u-body)", color: "var(--u-ink-2)", margin: "0 0 4px" }}>
          {formatDate(slot.start_at, { withTime: true })} — {formatDate(slot.end_at, { withTime: true })}
        </p>
        <p style={{ font: "var(--u-h4)", margin: "0 0 28px", color: "var(--u-ember)" }}>
          {formatMNT(slot.price)}
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
            <span className="u-eyebrow">Банкны мэдээлэл</span>
          </div>

          {/* Account number — prominent */}
          <div
            style={{
              padding: "20px 20px 16px",
              borderBottom: "1px solid var(--u-rule)",
              background: "var(--u-surface)",
            }}
          >
            <div style={{ font: "var(--u-body-s)", color: "var(--u-ink-3)", marginBottom: 4 }}>Дансны дугаар</div>
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
            <dt style={{ color: "var(--u-ink-3)" }}>Эзэмшигч</dt>
            <dd style={{ margin: 0, fontWeight: 600 }}>{PAYMENT_INFO.accountName}</dd>

            <dt style={{ color: "var(--u-ink-3)" }}>Дүн</dt>
            <dd
              style={{
                margin: 0,
                fontFamily: "var(--u-mono)",
                fontWeight: 700,
                color: "var(--u-ember)",
                fontSize: "1.05em",
              }}
            >
              {formatMNT(slot.price)}
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
            <span className="u-eyebrow">Баримтын зураг оруулах</span>
          </div>
          <div style={{ padding: 20 }}>
            <CoachingSlotBookForm slot={slot} successMessage="Захиалга хүлээгдэж байна" />
          </div>
        </div>

      </div>
    </div>
  );
}
