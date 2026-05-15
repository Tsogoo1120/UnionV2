"use client";

import { useMemo, useState, useTransition } from "react";
import type { TestQuestion } from "@/lib/types";
import { submitTestAnswers } from "@/app/actions/tests";
import { useRouter } from "next/navigation";
import { useToast } from "@/components/shell/Toast";
import { mapServerErrorToMn } from "@/lib/i18n/action-feedback";
import { validateAllTestAnswersAnswered } from "@/lib/validation/client-forms";

export type TestRunnerProps = {
  testId: string;
  slug: string;
  title: string;
  description: string | null;
  questions: TestQuestion[];
};

export function TestRunner({
  testId,
  slug,
  title,
  description,
  questions,
}: TestRunnerProps) {
  const router = useRouter();
  const toast = useToast();
  const [index, setIndex] = useState(0);
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [error, setError] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();

  const q = questions[index];
  const total = questions.length;
  const progress = total ? ((index + 1) / total) * 100 : 0;
  const questionIds = useMemo(() => questions.map((x) => x.id), [questions]);

  const canNext = useMemo(() => {
    if (!q) return false;
    return Boolean(answers[q.id]);
  }, [answers, q]);

  function setAnswer(questionId: string, optionId: string) {
    setAnswers((prev) => ({ ...prev, [questionId]: optionId }));
  }

  function submit() {
    setError(null);
    const check = validateAllTestAnswersAnswered(questionIds, answers);
    if (!check.ok) {
      setError(check.message);
      toast(check.message, "error");
      return;
    }
    startTransition(async () => {
      const res = await submitTestAnswers(testId, answers);
      if (res.error) {
        const m = mapServerErrorToMn(res.error);
        setError(m);
        toast(m, "error");
        return;
      }
      toast("Тестийн хариу амжилттай илгээгдлээ", "success");
      window.setTimeout(() => {
        router.push(`/tests/${slug}/result`);
        router.refresh();
      }, 250);
    });
  }

  if (!q) {
    return (
      <div style={{ padding: 24, font: "var(--u-body)", color: "var(--u-ink-2)" }}>
        <p style={{ margin: "0 0 16px" }}>Асуулт одоогоор бүртгэгдээгүй байна.</p>
        <a href="/dashboard?tab=hub" style={{ color: "var(--u-ember)", fontWeight: 600 }}>
          Хяналт руу буцах →
        </a>
      </div>
    );
  }

  return (
    <div
      style={{
        width: "100%",
        maxWidth: 560,
        margin: "0 auto",
        padding: "24px 16px 100px",
        boxSizing: "border-box",
      }}
    >
      <h1
        style={{
          fontFamily: "var(--u-display)",
          fontWeight: 700,
          fontSize: "clamp(24px, 4vw, 34px)",
          letterSpacing: "-0.02em",
          margin: "0 0 8px",
        }}
      >
        {title}
      </h1>
      {description ? (
        <p style={{ font: "var(--u-body)", color: "var(--u-ink-2)", margin: "0 0 20px" }}>{description}</p>
      ) : null}

      <div
        style={{
          height: 4,
          borderRadius: 2,
          background: "var(--u-rule)",
          overflow: "hidden",
          marginBottom: 20,
        }}
      >
        <div style={{ width: `${progress}%`, height: "100%", background: "var(--u-ember)", transition: "width 200ms ease" }} />
      </div>

      <div className="u-eyebrow" style={{ marginBottom: 8 }}>
        Асуулт {index + 1} / {total}
      </div>
      <p style={{ font: "var(--u-h3)", margin: "0 0 20px", color: "var(--u-ink)" }}>{q.text}</p>

      <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
        {q.options.map((opt) => {
          const selected = answers[q.id] === opt.id;
          return (
            <button
              key={opt.id}
              type="button"
              onClick={() => setAnswer(q.id, opt.id)}
              style={{
                textAlign: "left",
                padding: "14px 16px",
                borderRadius: "var(--u-r-2)",
                border: selected ? "2px solid var(--u-ember)" : "1px solid var(--u-rule-2)",
                background: selected ? "var(--u-ember-soft)" : "var(--u-surface-2)",
                font: "var(--u-body)",
                color: "var(--u-ink)",
                cursor: "pointer",
                minHeight: 48,
              }}
            >
              {opt.text}
            </button>
          );
        })}
      </div>

      {error ? (
        <p style={{ color: "var(--u-danger)", font: "var(--u-body-s)", marginTop: 16 }}>{error}</p>
      ) : null}

      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          gap: 12,
          marginTop: 28,
        }}
      >
        <button
          type="button"
          disabled={index === 0 || pending}
          onClick={() => setIndex((i) => Math.max(0, i - 1))}
          style={{
            padding: "12px 18px",
            borderRadius: "var(--u-r-2)",
            border: "1px solid var(--u-rule-2)",
            background: "transparent",
            font: "var(--u-body-s)",
            fontWeight: 500,
            opacity: index === 0 ? 0.4 : 1,
            cursor: index === 0 ? "not-allowed" : "pointer",
            minHeight: 48,
          }}
        >
          Өмнөх
        </button>
        {index < total - 1 ? (
          <button
            type="button"
            disabled={!canNext || pending}
            onClick={() => setIndex((i) => Math.min(total - 1, i + 1))}
            style={{
              padding: "12px 18px",
              borderRadius: "var(--u-r-2)",
              border: "none",
              background: "var(--u-ink)",
              color: "var(--u-bg)",
              font: "var(--u-body-s)",
              fontWeight: 600,
              cursor: !canNext ? "not-allowed" : "pointer",
              opacity: !canNext ? 0.45 : 1,
              minHeight: 48,
            }}
          >
            Дараах
          </button>
        ) : (
          <button
            type="button"
            disabled={!canNext || pending}
            onClick={submit}
            style={{
              padding: "12px 18px",
              borderRadius: "var(--u-r-2)",
              border: "none",
              background: "var(--u-ember)",
              color: "var(--u-ember-ink)",
              font: "var(--u-body-s)",
              fontWeight: 600,
              cursor: !canNext ? "not-allowed" : "pointer",
              opacity: !canNext ? 0.45 : 1,
              minHeight: 48,
            }}
          >
            {pending ? "Илгээж байна…" : "Дуусгах"}
          </button>
        )}
      </div>
    </div>
  );
}
