"use client";

import { useMemo, useState, useTransition } from "react";
import { approveCoachingBooking, denyCoachingBooking } from "@/app/actions/coaching";
import type { CoachingBookingAdminDetail } from "@/lib/queries/admin";
import { formatDate, formatMNT, statusLabel } from "@/lib/format";
import { useMediaQuery } from "@/lib/hooks/useMediaQuery";
import { EmptyState } from "@/components/ui/empty-state";

function BookingStatusBadge({ status }: { status: string }) {
  const { label, tone } = statusLabel(status, "booking");
  const style =
    tone === "success"
      ? { background: "var(--u-success-soft)", color: "var(--u-success)" }
      : tone === "danger"
        ? { background: "var(--u-danger-soft)", color: "var(--u-danger)" }
        : { background: "var(--u-surface)", color: "var(--u-ink-3)", border: "1px solid var(--u-rule-2)" };
  return (
    <span
      style={{
        ...style,
        padding: "2px 8px",
        borderRadius: "var(--u-r-pill)",
        font: "var(--u-body-s)",
        fontWeight: 500,
        display: "inline-block",
      }}
    >
      {label}
    </span>
  );
}

function BookingRowActions({
  pending,
  onApprove,
  denyOpen,
  setDenyOpen,
  denyReason,
  setDenyReason,
  onConfirmDeny,
  fullWidth,
}: {
  pending: boolean;
  onApprove: () => void;
  denyOpen: boolean;
  setDenyOpen: (v: boolean) => void;
  denyReason: string;
  setDenyReason: (v: string) => void;
  onConfirmDeny: () => void;
  fullWidth?: boolean;
}) {
  const btnBase = {
    minHeight: 44,
    padding: "10px 14px",
    borderRadius: "var(--u-r-2)" as const,
    font: "var(--u-body-s)",
    fontWeight: 500 as const,
    cursor: pending ? ("not-allowed" as const) : ("pointer" as const),
    flex: fullWidth ? 1 : undefined,
  };

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 10, width: fullWidth ? "100%" : undefined }}>
      <div style={{ display: "flex", gap: 8, flexWrap: "wrap", width: fullWidth ? "100%" : undefined }}>
        <button
          type="button"
          disabled={pending}
          onClick={onApprove}
          style={{
            ...btnBase,
            border: "none",
            background: "var(--u-success)",
            color: "var(--u-ember-ink)",
          }}
        >
          Зөвшөөрөх
        </button>
        <button
          type="button"
          disabled={pending}
          onClick={() => setDenyOpen(!denyOpen)}
          style={{
            ...btnBase,
            border: "1px solid var(--u-danger-soft)",
            background: "transparent",
            color: "var(--u-danger)",
          }}
        >
          Татгалзах
        </button>
      </div>
      {denyOpen ? (
        <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
          <textarea
            value={denyReason}
            onChange={(e) => setDenyReason(e.target.value)}
            placeholder="Татгалзах шалтгаан"
            className="u-field"
            style={{ minHeight: 72, resize: "vertical" }}
          />
          <div style={{ display: "flex", gap: 8 }}>
            <button
              type="button"
              onClick={() => setDenyOpen(false)}
              style={{
                ...btnBase,
                flex: 1,
                border: "1px solid var(--u-rule-2)",
                background: "transparent",
                color: "var(--u-ink-2)",
              }}
            >
              Цуцлах
            </button>
            <button
              type="button"
              disabled={pending}
              onClick={onConfirmDeny}
              style={{
                ...btnBase,
                flex: 1,
                border: "none",
                background: "var(--u-danger)",
                color: "var(--u-ember-ink)",
              }}
            >
              Баталгаажуулах
            </button>
          </div>
        </div>
      ) : null}
    </div>
  );
}

export function BookingsPanel({ bookings }: { bookings: CoachingBookingAdminDetail[] }) {
  const [filter, setFilter] = useState<string>("all");
  const [pending, startTransition] = useTransition();
  const [msg, setMsg] = useState<string | null>(null);
  const [denyId, setDenyId] = useState<string | null>(null);
  const [denyReason, setDenyReason] = useState("");
  const isDesktop = useMediaQuery("(min-width: 641px)");

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
              minHeight: 44,
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
      {msg ? <p style={{ color: "var(--u-danger)", marginBottom: 12, font: "var(--u-body-s)" }}>{msg}</p> : null}

      <div style={{ border: "1px solid var(--u-rule)", borderRadius: "var(--u-r-3)", overflow: "hidden" }}>
        {rows.length === 0 ? (
          <EmptyState title="Захиалга байхгүй" body="Энэ шүүлтээр захиалга олдсонгүй." />
        ) : null}
        {rows.map((b, i) =>
          isDesktop ? (
            <div
              key={b.id}
              style={{
                display: "grid",
                gridTemplateColumns: "minmax(0,1.2fr) minmax(0,1fr) 100px 120px minmax(0,1fr) auto",
                gap: 12,
                padding: "14px 16px",
                borderTop: i === 0 && rows.length > 0 ? "none" : "1px solid var(--u-rule)",
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
                  <img
                    src={b.screenshot_url}
                    alt=""
                    loading="lazy"
                    style={{ width: 100, height: 56, objectFit: "cover", borderRadius: 6 }}
                  />
                ) : (
                  "—"
                )}
              </div>
              <div>
                <BookingStatusBadge status={b.status} />
              </div>
              <div>
                {b.status === "pending" ? (
                  <BookingRowActions
                    pending={pending}
                    onApprove={() => act(() => approveCoachingBooking(b.id))}
                    denyOpen={denyId === b.id}
                    setDenyOpen={(open) => {
                      setDenyId(open ? b.id : null);
                      if (!open) setDenyReason("");
                    }}
                    denyReason={denyReason}
                    setDenyReason={setDenyReason}
                    onConfirmDeny={() => act(() => denyCoachingBooking(b.id, denyReason))}
                  />
                ) : null}
              </div>
            </div>
          ) : (
            <div
              key={b.id}
              style={{
                padding: 16,
                borderTop: i === 0 && rows.length > 0 ? "none" : "1px solid var(--u-rule)",
                display: "flex",
                flexDirection: "column",
                gap: 12,
                background: "var(--u-surface-2)",
              }}
            >
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: 12 }}>
                <div style={{ fontWeight: 700, font: "var(--u-body)" }}>{b.user_full_name ?? b.user_email ?? b.user_id}</div>
                <BookingStatusBadge status={b.status} />
              </div>
              <div style={{ font: "var(--u-body-s)", color: "var(--u-ink-2)" }}>
                {b.slot ? formatDate(b.slot.start_at, { withTime: true }) : "—"}
                {b.slot ? ` — ${formatDate(b.slot.end_at, { withTime: true })}` : ""}
              </div>
              <div style={{ fontFamily: "var(--u-mono)", fontWeight: 600 }}>{formatMNT(b.amount)}</div>
              {b.screenshot_url ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={b.screenshot_url}
                  alt=""
                  loading="lazy"
                  style={{ width: 80, height: 45, objectFit: "cover", borderRadius: "var(--u-r-2)" }}
                />
              ) : null}
              {b.status === "pending" ? (
                <BookingRowActions
                  pending={pending}
                  onApprove={() => act(() => approveCoachingBooking(b.id))}
                  denyOpen={denyId === b.id}
                  setDenyOpen={(open) => {
                    setDenyId(open ? b.id : null);
                    if (!open) setDenyReason("");
                  }}
                  denyReason={denyReason}
                  setDenyReason={setDenyReason}
                  onConfirmDeny={() => act(() => denyCoachingBooking(b.id, denyReason))}
                  fullWidth
                />
              ) : null}
            </div>
          ),
        )}
      </div>
    </div>
  );
}
