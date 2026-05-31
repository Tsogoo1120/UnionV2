"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useId,
  useRef,
  useState,
} from "react";
import { createPortal } from "react-dom";
import { useMediaQuery } from "@/lib/hooks/useMediaQuery";

export type ToastKind = "success" | "error" | "info";

type ToastItem = { id: number; message: string; kind: ToastKind };

type ShowToast = (message: string, kind?: ToastKind) => void;

const ToastContext = createContext<ShowToast | null>(null);

const TOAST_MS = 4800;

export function useToast(): ShowToast {
  const ctx = useContext(ToastContext);
  if (!ctx) {
    return () => {
      /* no provider */
    };
  }
  return ctx;
}

function ToastViewport({ items }: { items: ToastItem[] }) {
  const rid = useId();
  const isMobile = useMediaQuery("(max-width: 640px)");
  if (items.length === 0) return null;

  return createPortal(
    <div
      role="region"
      aria-live="polite"
      aria-relevant="additions text"
      aria-label="Мэдэгдэл"
      id={rid}
      style={{
        position: "fixed",
        zIndex: 60,
        display: "flex",
        flexDirection: "column",
        gap: 10,
        pointerEvents: "none",
        ...(isMobile
          ? {
              left: 16,
              right: 16,
              bottom: "calc(64px + env(safe-area-inset-bottom, 0px) + 12px)",
              alignItems: "stretch",
              maxWidth: 420,
              margin: "0 auto",
            }
          : {
              right: 24,
              bottom: 24,
              alignItems: "flex-end",
              maxWidth: 420,
            }),
      }}
    >
      {items.map((t) => (
        <div
          key={t.id}
          role="status"
          style={{
            pointerEvents: "auto",
            padding: "14px 18px",
            borderRadius: "var(--u-r-2)",
            boxShadow: "var(--u-shadow-3)",
            font: "var(--u-body-s)",
            fontWeight: 500,
            border: "1px solid var(--u-rule-2)",
            background:
              t.kind === "success"
                ? "var(--u-success-soft)"
                : t.kind === "error"
                  ? "var(--u-danger-soft)"
                  : "var(--u-surface-2)",
            color:
              t.kind === "success"
                ? "var(--u-success)"
                : t.kind === "error"
                  ? "var(--u-danger)"
                  : "var(--u-ink)",
          }}
        >
          {t.message}
        </div>
      ))}
    </div>,
    document.body,
  );
}

export function ToastProvider({ children }: { children: React.ReactNode }) {
  const [items, setItems] = useState<ToastItem[]>([]);
  const seq = useRef(0);
  const timers = useRef<Map<number, number>>(new Map());

  const dismiss = useCallback((id: number) => {
    const tid = timers.current.get(id);
    if (tid) window.clearTimeout(tid);
    timers.current.delete(id);
    setItems((prev) => prev.filter((x) => x.id !== id));
  }, []);

  const show = useCallback<ShowToast>((message, kind = "info") => {
    const id = ++seq.current;
    setItems((prev) => [...prev, { id, message, kind }]);
    const tid = window.setTimeout(() => dismiss(id), TOAST_MS);
    timers.current.set(id, tid);
  }, [dismiss]);

  useEffect(() => {
    return () => {
      for (const t of Array.from(timers.current.values())) window.clearTimeout(t);
      timers.current.clear();
    };
  }, []);

  return (
    <ToastContext.Provider value={show}>
      {children}
      <ToastViewport items={items} />
    </ToastContext.Provider>
  );
}
