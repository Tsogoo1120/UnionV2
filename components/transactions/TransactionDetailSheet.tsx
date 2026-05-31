"use client";

import type { CSSProperties } from "react";
import Image from "next/image";
import Link from "next/link";
import { useEffect, useRef, useState, useTransition } from "react";
import {
  fetchTransactionDetail,
  type TransactionDetailResult,
} from "@/app/actions/transactions";
import type { TransactionRow } from "@/lib/queries/transactions";
import { formatDate, formatMNT, statusLabel } from "@/lib/format";
import { MobileDrawer } from "@/components/shell/MobileDrawer";
import { useToast } from "@/components/shell/Toast";
import { ImageWithFallback } from "@/components/ui/ImageWithFallback";
import { mapServerErrorToMn } from "@/lib/i18n/action-feedback";
import { toneToBadgeStyle, transactionKindDetailTitle } from "./transaction-ui";

type FetchResult = TransactionDetailResult;

function slotWhenLabel(
  start: string | null | undefined,
  end: string | null | undefined,
): string {
  if (!start) return "";
  const startTxt = formatDate(start, { withTime: true });
  if (!end) return startTxt;
  const ms = new Date(end).getTime() - new Date(start).getTime();
  if (!Number.isFinite(ms) || ms <= 0) return startTxt;
  const mins = Math.round(ms / 60000);
  return `${startTxt} · ${mins} min`;
}

export function TransactionDetailSheet({
  open,
  onClose,
  selection,
  drawerSide,
}: {
  open: boolean;
  onClose: () => void;
  selection: Pick<TransactionRow, "id" | "kind"> | null;
  drawerSide: "bottom" | "right";
}) {
  const toast = useToast();
  const [pending, startTransition] = useTransition();
  const [result, setResult] = useState<FetchResult | null>(null);
  const [zoomUrl, setZoomUrl] = useState<string | null>(null);

  useEffect(() => {
    if (!open || !selection) {
      setResult(null);
      return;
    }
    startTransition(() => {
      void (async () => {
        const res = await fetchTransactionDetail(selection.id, selection.kind);
        setResult(res);
      })();
    });
  }, [open, selection]);

  const err = result && "error" in result ? result.error : null;
  const d = result && "detail" in result ? result.detail : null;
  const reviewerFullName =
    result && "reviewerFullName" in result ? result.reviewerFullName : null;
  const isAdmin = result && "isAdmin" in result ? result.isAdmin : false;

  const lastErrToast = useRef<string | null>(null);
  useEffect(() => {
    if (!err) {
      lastErrToast.current = null;
      return;
    }
    if (lastErrToast.current === err) return;
    lastErrToast.current = err;
    toast(mapServerErrorToMn(err), "error");
  }, [err, toast]);

  const { label, tone } = d
    ? statusLabel(d.status, "payment")
    : statusLabel("pending", "payment");
  const badgeStyle = toneToBadgeStyle(tone);

  async function copyRef(text: string) {
    try {
      await navigator.clipboard.writeText(text);
    } catch {
      /* ignore */
    }
  }

  const panelStyle =
    drawerSide === "right"
      ? { width: "min(440px, 100vw)", maxWidth: "100%", maxHeight: "100vh" as const }
      : {
          maxHeight: "min(90vh, 100%)",
          display: "flex" as const,
          flexDirection: "column" as const,
          overflow: "hidden" as const,
        };

  const innerScroll: CSSProperties =
    drawerSide === "right"
      ? { overflow: "auto", padding: "8px 20px 28px", flex: 1 }
      : {
          overflow: "auto",
          padding: "0 16px 24px",
          flex: 1,
          WebkitOverflowScrolling: "touch",
        };

  return (
    <>
      <MobileDrawer
        open={open}
        onClose={onClose}
        side={drawerSide}
        panelStyle={panelStyle}
      >
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            height: drawerSide === "right" ? "100vh" : "100%",
            maxHeight: drawerSide === "right" ? "100vh" : "90vh",
          }}
        >
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              padding: "12px 16px 8px",
              flexShrink: 0,
            }}
          >
            <div className="u-eyebrow">Transaction</div>
            <button
              type="button"
              onClick={onClose}
              style={{
                border: "none",
                background: "transparent",
                font: "var(--u-h4)",
                cursor: "pointer",
                color: "var(--u-ink-2)",
                minWidth: 44,
                minHeight: 44,
              }}
              aria-label="Close"
            >
              ×
            </button>
          </div>
          <div style={innerScroll}>
            {pending && !d ? (
              <div style={{ font: "var(--u-body)", color: "var(--u-ink-2)" }}>
                Loading…
              </div>
            ) : null}
            {err ? (
              <div style={{ color: "var(--u-danger)", font: "var(--u-body)" }}>{err}</div>
            ) : null}
            {d ? (
              <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
                <div>
                  <div
                    style={{
                      font: "var(--u-display-xs)",
                      fontFamily: "var(--u-mono)",
                      fontWeight: 700,
                      letterSpacing: "-0.02em",
                    }}
                  >
                    {formatMNT(d.amount)}
                  </div>
                  <span
                    style={{
                      display: "inline-flex",
                      marginTop: 10,
                      ...badgeStyle,
                      font: "var(--u-body-s)",
                      fontWeight: 600,
                      padding: "6px 14px",
                      borderRadius: "var(--u-r-pill)",
                    }}
                  >
                    {label}
                  </span>
                </div>

                <section>
                  <div className="u-eyebrow" style={{ marginBottom: 6 }}>
                    Type
                  </div>
                  <div style={{ font: "var(--u-body)", fontWeight: 500 }}>
                    {transactionKindDetailTitle(
                      d.kind,
                      d.related.slot_description,
                    )}
                  </div>
                </section>

                <section
                  style={{
                    display: "grid",
                    gap: 8,
                    font: "var(--u-body-s)",
                    color: "var(--u-ink-2)",
                  }}
                >
                  <div>
                    <span style={{ color: "var(--u-ink-3)" }}>Submitted: </span>
                    {formatDate(d.submitted_at, { withTime: true })}
                  </div>
                  {d.reviewed_at ? (
                    <div>
                      <span style={{ color: "var(--u-ink-3)" }}>Reviewed: </span>
                      {formatDate(d.reviewed_at, { withTime: true })}
                    </div>
                  ) : null}
                  {isAdmin && reviewerFullName ? (
                    <div>
                      <span style={{ color: "var(--u-ink-3)" }}>Reviewer: </span>
                      <span style={{ color: "var(--u-ink)" }}>{reviewerFullName}</span>
                    </div>
                  ) : null}
                </section>

                {d.bank_reference ? (
                  <section>
                    <div className="u-eyebrow" style={{ marginBottom: 6 }}>
                      Bank reference
                    </div>
                    <div
                      style={{
                        display: "flex",
                        flexWrap: "wrap",
                        gap: 8,
                        alignItems: "center",
                      }}
                    >
                      <code
                        style={{
                          font: "var(--u-body-s)",
                          fontFamily: "var(--u-mono)",
                          background: "var(--u-surface)",
                          padding: "8px 10px",
                          borderRadius: "var(--u-r-2)",
                          border: "1px solid var(--u-rule)",
                          userSelect: "all",
                          wordBreak: "break-all",
                        }}
                      >
                        {d.bank_reference}
                      </code>
                      <button
                        type="button"
                        onClick={() => copyRef(d.bank_reference ?? "")}
                        style={{
                          border: "1px solid var(--u-rule-2)",
                          background: "var(--u-surface-2)",
                          font: "var(--u-body-s)",
                          padding: "8px 12px",
                          borderRadius: "var(--u-r-2)",
                          cursor: "pointer",
                        }}
                      >
                        Copy
                      </button>
                    </div>
                  </section>
                ) : null}

                {d.status === "denied" && d.admin_note ? (
                  <section>
                    <div className="u-eyebrow" style={{ marginBottom: 6 }}>
                      Admin note
                    </div>
                    <div
                      style={{
                        font: "var(--u-body)",
                        background: "var(--u-danger-soft)",
                        color: "var(--u-danger)",
                        padding: 12,
                        borderRadius: "var(--u-r-2)",
                      }}
                    >
                      {d.admin_note}
                    </div>
                  </section>
                ) : null}

                {d.screenshot_url ? (
                  <section>
                    <div className="u-eyebrow" style={{ marginBottom: 8 }}>
                      Screenshot
                    </div>
                    <button
                      type="button"
                      onClick={() => setZoomUrl(d.screenshot_url)}
                      style={{
                        position: "relative",
                        width: "100%",
                        maxWidth: 480,
                        aspectRatio: "4 / 3",
                        padding: 0,
                        border: "1px solid var(--u-rule)",
                        borderRadius: "var(--u-r-2)",
                        overflow: "hidden",
                        cursor: "zoom-in",
                        background: "var(--u-surface)",
                      }}
                    >
                      <Image
                        src={d.screenshot_url}
                        alt="Payment screenshot"
                        fill
                        sizes="(max-width: 640px) 100vw, 440px"
                        style={{ objectFit: "contain" }}
                      />
                    </button>
                  </section>
                ) : null}

                {d.kind === "coaching" ? (
                  <section>
                    <div className="u-eyebrow" style={{ marginBottom: 6 }}>
                      Coaching slot
                    </div>
                    <div style={{ font: "var(--u-body)", marginBottom: 10 }}>
                      {slotWhenLabel(d.related.slot_start_at, d.related.slot_end_at)}
                    </div>
                    <Link
                      href="/dashboard"
                      style={{
                        display: "inline-block",
                        font: "var(--u-body-s)",
                        fontWeight: 600,
                        color: "var(--u-ember)",
                      }}
                    >
                      Go to coaching →
                    </Link>
                  </section>
                ) : null}
              </div>
            ) : null}
          </div>
        </div>
      </MobileDrawer>

      {zoomUrl ? (
        <button
          type="button"
          aria-label="Close"
          onClick={() => setZoomUrl(null)}
          style={{
            position: "fixed",
            inset: 0,
            zIndex: 200,
            border: "none",
            padding: 16,
            margin: 0,
            cursor: "zoom-out",
            background: "rgba(0,0,0,0.88)",
            display: "grid",
            placeItems: "center",
          }}
        >
          <ImageWithFallback
            src={zoomUrl}
            alt="Payment screenshot — enlarged view"
            loading="eager"
            style={{
              maxWidth: "100%",
              maxHeight: "100%",
              objectFit: "contain",
            }}
          />
        </button>
      ) : null}
    </>
  );
}
