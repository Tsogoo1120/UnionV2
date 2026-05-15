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
    <div style={{ minHeight: "100vh", background: "var(--u-bg)", padding: "24px 16px 48px" }}>
      <div style={{ maxWidth: 560, margin: "0 auto" }}>
        <Link
          href="/dashboard?tab=coaching"
          style={{
            display: "inline-flex",
            alignItems: "center",
            minHeight: 44,
            marginBottom: 20,
            font: "var(--u-body-s)",
            fontWeight: 600,
            color: "var(--u-ember)",
            textDecoration: "none",
          }}
        >
          ← Коучинг
        </Link>
        <div className="u-eyebrow">1:1 коучинг</div>
        <h1 style={{ font: "var(--u-display-s)", margin: "8px 0 12px", letterSpacing: "-0.02em" }}>
          Захиалга баталгаажуулах
        </h1>
        <p style={{ font: "var(--u-body)", color: "var(--u-ink-2)", margin: "0 0 8px" }}>
          {formatDate(slot.start_at, { withTime: true })} — {formatDate(slot.end_at, { withTime: true })}
        </p>
        <p style={{ font: "var(--u-h4)", margin: "0 0 24px" }}>{formatMNT(slot.price)}</p>
        <p style={{ font: "var(--u-body-s)", color: "var(--u-ink-3)", margin: "0 0 24px" }}>
          {PAYMENT_INFO.bankName} · {PAYMENT_INFO.accountName}
          <br />
          Данс: <span style={{ fontFamily: "var(--u-mono)" }}>{PAYMENT_INFO.accountNumber}</span>
        </p>
        <div
          style={{
            padding: 20,
            borderRadius: "var(--u-r-3)",
            border: "1px solid var(--u-rule)",
            background: "var(--u-surface-2)",
          }}
        >
          <CoachingSlotBookForm slot={slot} successMessage="Захиалга хүлээгдэж байна" />
        </div>
      </div>
    </div>
  );
}
