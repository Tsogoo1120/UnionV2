"use client";

import Link from "next/link";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { ImageWithFallback } from "@/components/ui/ImageWithFallback";

function fmtDate(iso: string) {
  const d = new Date(iso);
  return `${d.getFullYear()}.${String(d.getMonth() + 1).padStart(2, "0")}.${String(d.getDate()).padStart(2, "0")}`;
}

export type CommunityFeedPost = {
  id: string;
  title: string;
  body: string;
  created_at: string;
  authorLabel: string;
  commentCount: number;
  imageUrl: string | null;
};

export function CommunityFeed({ posts }: { posts: CommunityFeedPost[] }) {
  if (posts.length === 0) {
    return (
      <div
        style={{
          padding: "40px 24px",
          textAlign: "center",
          background: "var(--u-surface-2)",
          border: "1px solid var(--u-rule)",
          borderRadius: "var(--u-r-3)",
        }}
      >
        <div style={{ font: "var(--u-h3)", fontWeight: 600, marginBottom: 10 }}>Одоогоор пост байхгүй</div>
        <p style={{ font: "var(--u-body)", color: "var(--u-ink-2)", margin: "0 0 22px", lineHeight: 1.55 }}>
          Та эхний постоо бичиж, нийгэмлэгийг эхлүүлээрэй.
        </p>
        <p style={{ font: "var(--u-body-s)", color: "var(--u-ink-3)", margin: 0 }}>
          Доорх товчоор шинэ пост нээнэ үү.
        </p>
      </div>
    );
  }

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 16, paddingBottom: 120 }}>
      {posts.map((p) => (
        <Link
          key={p.id}
          href={`/community/${p.id}`}
          style={{
            textDecoration: "none",
            color: "inherit",
            display: "block",
            background: "var(--u-surface-2)",
            border: "1px solid var(--u-rule)",
            borderRadius: "var(--u-r-3)",
            overflow: "hidden",
          }}
        >
          <div style={{ padding: "18px 20px 16px" }}>
            <div style={{ display: "flex", justifyContent: "space-between", gap: 12, marginBottom: 8 }}>
              <span style={{ font: "var(--u-body-s)", color: "var(--u-ink-3)" }}>{p.authorLabel}</span>
              <span style={{ font: "var(--u-mono)", fontSize: 11, color: "var(--u-ink-4)" }}>
                {fmtDate(p.created_at)}
              </span>
            </div>
            <h2 style={{ font: "var(--u-h3)", margin: "0 0 10px", color: "var(--u-ink)" }}>{p.title}</h2>
            {p.imageUrl ? (
              <div style={{ width: "100%", marginBottom: 12, borderRadius: "var(--u-r-2)", overflow: "hidden" }}>
                <ImageWithFallback
                  src={p.imageUrl}
                  alt={p.title ? `${p.title} — зураг` : "Постын зураг"}
                  loading="lazy"
                  style={{ width: "100%", height: "auto", display: "block", maxHeight: 280, objectFit: "cover" }}
                />
              </div>
            ) : null}
            <div
              style={{
                font: "var(--u-body-s)",
                color: "var(--u-ink-2)",
                lineHeight: 1.55,
                display: "-webkit-box",
                WebkitLineClamp: 4,
                WebkitBoxOrient: "vertical",
                overflow: "hidden",
              }}
            >
              <ReactMarkdown remarkPlugins={[remarkGfm]} disallowedElements={["img"]} unwrapDisallowed>
                {p.body.length > 400 ? `${p.body.slice(0, 400)}…` : p.body}
              </ReactMarkdown>
            </div>
            <div style={{ marginTop: 12, font: "var(--u-body-s)", color: "var(--u-ember)" }}>
              Сэтгэгдэл · {p.commentCount}
            </div>
          </div>
        </Link>
      ))}
    </div>
  );
}
