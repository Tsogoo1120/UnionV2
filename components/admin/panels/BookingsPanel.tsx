"use client";

import { useMemo, useState, useTransition } from "react";
import { approveCoachingBooking, denyCoachingBooking } from "@/app/actions/coaching";
import type { CoachingBookingAdminDetail } from "@/lib/queries/admin";
import { formatDate, formatMNT, statusLabel } from "@/lib/format";

export function BookingsPanel({ bookings }: { bookings: CoachingBookingAdminDetail[] }) {
  const [filter, setFilter] = useState<string>("all");
  const [pending, startTransition] = useTransition();
  const [msg, setMsg] = useState<string | null>(null);

  const rows = useMemo(() => {
    if (filter === "all") return bookings;
    return bookings.filter((b) => b.status === filter);
  }, [bookings, filter]);

  function act(fn: () => Promise<{ error?: string }>) {
    setMsg(null);
    startTransition(async () => {
      const r = await fn();
      if (r.error) setMsg(r.error);
      else window.location.reload();
    });
  }

  return (
    <div>
      <div style={{ display: "flex", gap: 8, marginBottom: 16, flexWrap: "wrap" }}>
        {["all", "pending", "approved", "denied"].map((f) => (
          <button
            key={f}
            type="button"
            onClick={() => setFilter(f)}
            style={{
              padding: "8px 14px",
              borderRadius: "var(--u-r-pill)",
              border: filter === f ? "none" : "1px solid var(--u-rule-2)",
              background: filter === f ? "var(--u-ink)" : "transparent",
              color: filter === f ? "var(--u-bg)" : "var(--u-ink-2)",
              cursor: "pointer",
              font: "var(--u-body-s)",
              fontWeight: 500,
            }}
          >
            {f}
          </button>
        ))}
      </div>
      {msg ? <p style={{ color: "var(--u-danger)", marginBottom: 12 }}>{msg}</p> : null}

      <div style={{ border: "1px solid var(--u-rule)", borderRadius: "var(--u-r-3)", overflow: "auto" }}>
        {rows.map((b) => (
          <div
            key={b.id}
            style={{
              display: "grid",
              gridTemplateColumns: "minmax(0,1.2fr) minmax(0,1fr) 100px 120px minmax(0,1fr) auto",
              gap: 12,
              padding: "14px 16px",
              borderTop: "1px solid var(--u-rule)",
              font: "var(--u-body-s)",
              alignItems: "center",
            }}
          >
            <div>
              <div style={{ fontWeight: 600 }}>{b.user_full_name ?? b.user_email ?? b.user_id}</div>
              <div style={{ color: "var(--u-ink-3)" }}>{b.user_email}</div>
            </div>
            <div>
              {b.slot ? (
                <>
                  <div>{formatDate(b.slot.start_at, { withTime: true })}</div>
                  <div style={{ color: "var(--u-ink-3)" }}>{formatDate(b.slot.end_at, { withTime: true })}</div>
                </>
              ) : (
                "—"
              )}
            </div>
            <div style={{ fontFamily: "var(--u-mono)" }}>{formatMNT(b.amount)}</div>
            <div>
              {b.screenshot_url ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={b.screenshot_url} alt="" style={{ width: 100, height: 56, objectFit: "cover", borderRadius: 6 }} />
              ) : (
                "—"
              )}
            </div>
            <div>{statusLabel(b.status, "booking").label}</div>
            <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
              {b.status === "pending" ? (
                <>
                  <button
                    type="button"
                    disabled={pending}
                    onClick={() => act(() => approveCoachingBooking(b.id))}
                    style={{ padding: "6px 10px", borderRadius: 6, border: "none", background: "var(--u-success)", color: "white", cursor: "pointer" }}
                  >
                    Зөвшөөрөх
                  </button>
                  <button
                    type="button"
                    disabled={pending}
                    onClick={() => {
                      const reason = window.prompt("Татгалзах шалтгаан:");
                      if (reason !== null) act(() => denyCoachingBooking(b.id, reason));
                    }}
                    style={{ padding: "6px 10px", borderRadius: 6, border: "1px solid var(--u-rule-2)", cursor: "pointer" }}
                  >
                    Татгалзах
                  </button>
                </>
              ) : null}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
