"use client";

import { useEffect, useState, type CSSProperties, type FormEvent, type ReactNode } from "react";
import { useMediaQuery } from "@/lib/hooks/useMediaQuery";

export const adminInputStyle: CSSProperties = {
  padding: "10px 14px",
  borderRadius: "var(--u-r-2)",
  border: "1px solid var(--u-rule-2)",
  background: "var(--u-surface-2)",
  color: "var(--u-ink)",
  font: "var(--u-body)",
  width: "100%",
  minHeight: 48,
  boxSizing: "border-box",
};

export function AdminFieldLabel({
  children,
  htmlFor,
}: {
  children: ReactNode;
  htmlFor?: string;
}) {
  return (
    <label
      htmlFor={htmlFor}
      className="u-eyebrow"
      style={{ display: "flex", flexDirection: "column", gap: 4 }}
    >
      {children}
    </label>
  );
}

type AdminDrawerProps = {
  open: boolean;
  onClose: () => void;
  title: string;
  width?: number | string;
  onSubmit: (e: FormEvent<HTMLFormElement>) => void;
  children: ReactNode;
  footer: ReactNode;
};

export function AdminDrawer({
  open,
  onClose,
  title,
  width = 440,
  onSubmit,
  children,
  footer,
}: AdminDrawerProps) {
  const [entered, setEntered] = useState(false);
  const isMobile = useMediaQuery("(max-width: 480px)");

  useEffect(() => {
    if (!open) {
      setEntered(false);
      return;
    }
    const t = requestAnimationFrame(() => setEntered(true));
    return () => cancelAnimationFrame(t);
  }, [open]);

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open, onClose]);

  if (!open) return null;

  const w = isMobile ? "100%" : typeof width === "number" ? `${width}px` : width;

  return (
    <DrawerBackdrop onClose={onClose}>
      <form
        onSubmit={onSubmit}
        onClick={(e) => e.stopPropagation()}
        role="dialog"
        aria-modal="true"
        aria-labelledby="admin-drawer-title"
        style={{
          position: "absolute",
          top: 0,
          right: 0,
          height: "100%",
          width: `min(${w}, 100%)`,
          background: "var(--u-surface)",
          borderLeft: isMobile ? "none" : "1px solid var(--u-rule)",
          boxShadow: "var(--u-shadow-3)",
          padding: "24px 24px calc(24px + env(safe-area-inset-bottom, 0px))",
          display: "flex",
          flexDirection: "column",
          gap: 12,
          overflow: "hidden",
          transform: entered ? "translateX(0)" : "translateX(100%)",
          transition: `transform var(--u-dur-3) var(--u-ease-out)`,
        }}
      >
        <button
          type="button"
          aria-label="Close"
          onClick={onClose}
          style={{
            position: "absolute",
            top: 16,
            right: 16,
            width: 36,
            height: 36,
            borderRadius: "var(--u-r-pill)",
            background: "var(--u-surface)",
            border: "1px solid var(--u-rule-2)",
            cursor: "pointer",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            fontSize: 18,
            color: "var(--u-ink-2)",
            zIndex: 1,
          }}
        >
          ✕
        </button>
        <div id="admin-drawer-title" style={{ font: "var(--u-h3)", fontWeight: 600, paddingRight: 40 }}>
          {title}
        </div>
        <div style={{ flex: 1, overflow: "auto", display: "flex", flexDirection: "column", gap: 12 }}>{children}</div>
        <div
          style={{
            flexShrink: 0,
            paddingTop: 12,
            borderTop: "1px solid var(--u-rule)",
            display: "flex",
            gap: 10,
          }}
        >
          {footer}
        </div>
      </form>
    </DrawerBackdrop>
  );
}

function DrawerBackdrop({
  onClose,
  children,
}: {
  onClose: () => void;
  children: ReactNode;
}) {
  return (
    <div
      role="presentation"
      onClick={onClose}
      style={{
        position: "fixed",
        inset: 0,
        background: "rgba(20,17,13,.32)",
        zIndex: 50,
      }}
    >
      {children}
    </div>
  );
}

export function DrawerCancelButton({
  onClick,
  disabled,
}: {
  onClick: () => void;
  disabled?: boolean;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      style={{
        flex: 1,
        minHeight: 52,
        padding: 12,
        borderRadius: "var(--u-r-2)",
        border: "1px solid var(--u-rule-2)",
        background: "transparent",
        cursor: "pointer",
        font: "var(--u-body-s)",
      }}
    >
      Cancel
    </button>
  );
}

export function DrawerSubmitButton({
  pending,
  label = "Save",
}: {
  pending: boolean;
  label?: string;
}) {
  return (
    <button
      type="submit"
      disabled={pending}
      style={{
        flex: 1,
        minHeight: 52,
        padding: 12,
        borderRadius: "var(--u-r-2)",
        border: "none",
        background: "var(--u-ember)",
        color: "var(--u-ember-ink)",
        cursor: pending ? "wait" : "pointer",
        font: "var(--u-body-s)",
        fontWeight: 600,
      }}
    >
      {pending ? "Saving…" : label}
    </button>
  );
}
