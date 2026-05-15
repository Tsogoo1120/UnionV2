"use client";

import { useMemo, useState, useTransition, type FormEvent } from "react";
import { createCoachingSlot, deleteCoachingSlot } from "@/app/actions/coaching";
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
import { useMediaQuery } from "@/lib/hooks/useMediaQuery";
import { adminCoachingSlotClientSchema } from "@/lib/validation/client-forms";
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

function SlotRow({
  slot,
  isWide,
  isFirst,
  pending,
  onDelete,
}: {
  slot: CoachingSlot;
  isWide: boolean;
  isFirst: boolean;
  pending: boolean;
  onDelete: () => void;
}) {
  return (
    <div
      style={{
        display: "grid",
        gridTemplateColumns: isWide ? "100px 1.4fr 1fr 1fr 120px" : "minmax(0,1fr)",
        padding: "16px 22px",
        borderTop: isFirst ? "none" : "1px solid var(--u-rule)",
        alignItems: "center",
        gap: isWide ? 0 : 8,
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
          {new Date(slot.start_at).toLocaleDateString("mn-MN", { weekday: "short" })}
        </span>
      </div>
      <div>
        <div style={{ font: "var(--u-h4)" }}>
          {new Date(slot.start_at).toLocaleTimeString("mn-MN", { hour: "2-digit", minute: "2-digit" })} —{" "}
          {new Date(slot.end_at).toLocaleTimeString("mn-MN", { hour: "2-digit", minute: "2-digit" })}
        </div>
        <div style={{ font: "var(--u-body-s)", color: "var(--u-ink-3)" }}>{formatDate(slot.start_at)}</div>
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
            borderRadius: "var(--u-r-1)",
            font: "var(--u-body-s)",
            color: "var(--u-ink-2)",
            cursor: "pointer",
          }}
        >
          Устгах
        </button>
      </div>
    </div>
  );
}

export function CoachingSlotsPanel({ slots }: Props) {
  const toast = useToast();
  const isWide = useMediaQuery("(min-width: 900px)");
  const [draw, setDraw] = useState(false);
  const [start, setStart] = useState("");
  const [end, setEnd] = useState("");
  const [price, setPrice] = useState("150000");
  const [desc, setDesc] = useState("1:1 уулзалт · онлайн");
  const [pending, startTransition] = useTransition();
  const [err, setErr] = useState<string | null>(null);

  const stats = useMemo(() => {
    const available = slots.filter((s) => s.status === "available").length;
    const booked = slots.filter((s) => s.status === "booked").length;
    const expired = slots.filter((s) => s.status === "expired").length;
    return { available, booked, expired };
  }, [slots]);

  function create(e: FormEvent) {
    e.preventDefault();
    setErr(null);
    const parsed = adminCoachingSlotClientSchema.safeParse({
      start,
      end,
      price,
      description: desc,
    });
    if (!parsed.success) {
      const first = parsed.error.issues[0]?.message ?? "Мэдээллээ шалгана уу.";
      setErr(first);
      toast(first, "error");
      return;
    }
    if (new Date(start) <= new Date()) {
      const m = "Эхлэх цаг ирээдүйд байх ёстой.";
      setErr(m);
      toast(m, "error");
      return;
    }
    startTransition(async () => {
      const res = await createCoachingSlot({
        startAt: new Date(start).toISOString(),
        endAt: new Date(end).toISOString(),
        price: Number(price.replace(/\s/g, "")) || undefined,
        description: desc || null,
      });
      if (res.error) {
        const m = mapServerErrorToMn(res.error);
        setErr(m);
        toast(m, "error");
        return;
      }
      toast("Цаг нэмэгдлээ", "success");
      setDraw(false);
      window.location.reload();
    });
  }

  return (
    <div>
      <div style={{ display: "flex", flexWrap: "wrap", gap: 10, marginBottom: 16, alignItems: "center" }}>
        <StatBadge label="Боломжтой" value={stats.available} />
        <StatBadge label="Захиалсан" value={stats.booked} />
        <StatBadge label="Дууссан" value={stats.expired} />
        <div style={{ flex: 1 }} />
        <button
          type="button"
          onClick={() => setDraw(true)}
          style={{
            background: "var(--u-ink)",
            color: "var(--u-bg)",
            border: "none",
            font: "var(--u-body-s)",
            fontWeight: 500,
            padding: "10px 16px",
            borderRadius: "var(--u-r-2)",
            cursor: "pointer",
          }}
        >
          + Шинэ цаг
        </button>
      </div>

      <div
        style={{
          background: "var(--u-surface-2)",
          border: "1px solid var(--u-rule)",
          borderRadius: "var(--u-r-3)",
          overflow: "hidden",
        }}
      >
        {slots.length === 0 ? (
          <div style={{ padding: 24, textAlign: "center", color: "var(--u-ink-3)", font: "var(--u-body-s)" }}>
            Цаг хуваарь хоосон байна.
          </div>
        ) : (
          slots.map((s, i) => (
            <SlotRow
              key={s.id}
              slot={s}
              isWide={isWide}
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
          ))
        )}
      </div>

      <AdminDrawer
        open={draw}
        onClose={() => setDraw(false)}
        title="Шинэ коучингын цаг"
        onSubmit={create}
        footer={
          <>
            <DrawerCancelButton onClick={() => setDraw(false)} disabled={pending} />
            <DrawerSubmitButton pending={pending} label="Үүсгэх" />
          </>
        }
      >
        <AdminFieldLabel htmlFor="cs-start">
          Эхлэх *
          <input
            id="cs-start"
            type="datetime-local"
            required
            value={start}
            onChange={(e) => setStart(e.target.value)}
            style={adminInputStyle}
          />
        </AdminFieldLabel>
        <AdminFieldLabel htmlFor="cs-end">
          Дуусах *
          <input
            id="cs-end"
            type="datetime-local"
            required
            value={end}
            onChange={(e) => setEnd(e.target.value)}
            style={adminInputStyle}
          />
        </AdminFieldLabel>
        <AdminFieldLabel htmlFor="cs-price">
          Үнэ (MNT) *
          <input
            id="cs-price"
            type="number"
            min={1}
            required
            value={price}
            onChange={(e) => setPrice(e.target.value)}
            style={adminInputStyle}
          />
        </AdminFieldLabel>
        <AdminFieldLabel htmlFor="cs-desc">
          Тайлбар
          <textarea
            id="cs-desc"
            maxLength={500}
            rows={2}
            value={desc}
            onChange={(e) => setDesc(e.target.value)}
            style={{ ...adminInputStyle, resize: "vertical" }}
          />
        </AdminFieldLabel>
        {err ? <p style={{ color: "var(--u-danger)", font: "var(--u-body-s)" }}>{err}</p> : null}
      </AdminDrawer>
    </div>
  );
}
