"use client";

import { useState, useTransition, type FormEvent } from "react";
import { MobileDrawer } from "@/components/shell/MobileDrawer";
import { useToast } from "@/components/shell/Toast";
import { createPost } from "@/app/actions/community";
import { mapServerErrorToMn } from "@/lib/i18n/action-feedback";
import {
  communityImageRefine,
  parseCommunityPostFormData,
} from "@/lib/validation/client-forms";

export function CommunityComposerFab() {
  const toast = useToast();
  const [open, setOpen] = useState(false);
  const [pending, startTransition] = useTransition();
  const [err, setErr] = useState<string | null>(null);
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});

  function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    setErr(null);
    setFieldErrors({});

    const parsed = parseCommunityPostFormData(formData);
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

    const img = formData.get("image");
    const file = img instanceof File && img.size > 0 ? img : null;
    const imgCheck = communityImageRefine(file);
    if (!imgCheck.ok) {
      setErr(imgCheck.message);
      toast(imgCheck.message, "error");
      return;
    }

    startTransition(async () => {
      const res = await createPost(formData);
      if (res.error) {
        const m = mapServerErrorToMn(res.error);
        setErr(m);
        toast(m, "error");
        return;
      }
      toast("Пост нийтлэгдлээ", "success");
      setOpen(false);
      window.setTimeout(() => window.location.reload(), 350);
    });
  }

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        style={{
          position: "fixed",
          right: 20,
          bottom: 88,
          zIndex: 25,
          width: 56,
          height: 56,
          borderRadius: 999,
          border: "none",
          background: "var(--u-ember)",
          color: "var(--u-ember-ink)",
          fontSize: 28,
          fontWeight: 700,
          cursor: "pointer",
          boxShadow: "var(--u-shadow-2)",
        }}
        aria-label="Шинэ пост нээх"
      >
        +
      </button>

      <MobileDrawer open={open} onClose={() => setOpen(false)} side="bottom">
        <form
          onSubmit={handleSubmit}
          style={{ padding: "20px 20px 28px", display: "flex", flexDirection: "column", gap: 12, maxWidth: 560, margin: "0 auto" }}
        >
          <div className="u-eyebrow">Шинэ пост</div>
          <input
            name="title"
            required
            placeholder="Гарчиг"
            aria-invalid={Boolean(fieldErrors.title)}
            style={{ padding: 12, borderRadius: "var(--u-r-2)", border: "1px solid var(--u-rule-2)", font: "var(--u-body)", minHeight: 44 }}
          />
          {fieldErrors.title ? (
            <p style={{ color: "var(--u-danger)", font: "var(--u-body-s)", margin: 0 }}>{fieldErrors.title}</p>
          ) : null}
          <textarea
            name="body"
            required
            rows={5}
            placeholder="Текст (markdown дэмжинэ)"
            aria-invalid={Boolean(fieldErrors.body)}
            style={{ padding: 12, borderRadius: "var(--u-r-2)", border: "1px solid var(--u-rule-2)", font: "var(--u-body)", resize: "vertical" }}
          />
          {fieldErrors.body ? (
            <p style={{ color: "var(--u-danger)", font: "var(--u-body-s)", margin: 0 }}>{fieldErrors.body}</p>
          ) : null}
          <label className="u-eyebrow" style={{ display: "flex", flexDirection: "column", gap: 6 }}>
            Зураг (заавал биш)
            <input name="image" type="file" accept="image/png,image/jpeg,image/webp" style={{ minHeight: 44 }} />
          </label>
          {err ? <p style={{ color: "var(--u-danger)", font: "var(--u-body-s)", margin: 0 }}>{err}</p> : null}
          <button
            type="submit"
            disabled={pending}
            style={{
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
            {pending ? "Нийтэлж байна…" : "Нийтлэх"}
          </button>
        </form>
      </MobileDrawer>
    </>
  );
}
