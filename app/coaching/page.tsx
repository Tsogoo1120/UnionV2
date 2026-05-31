import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { listAvailableSlots } from "@/lib/queries/coaching";
import { formatDate, formatMNT } from "@/lib/format";
import { COACHING_SERVICE_TYPES, type CoachingServiceType } from "@/lib/constants";

export const revalidate = 60;

export default async function CoachingLandingPage() {
  const supabase = await createClient();
  const slots = await listAvailableSlots(supabase, {
    from: new Date().toISOString(),
    limit: 20,
  });

  return (
    <div style={{ minHeight: "100vh", background: "var(--u-bg)", padding: "40px 16px 80px" }}>
      <div style={{ maxWidth: 640, margin: "0 auto" }}>
        <div className="u-eyebrow" style={{ marginBottom: 8 }}>1:1 Coaching</div>
        <h1
          style={{
            font: "var(--u-display-s)",
            margin: "0 0 12px",
            letterSpacing: "-0.02em",
          }}
        >
          Personal coaching
        </h1>
        <p style={{ font: "var(--u-body)", color: "var(--u-ink-2)", margin: "0 0 40px", maxWidth: 480 }}>
          My 1:1 coaching is a service separate from the membership fee.
          You can choose and book from the available slots below.
        </p>

        {slots.length === 0 ? (
          <div
            style={{
              padding: "32px 24px",
              borderRadius: "var(--u-r-3)",
              border: "1px solid var(--u-rule)",
              background: "var(--u-surface-2)",
              textAlign: "center",
              color: "var(--u-ink-3)",
              font: "var(--u-body)",
            }}
          >
            No available slots right now. New slots will be added soon.
          </div>
        ) : (
          <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
            {slots.map((slot) => (
              <div
                key={slot.id}
                style={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                  gap: 16,
                  padding: "16px 20px",
                  borderRadius: "var(--u-r-3)",
                  border: "1px solid var(--u-rule)",
                  background: "var(--u-surface-2)",
                  flexWrap: "wrap",
                }}
              >
                <div>
                  <div
                    className="u-eyebrow"
                    style={{ marginBottom: 4 }}
                  >
                    {COACHING_SERVICE_TYPES[slot.service_type as CoachingServiceType]?.label ?? slot.service_type}
                  </div>
                  <div
                    style={{
                      font: "var(--u-body)",
                      fontWeight: 600,
                      color: "var(--u-ink)",
                      marginBottom: 4,
                    }}
                  >
                    {formatDate(slot.start_at, { withTime: true })}
                  </div>
                  <div style={{ font: "var(--u-body-s)", color: "var(--u-ink-3)" }}>
                    Until {formatDate(slot.end_at, { withTime: true })}
                  </div>
                </div>

                <div style={{ display: "flex", alignItems: "center", gap: 16, flexShrink: 0 }}>
                  <span
                    style={{
                      font: "var(--u-body)",
                      fontWeight: 600,
                      color: "var(--u-ember)",
                    }}
                  >
                    {formatMNT(slot.price)}
                  </span>
                  <Link
                    href={`/coaching/book/${slot.id}`}
                    style={{
                      display: "inline-flex",
                      alignItems: "center",
                      minHeight: 40,
                      padding: "0 20px",
                      borderRadius: "var(--u-r-2)",
                      background: "var(--u-ember)",
                      color: "var(--u-ember-ink)",
                      font: "var(--u-body-s)",
                      fontWeight: 600,
                      textDecoration: "none",
                    }}
                  >
                    Book
                  </Link>
                </div>
              </div>
            ))}
          </div>
        )}

        <p
          style={{
            font: "var(--u-body-s)",
            color: "var(--u-ink-3)",
            margin: "32px 0 0",
            textAlign: "center",
          }}
        >
          You must sign in before booking. After your booking is confirmed, you&apos;ll
          receive a Google Meet link by email.
        </p>
      </div>
    </div>
  );
}