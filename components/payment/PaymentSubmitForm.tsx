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
      style={{
        display: "flex",
        flexDirection: "column",
        gap: 20,
        maxWidth: 480,
        width: "100%",
        margin: "0 auto",
      }}
    >
    


      <div>
        <div className="u-eyebrow" style={{ marginBottom: 8 }}>
          Төлбөрийн баримтын зураг
        </div>
        <input
          name="screenshot"
          type="file"
          accept={acceptAttr}
          required
          aria-invalid={Boolean(fieldErrors.screenshot)}
          aria-describedby={fieldErrors.screenshot ? "err-shot" : "hint-shot"}
          style={{ font: "var(--u-body-s)", width: "100%", minHeight: 44 }}
        />

        {fieldErrors.screenshot ? (
          <p id="err-shot" style={{ color: "var(--u-danger)", font: "var(--u-body-s)", margin: "8px 0 0" }}>
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
        style={{
          width: "100%",
          minHeight: 52,
          border: "none",
          borderRadius: "var(--u-r-2)",
          background: "var(--u-ember)",
          color: "var(--u-ember-ink)",
          font: "var(--u-body)",
          fontWeight: 600,
          cursor: pending ? "wait" : "pointer",
          opacity: pending ? 0.85 : 1,
        }}
      >
        {pending ? "Илгээж байна…" : "Илгээх"}
      </button>
    </form>
  );
}
