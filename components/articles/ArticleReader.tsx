"use client";

import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";

export type ArticleReaderProps = {
  title: string;
  bodyMd: string;
  readingMinutes: number | null;
};

export function ArticleReader({ title, bodyMd, readingMinutes }: ArticleReaderProps) {
  return (
    <article
      style={{
        width: "100%",
        maxWidth: 720,
        margin: "0 auto",
        padding: "24px 16px 80px",
        boxSizing: "border-box",
      }}
    >
      <header style={{ marginBottom: 28 }}>
        <h1
          style={{
            fontFamily: "var(--u-display)",
            fontWeight: 700,
            fontSize: "clamp(28px, 4.5vw, 44px)",
            letterSpacing: "-0.02em",
            lineHeight: 1.08,
            margin: "0 0 12px",
            color: "var(--u-ink)",
          }}
        >
          {title}
        </h1>
        {readingMinutes != null && readingMinutes > 0 ? (
          <span
            style={{
              display: "inline-flex",
              alignItems: "center",
              font: "var(--u-body-s)",
              color: "var(--u-ink-3)",
              border: "1px solid var(--u-rule-2)",
              padding: "4px 12px",
              borderRadius: "var(--u-r-pill)",
            }}
          >
            Унших цаг · {readingMinutes} мин
          </span>
        ) : null}
      </header>
      <div
        className="u-prose u-article-body"
        style={{
          fontSize: "clamp(16px, 2.2vw, 18px)",
          lineHeight: 1.7,
          color: "var(--u-ink)",
        }}
      >
        <ReactMarkdown remarkPlugins={[remarkGfm]}>{bodyMd}</ReactMarkdown>
      </div>
    </article>
  );
}
