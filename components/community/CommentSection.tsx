"use client";

import { useRef, useState, useTransition, type FormEvent } from "react";
import { useRouter } from "next/navigation";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { createComment } from "@/app/actions/community";
import type { Comment } from "@/lib/types";

function fmtDate(iso: string) {
  const d = new Date(iso);
  return `${d.getFullYear()}.${String(d.getMonth() + 1).padStart(2, "0")}.${String(d.getDate()).padStart(2, "0")}`;
}

interface Props {
  postId: string;
  initialComments: Comment[];
  currentUserId: string;
}

export function CommentSection({ postId, initialComments, currentUserId }: Props) {
  const router = useRouter();
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const [body, setBody] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  function handleReply(replyToBody: string) {
    const quote = replyToBody
      .split("\n")
      .slice(0, 2)
      .map((l) => `> ${l}`)
      .join("\n");
    setBody((prev) => (prev ? `${quote}\n\n${prev}` : `${quote}\n\n`));
    textareaRef.current?.scrollIntoView({ behavior: "smooth", block: "center" });
    setTimeout(() => textareaRef.current?.focus(), 100);
  }

  function handleSubmit(e: FormEvent) {
    e.preventDefault();
    const trimmed = body.trim();
    if (!trimmed) return;
    setError(null);
    startTransition(async () => {
      const result = await createComment(postId, trimmed);
      if (result.error) {
        setError(result.error);
      } else {
        setBody("");
        router.refresh();
      }
    });
  }

  return (
    <section style={{ marginTop: 40, borderTop: "1px solid var(--u-rule)", paddingTop: 24 }}>
      <h2 className="u-eyebrow" style={{ marginBottom: 16 }}>
        Comments ({initialComments.length})
      </h2>

      {initialComments.length === 0 ? (
        <div
          style={{
            padding: "20px 16px",
            borderRadius: "var(--u-r-2)",
            background: "var(--u-surface-2)",
            border: "1px dashed var(--u-rule-2)",
            textAlign: "center",
            marginBottom: 24,
          }}
        >
          <p style={{ color: "var(--u-ink-2)", font: "var(--u-body)", margin: 0 }}>
            No comments yet. Be the first to leave one.
          </p>
        </div>
      ) : (
        <div style={{ marginBottom: 24 }}>
          {initialComments.map((c) => {
            const isOwn = c.user_id === currentUserId;
            return (
              <div
                key={c.id}
                style={{
                  padding: "14px 0",
                  borderBottom: "1px solid var(--u-rule)",
                }}
              >
                <div
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                    marginBottom: 6,
                  }}
                >
                  <span style={{ font: "var(--u-body-s)", color: "var(--u-ink-3)", fontWeight: 600 }}>
                    {isOwn ? "You" : "Member"}
                  </span>
                  <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                    <span style={{ font: "var(--u-mono)", fontSize: 11, color: "var(--u-ink-4)" }}>
                      {fmtDate(c.created_at)}
                    </span>
                    <button
                      type="button"
                      onClick={() => handleReply(c.body)}
                      style={{
                        background: "none",
                        border: "none",
                        cursor: "pointer",
                        font: "var(--u-body-s)",
                        color: "var(--u-ember)",
                        fontWeight: 600,
                        padding: 0,
                      }}
                    >
                      Reply
                    </button>
                  </div>
                </div>
                <div style={{ font: "var(--u-body-s)", color: "var(--u-ink-2)", lineHeight: 1.6, paddingLeft: 12, borderLeft: '2px solid var(--u-rule-2)' }}>
                  <ReactMarkdown remarkPlugins={[remarkGfm]}>{c.body}</ReactMarkdown>
                </div>
              </div>
            );
          })}
        </div>
      )}

      <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: 10 }}>
        <textarea
          ref={textareaRef}
          value={body}
          onChange={(e) => setBody(e.target.value)}
          rows={4}
          placeholder="Write a comment…"
          disabled={isPending}
          style={{
            width: "100%",
            resize: "vertical",
            font: "var(--u-body-s)",
            color: "var(--u-ink)",
            background: "var(--u-surface-2)",
            border: "1px solid var(--u-rule)",
            borderRadius: "var(--u-r-2)",
            padding: "10px 12px",
            outline: "none",
            boxSizing: "border-box",
          }}
        />
        {error && (
          <p style={{ font: "var(--u-body-s)", color: "var(--u-danger, #e53e3e)", margin: 0 }}>{error}</p>
        )}
        <div style={{ display: "flex", justifyContent: "flex-end" }}>
          <button
            type="submit"
            disabled={isPending || !body.trim()}
            style={{
              background: "var(--u-ember)",
              color: "#fff",
              border: "none",
              borderRadius: "var(--u-r-2)",
              padding: "9px 20px",
              font: "var(--u-body-s)",
              fontWeight: 700,
              cursor: isPending ? "not-allowed" : "pointer",
              opacity: isPending || !body.trim() ? 0.6 : 1,
            }}
          >
            {isPending ? "Sending…" : "Send"}
          </button>
        </div>
      </form>
    </section>
  );
}
