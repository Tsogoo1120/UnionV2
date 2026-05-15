import Link from "next/link";
import { notFound } from "next/navigation";
import { CoachingSlotBookForm } from "@/components/coaching/CoachingSlotBookForm";
import { requireActive } from "@/lib/auth/requireSession";
import { getCoachingSlotById } from "@/lib/queries/coaching";
import { createClient } from "@/lib/supabase/server";

export default async function CoachingSlotPage({
  params,
}: {
  params: { slotId: string };
}) {
  const supabase = await createClient();
  await requireActive();

  const slot = await getCoachingSlotById(supabase, params.slotId);
  if (!slot || slot.status !== "available") {
    notFound();
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
        <CoachingSlotBookForm slot={slot} />
      </div>
    </div>
  );
}
