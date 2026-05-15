"use client";

import { useState } from "react";
import type { CSSProperties } from "react";

export type ImageWithFallbackProps = {
  src: string;
  alt: string;
  className?: string;
  style?: CSSProperties;
  /** Use lazy for below-the-fold images */
  loading?: "lazy" | "eager";
};

/**
 * `<img>` with meaningful alt text and a broken-image placeholder using `var(--u-mute)`.
 */
export function ImageWithFallback({
  src,
  alt,
  className,
  style,
  loading = "lazy",
}: ImageWithFallbackProps) {
  const [broken, setBroken] = useState(false);

  if (broken) {
    return (
      <div
        role="img"
        aria-label={alt ? `${alt} — ачааллахад алдаа гарлаа` : "Зураг ачааллахад алдаа гарлаа"}
        className={className}
        style={{
          background: "var(--u-mute)",
          color: "var(--u-ink-3)",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          font: "var(--u-body-s)",
          textAlign: "center",
          padding: 16,
          boxSizing: "border-box",
          ...style,
        }}
      >
        Зураг ачааллахгүй байна
      </div>
    );
  }

  return (
    // eslint-disable-next-line @next/next/no-img-element -- signed URLs / user content; needs onError fallback
    <img
      src={src}
      alt={alt}
      loading={loading}
      className={className}
      style={style}
      onError={() => setBroken(true)}
    />
  );
}
