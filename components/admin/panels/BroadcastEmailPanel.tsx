"use client";

import { useState, useTransition } from "react";
import { broadcastEmail } from "@/app/actions/admin";
import { useToast } from "@/components/shell/Toast";

export function BroadcastEmailPanel() {
  const toast = useToast();
  const [isPending, startTransition] = useTransition();
  const [subject, setSubject] = useState("");
  const [body, setBody] = useState("");
  const [result, setResult] = useState<string | null>(null);

  function handleSend() {
    if (!subject.trim() || !body.trim()) {
      toast("Гарчиг болон текст оруулна уу.", "error");
      return;
    }
    setResult(null);
    startTransition(async () => {
      const res = await broadcastEmail(subject, body);
      if (res.ok) {
        toast(`${res.sent} хэрэглэгчид имэйл илгээгдлээ.`, "success");
        setResult(`✓ ${res.sent} хэрэглэгчид амжилттай илгээгдлээ.`);
        setSubject("");
        setBody("");
      } else {
        toast(res.error ?? "Алдаа гарлаа.", "error");
        setResult(null);
      }
    });
  }

  const labelStyle: React.CSSProperties = {
    display: "block",
    font: "var(--u-body-s)",
    fontWeight: 600,
    color: "var(--u-ink-2)",
    marginBottom: 6,
    textTransform: "uppercase",
    letterSpacing: "0.06em",
  };

  const inputStyle: React.CSSProperties = {
    width: "100%",
    boxSizing: "border-box",
    borderRadius: "var(--u-r-2)",
    border: "1px solid var(--u-rule-2)",
    padding: "10px 14px",
    font: "var(--u-body)",
    background: "var(--u-surface-2)",
    color: "var(--u-ink)",
    outline: "none",
  };

  return (
    <div style={{ maxWidth: 640 }}>
      <p style={{ font: "var(--u-body)", color: "var(--u-ink-2)", margin: "0 0 24px" }}>
        Имэйл мэдэгдэл идэвхжүүлсэн бүх хэрэглэгчдэд нэг удаа имэйл илгээх.
      </p>

      <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
        <div>
          <label style={labelStyle}>Гарчиг</label>
          <input
            type="text"
            value={subject}
            onChange={(e) => setSubject(e.target.value)}
            placeholder="Имэйлийн гарчиг..."
            disabled={isPending}
            style={{ ...inputStyle, minHeight: 44 }}
          />
        </div>

        <div>
          <label style={labelStyle}>Текст</label>
          <textarea
            value={body}
            onChange={(e) => setBody(e.target.value)}
            placeholder="Имэйлийн агуулга..."
            disabled={isPending}
            rows={8}
            style={{
              ...inputStyle,
              resize: "vertical",
              minHeight: 160,
              lineHeight: 1.6,
            }}
          />
        </div>

        {result ? (
          <p
            style={{
              font: "var(--u-body-s)",
              color: "var(--u-success, #2d7a4f)",
              margin: 0,
            }}
          >
            {result}
          </p>
        ) : null}

        <button
          type="button"
          onClick={handleSend}
          disabled={isPending || !subject.trim() || !body.trim()}
          style={{
            alignSelf: "flex-start",
            minHeight: 44,
            padding: "0 24px",
            border: "none",
            borderRadius: "var(--u-r-2)",
            background: "var(--u-ember)",
            color: "var(--u-ember-ink)",
            font: "var(--u-body)",
            fontWeight: 600,
            cursor: isPending || !subject.trim() || !body.trim() ? "not-allowed" : "pointer",
            opacity: isPending || !subject.trim() || !body.trim() ? 0.65 : 1,
          }}
        >
          {isPending ? "Илгээж байна…" : "Бүгдэд илгээх"}
        </button>
      </div>
    </div>
  );
}
