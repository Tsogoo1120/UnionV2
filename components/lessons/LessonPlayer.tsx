"use client";

import Link from "next/link";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";

export type LessonPlayerProps = {
  title: string;
  streamUrl: string;
  posterUrl: string | null;
  descriptionMd: string | null;
};

export function LessonPlayer({
  title,
  streamUrl,
  posterUrl,
  descriptionMd,
}: LessonPlayerProps) {
  return (
    <div
      style={{
        width: "100%",
        maxWidth: 960,
        margin: "0 auto",
        padding: "0 16px 48px",
        boxSizing: "border-box",
      }}
    >
      <Link
        href="/dashboard?tab=lessons"
        style={{
          display: "inline-flex",
          alignItems: "center",
          minHeight: 44,
          marginBottom: "var(--u-s-4)",
          font: "var(--u-body-s)",
          fontWeight: 600,
          color: "var(--u-ember)",
          textDecoration: "none",
        }}
      >
        ← Хичээлүүд
      </Link>
      <h1
        style={{
          fontFamily: "var(--u-display)",
          fontWeight: 700,
          fontSize: "clamp(26px, 4vw, 40px)",
          letterSpacing: "-0.02em",
          margin: "0 0 16px",
        }}
      >
        {title}
      </h1>
      <div
        style={{
          width: "100%",
          borderRadius: "var(--u-r-3)",
          overflow: "hidden",
          border: "1px solid var(--u-rule)",
          background: "var(--u-ink)",
          aspectRatio: "16 / 9",
        }}
      >
        <video
          controls
          playsInline
          preload="metadata"
          poster={posterUrl ?? undefined}
          src={streamUrl}
          style={{ width: "100%", height: "100%", display: "block" }}
        >
          <track kind="captions" />
        </video>
      </div>
      {descriptionMd?.trim() ? (
        <div
          className="u-prose"
          style={{
            marginTop: 24,
            font: "var(--u-body)",
            color: "var(--u-ink-2)",
            lineHeight: 1.65,
          }}
        >
          <ReactMarkdown remarkPlugins={[remarkGfm]}>{descriptionMd}</ReactMarkdown>
        </div>
      ) : null}
    </div>
  );
}
