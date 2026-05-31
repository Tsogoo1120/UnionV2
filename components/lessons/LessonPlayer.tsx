"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { useMediaQuery } from "@/lib/hooks/useMediaQuery";
import { getVideoStreamUrl } from "@/app/actions/video-lessons";
import { getCollectiveReadingStreamUrl } from "@/app/actions/collective-readings";

export type LessonPlayerProps = {
  title: string;
  lessonId: string;
  kind: "video" | "collective";
  posterUrl: string | null;
  heroImageUrl?: string | null;
  descriptionImageUrl?: string | null;
  descriptionMd: string | null;
  prevLessonHref?: string | null;
  nextLessonHref?: string | null;
};

const navBtnStyle = {
  display: "inline-flex" as const,
  alignItems: "center" as const,
  justifyContent: "center" as const,
  minHeight: 48,
  padding: "0 18px",
  borderRadius: "var(--u-r-2)",
  border: "1px solid var(--u-rule-2)",
  background: "var(--u-surface-2)",
  color: "var(--u-ink)",
  font: "var(--u-body-s)",
  fontWeight: 600,
  textDecoration: "none" as const,
  flex: "1 1 0",
};

export function LessonPlayer({
  title,
  lessonId,
  kind,
  posterUrl,
  heroImageUrl,
  descriptionImageUrl,
  descriptionMd,
  prevLessonHref,
  nextLessonHref,
}: LessonPlayerProps) {
  const isMobile = useMediaQuery("(max-width: 640px)");
  const [streamUrl, setStreamUrl] = useState<string | null>(null);
  const [streamError, setStreamError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    setStreamUrl(null);
    setStreamError(null);
    const fetcher =
      kind === "video" ? getVideoStreamUrl : getCollectiveReadingStreamUrl;
    fetcher(lessonId)
      .then((res) => {
        if (cancelled) return;
        if (res.url) setStreamUrl(res.url);
        else setStreamError(res.error ?? "Видео ачаалж чадсангүй.");
      })
      .catch(() => {
        if (!cancelled) setStreamError("Видео ачаалж чадсангүй.");
      });
    return () => {
      cancelled = true;
    };
  }, [lessonId, kind]);

  return (
    <div
      style={{
        width: "100%",
        maxWidth: 960,
        margin: "0 auto",
        padding: isMobile ? "0 0 48px" : "0 16px 48px",
        boxSizing: "border-box",
      }}
    >
      <div style={{ padding: isMobile ? "0 16px" : 0 }}>
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
      </div>
      {heroImageUrl ? (
        <div
          style={{
            width: "100%",
            borderRadius: isMobile ? 0 : "var(--u-r-3)",
            overflow: "hidden",
            marginBottom: 20,
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
      <div style={{ padding: isMobile ? "0 16px" : 0 }}>
        <h1
          style={{
            font: "var(--u-h2)",
            margin: "0 0 var(--u-s-4)",
            color: "var(--u-ink)",
          }}
        >
          {title}
        </h1>
      </div>
      <div
        style={{
          width: "100%",
          borderRadius: isMobile ? 0 : "var(--u-r-3)",
          overflow: "hidden",
          border: isMobile ? "none" : "1px solid var(--u-rule)",
          background: "#000",
          aspectRatio: "16 / 9",
          position: "relative",
        }}
      >
        {streamUrl ? (
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
        ) : (
          <div
            style={{
              position: "absolute",
              inset: 0,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              color: "var(--u-ink-on-dark, #fff)",
              font: "var(--u-body-s)",
              textAlign: "center",
              padding: 16,
              ...(posterUrl
                ? {
                    backgroundImage: `url(${posterUrl})`,
                    backgroundSize: "cover",
                    backgroundPosition: "center",
                  }
                : {}),
            }}
          >
            <span
              style={{
                background: "rgba(0,0,0,0.55)",
                padding: "8px 14px",
                borderRadius: 8,
              }}
            >
              {streamError ?? "Видео бэлдэж байна…"}
            </span>
          </div>
        )}
      </div>
      {descriptionMd?.trim() ? (
        <div
          className="u-prose"
          style={{
            marginTop: "var(--u-s-6)",
            padding: isMobile ? "0 16px" : 0,
            font: "var(--u-body-l)",
            color: "var(--u-ink-2)",
            lineHeight: 1.7,
          }}
        >
          <ReactMarkdown remarkPlugins={[remarkGfm]}>{descriptionMd}</ReactMarkdown>
        </div>
      ) : null}
      {descriptionImageUrl ? (
        <div
          style={{
            marginTop: "var(--u-s-6)",
            padding: isMobile ? "0 16px" : 0,
            borderRadius: "var(--u-r-3)",
            overflow: "hidden",
          }}
        >
          <img
            src={descriptionImageUrl}
            alt=""
            loading="lazy"
            style={{ width: "100%", display: "block", borderRadius: "var(--u-r-3)" }}
          />
        </div>
      ) : null}
      {prevLessonHref || nextLessonHref ? (
        <div
          style={{
            display: "flex",
            gap: 12,
            marginTop: "var(--u-s-8)",
            padding: isMobile ? "0 16px" : 0,
          }}
        >
          {prevLessonHref ? (
            <Link href={prevLessonHref} style={navBtnStyle}>
              ← Өмнөх
            </Link>
          ) : (
            <span style={{ ...navBtnStyle, opacity: 0.4, pointerEvents: "none" }} aria-hidden>
              ← Өмнөх
            </span>
          )}
          {nextLessonHref ? (
            <Link href={nextLessonHref} style={navBtnStyle}>
              Дараах →
            </Link>
          ) : (
            <span style={{ ...navBtnStyle, opacity: 0.4, pointerEvents: "none" }} aria-hidden>
              Дараах →
            </span>
          )}
        </div>
      ) : null}
    </div>
  );
}
