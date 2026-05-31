"use client";

import { useState, useTransition, type FormEvent } from "react";
import { bookCoachingSlot } from "@/app/actions/coaching";
import { useToast } from "@/components/shell/Toast";
import type { CoachingSlot } from "@/lib/types";
import { mapServerErrorToMn } from "@/lib/i18n/action-feedback";
import { parseCoachingBookFormData } from "@/lib/validation/client-forms";

export function CoachingSlotBookForm({
  slot,
  successMessage = "Submitted successfully. Please await admin confirmation.",
}: {
  slot: CoachingSlot;
  successMessage?: string;
}) {
  const toast = useToast();
  const [pending, startTransition] = useTransition();
  const [msg, setMsg] = useState<string | null>(null);
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});
  const [fileName, setFileName] = useState<string | null>(null);

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
      toast(Object.values(fe)[0] ?? "Please check your information.", "error");
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
      toast("Booking submitted", "success");
    });
  }

  const isSuccess = msg && (msg.includes("pending") || msg.includes("successfully"));

  return (
    <form
      onSubmit={handleSubmit}
      style={{ display: "flex", flexDirection: "column", gap: 16, width: "100%" }}
    >
      {/* Screenshot upload zone */}
      <div>
        <div className="u-eyebrow" style={{ marginBottom: 8 }}>Payment screenshot</div>
        <label
          htmlFor="coaching-screenshot"
          style={{
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
            gap: 10,
            padding: "28px 16px",
            borderRadius: "var(--u-r-2)",
            border: `2px dashed ${fieldErrors.screenshot ? "var(--u-danger)" : "var(--u-rule-2)"}`,
            background: "var(--u-surface)",
            cursor: "pointer",
            textAlign: "center",
            transition: "border-color 0.15s, background 0.15s",
          }}
        >
          <svg
            width="28"
            height="28"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.5"
            style={{ color: fileName ? "var(--u-ember)" : "var(--u-ink-3)" }}
            aria-hidden
          >
            <rect x="3" y="3" width="18" height="18" rx="2" />
            <path d="M3 9h18M9 21V9" />
          </svg>
          <div>
            <div style={{ font: "var(--u-body-s)", fontWeight: 600, color: "var(--u-ink)" }}>
              {fileName ?? "Choose image"}
            </div>
            <div style={{ marginTop: 4, fontSize: 12, color: "var(--u-ink-3)" }}>
              PNG, JPG, WEBP · up to 5 MB
            </div>
          </div>
          <input
            id="coaching-screenshot"
            name="screenshot"
            type="file"
            accept="image/png,image/jpeg,image/webp"
            required
            aria-invalid={Boolean(fieldErrors.screenshot)}
            onChange={(e) => setFileName(e.target.files?.[0]?.name ?? null)}
            style={{ position: "absolute", opacity: 0, width: 0, height: 0 }}
          />
        </label>
        {fieldErrors.screenshot ? (
          <p className="u-field-error">{fieldErrors.screenshot}</p>
        ) : null}
      </div>

      {/* Bank reference */}
      <div>
        <label
          htmlFor="coaching-ref"
          className="u-eyebrow"
          style={{ display: "block", marginBottom: 8 }}
        >
          Reference (optional)
        </label>
        <input
          id="coaching-ref"
          name="bank_reference"
          type="text"
          aria-invalid={Boolean(fieldErrors.bank_reference)}
          placeholder="Bank transaction number"
          className={fieldErrors.bank_reference ? "u-field u-field--error" : "u-field"}
        />
        {fieldErrors.bank_reference ? (
          <p className="u-field-error">{fieldErrors.bank_reference}</p>
        ) : null}
      </div>

      <button type="submit" disabled={pending} className="u-btn-submit" style={{ marginTop: 4, display: "flex", alignItems: "center", justifyContent: "center", gap: 8 }}>
        {pending ? (
          <>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" style={{ animation: "spin 1s linear infinite" }} aria-hidden>
              <path d="M12 2v4M12 18v4M4.93 4.93l2.83 2.83M16.24 16.24l2.83 2.83M2 12h4M18 12h4M4.93 19.07l2.83-2.83M16.24 7.76l2.83-2.83" />
            </svg>
            Submitting&hellip;
          </>
        ) : "Submit booking"}
      </button>

      {msg ? (
        <div
          role="status"
          style={{
            padding: 12,
            borderRadius: "var(--u-r-2)",
            background: isSuccess ? "var(--u-success-soft, #e6f4ea)" : "var(--u-danger-soft)",
            color: isSuccess ? "var(--u-success, #1a7f3c)" : "var(--u-danger)",
            font: "var(--u-body-s)",
            fontWeight: 500,
          }}
        >
          {msg}
        </div>
      ) : null}

      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </form>
  );
}