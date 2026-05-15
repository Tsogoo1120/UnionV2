"use client";

import Image from "next/image";
import Link from "next/link";
import { useCallback, useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { cn } from "@/lib/utils";
import type { ServicePreviewItem } from "@/lib/queries/service-previews";

const EASE = "cubic-bezier(0.2, 0.7, 0.2, 1)";
const DUR_MS = 200;

type ServiceMeta = {
  n: string;
  title: string;
  sub: string;
  body: string;
};

type Props = {
  open: boolean;
  onClose: () => void;
  service: ServiceMeta;
  items: ServicePreviewItem[];
};

const fallbackGradients = [
  "bg-[linear-gradient(135deg,var(--u-ember),var(--u-danger))]",
  "bg-[linear-gradient(135deg,var(--u-indigo),var(--u-dark))]",
  "bg-[linear-gradient(135deg,var(--u-ink-2),var(--u-dark))]",
] as const;

const cardClass =
  "group flex flex-col overflow-hidden rounded-[var(--u-r-3)] border border-[var(--u-rule)] bg-[var(--u-surface-2)] text-inherit no-underline shadow-[var(--u-shadow-1)] transition-[transform,box-shadow] duration-[var(--u-dur-2)] ease-[var(--u-ease)] hover:-translate-y-px hover:shadow-[var(--u-shadow-2)] motion-reduce:transition-none motion-reduce:hover:translate-y-0";

export function ServicePreviewModal({ open, onClose, service, items }: Props) {
  const [mounted, setMounted] = useState(false);
  const [active, setActive] = useState(false);
  const closeBtnRef = useRef<HTMLButtonElement | null>(null);
  const closeRef = useRef(onClose);
  closeRef.current = onClose;

  const handleClose = useCallback(() => {
    closeRef.current();
  }, []);

  useEffect(() => {
    if (open) {
      setMounted(true);
      const id = window.requestAnimationFrame(() => {
        window.requestAnimationFrame(() => setActive(true));
      });
      return () => window.cancelAnimationFrame(id);
    }
    setActive(false);
    const t = window.setTimeout(() => setMounted(false), DUR_MS);
    return () => window.clearTimeout(t);
  }, [open]);

  useEffect(() => {
    if (!mounted) return;
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        e.stopPropagation();
        handleClose();
      }
    };
    document.addEventListener("keydown", onKeyDown);
    return () => document.removeEventListener("keydown", onKeyDown);
  }, [mounted, handleClose]);

  useEffect(() => {
    if (!mounted) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = prev;
    };
  }, [mounted]);

  useEffect(() => {
    if (active) {
      closeBtnRef.current?.focus();
    }
  }, [active]);

  if (!mounted) return null;

  const transition = `opacity var(--u-dur-2) ${EASE}, transform var(--u-dur-2) ${EASE}, background-color var(--u-dur-2) ${EASE}`;

  const overlay = (
    <div
      style={{
        position: "fixed",
        inset: 0,
        zIndex: 200,
        pointerEvents: active ? "auto" : "none",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        padding: "max(16px, env(safe-area-inset-top, 0px)) 16px",
      }}
    >
      <div
        role="presentation"
        onClick={handleClose}
        style={{
          position: "absolute",
          inset: 0,
          backgroundColor: active ? "rgba(20, 17, 13, 0.46)" : "rgba(20, 17, 13, 0)",
          cursor: "pointer",
          transition,
          WebkitTapHighlightColor: "transparent",
        }}
      />
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="service-preview-title"
        style={{
          position: "relative",
          zIndex: 1,
          width: "100%",
          maxWidth: "min(960px, 100%)",
          maxHeight: "min(88vh, 100%)",
          overflow: "auto",
          background: "var(--u-bg)",
          border: "1px solid var(--u-rule)",
          borderRadius: "var(--u-r-4)",
          boxShadow: "var(--u-shadow-3)",
          opacity: active ? 1 : 0,
          transform: active ? "scale(1)" : "scale(0.96)",
          transition,
          willChange: "transform, opacity",
        }}
        className="motion-reduce:!transition-none"
      >
        <div className="flex items-start justify-between gap-4 border-b border-[var(--u-rule)] px-[var(--u-s-6)] py-[var(--u-s-5)] sm:px-[var(--u-s-8)] sm:py-[var(--u-s-6)]">
          <div className="min-w-0">
            <div className="font-[family-name:var(--u-mono)] text-[12px] tracking-[0.08em] text-[var(--u-ink-3)]">
              {service.n} · {service.sub}
            </div>
            <h2
              id="service-preview-title"
              className="mt-1 font-[family-name:var(--u-display)] text-[clamp(1.5rem,4vw,2rem)] font-bold leading-[1.05] tracking-[-0.02em]"
            >
              {service.title}
            </h2>
            <p className="mt-2 max-w-[60ch] text-pretty font-[var(--u-body-s)] text-[var(--u-ink-2)]">
              {service.body}
            </p>
          </div>
          <button
            ref={closeBtnRef}
            type="button"
            onClick={handleClose}
            aria-label="Хаах"
            className="-mr-2 -mt-2 inline-flex h-11 w-11 shrink-0 items-center justify-center rounded-[var(--u-r-pill)] text-[var(--u-ink-2)] transition-[background-color,color] duration-[var(--u-dur-2)] ease-[var(--u-ease)] hover:bg-[var(--u-surface)] hover:text-[var(--u-ink)]"
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" aria-hidden>
              <path d="M6 6l12 12M18 6L6 18" />
            </svg>
          </button>
        </div>

        <div className="grid grid-cols-1 gap-4 px-[var(--u-s-6)] py-[var(--u-s-6)] sm:grid-cols-2 sm:px-[var(--u-s-8)] sm:py-[var(--u-s-8)] md:grid-cols-3">
          {items.map((item, i) => (
            <article key={item.id} className={cardClass}>
              <div className={cn("relative aspect-[16/10]", !item.imageUrl && fallbackGradients[i % fallbackGradients.length])}>
                {item.imageUrl ? (
                  <Image
                    src={item.imageUrl}
                    alt=""
                    fill
                    sizes="(max-width: 768px) 100vw, 33vw"
                    loading="lazy"
                    className="object-cover"
                  />
                ) : (
                  <Image
                    src="/union-monogram.svg"
                    alt=""
                    fill
                    sizes="(max-width: 768px) 100vw, 33vw"
                    loading="lazy"
                    className="object-contain p-[16%_20%] opacity-[0.16]"
                  />
                )}
              </div>
              <div className="flex flex-1 flex-col gap-2 p-4 sm:p-5">
                <h3 className="font-[family-name:var(--u-display)] text-[clamp(1rem,2vw,1.125rem)] font-bold leading-[1.15] tracking-[-0.01em]">
                  {item.title}
                </h3>
                {item.description ? (
                  <p className="font-[var(--u-body-s)] leading-[1.5] text-[var(--u-ink-2)]">
                    {item.description}
                  </p>
                ) : null}
              </div>
            </article>
          ))}
        </div>

        <div className="flex flex-col items-stretch gap-3 border-t border-[var(--u-rule)] px-[var(--u-s-6)] py-[var(--u-s-5)] sm:flex-row sm:items-center sm:justify-between sm:px-[var(--u-s-8)] sm:py-[var(--u-s-6)]">
          <p className="font-[var(--u-body-s)] text-[var(--u-ink-3)]">
            Гишүүнчлэл аваад бүгдийг бүрэн үзэх боломжтой.
          </p>
          <Link
            href="/dashboard"
            className="inline-flex min-h-11 items-center justify-center gap-1.5 rounded-[var(--u-r-pill)] bg-[var(--u-ink)] px-5 py-2.5 font-[var(--u-body-s)] font-medium text-[var(--u-bg)] no-underline transition-[background-color,transform] duration-[var(--u-dur-2)] ease-[var(--u-ease)] hover:bg-[var(--u-ember)] motion-reduce:transition-none"
          >
            Бүгдийг үзэх <span aria-hidden>→</span>
          </Link>
        </div>
      </div>
    </div>
  );

  return createPortal(overlay, document.body);
}
