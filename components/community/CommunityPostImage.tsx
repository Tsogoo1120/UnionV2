"use client";

import { ImageWithFallback } from "@/components/ui/ImageWithFallback";

export function CommunityPostImage({ src, title }: { src: string; title: string }) {
  return (
    <div style={{ marginBottom: 20, borderRadius: "var(--u-r-3)", overflow: "hidden" }}>
      <ImageWithFallback
        src={src}
        alt={title ? `${title} — зураг` : "Постын зураг"}
        loading="lazy"
        style={{ width: "100%", height: "auto", display: "block" }}
      />
    </div>
  );
}
