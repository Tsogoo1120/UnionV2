"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useMemo, useState, useTransition, type ReactNode } from "react";
import { approvePayment, denyPayment } from "@/app/actions/admin";
import { toggleArticlePublished, deleteArticle } from "@/app/actions/articles";
import { toggleVideoLessonPublished, deleteVideoLesson } from "@/app/actions/video-lessons";
import { toggleCollectiveReadingPublished, deleteCollectiveReading } from "@/app/actions/collective-readings";
import { toggleTestPublished, deleteTest } from "@/app/actions/tests";
import type { AdminOverviewKpis, PendingPaymentRow } from "@/lib/queries/admin";
import type { CoachingSlot } from "@/lib/types";
import type { VideoLesson, CollectiveReading, Article, PsychologyTest } from "@/lib/types";
import type { CommunityPost } from "@/lib/types";
import type { CoachingBookingAdminDetail } from "@/lib/queries/admin";
import type { AdminUserListRow } from "@/lib/queries/admin";
import { formatMNT, formatRelative, statusLabel } from "@/lib/format";
import { ContentStatusBadge } from "@/components/ui/content-status-badge";
import { EmptyState } from "@/components/ui/empty-state";
import { BookingsPanel } from "@/components/admin/panels/BookingsPanel";
import { CoachingSlotsPanel } from "@/components/admin/panels/CoachingSlotsPanel";
import { CommunityPanel } from "@/components/admin/panels/CommunityPanel";
import { CreateArticleDrawer } from "@/components/admin/panels/CreateArticleDrawer";
import { CreateCollectiveReadingDrawer } from "@/components/admin/panels/CreateCollectiveReadingDrawer";
import { CreatePsychologyTestDrawer } from "@/components/admin/panels/CreatePsychologyTestDrawer";
import { CreateVideoLessonDrawer } from "@/components/admin/panels/CreateVideoLessonDrawer";
import { EditArticleDrawer } from "@/components/admin/panels/EditArticleDrawer";
import { EditCollectiveReadingDrawer } from "@/components/admin/panels/EditCollectiveReadingDrawer";
import { EditPsychologyTestDrawer } from "@/components/admin/panels/EditPsychologyTestDrawer";
import { EditVideoLessonDrawer } from "@/components/admin/panels/EditVideoLessonDrawer";
import { BroadcastEmailPanel } from "@/components/admin/panels/BroadcastEmailPanel";
import { SiteSettingsPanel } from "@/components/admin/panels/SiteSettingsPanel";
import { UsersPanel } from "@/components/admin/panels/UsersPanel";
import { useToast } from "@/components/shell/Toast";
import { PAYMENT_INFO } from "@/lib/constants";
import { mapServerErrorToMn } from "@/lib/i18n/action-feedback";

type AdminTab =
  | "overview"
  | "payments"
  | "slots"
  | "bookings"
  | "lessons"
  | "readings"
  | "articles"
  | "tests"
  | "community"
  | "users"
  | "email"
  | "settings";

const meta: Record<AdminTab, { title: string; sub: string }> = {
  overview: { title: "Overview", sub: "Last 24 hours" },
  payments: { title: "Payments", sub: "Membership payments" },
  slots: { title: "Slots", sub: "1:1 coaching" },
  bookings: { title: "Bookings", sub: "1:1 coaching" },
  lessons: { title: "Video Lessons", sub: "Content · 01" },
  readings: { title: "Collective Reading", sub: "Content · 02" },
  articles: { title: "Articles", sub: "Content · 05" },
  tests: { title: "Tests", sub: "Content · 04" },
  community: { title: "Community", sub: "Moderation" },
  users: { title: "Users", sub: "System" },
  email: { title: "Email", sub: "All users" },
  settings: { title: "Settings", sub: "Site settings" },
};

function compactMnt(n: number): string {
  if (n >= 1_000_000) return `${(n / 1_000_000).toFixed(1)}M₮`;
  if (n >= 1000) return `${(n / 1000).toFixed(1)}k₮`;
  return formatMNT(n);
}

function AdminBackHomeLink() {
  return (
    <Link
      href="/?landing=1"
      scroll
      aria-label="Back to home"
      className="inline-flex min-h-11 shrink-0 items-center justify-center rounded-[var(--u-r-2)] px-3 no-underline transition-[color,transform,opacity] duration-[var(--u-dur-2)] ease-[var(--u-ease)] hover:-translate-y-px focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--u-ember)] motion-reduce:transition-none motion-reduce:hover:translate-y-0"
      style={{
        font: "var(--u-body-s)",
        fontWeight: 600,
        color: "var(--u-ember)",
      }}
    >
      ← Home
    </Link>
  );
}

export type AdminExperienceProps = {
  initialTab: AdminTab;
  adminEmail: string;
  adminName: string;
  kpis: AdminOverviewKpis;
  pendingPayments: PendingPaymentRow[];
  slots: CoachingSlot[];
  videoLessons: VideoLesson[];
  collectiveReadings: CollectiveReading[];
  articles: Article[];
  tests: PsychologyTest[];
  bookings: CoachingBookingAdminDetail[];
  moderationPosts: CommunityPost[];
  users: AdminUserListRow[];
  usersTotal: number;
  usersPage: number;
  usersQuery: string;
};

function AdminNav({
  tab,
  setTab,
  counts,
  adminName,
  adminEmail,
}: {
  tab: AdminTab;
  setTab: (t: AdminTab) => void;
  counts: Record<string, number>;
  adminName: string;
  adminEmail: string;
}) {
  const sections: { h: string; items: { id: AdminTab; label: string; n: number }[] }[] = [
    { h: "Control", items: [
      { id: "overview", label: "Overview", n: 0 },
      { id: "payments", label: "Payments", n: counts.payments },
    ]},
    { h: "Coaching", items: [
      { id: "slots", label: "Slots", n: 0 },
      { id: "bookings", label: "Bookings", n: counts.bookings },
    ]},
    { h: "Content", items: [
      { id: "lessons", label: "Video Lessons", n: 0 },
      { id: "readings", label: "Collective Reading", n: 0 },
      { id: "articles", label: "Articles", n: 0 },
      { id: "tests", label: "Tests", n: 0 },
      { id: "community", label: "Community", n: counts.community },
    ]},
    { h: "System", items: [
      { id: "users", label: "Users", n: 0 },
      { id: "email", label: "Email", n: 0 },
      { id: "settings", label: "Settings", n: 0 },
    ]},
  ];

  return (
    <aside
      className="u-admin-sidebar"
      style={{
        background: "var(--u-indigo)",
        color: "var(--u-indigo-ink)",
        position: "sticky",
        top: 0,
        height: "100vh",
        display: "flex",
        flexDirection: "column",
      }}
    >
      <div style={{ padding: "20px 22px 28px", borderBottom: "1px solid rgba(255,255,255,.08)" }}>
        <div style={{ display: "flex", alignItems: "baseline" }}>
          <span style={{ fontFamily: "var(--u-display)", fontWeight: 700, fontSize: 22, letterSpacing: "-0.04em", color: "var(--u-indigo-ink)" }}>
            Union
          </span>
          <span style={{ color: "var(--u-ember)", fontSize: 22, fontWeight: 700 }}>.</span>
        </div>
        <div style={{ font: "var(--u-mono)", fontSize: 11, color: "rgba(242,238,227,.55)", marginTop: 4, letterSpacing: ".06em" }}>ADMIN · v2</div>
      </div>
      <nav style={{ padding: "16px 12px", display: "flex", flexDirection: "column", gap: 18, flex: 1, overflow: "auto" }}>
        {sections.map((sec) => (
          <div key={sec.h}>
            <div
              style={{
                font: "var(--u-label)",
                letterSpacing: ".14em",
                textTransform: "uppercase",
                color: "rgba(242,238,227,.45)",
                padding: "0 10px 8px",
              }}
            >
              {sec.h}
            </div>
            {sec.items.map((it) => {
              const active = tab === it.id;
              return (
                <button
                  key={it.id}
                  type="button"
                  onClick={() => setTab(it.id)}
                  className={active ? "u-admin-nav-btn u-admin-nav-btn--active" : "u-admin-nav-btn"}
                  style={{
                    width: "100%",
                    textAlign: "left",
                    background: active ? "rgba(255,255,255,.14)" : "transparent",
                    color: active ? "var(--u-indigo-ink)" : "rgba(242,238,227,.78)",
                    border: "none",
                    borderLeft: active ? "2px solid var(--u-ember)" : "2px solid transparent",
                    cursor: "pointer",
                    font: "var(--u-body)",
                    fontWeight: active ? 600 : 400,
                    padding: active ? "8px 10px 8px 8px" : "8px 10px",
                    borderRadius: "var(--u-r-2)",
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                  }}
                >
                  <span>{it.label}</span>
                  {it.n > 0 && (
                    <span
                      style={{
                        background: "var(--u-ember)",
                        color: "var(--u-ember-ink)",
                        font: "var(--u-mono)",
                        fontSize: 10,
                        fontWeight: 600,
                        padding: "1px 7px",
                        borderRadius: 999,
                      }}
                    >
                      {it.n}
                    </span>
                  )}
                </button>
              );
            })}
          </div>
        ))}
      </nav>
      <div
        style={{
          padding: "16px 22px",
          borderTop: "1px solid rgba(255,255,255,.08)",
          display: "flex",
          gap: 10,
          alignItems: "center",
        }}
      >
        <div
          style={{
            width: 28,
            height: 28,
            borderRadius: 999,
            background: "#D4B98C",
            border: "2px solid rgba(255,255,255,.18)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            font: "var(--u-body-s)",
            fontWeight: 600,
            color: "var(--u-ink)",
            flexShrink: 0,
          }}
        >
          {(adminName?.trim()?.[0] ?? adminEmail?.[0] ?? "A").toUpperCase()}
        </div>
        <div style={{ minWidth: 0 }}>
          <div
            style={{
              font: "var(--u-body-s)",
              fontWeight: 500,
              color: "var(--u-indigo-ink)",
              overflow: "hidden",
              textOverflow: "ellipsis",
              whiteSpace: "nowrap",
            }}
          >
            {adminName || adminEmail || "Admin"}
          </div>
          <div
            style={{
              font: "var(--u-mono)",
              fontSize: 10,
              color: "rgba(242,238,227,.55)",
              overflow: "hidden",
              textOverflow: "ellipsis",
              whiteSpace: "nowrap",
            }}
          >
            {adminEmail || "admin"}
          </div>
        </div>
      </div>
    </aside>
  );
}

function AdminTopbar({
  title,
  subtitle,
}: {
  title: string;
  subtitle: string;
}) {
  return (
    <div
      style={{
        padding: "16px 20px",
        borderBottom: "1px solid var(--u-rule)",
        background: "var(--u-bg)",
        display: "flex",
        justifyContent: "space-between",
        alignItems: "flex-end",
        gap: 12,
      }}
    >
      <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
        <div>
          <div className="u-eyebrow">{subtitle}</div>
          <h1 style={{ fontFamily: "var(--u-display)", fontWeight: 700, fontSize: "clamp(24px, 5vw, 40px)", letterSpacing: "-0.02em", margin: "8px 0 0" }}>{title}</h1>
        </div>
      </div>
      <AdminBackHomeLink />
    </div>
  );
}

function KPIStrip({ kpis, pending }: { kpis: AdminOverviewKpis; pending: number }) {
  const kpisList = [
    { l: "Active members", v: String(kpis.activeMembers), d: "Active + valid period", ember: false },
    { l: "Pending payments", v: String(pending), d: "Needs review", ember: true },
    { l: "Monthly revenue", v: compactMnt(kpis.monthlyRevenueMnt), d: "Confirmed payments", ember: false },
    { l: "Open slots", v: String(kpis.upcomingAvailableSlots), d: "Available slots", ember: false },
  ];
  return (
    <section className="u-admin-scroll-x">
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(4, minmax(150px, 1fr))",
          gap: 16,
        }}
      >
        {kpisList.map((k) => (
          <div
            key={k.l}
            className="u-card-lift"
            style={{
              background: "var(--u-surface-2)",
              border: "1px solid var(--u-rule)",
              borderLeft: `3px solid ${k.ember ? "var(--u-ember)" : "var(--u-rule)"}`,
              borderRadius: "var(--u-r-3)",
              padding: "20px 22px",
            }}
          >
            <div className="u-eyebrow">{k.l}</div>
            <div style={{ fontFamily: "var(--u-display)", fontWeight: 700, fontSize: 40, letterSpacing: "-0.02em", marginTop: 8 }}>{k.v}</div>
            <div style={{ font: "var(--u-body-s)", color: k.ember ? "var(--u-ember)" : "var(--u-ink-3)", marginTop: 6 }}>{k.d}</div>
          </div>
        ))}
      </div>
    </section>
  );
}

function OverviewQuickActions({
  pendingPayments,
  pendingBookings,
  onTab,
}: {
  pendingPayments: number;
  pendingBookings: number;
  onTab: (t: AdminTab) => void;
}) {
  const actions: { tab: AdminTab; title: string; sub: string; badge?: number }[] = [
    { tab: "payments", title: "Review payments", sub: "Pending transactions", badge: pendingPayments },
    { tab: "bookings", title: "Bookings", sub: "Coaching confirmations", badge: pendingBookings },
    { tab: "community", title: "Community", sub: "Moderation, hidden posts" },
    { tab: "lessons", title: "New content", sub: "Add a video lesson" },
  ];

  return (
    <section>
      <div className="u-eyebrow" style={{ marginBottom: 14 }}>
        Quick actions
      </div>
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))",
          gap: 12,
        }}
      >
        {actions.map((a) => (
          <button
            key={a.tab}
            type="button"
            onClick={() => onTab(a.tab)}
            className="u-quick-action"
            style={{
              textAlign: "left",
              border: "1px solid var(--u-rule)",
              borderRadius: "var(--u-r-3)",
              padding: "20px 22px",
              background: "var(--u-surface-2)",
              cursor: "pointer",
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              gap: 12,
              minHeight: 44,
            }}
          >
            <div style={{ minWidth: 0 }}>
              <div style={{ font: "var(--u-h4)", color: "var(--u-ink)" }}>{a.title}</div>
              <div style={{ font: "var(--u-body-s)", color: "var(--u-ink-2)", marginTop: 4 }}>{a.sub}</div>
            </div>
            <div style={{ display: "flex", alignItems: "center", gap: 8, flexShrink: 0 }}>
              {a.badge != null && a.badge > 0 ? (
                <span
                  style={{
                    background: "var(--u-ember)",
                    color: "var(--u-ember-ink)",
                    font: "var(--u-mono)",
                    fontSize: 10,
                    fontWeight: 600,
                    padding: "2px 8px",
                    borderRadius: 999,
                  }}
                >
                  {a.badge}
                </span>
              ) : null}
              <svg width={18} height={18} viewBox="0 0 24 24" fill="none" stroke="var(--u-ink-3)" strokeWidth="1.6" aria-hidden>
                <path d="M9 6l6 6-6 6" />
              </svg>
            </div>
          </button>
        ))}
      </div>
    </section>
  );
}

function PaymentDetailPanel({
  cur,
  note,
  setNote,
  err,
  pending,
  onDeny,
  onApprove,
  onClose,
  showClose,
}: {
  cur: PendingPaymentRow;
  note: string;
  setNote: (v: string) => void;
  err: string | null;
  pending: boolean;
  onDeny: () => void;
  onApprove: () => void;
  onClose?: () => void;
  showClose?: boolean;
}) {
  return (
    <>
      {showClose && onClose ? (
        <button
          type="button"
          aria-label="Close"
          onClick={onClose}
          style={{
            position: "absolute",
            top: 16,
            right: 16,
            width: 44,
            height: 44,
            borderRadius: "var(--u-r-pill)",
            border: "1px solid var(--u-rule-2)",
            background: "var(--u-surface)",
            cursor: "pointer",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            fontSize: 20,
            color: "var(--u-ink-2)",
          }}
        >
          ✕
        </button>
      ) : null}
      <div className="u-eyebrow">Review</div>
      <div>
        <div style={{ font: "var(--u-h3)" }}>{cur.user_full_name ?? cur.user_email}</div>
        <div style={{ font: "var(--u-body-s)", color: "var(--u-ink-3)" }}>{cur.user_email}</div>
      </div>
      <div style={{ font: "var(--u-h4)", fontFamily: "var(--u-mono)" }}>{formatMNT(Number(cur.amount))}</div>
      {cur.bank_reference ? (
        <div style={{ font: "var(--u-body-s)", color: "var(--u-ink-2)" }}>
          <span className="u-eyebrow">Reference · </span>
          <span style={{ fontFamily: "var(--u-mono)" }}>{cur.bank_reference}</span>
        </div>
      ) : null}
      <div style={{ font: "var(--u-body-s)", color: "var(--u-ink-2)" }}>
        {PAYMENT_INFO.bankName} · {PAYMENT_INFO.accountNumber} · {PAYMENT_INFO.accountName}
      </div>
      {cur.screenshot_url ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={cur.screenshot_url}
          alt=""
          loading="lazy"
          style={{ width: "100%", borderRadius: "var(--u-r-2)", border: "1px solid var(--u-rule)" }}
        />
      ) : null}
      <textarea
        value={note}
        onChange={(e) => setNote(e.target.value)}
        placeholder="Admin note (for rejection)"
        className="u-field"
        style={{ resize: "vertical", minHeight: 64 }}
      />
      {err ? <p style={{ color: "var(--u-danger)", font: "var(--u-body-s)" }}>{err}</p> : null}
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
        <button
          type="button"
          disabled={pending}
          onClick={onDeny}
          className="u-btn-danger-ghost"
          style={{ padding: "12px", minHeight: 48, width: "100%" }}
        >
          Reject
        </button>
        <button
          type="button"
          disabled={pending}
          onClick={onApprove}
          style={{
            background: "var(--u-success)",
            color: "var(--u-ember-ink)",
            border: "none",
            font: "var(--u-body-s)",
            fontWeight: 600,
            padding: "12px",
            borderRadius: "var(--u-r-2)",
            cursor: "pointer",
            minHeight: 48,
          }}
        >
          Approve →
        </button>
      </div>
    </>
  );
}

function PaymentsSection({ rows }: { rows: PendingPaymentRow[] }) {
  const [sel, setSel] = useState<string | null>(rows[0]?.id ?? null);
  const [note, setNote] = useState("");
  const [pending, startTransition] = useTransition();
  const [err, setErr] = useState<string | null>(null);
  const cur = rows.find((r) => r.id === sel) ?? rows[0];

  function run(fn: () => Promise<{ error?: string }>) {
    setErr(null);
    startTransition(async () => {
      const r = await fn();
      if (r.error) setErr(mapServerErrorToMn(r.error));
      else window.location.reload();
    });
  }

  if (rows.length === 0) {
    return (
      <EmptyState
        title="No pending payments"
        body="New payments will appear here as they come in."
      />
    );
  }

  const detailProps = cur
    ? {
        cur,
        note,
        setNote,
        err,
        pending,
        onDeny: () => run(() => denyPayment(cur.id, note)),
        onApprove: () => run(() => approvePayment(cur.id)),
      }
    : null;

  return (
    <div className="u-admin-scroll-x">
      <div style={{ display: "grid", gridTemplateColumns: "minmax(440px, 1.4fr) minmax(320px, 1fr)", gap: 24 }}>
        <div style={{ background: "var(--u-surface-2)", border: "1px solid var(--u-rule)", borderRadius: "var(--u-r-3)", overflow: "hidden", height: "fit-content" }}>
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "1.6fr 1fr 1fr .8fr 1fr",
              padding: "10px 22px",
              background: "var(--u-surface)",
              borderBottom: "1px solid var(--u-rule)",
              font: "var(--u-label)",
              letterSpacing: ".12em",
              textTransform: "uppercase",
              color: "var(--u-ink-3)",
            }}
          >
            <div>User</div>
            <div>Amount</div>
            <div>Date</div>
            <div>Status</div>
            <div />
          </div>
          {rows.map((r) => (
            <button
              key={r.id}
              type="button"
              onClick={() => setSel(r.id)}
              className="u-admin-row"
              style={{
                width: "100%",
                textAlign: "left",
                border: "none",
                cursor: "pointer",
                display: "grid",
                gridTemplateColumns: "1.6fr 1fr 1fr .8fr 1fr",
                alignItems: "center",
                padding: "14px 22px",
                borderTop: "1px solid var(--u-rule)",
                font: "var(--u-body-s)",
                background: sel === r.id ? "var(--u-ember-soft)" : "var(--u-surface-2)",
              }}
            >
              <div>
                <div style={{ fontWeight: 500 }}>{r.user_full_name ?? "—"}</div>
                <div style={{ fontSize: 11, color: "var(--u-ink-3)" }}>{r.user_email}</div>
              </div>
              <div style={{ fontFamily: "var(--u-mono)" }}>{formatMNT(Number(r.amount))}</div>
              <div style={{ color: "var(--u-ink-3)" }}>{formatRelative(r.submitted_at)}</div>
              <div>{statusLabel(r.status, "payment").label}</div>
              <div />
            </button>
          ))}
        </div>

        {detailProps ? (
          <div
            style={{
              background: "var(--u-surface-2)",
              border: "1px solid var(--u-rule)",
              borderRadius: "var(--u-r-3)",
              padding: 24,
              display: "flex",
              flexDirection: "column",
              gap: 16,
              position: "sticky",
              top: 24,
              height: "fit-content",
            }}
          >
            <PaymentDetailPanel {...detailProps} />
          </div>
        ) : null}
      </div>
    </div>
  );
}

function ContentCreateBar({ label, onClick }: { label: string; onClick: () => void }) {
  return (
    <div style={{ display: "flex", justifyContent: "flex-end", marginBottom: 16 }}>
      <button
        type="button"
        onClick={onClick}
        style={{
          background: "var(--u-ink)",
          color: "var(--u-bg)",
          border: "none",
          font: "var(--u-body-s)",
          fontWeight: 500,
          padding: "10px 16px",
          borderRadius: "var(--u-r-2)",
          cursor: "pointer",
          minHeight: 44,
        }}
      >
        {label}
      </button>
    </div>
  );
}

function ContentActionsTable({
  rows,
  cols,
  onEdit,
  onTogglePublish,
  onDelete,
  busy,
}: {
  rows: { id: string; cells: (string | number | ReactNode)[]; isPublished: boolean }[];
  cols: string[];
  onEdit?: (id: string) => void;
  onTogglePublish: (id: string, publish: boolean) => void;
  onDelete: (id: string) => void;
  busy: boolean;
}) {
  const colTemplate = [...cols.map(() => "minmax(120px, 1fr)"), "minmax(200px, auto)"].join(" ");

  const actionBtns = (r: (typeof rows)[0]) => (
    <>
      {onEdit ? (
        <button
          type="button"
          disabled={busy}
          onClick={() => onEdit(r.id)}
          style={{
            padding: "6px 12px",
            borderRadius: "var(--u-r-2)",
            border: "1px solid var(--u-rule-2)",
            background: "transparent",
            color: "var(--u-ink)",
            font: "var(--u-body-s)",
            cursor: busy ? "not-allowed" : "pointer",
            minHeight: 36,
          }}
        >
          Edit
        </button>
      ) : null}
      <button
        type="button"
        disabled={busy}
        onClick={() => onTogglePublish(r.id, !r.isPublished)}
        style={{
          padding: "6px 12px",
          borderRadius: "var(--u-r-2)",
          border: r.isPublished ? "1px solid var(--u-rule-2)" : "none",
          background: r.isPublished ? "transparent" : "var(--u-ember)",
          color: r.isPublished ? "var(--u-ink-2)" : "var(--u-ember-ink)",
          font: "var(--u-body-s)",
          cursor: busy ? "not-allowed" : "pointer",
          whiteSpace: "nowrap",
          minHeight: 36,
          fontWeight: r.isPublished ? 400 : 600,
        }}
      >
        {r.isPublished ? "Unpublish" : "Publish"}
      </button>
      <button
        type="button"
        disabled={busy}
        onClick={() => onDelete(r.id)}
        className="u-btn-danger-ghost"
        style={{ padding: "6px 12px", minHeight: 36 }}
      >
        Delete
      </button>
    </>
  );

  if (rows.length === 0) {
    return (
      <div style={{ border: "1px solid var(--u-rule)", borderRadius: "var(--u-r-3)", overflow: "hidden" }}>
        <EmptyState title="No data yet" body="Use the button above to add your first item." />
      </div>
    );
  }

  return (
    <div className="u-admin-scroll-x" style={{ border: "1px solid var(--u-rule)", borderRadius: "var(--u-r-3)" }}>
      <div style={{ minWidth: 640 }}>
        <div
          style={{
            display: "grid",
            gridTemplateColumns: colTemplate,
            padding: "10px 16px",
            background: "var(--u-surface)",
            borderBottom: "1px solid var(--u-rule)",
            font: "var(--u-label)",
            color: "var(--u-ink-3)",
            gap: 8,
          }}
        >
          {cols.map((c) => (
            <div key={c}>{c}</div>
          ))}
          <div style={{ textAlign: "right" }}>Actions</div>
        </div>
        {rows.map((r, i) => (
          <div
            key={r.id}
            className="u-admin-row"
            style={{
              display: "grid",
              gridTemplateColumns: colTemplate,
              padding: "12px 16px",
              borderTop: i === 0 ? "none" : "1px solid var(--u-rule)",
              font: "var(--u-body-s)",
              gap: 8,
              alignItems: "center",
            }}
          >
            {r.cells.map((cell, j) => (
              <div key={j}>{cell}</div>
            ))}
            <div style={{ display: "flex", gap: 6, justifyContent: "flex-end", flexWrap: "wrap" }}>{actionBtns(r)}</div>
          </div>
        ))}
      </div>
    </div>
  );
}

export function AdminExperience(props: AdminExperienceProps) {
  const router = useRouter();
  const toast = useToast();
  const [tab, setTab] = useState<AdminTab>(props.initialTab ?? "overview");
  const [lessonDrawer, setLessonDrawer] = useState(false);
  const [readingDrawer, setReadingDrawer] = useState(false);
  const [articleDrawer, setArticleDrawer] = useState(false);
  const [testDrawer, setTestDrawer] = useState(false);
  const [editLesson, setEditLesson] = useState<VideoLesson | null>(null);
  const [editReading, setEditReading] = useState<CollectiveReading | null>(null);
  const [editArticle, setEditArticle] = useState<Article | null>(null);
  const [editTest, setEditTest] = useState<PsychologyTest | null>(null);
  const [contentPending, startContentTransition] = useTransition();
  const m = meta[tab];

  useEffect(() => {
    setTab(props.initialTab ?? "overview");
  }, [props.initialTab]);

  function changeTab(t: AdminTab) {
    setTab(t);
    const sp = new URLSearchParams();
    sp.set("tab", t);
    if (typeof window !== "undefined" && t === "users") {
      const cur = new URLSearchParams(window.location.search);
      const q = cur.get("q");
      const up = cur.get("usersPage");
      if (q) sp.set("q", q);
      if (up) sp.set("usersPage", up);
    }
    router.push(`/admin/dashboard?${sp.toString()}`);
  }

  const counts = useMemo(
    () => ({
      payments: props.pendingPayments.length,
      bookings: props.bookings.filter((b) => b.status === "pending").length,
      community: props.moderationPosts.length,
    }),
    [props.pendingPayments.length, props.bookings, props.moderationPosts.length],
  );

  const lessonCategories = useMemo(
    () =>
      Array.from(
        new Set(props.videoLessons.map((l) => l.category).filter((c): c is string => Boolean(c))),
      ).sort(),
    [props.videoLessons],
  );

  return (
    <div className="u-admin-shell">
      <AdminNav
        tab={tab}
        setTab={changeTab}
        counts={counts}
        adminName={props.adminName}
        adminEmail={props.adminEmail}
      />
      <div style={{ flex: 1, display: "flex", flexDirection: "column", minWidth: 0 }}>
        <AdminTopbar title={m.title} subtitle={m.sub} />
        <main className="u-admin-main">
          {tab === "overview" && (
            <div style={{ display: "flex", flexDirection: "column", gap: 28 }}>
              <KPIStrip kpis={props.kpis} pending={props.pendingPayments.length} />
              <OverviewQuickActions
                pendingPayments={props.pendingPayments.length}
                pendingBookings={counts.bookings}
                onTab={changeTab}
              />
            </div>
          )}
          {tab === "payments" && <PaymentsSection rows={props.pendingPayments} />}
          {tab === "slots" && <CoachingSlotsPanel slots={props.slots} />}
          {tab === "bookings" && <BookingsPanel bookings={props.bookings} />}
          {tab === "lessons" && (
            <>
              <ContentCreateBar label="+ New lesson" onClick={() => setLessonDrawer(true)} />
              <ContentActionsTable
                cols={["Title", "Category", "Status"]}
                rows={props.videoLessons.map((l) => ({
                  id: l.id,
                  cells: [l.title, l.category ?? "—", <ContentStatusBadge key="s" published={l.is_published ?? false} />],
                  isPublished: l.is_published ?? false,
                }))}
                busy={contentPending}
                onEdit={(id) => {
                  const row = props.videoLessons.find((l) => l.id === id);
                  if (row) setEditLesson(row);
                }}
                onTogglePublish={(id, pub) => {
                  startContentTransition(async () => {
                    const r = await toggleVideoLessonPublished(id, pub);
                    if (r.error) toast(mapServerErrorToMn(r.error), "error");
                    else router.refresh();
                  });
                }}
                onDelete={(id) => {
                  if (!window.confirm("Delete this lesson?")) return;
                  startContentTransition(async () => {
                    const r = await deleteVideoLesson(id);
                    if (r.error) toast(mapServerErrorToMn(r.error), "error");
                    else router.refresh();
                  });
                }}
              />
              <CreateVideoLessonDrawer
                open={lessonDrawer}
                onClose={() => setLessonDrawer(false)}
                categories={lessonCategories}
              />
              <EditVideoLessonDrawer
                open={editLesson != null}
                item={editLesson}
                onClose={() => setEditLesson(null)}
                categories={lessonCategories}
              />
            </>
          )}
          {tab === "readings" && (
            <>
              <ContentCreateBar label="+ New reading" onClick={() => setReadingDrawer(true)} />
              <ContentActionsTable
                cols={["Title", "Status"]}
                rows={props.collectiveReadings.map((l) => ({
                  id: l.id,
                  cells: [l.title, <ContentStatusBadge key="s" published={l.is_published ?? false} />],
                  isPublished: l.is_published ?? false,
                }))}
                busy={contentPending}
                onEdit={(id) => {
                  const row = props.collectiveReadings.find((l) => l.id === id);
                  if (row) setEditReading(row);
                }}
                onTogglePublish={(id, pub) => {
                  startContentTransition(async () => {
                    const r = await toggleCollectiveReadingPublished(id, pub);
                    if (r.error) toast(mapServerErrorToMn(r.error), "error");
                    else router.refresh();
                  });
                }}
                onDelete={(id) => {
                  if (!window.confirm("Delete this reading?")) return;
                  startContentTransition(async () => {
                    const r = await deleteCollectiveReading(id);
                    if (r.error) toast(mapServerErrorToMn(r.error), "error");
                    else router.refresh();
                  });
                }}
              />
              <CreateCollectiveReadingDrawer open={readingDrawer} onClose={() => setReadingDrawer(false)} />
              <EditCollectiveReadingDrawer
                open={editReading != null}
                item={editReading}
                onClose={() => setEditReading(null)}
              />
            </>
          )}
          {tab === "articles" && (
            <>
              <ContentCreateBar label="+ New article" onClick={() => setArticleDrawer(true)} />
              <ContentActionsTable
                cols={["Title", "Reading time", "Status"]}
                rows={props.articles.map((a) => ({
                  id: a.id,
                  cells: [a.title, a.reading_minutes ?? "—", <ContentStatusBadge key="s" published={a.is_published ?? false} />],
                  isPublished: a.is_published ?? false,
                }))}
                busy={contentPending}
                onEdit={(id) => {
                  const row = props.articles.find((a) => a.id === id);
                  if (row) setEditArticle(row);
                }}
                onTogglePublish={(id, pub) => {
                  startContentTransition(async () => {
                    const r = await toggleArticlePublished(id, pub);
                    if (r.error) toast(mapServerErrorToMn(r.error), "error");
                    else router.refresh();
                  });
                }}
                onDelete={(id) => {
                  if (!window.confirm("Delete this article?")) return;
                  startContentTransition(async () => {
                    const r = await deleteArticle(id);
                    if (r.error) toast(mapServerErrorToMn(r.error), "error");
                    else router.refresh();
                  });
                }}
              />
              <CreateArticleDrawer open={articleDrawer} onClose={() => setArticleDrawer(false)} />
              <EditArticleDrawer
                open={editArticle != null}
                item={editArticle}
                onClose={() => setEditArticle(null)}
              />
            </>
          )}
          {tab === "tests" && (
            <>
              <ContentCreateBar label="+ New test" onClick={() => setTestDrawer(true)} />
              <ContentActionsTable
                cols={["Title", "Status"]}
                rows={props.tests.map((t) => ({
                  id: t.id,
                  cells: [t.title, <ContentStatusBadge key="s" published={t.is_published ?? false} />],
                  isPublished: t.is_published ?? false,
                }))}
                busy={contentPending}
                onEdit={(id) => {
                  const row = props.tests.find((t) => t.id === id);
                  if (row) setEditTest(row);
                }}
                onTogglePublish={(id, pub) => {
                  startContentTransition(async () => {
                    const r = await toggleTestPublished(id, pub);
                    if (r.error) toast(mapServerErrorToMn(r.error), "error");
                    else router.refresh();
                  });
                }}
                onDelete={(id) => {
                  if (!window.confirm("Delete this test?")) return;
                  startContentTransition(async () => {
                    const r = await deleteTest(id);
                    if (r.error) toast(mapServerErrorToMn(r.error), "error");
                    else router.refresh();
                  });
                }}
              />
              <CreatePsychologyTestDrawer open={testDrawer} onClose={() => setTestDrawer(false)} />
              <EditPsychologyTestDrawer
                open={editTest != null}
                item={editTest}
                onClose={() => setEditTest(null)}
              />
            </>
          )}
          {tab === "community" && <CommunityPanel posts={props.moderationPosts} />}
          {tab === "users" && (
            <UsersPanel users={props.users} total={props.usersTotal} page={props.usersPage} query={props.usersQuery} />
          )}
          {tab === "email" && <BroadcastEmailPanel />}
          {tab === "settings" && <SiteSettingsPanel />}
        </main>
      </div>
    </div>
  );
}
