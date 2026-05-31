"use client";

import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";

export type ArticleReaderProps = {
  title: string;
  bodyMd: string;
  readingMinutes: number | null;
  heroImageUrl?: string | null;
  descriptionImageUrl?: string | null;
};

export function ArticleReader({ title, bodyMd, readingMinutes, heroImageUrl, descriptionImageUrl }: ArticleReaderProps) {
  return (
    <article
      style={{
        width: "100%",
        maxWidth: "68ch",
        margin: "0 auto",
        padding: "24px 16px 80px",
        boxSizing: "border-box",
        overflowX: "hidden",
      }}
    >
      {heroImageUrl ? (
        <div
          style={{
            width: "100%",
            borderRadius: "var(--u-r-3)",
            overflow: "hidden",
            marginBottom: "var(--u-s-8)",
            aspectRatio: "21 / 9",
          }}
        >
          <img
            src={heroImageUrl}
            alt=""
            loading="lazy"
            style={{ width: "100%", height: "100%", objectFit: "cover", display: "block" }}
          />
        </div>
      ) : null}
      <header style={{ marginBottom: "var(--u-s-8)" }}>
        <h1
          style={{
            font: "var(--u-h1)",
            letterSpacing: "-0.02em",
            margin: "0 0 var(--u-s-4)",
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
      {descriptionImageUrl ? (
        <div style={{ marginBottom: "var(--u-s-8)", borderRadius: "var(--u-r-3)", overflow: "hidden" }}>
          <img
            src={descriptionImageUrl}
            alt=""
            loading="lazy"
            style={{ width: "100%", display: "block" }}
          />
        </div>
      ) : null}
      <div className="u-prose u-article-body">
        <ReactMarkdown remarkPlugins={[remarkGfm]}>{bodyMd}</ReactMarkdown>
      </div>
    </article>
  );
}
