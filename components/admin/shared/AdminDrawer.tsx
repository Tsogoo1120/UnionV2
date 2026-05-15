"use client";

import type { FormEvent, ReactNode } from "react";

export const adminInputStyle: React.CSSProperties = {
  padding: 10,
  borderRadius: 8,
  border: "1px solid var(--u-rule-2)",
  background: "var(--u-surface)",
  color: "var(--u-ink)",
  font: "var(--u-body)",
  width: "100%",
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
  if (!open) return null;

  const w = typeof width === "number" ? `${width}px` : width;

  return (
    <DrawerBackdrop onClose={onClose}>
      <form
        onSubmit={onSubmit}
        onClick={(e) => e.stopPropagation()}
        role="dialog"
        aria-modal="true"
        style={{
          position: "absolute",
          top: 0,
          right: 0,
          height: "100%",
          width: `min(${w}, 100%)`,
          background: "var(--u-surface)",
          borderLeft: "1px solid var(--u-rule)",
          boxShadow: "var(--u-shadow-3)",
          padding: 24,
          display: "flex",
          flexDirection: "column",
          gap: 12,
          overflow: "hidden",
        }}
      >
        <div className="u-eyebrow">{title}</div>
        <div style={{ flex: 1, overflow: "auto", display: "flex", flexDirection: "column", gap: 12 }}>
          {children}
        </div>
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
        padding: 12,
        borderRadius: 8,
        border: "1px solid var(--u-rule-2)",
        background: "transparent",
        cursor: "pointer",
        font: "var(--u-body-s)",
      }}
    >
      Цуцлах
    </button>
  );
}

export function DrawerSubmitButton({
  pending,
  label = "Хадгалах",
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
        padding: 12,
        borderRadius: 8,
        border: "none",
        background: "var(--u-ink)",
        color: "var(--u-bg)",
        cursor: pending ? "wait" : "pointer",
        font: "var(--u-body-s)",
        fontWeight: 500,
      }}
    >
      {pending ? "Хадгалж байна…" : label}
    </button>
  );
}
