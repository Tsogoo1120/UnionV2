"use client";

import type { FormEvent } from "react";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { submitPayment } from "@/app/actions/payment";
import { useToast } from "@/components/shell/Toast";
import { ALLOWED_SCREENSHOT_TYPES } from "@/lib/constants";
import { mapServerErrorToMn } from "@/lib/i18n/action-feedback";
import { parsePaymentFormData } from "@/lib/validation/client-forms";

const acceptAttr = ALLOWED_SCREENSHOT_TYPES.join(",");

export function PaymentSubmitForm() {
  const router = useRouter();
  const toast = useToast();
  const [pending, setPending] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});
  const [fileName, setFileName] = useState<string | null>(null);

  async function onSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError(null);
    setFieldErrors({});
    const fd = new FormData(e.currentTarget);
    const parsed = parsePaymentFormData(fd);
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

    setPending(true);
    const res = await submitPayment(fd);
    setPending(false);
    if (res.error) {
      const msg = mapServerErrorToMn(res.error);
      setError(msg);
      toast(msg, "error");
      return;
    }
    toast("Хүсэлт хүлээн авлаа", "success");
    window.setTimeout(() => router.push("/status/pending"), 250);
  }

  return (
    <form
      onSubmit={onSubmit}
      style={{ display: "flex", flexDirection: "column", gap: 16, width: "100%" }}
    >
      {/* File upload zone */}
      <div>
        <div className="u-eyebrow" style={{ marginBottom: 8 }}>
          Төлбөрийн баримт
        </div>
        <label
          htmlFor="pay-screenshot"
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
              {fileName ?? "Зураг сонгох"}
            </div>
            <div style={{ marginTop: 4, fontSize: 12, color: "var(--u-ink-3)" }}>
              PNG, JPG, WEBP · 5 MB хүртэл
            </div>
          </div>
          <input
            id="pay-screenshot"
            name="screenshot"
            type="file"
            accept={acceptAttr}
            required
            aria-invalid={Boolean(fieldErrors.screenshot)}
            aria-describedby={fieldErrors.screenshot ? "err-shot" : undefined}
            onChange={(e) => setFileName(e.target.files?.[0]?.name ?? null)}
            style={{ position: "absolute", opacity: 0, width: 0, height: 0 }}
          />
        </label>
        {fieldErrors.screenshot ? (
          <p id="err-shot" className="u-field-error">
            {fieldErrors.screenshot}
          </p>
        ) : null}
      </div>

      {error ? (
        <div
          role="alert"
          style={{
            padding: 12,
            borderRadius: "var(--u-r-2)",
            background: "var(--u-danger-soft)",
            color: "var(--u-danger)",
            font: "var(--u-body-s)",
          }}
        >
          {error}
        </div>
      ) : null}

      <button
        type="submit"
        disabled={pending}
        className="u-btn-submit"
        style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 8 }}
      >
        {pending ? (
          <>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" style={{ animation: "spin 1s linear infinite" }} aria-hidden>
              <path d="M12 2v4M12 18v4M4.93 4.93l2.83 2.83M16.24 16.24l2.83 2.83M2 12h4M18 12h4M4.93 19.07l2.83-2.83M16.24 7.76l2.83-2.83" />
            </svg>
            Илгээж байна…
          </>
        ) : "Илгээх"}
      </button>

      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </form>
  );
}
