"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import type { TransactionRow as TRow } from "@/lib/queries/transactions";
import { useMediaQuery } from "@/lib/hooks/useMediaQuery";
import { MobileTopBar } from "@/components/shell/MobileTopBar";
import { MobileDrawer } from "@/components/shell/MobileDrawer";
import { TransactionFilters } from "./TransactionFilters";
import { ExportButton, type ExportFilters } from "./ExportButton";
import { TransactionRow } from "./TransactionRow";
import { TransactionDetailSheet } from "./TransactionDetailSheet";

function buildPath(filters: ExportFilters, page: number): string {
  const p = new URLSearchParams();
  if (filters.from) p.set("from", filters.from);
  if (filters.to) p.set("to", filters.to);
  if (filters.statuses.length > 0) p.set("status", filters.statuses.join(","));
  if (filters.kind !== "all") p.set("kind", filters.kind);
  if (page > 1) p.set("page", String(page));
  const s = p.toString();
  return s ? `/transactions?${s}` : "/transactions";
}

export function TransactionsView({
  rows,
  total,
  page,
  pageSize,
  subscriptionStatus,
  initialFilters,
}: {
  rows: TRow[];
  total: number;
  page: number;
  pageSize: number;
  subscriptionStatus: string;
  initialFilters: ExportFilters;
}) {
  const isDesktop = useMediaQuery("(min-width: 641px)");
  const [menuOpen, setMenuOpen] = useState(false);
  const [filterDrawerOpen, setFilterDrawerOpen] = useState(false);
  const [detailOpen, setDetailOpen] = useState(false);
  const [selection, setSelection] = useState<Pick<TRow, "id" | "kind"> | null>(
    null,
  );

  const filters = useMemo(() => initialFilters, [initialFilters]);

  const totalPages = Math.max(1, Math.ceil(total / pageSize));
  const canPrev = page > 1;
  const canNext = page < totalPages;

  function openDetail(row: TRow) {
    setSelection({ id: row.id, kind: row.kind });
    setDetailOpen(true);
  }

  return (
    <div style={{ minHeight: "100vh", background: "var(--u-bg)" }}>
      <MobileTopBar
        title="Transactions"
        onMenuClick={() => setMenuOpen(true)}
        rightSlot={
          <Link
            href="/dashboard"
            style={{
              font: "var(--u-body-s)",
              fontWeight: 600,
              color: "var(--u-ember)",
              textDecoration: "none",
              padding: "8px 4px",
            }}
          >
            Dashboard
          </Link>
        }
      />

      <MobileDrawer open={menuOpen} onClose={() => setMenuOpen(false)} side="left">
        <nav style={{ padding: 20, display: "flex", flexDirection: "column", gap: 12 }}>
          <Link
            href="/dashboard"
            onClick={() => setMenuOpen(false)}
            style={{ font: "var(--u-body)", color: "var(--u-ink)", textDecoration: "none" }}
          >
            Dashboard
          </Link>
          <Link
            href="/transactions"
            onClick={() => setMenuOpen(false)}
            style={{ font: "var(--u-body)", fontWeight: 600, color: "var(--u-ink)" }}
          >
            Transactions
          </Link>
          <Link
            href="/payment"
            onClick={() => setMenuOpen(false)}
            style={{ font: "var(--u-body)", color: "var(--u-ink)", textDecoration: "none" }}
          >
            Payment
          </Link>
        </nav>
      </MobileDrawer>

      <div
        style={{
          maxWidth: 1100,
          margin: "0 auto",
          padding: isDesktop ? "24px 24px 80px" : "12px 12px 88px",
        }}
      >
        {isDesktop ? (
          <Link
            href="/dashboard?tab=profile"
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
            ← Dashboard
          </Link>
        ) : null}
        <div
          style={{
            display: "flex",
            flexWrap: "wrap",
            alignItems: "center",
            justifyContent: "space-between",
            gap: 12,
            marginBottom: isDesktop ? 20 : 12,
          }}
        >
          <div style={{ font: "var(--u-h3)", fontWeight: 600 }}>
            Total:{" "}
            <span style={{ fontFamily: "var(--u-mono)" }}>{total}</span>
          </div>
          <ExportButton total={total} filters={filters} />
        </div>

        {isDesktop ? (
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "280px minmax(0,1fr)",
              gap: 24,
              alignItems: "start",
            }}
          >
            <aside
              style={{
                position: "sticky",
                top: 16,
                padding: 20,
                background: "var(--u-surface-2)",
                border: "1px solid var(--u-rule)",
                borderRadius: "var(--u-r-3)",
              }}
            >
              <TransactionFilters filters={filters} />
            </aside>
            <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
              {rows.length === 0 ? (
                <EmptyState subscriptionStatus={subscriptionStatus} />
              ) : (
                rows.map((row) => (
                  <TransactionRow
                    key={`${row.kind}-${row.id}`}
                    row={row}
                    layout="desktop"
                    onOpen={openDetail}
                  />
                ))
              )}
              <Pagination
                total={total}
                filters={filters}
                page={page}
                totalPages={totalPages}
                canPrev={canPrev}
                canNext={canNext}
              />
            </div>
          </div>
        ) : (
          <>
            <div
              style={{
                position: "sticky",
                top: 56,
                zIndex: 8,
                margin: "0 -12px 12px",
                padding: "10px 12px",
                background: "var(--u-surface)",
                borderBottom: "1px solid var(--u-border-strong)",
                display: "flex",
                gap: 10,
              }}
            >
              <button
                type="button"
                onClick={() => setFilterDrawerOpen(true)}
                style={{
                  flex: 1,
                  minHeight: 44,
                  borderRadius: "var(--u-r-2)",
                  border: "1px solid var(--u-rule-2)",
                  background: "var(--u-surface-2)",
                  font: "var(--u-body-s)",
                  fontWeight: 600,
                  cursor: "pointer",
                }}
              >
                Filters
              </button>
            </div>
            <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
              {rows.length === 0 ? (
                <EmptyState subscriptionStatus={subscriptionStatus} />
              ) : (
                rows.map((row) => (
                  <TransactionRow
                    key={`${row.kind}-${row.id}`}
                    row={row}
                    layout="mobile"
                    onOpen={openDetail}
                  />
                ))
              )}
              <Pagination
                total={total}
                filters={filters}
                page={page}
                totalPages={totalPages}
                canPrev={canPrev}
                canNext={canNext}
              />
            </div>
            <MobileDrawer
              open={filterDrawerOpen}
              onClose={() => setFilterDrawerOpen(false)}
              side="bottom"
              panelStyle={{
                maxHeight: "min(88vh, 100%)",
                display: "flex",
                flexDirection: "column",
              }}
            >
              <div style={{ padding: "0 16px 20px", overflow: "auto" }}>
                <TransactionFilters filters={filters} />
              </div>
            </MobileDrawer>
          </>
        )}
      </div>

      <TransactionDetailSheet
        open={detailOpen}
        onClose={() => {
          setDetailOpen(false);
          setSelection(null);
        }}
        selection={selection}
        drawerSide={isDesktop ? "right" : "bottom"}
      />
    </div>
  );
}

function EmptyState({ subscriptionStatus }: { subscriptionStatus: string }) {
  return (
    <div
      style={{
        padding: "32px 20px",
        textAlign: "center",
        background: "var(--u-surface-2)",
        border: "1px solid var(--u-rule)",
        borderRadius: "var(--u-r-3)",
      }}
    >
      <div style={{ font: "var(--u-h3)", fontWeight: 600, marginBottom: 8 }}>
        No transactions
      </div>
      <p style={{ font: "var(--u-body)", color: "var(--u-ink-2)", margin: "0 0 20px" }}>
        You don&apos;t have any transactions to show yet.
      </p>
      {subscriptionStatus === "inactive" ? (
        <Link
          href="/payment"
          style={{
            display: "inline-flex",
            alignItems: "center",
            justifyContent: "center",
            minHeight: 48,
            padding: "0 22px",
            borderRadius: "var(--u-r-2)",
            background: "var(--u-ember)",
            color: "var(--u-ember-ink)",
            font: "var(--u-body-s)",
            fontWeight: 600,
            textDecoration: "none",
          }}
        >
          Pay for membership
        </Link>
      ) : null}
    </div>
  );
}

function Pagination({
  total,
  filters,
  page,
  totalPages,
  canPrev,
  canNext,
}: {
  total: number;
  filters: ExportFilters;
  page: number;
  totalPages: number;
  canPrev: boolean;
  canNext: boolean;
}) {
  if (total <= 0) return null;
  if (totalPages <= 1) return null;
  return (
    <div
      style={{
        display: "flex",
        justifyContent: "center",
        gap: 12,
        marginTop: 8,
        flexWrap: "wrap",
      }}
    >
      <Link
        href={buildPath(filters, page - 1)}
        aria-disabled={!canPrev}
        style={{
          pointerEvents: canPrev ? "auto" : "none",
          opacity: canPrev ? 1 : 0.45,
          minHeight: 44,
          padding: "0 18px",
          display: "inline-flex",
          alignItems: "center",
          borderRadius: "var(--u-r-2)",
          border: "1px solid var(--u-rule-2)",
          background: "var(--u-surface-2)",
          color: "var(--u-ink)",
          font: "var(--u-body-s)",
          fontWeight: 600,
          textDecoration: "none",
        }}
      >
        Previous
      </Link>
      <span
        style={{
          alignSelf: "center",
          font: "var(--u-body-s)",
          color: "var(--u-ink-2)",
        }}
      >
        {page} / {totalPages}
      </span>
      <Link
        href={buildPath(filters, page + 1)}
        aria-disabled={!canNext}
        style={{
          pointerEvents: canNext ? "auto" : "none",
          opacity: canNext ? 1 : 0.45,
          minHeight: 44,
          padding: "0 18px",
          display: "inline-flex",
          alignItems: "center",
          borderRadius: "var(--u-r-2)",
          border: "1px solid var(--u-rule-2)",
          background: "var(--u-surface-2)",
          color: "var(--u-ink)",
          font: "var(--u-body-s)",
          fontWeight: 600,
          textDecoration: "none",
        }}
      >
        Next
      </Link>
    </div>
  );
}
