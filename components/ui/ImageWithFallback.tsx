"use client";

import { useState } from "react";
import type { CSSProperties } from "react";
import { gradForKey } from "@/lib/ui-gradients";

export type ImageWithFallbackProps = {
  src: string;
  alt: string;
  className?: string;
  style?: CSSProperties;
  /** Use lazy for below-the-fold images */
  loading?: "lazy" | "eager";
  /** Deterministic gradient when image fails (e.g. lesson slug or post id) */
  gradientKey?: string;
};

/**
 * `<img>` with meaningful alt text and a gradient placeholder on load error.
 */
export function ImageWithFallback({
  src,
  alt,
  className,
  style,
  loading = "lazy",
  gradientKey,
}: ImageWithFallbackProps) {
  const [broken, setBroken] = useState(false);
  const grad = gradForKey(gradientKey ?? src);

  if (broken) {
    return (
      <div
        role="img"
        aria-label={alt ? `${alt} — ачааллахад алдаа гарлаа` : "Зураг ачааллахад алдаа гарлаа"}
        className={className}
        style={{
          background: grad,
          color: "var(--u-dark-ink-2)",
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
