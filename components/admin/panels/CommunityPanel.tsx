"use client";

import Link from "next/link";
import { useTransition } from "react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { adminHidePost } from "@/app/actions/community";
import type { CommunityPost } from "@/lib/types";

export function CommunityPanel({ posts }: { posts: CommunityPost[] }) {
  const [pending, startTransition] = useTransition();

  function toggleHide(id: string, hide: boolean) {
    startTransition(async () => {
      await adminHidePost(id, hide);
      window.location.reload();
    });
  }

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
      {posts.length === 0 ? (
        <div
          style={{
            padding: "28px 20px",
            textAlign: "center",
            borderRadius: "var(--u-r-3)",
            border: "1px dashed var(--u-rule-2)",
            background: "var(--u-surface-2)",
          }}
        >
          <div style={{ font: "var(--u-h4)", fontWeight: 600, marginBottom: 8 }}>Модерацийн дараалал хоосон</div>
          <p style={{ font: "var(--u-body)", color: "var(--u-ink-2)", margin: "0 0 18px", lineHeight: 1.55 }}>
            Нуугдах пост байхгүй. Нийгэмлэгийн идэвхийг доорх холбоосоор үзнэ үү.
          </p>
          <Link
            href="/community"
            style={{
              display: "inline-flex",
              alignItems: "center",
              justifyContent: "center",
              minHeight: 48,
              padding: "0 20px",
              borderRadius: "var(--u-r-2)",
              background: "var(--u-ink)",
              color: "var(--u-bg)",
              font: "var(--u-body-s)",
              fontWeight: 600,
              textDecoration: "none",
            }}
          >
            Нийгэмлэг рүү орох
          </Link>
        </div>
      ) : (
        posts.map((p) => (
          <div
            key={p.id}
            style={{
              border: "1px solid var(--u-rule)",
              borderRadius: "var(--u-r-3)",
              padding: 16,
              background: "var(--u-surface-2)",
            }}
          >
            <div style={{ display: "flex", justifyContent: "space-between", gap: 12, marginBottom: 8 }}>
              <strong>{p.title}</strong>
              <span style={{ font: "var(--u-mono)", fontSize: 11, color: "var(--u-ink-3)" }}>{p.id.slice(0, 8)}…</span>
            </div>
            <div style={{ font: "var(--u-body-s)", color: "var(--u-ink-2)", maxHeight: 120, overflow: "auto" }}>
              <ReactMarkdown remarkPlugins={[remarkGfm]}>{p.body.slice(0, 500)}</ReactMarkdown>
            </div>
            <div style={{ marginTop: 12, display: "flex", gap: 8, alignItems: "center" }}>
              <span style={{ font: "var(--u-body-s)", color: p.is_hidden ? "var(--u-danger)" : "var(--u-success)" }}>
                {p.is_hidden ? "Нуугдсан" : "Илэрхий"}
              </span>
              <button
                type="button"
                disabled={pending}
                onClick={() => toggleHide(p.id, !p.is_hidden)}
                style={{
                  padding: "6px 12px",
                  borderRadius: 6,
                  border: "1px solid var(--u-rule-2)",
                  background: "transparent",
                  cursor: "pointer",
                }}
              >
                {p.is_hidden ? "Нээх" : "Нуух"}
              </button>
            </div>
          </div>
        ))
      )}
    </div>
  );
}
