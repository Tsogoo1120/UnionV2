"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import type { CSSProperties, ReactNode } from "react";
import { createPortal } from "react-dom";

const EASE = "cubic-bezier(0.2, 0.7, 0.2, 1)";
const DUR_MS = 200;

export type MobileDrawerSide = "left" | "right" | "bottom";

export type MobileDrawerProps = {
  open: boolean;
  onClose: () => void;
  side: MobileDrawerSide;
  children: ReactNode;
  /** Merged into the panel positioning box (width, maxHeight, etc.). */
  panelStyle?: CSSProperties;
};

export function MobileDrawer({
  open,
  onClose,
  side,
  children,
  panelStyle: panelStyleExtra,
}: MobileDrawerProps) {
  const [mounted, setMounted] = useState(false);
  const [active, setActive] = useState(false);
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

    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = prevOverflow;
    };
  }, [mounted]);

  if (!mounted) return null;

  const transition = `background-color var(--u-dur-2) ${EASE}, transform var(--u-dur-2) ${EASE}`;

  const panelBase: CSSProperties = {
    position: "fixed",
    zIndex: 101,
    background: "var(--u-surface)",
    boxShadow: "var(--u-shadow-3)",
    transition,
    willChange: "transform",
  };

  let panelStyle: CSSProperties = panelBase;

  if (side === "left") {
    panelStyle = {
      ...panelStyle,
      top: 0,
      bottom: 0,
      left: 0,
      width: "min(320px, 88vw)",
      maxWidth: "100%",
      transform: active ? "translateX(0)" : "translateX(-100%)",
      borderRight: "1px solid var(--u-border-strong)",
    };
  } else if (side === "right") {
    panelStyle = {
      ...panelStyle,
      top: 0,
      bottom: 0,
      right: 0,
      width: "min(320px, 88vw)",
      maxWidth: "100%",
      transform: active ? "translateX(0)" : "translateX(100%)",
      borderLeft: "1px solid var(--u-border-strong)",
    };
  } else {
    panelStyle = {
      ...panelStyle,
      left: 0,
      right: 0,
      bottom: 0,
      maxHeight: "min(88vh, 100%)",
      overflow: "auto",
      borderTopLeftRadius: "var(--u-radius-20)",
      borderTopRightRadius: "var(--u-radius-20)",
      transform: active ? "translateY(0)" : "translateY(100%)",
      paddingTop: 12,
      paddingBottom: "calc(16px + env(safe-area-inset-bottom, 0px))",
    };
  }

  if (panelStyleExtra) {
    panelStyle = { ...panelStyle, ...panelStyleExtra };
  }

  const overlay = (
    <div
      style={{
        position: "fixed",
        inset: 0,
        zIndex: 100,
        pointerEvents: active ? "auto" : "none",
      }}
    >
      <div
        role="presentation"
        onClick={handleClose}
        style={{
          position: "absolute",
          inset: 0,
          backgroundColor: active ? "rgba(0, 0, 0, 0.4)" : "rgba(0, 0, 0, 0)",
          cursor: "pointer",
          transition,
          WebkitTapHighlightColor: "transparent",
        }}
      />
      <div role="dialog" aria-modal="true" style={panelStyle}>
        {side === "bottom" ? (
          <div
            style={{
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              marginBottom: 12,
            }}
          >
            <div
              aria-hidden
              style={{
                width: 40,
                height: 4,
                borderRadius: 999,
                background: "var(--u-rule-2)",
              }}
            />
          </div>
        ) : null}
        {children}
      </div>
    </div>
  );

  return createPortal(overlay, document.body);
}
