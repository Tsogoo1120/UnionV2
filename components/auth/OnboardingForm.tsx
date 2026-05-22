"use client";

import type { FormEvent } from "react";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { submitOnboarding } from "@/app/actions/onboarding";
import { useToast } from "@/components/shell/Toast";
import { mapServerErrorToMn } from "@/lib/i18n/action-feedback";
import { parseOnboardingFormData } from "@/lib/validation/client-forms";

type Props = {
  defaultFullName?: string | null;
  defaultPhone?: string | null;
  redirectTo?: string;
};

export function OnboardingForm({ defaultFullName, defaultPhone, redirectTo }: Props) {
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
    const parsed = parseOnboardingFormData(fd);
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
    const res = await submitOnboarding(fd);
    setPending(false);
    if (res.error) {
      const msg = mapServerErrorToMn(res.error);
      setError(msg);
      toast(msg, "error");
      return;
    }
    toast("Хадгалагдлаа", "success");
    const destination =
      redirectTo && redirectTo.startsWith("/coaching/")
        ? redirectTo
        : "/payment";
    window.setTimeout(() => router.push(destination), 250);
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
          Овог нэр
        </div>
        <input
          name="full_name"
          type="text"
          autoComplete="name"
          defaultValue={defaultFullName ?? ""}
          required
          aria-invalid={Boolean(fieldErrors.full_name)}
          aria-describedby={fieldErrors.full_name ? "err-full-name" : undefined}
          className={fieldErrors.full_name ? "u-field u-field--error" : "u-field"}
        />
        {fieldErrors.full_name ? (
          <p id="err-full-name" className="u-field-error">
            {fieldErrors.full_name}
          </p>
        ) : null}
      </div>

      <div>
        <div className="u-eyebrow" style={{ marginBottom: 8 }}>
          Утасны дугаар
        </div>
        <input
          name="phone"
          type="tel"
          inputMode="tel"
          autoComplete="tel"
          placeholder="99112233"
          defaultValue={defaultPhone ?? ""}
          required
          aria-invalid={Boolean(fieldErrors.phone)}
          aria-describedby={fieldErrors.phone ? "err-phone" : undefined}
          className={fieldErrors.phone ? "u-field u-field--error" : "u-field"}
          style={{ fontFamily: "var(--u-mono)" }}
        />
        {fieldErrors.phone ? (
          <p id="err-phone" className="u-field-error">
            {fieldErrors.phone}
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

      <button type="submit" disabled={pending} className="u-btn-submit">
        {pending ? "Хадгалж байна…" : "Үргэлжлүүлэх"}
      </button>
    </form>
  );
}
