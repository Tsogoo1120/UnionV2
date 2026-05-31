"use client";

import { useMemo, useState, useTransition } from "react";
import { createCoachingSlots, deleteCoachingSlot } from "@/app/actions/coaching";
import {
  AdminDrawer,
  AdminFieldLabel,
  DrawerCancelButton,
  DrawerSubmitButton,
  adminInputStyle,
} from "@/components/admin/shared/AdminDrawer";
import { useToast } from "@/components/shell/Toast";
import { formatDate, formatMNT, statusLabel } from "@/lib/format";
import { mapServerErrorToMn } from "@/lib/i18n/action-feedback";
import { COACHING_SERVICE_TYPES, type CoachingServiceType } from "@/lib/constants";
import type { CoachingSlot } from "@/lib/types";

type Props = {
  slots: CoachingSlot[];
};

function StatBadge({ label, value }: { label: string; value: number }) {
  return (
    <span
      style={{
        font: "var(--u-body-s)",
        padding: "6px 12px",
        borderRadius: "var(--u-r-pill)",
        border: "1px solid var(--u-rule-2)",
        background: "var(--u-surface-2)",
        color: "var(--u-ink-2)",
      }}
    >
      <span style={{ color: "var(--u-ink-3)", marginRight: 6 }}>{label}</span>
      <span style={{ fontFamily: "var(--u-mono)", fontWeight: 600, color: "var(--u-ink)" }}>{value}</span>
    </span>
  );
}

function ServiceTypeBadge({ serviceType }: { serviceType: string }) {
  const cfg = COACHING_SERVICE_TYPES[serviceType as CoachingServiceType];
  const label = cfg?.label ?? serviceType;
  const isTarot = serviceType === "tarot_reading";
  return (
    <span
      style={{
        display: "inline-block",
        font: "var(--u-body-s)",
        fontWeight: 500,
        padding: "2px 8px",
        borderRadius: "var(--u-r-pill)",
        background: isTarot ? "var(--u-surface-3, #f3eeff)" : "var(--u-surface-2)",
        color: isTarot ? "var(--u-ember)" : "var(--u-ink-2)",
        border: "1px solid var(--u-rule)",
        whiteSpace: "nowrap",
      }}
    >
      {label}
    </span>
  );
}

function SlotRow({
  slot,
  isFirst,
  pending,
  onDelete,
}: {
  slot: CoachingSlot;
  isFirst: boolean;
  pending: boolean;
  onDelete: () => void;
}) {
  return (
    <div
      className="u-admin-row"
      style={{
        display: "grid",
        gridTemplateColumns: "100px 1.4fr 140px 1fr 1fr 120px",
        padding: "16px 22px",
        borderTop: isFirst ? "none" : "1px solid var(--u-rule)",
        alignItems: "center",
        gap: 8,
      }}
    >
      <div style={{ display: "flex", alignItems: "baseline", gap: 6 }}>
        <span
          style={{
            fontFamily: "var(--u-display)",
            fontWeight: 700,
            fontSize: 28,
            lineHeight: 1,
            letterSpacing: "-0.02em",
          }}
        >
          {new Date(slot.start_at).getDate()}
        </span>
        <span style={{ font: "var(--u-body-s)", color: "var(--u-ink-3)" }}>
          {new Date(slot.start_at).toLocaleDateString("en-US", { weekday: "short" })}
        </span>
      </div>
      <div>
        <div style={{ font: "var(--u-h4)" }}>
          {new Date(slot.start_at).toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit", hour12: false })} —{" "}
          {new Date(slot.end_at).toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit", hour12: false })}
        </div>
        <div style={{ font: "var(--u-body-s)", color: "var(--u-ink-3)" }}>{formatDate(slot.start_at)}</div>
      </div>
      <div>
        <ServiceTypeBadge serviceType={slot.service_type} />
      </div>
      <div style={{ fontFamily: "var(--u-mono)" }}>{formatMNT(slot.price)}</div>
      <div>{statusLabel(slot.status, "slot").label}</div>
      <div style={{ textAlign: "right" }}>
        <button
          type="button"
          disabled={pending}
          onClick={onDelete}
          style={{
            background: "transparent",
            border: "1px solid var(--u-rule-2)",
            padding: "6px 12px",
            minHeight: 36,
            borderRadius: "var(--u-r-1)",
            font: "var(--u-body-s)",
            color: "var(--u-ink-2)",
            cursor: pending ? "not-allowed" : "pointer",
          }}
        >
          Delete
        </button>
      </div>
    </div>
  );
}

const addBtnStyle: React.CSSProperties = {
  background: "transparent",
  border: "1px dashed var(--u-rule-2)",
  padding: "6px 12px",
  borderRadius: "var(--u-r-1)",
  font: "var(--u-body-s)",
  color: "var(--u-ink-2)",
  cursor: "pointer",
  marginTop: 6,
};

const removeBtnStyle: React.CSSProperties = {
  background: "transparent",
  border: "none",
  padding: "0 6px",
  font: "var(--u-body-s)",
  color: "var(--u-ink-3)",
  cursor: "pointer",
  lineHeight: 1,
};

export function CoachingSlotsPanel({ slots }: Props) {
  const toast = useToast();
  const [draw, setDraw] = useState(false);

  const [serviceType, setServiceType] = useState<CoachingServiceType>("1vs1_coaching");
  const [dates, setDates] = useState<string[]>([""]);
  const [times, setTimes] = useState<string[]>([""]);
  const [pending, startTransition] = useTransition();
  const [err, setErr] = useState<string | null>(null);

  const svcCfg = COACHING_SERVICE_TYPES[serviceType];
  const previewCount = dates.filter(Boolean).length * times.filter(Boolean).length;

  const stats = useMemo(() => {
    const available = slots.filter((s) => s.status === "available").length;
    const booked = slots.filter((s) => s.status === "booked").length;
    const expired = slots.filter((s) => s.status === "expired").length;
    return { available, booked, expired };
  }, [slots]);

  function resetForm() {
    setServiceType("1vs1_coaching");
    setDates([""]);
    setTimes([""]);
    setErr(null);
  }

  function handleCreate(e: React.FormEvent) {
    e.preventDefault();
    setErr(null);

    const validDates = dates.filter(Boolean);
    const validTimes = times.filter(Boolean);
    if (validDates.length === 0) {
      const m = "Please select a date.";
      setErr(m);
      toast(m, "error");
      return;
    }
    if (validTimes.length === 0) {
      const m = "Please enter a time.";
      setErr(m);
      toast(m, "error");
      return;
    }
    if (validDates.length * validTimes.length > 50) {
      const m = "You can create at most 50 slots at once.";
      setErr(m);
      toast(m, "error");
      return;
    }

    startTransition(async () => {
      const res = await createCoachingSlots({
        serviceType,
        dates: validDates,
        startTimes: validTimes,
      });

      if (res.errors && !res.count) {
        const m = res.errors[0] ?? "Something went wrong.";
        setErr(m);
        toast(m, "error");
        return;
      }

      const skipped = res.errors?.length ?? 0;
      const msg =
        skipped > 0
          ? `${res.count} slots added (${skipped} skipped)`
          : `${res.count} slots added`;
      toast(msg, "success");
      setDraw(false);
      resetForm();
      window.location.reload();
    });
  }

  return (
    <div>
      <div style={{ display: "flex", flexWrap: "wrap", gap: 10, marginBottom: 16, alignItems: "center" }}>
        <StatBadge label="Available" value={stats.available} />
        <StatBadge label="Booked" value={stats.booked} />
        <StatBadge label="Expired" value={stats.expired} />
        <div style={{ flex: 1 }} />
        <button
          type="button"
          onClick={() => { resetForm(); setDraw(true); }}
          style={{
            background: "var(--u-ink)",
            color: "var(--u-bg)",
            border: "none",
            font: "var(--u-body-s)",
            fontWeight: 500,
            padding: "10px 16px",
            minHeight: 44,
            borderRadius: "var(--u-r-2)",
            cursor: "pointer",
          }}
        >
          + New slot
        </button>
      </div>

      <div
        className="u-admin-scroll-x"
        style={{
          background: "var(--u-surface-2)",
          border: "1px solid var(--u-rule)",
          borderRadius: "var(--u-r-3)",
        }}
      >
        {slots.length === 0 ? (
          <div style={{ padding: 24, textAlign: "center", color: "var(--u-ink-3)", font: "var(--u-body-s)" }}>
            No slots scheduled yet.
          </div>
        ) : (
          <div style={{ minWidth: 720 }}>
            {slots.map((s, i) => (
              <SlotRow
                key={s.id}
                slot={s}
                isFirst={i === 0}
                pending={pending}
                onDelete={() => {
                  startTransition(async () => {
                    const r = await deleteCoachingSlot(s.id);
                    if (r.error) toast(mapServerErrorToMn(r.error), "error");
                    else window.location.reload();
                  });
                }}
              />
            ))}
          </div>
        )}
      </div>

      <AdminDrawer
        open={draw}
        onClose={() => { setDraw(false); resetForm(); }}
        title="Add new slot"
        onSubmit={handleCreate}
        footer={
          <>
            <DrawerCancelButton onClick={() => { setDraw(false); resetForm(); }} disabled={pending} />
            <DrawerSubmitButton pending={pending} label="Create" />
          </>
        }
      >
        {/* ── Service type ── */}
        <AdminFieldLabel htmlFor="cs-svc">
          Service type *
          <select
            id="cs-svc"
            value={serviceType}
            onChange={(e) => setServiceType(e.target.value as CoachingServiceType)}
            style={adminInputStyle}
          >
            {(Object.keys(COACHING_SERVICE_TYPES) as CoachingServiceType[]).map((k) => (
              <option key={k} value={k}>
                {COACHING_SERVICE_TYPES[k].label}
              </option>
            ))}
          </select>
        </AdminFieldLabel>

        {/* ── Auto-derived price + duration info ── */}
        <div
          style={{
            display: "flex",
            gap: 16,
            padding: "10px 14px",
            borderRadius: "var(--u-r-2)",
            background: "var(--u-surface-3, #f7f7f8)",
            border: "1px solid var(--u-rule)",
            font: "var(--u-body-s)",
            color: "var(--u-ink-2)",
            marginBottom: 4,
          }}
        >
          <span>
            <span style={{ color: "var(--u-ink-3)" }}>Price: </span>
            <span style={{ fontFamily: "var(--u-mono)", fontWeight: 600, color: "var(--u-ink)" }}>
              {formatMNT(svcCfg.price)}
            </span>
          </span>
          <span>
            <span style={{ color: "var(--u-ink-3)" }}>Duration: </span>
            <span style={{ fontWeight: 600, color: "var(--u-ink)" }}>{svcCfg.durationMinutes} min</span>
          </span>
        </div>

        {/* ── Dates ── */}
        <AdminFieldLabel htmlFor="cs-date-0">
          Date *
          {dates.map((d, i) => (
            <div key={i} style={{ display: "flex", alignItems: "center", gap: 6, marginBottom: 6 }}>
              <input
                id={i === 0 ? "cs-date-0" : undefined}
                type="date"
                required={i === 0}
                value={d}
                onChange={(e) => {
                  const next = [...dates];
                  next[i] = e.target.value;
                  setDates(next);
                }}
                style={{ ...adminInputStyle, flex: 1, marginBottom: 0 }}
              />
              {dates.length > 1 && (
                <button
                  type="button"
                  style={removeBtnStyle}
                  onClick={() => setDates(dates.filter((_, j) => j !== i))}
                >
                  ✕
                </button>
              )}
            </div>
          ))}
          {dates.length < 30 && (
            <button type="button" style={addBtnStyle} onClick={() => setDates([...dates, ""])}>
              + Add date
            </button>
          )}
        </AdminFieldLabel>

        {/* ── Start times ── */}
        <AdminFieldLabel htmlFor="cs-time-0">
          Start time *
          {times.map((t, i) => (
            <div key={i} style={{ display: "flex", alignItems: "center", gap: 6, marginBottom: 6 }}>
              <input
                id={i === 0 ? "cs-time-0" : undefined}
                type="time"
                required={i === 0}
                value={t}
                onChange={(e) => {
                  const next = [...times];
                  next[i] = e.target.value;
                  setTimes(next);
                }}
                style={{ ...adminInputStyle, flex: 1, marginBottom: 0 }}
              />
              {times.length > 1 && (
                <button
                  type="button"
                  style={removeBtnStyle}
                  onClick={() => setTimes(times.filter((_, j) => j !== i))}
                >
                  ✕
                </button>
              )}
            </div>
          ))}
          {times.length < 20 && (
            <button type="button" style={addBtnStyle} onClick={() => setTimes([...times, ""])}>
              + Add time
            </button>
          )}
        </AdminFieldLabel>

        {/* ── Preview count ── */}
        {previewCount > 0 && (
          <div
            style={{
              padding: "8px 14px",
              borderRadius: "var(--u-r-2)",
              background: "var(--u-surface-2)",
              border: "1px solid var(--u-rule)",
              font: "var(--u-body-s)",
              color: "var(--u-ink-2)",
            }}
          >
            <strong style={{ color: "var(--u-ink)" }}>{previewCount} slots</strong> will be created
          </div>
        )}

        {err && <p style={{ color: "var(--u-danger)", font: "var(--u-body-s)" }}>{err}</p>}
      </AdminDrawer>
    </div>
  );
}
