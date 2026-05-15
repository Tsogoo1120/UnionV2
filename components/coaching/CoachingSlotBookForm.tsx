"use client";

import { useState, useTransition, type FormEvent } from "react";
import { bookCoachingSlot } from "@/app/actions/coaching";
import { useToast } from "@/components/shell/Toast";
import type { CoachingSlot } from "@/lib/types";
import { formatDate, formatMNT } from "@/lib/format";
import { mapServerErrorToMn } from "@/lib/i18n/action-feedback";
import { parseCoachingBookFormData } from "@/lib/validation/client-forms";

export function CoachingSlotBookForm({
  slot,
  successMessage = "Амжилттай илгээгдлээ. Админ баталгаажуулалт хүлээнэ үү.",
}: {
  slot: CoachingSlot;
  successMessage?: string;
}) {
  const toast = useToast();
  const [pending, startTransition] = useTransition();
  const [msg, setMsg] = useState<string | null>(null);
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});

  function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    setMsg(null);
    setFieldErrors({});
    const parsed = parseCoachingBookFormData(formData);
    if (!parsed.success) {
      const fe: Record<string, string> = {};
      for (const issue of parsed.error.issues) {
        const key = issue.path[0];
        if (typeof key === "string" && !fe[key]) fe[key] = issue.message;
      }
      setFieldErrors(fe);
      toast(Object.values(fe)[0] ?? "Мэдээллээ шалгана уу.", "error");
      return;
    }

    startTransition(async () => {
      const res = await bookCoachingSlot(slot.id, formData);
      if (res.error) {
        const m = mapServerErrorToMn(res.error);
        setMsg(m);
        toast(m, "error");
        return;
      }
      setMsg(successMessage);
      toast("Захиалга илгээгдлээ", "success");
    });
  }

  return (
    <div style={{ maxWidth: 480, margin: "0 auto", padding: "24px 16px" }}>
      <h1 style={{ fontFamily: "var(--u-display)", fontWeight: 700, fontSize: 32, margin: "0 0 8px" }}>
        Коучинг захиалах
      </h1>
      <p style={{ font: "var(--u-body)", color: "var(--u-ink-2)" }}>
        {formatDate(slot.start_at, { withTime: true })} — {formatDate(slot.end_at, { withTime: true })}
      </p>
      <p style={{ font: "var(--u-h4)", marginTop: 12 }}>{formatMNT(slot.price)}</p>

      <form onSubmit={handleSubmit} style={{ marginTop: 28, display: "flex", flexDirection: "column", gap: 14 }}>
        <label className="u-eyebrow" style={{ display: "flex", flexDirection: "column", gap: 6 }}>
          Дансны дэлгэцийн зураг
          <input
            name="screenshot"
            type="file"
            accept="image/png,image/jpeg,image/webp"
            required
            aria-invalid={Boolean(fieldErrors.screenshot)}
            style={{ minHeight: 44 }}
          />
        </label>
        {fieldErrors.screenshot ? (
          <p style={{ color: "var(--u-danger)", font: "var(--u-body-s)", margin: 0 }}>{fieldErrors.screenshot}</p>
        ) : null}
        <label className="u-eyebrow" style={{ display: "flex", flexDirection: "column", gap: 6 }}>
          Лавлагаа (заавал биш)
          <input
            name="bank_reference"
            type="text"
            aria-invalid={Boolean(fieldErrors.bank_reference)}
            style={{ padding: 10, borderRadius: "var(--u-r-2)", border: "1px solid var(--u-rule-2)", minHeight: 44 }}
          />
        </label>
        {fieldErrors.bank_reference ? (
          <p style={{ color: "var(--u-danger)", font: "var(--u-body-s)", margin: 0 }}>{fieldErrors.bank_reference}</p>
        ) : null}
        <button
          type="submit"
          disabled={pending}
          style={{
            marginTop: 8,
            padding: "14px 18px",
            borderRadius: "var(--u-r-2)",
            border: "none",
            background: "var(--u-ink)",
            color: "var(--u-bg)",
            fontWeight: 600,
            cursor: pending ? "wait" : "pointer",
            minHeight: 48,
          }}
        >
          {pending ? "Илгээж байна…" : "Илгээх"}
        </button>
      </form>
      {msg ? (
        <p
          style={{
            marginTop: 16,
            font: "var(--u-body-s)",
            color: msg.includes("хүлээгдэж") || msg.includes("Амжилттай") ? "var(--u-success)" : "var(--u-danger)",
          }}
        >
          {msg}
        </p>
      ) : null}
    </div>
  );
}
