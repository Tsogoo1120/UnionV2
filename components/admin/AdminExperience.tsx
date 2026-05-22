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
import { useMediaQuery } from "@/lib/hooks/useMediaQuery";
import {
  IconArticles,
  IconBookings,
  IconCommunity,
  IconEmail,
  IconHamburger,
  IconLessons,
  IconOverview,
  IconPayments,
  IconReadings,
  IconSettings,
  IconSlots,
  IconTests,
  IconUsers,
} from "@/components/admin/admin-nav-icons";
import { AdminMobileSidebar, type AdminMobileTab } from "@/components/shell/AdminMobileSidebar";
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
  overview: { title: "Тойм", sub: "Сүүлийн 24 цаг" },
  payments: { title: "Төлбөр", sub: "Гишүүнчлэлийн төлбөр" },
  slots: { title: "Цаг хуваарь", sub: "1:1 коучинг" },
  bookings: { title: "Захиалга", sub: "1:1 коучинг" },
  lessons: { title: "Видео хичээл", sub: "Контент · 01" },
  readings: { title: "Хамтын уншилт", sub: "Контент · 02" },
  articles: { title: "Нийтлэл", sub: "Контент · 05" },
  tests: { title: "Тест", sub: "Контент · 04" },
  community: { title: "Нийгэмлэг", sub: "Модерац" },
  users: { title: "Хэрэглэгчид", sub: "Систем" },
  email: { title: "Имэйл", sub: "Бүх хэрэглэгчдэд" },
  settings: { title: "Тохиргоо", sub: "Сайтын тохиргоо" },
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
      aria-label="Нүүр хуудас руу буцах"
      className="inline-flex min-h-11 shrink-0 items-center justify-center rounded-[var(--u-r-2)] px-3 no-underline transition-[color,transform,opacity] duration-[var(--u-dur-2)] ease-[var(--u-ease)] hover:-translate-y-px focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--u-ember)] motion-reduce:transition-none motion-reduce:hover:translate-y-0"
      style={{
        font: "var(--u-body-s)",
        fontWeight: 600,
        color: "var(--u-ember)",
      }}
    >
      ← Нүүр хуудас
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
  desktop,
  adminName,
  adminEmail,
}: {
  tab: AdminTab;
  setTab: (t: AdminTab) => void;
  counts: Record<string, number>;
  desktop: boolean;
  adminName: string;
  adminEmail: string;
}) {
  if (!desktop) return null;
  const sections: { h: string; items: { id: AdminTab; label: string; n: number }[] }[] = [
    { h: "Хяналт", items: [
      { id: "overview", label: "Тойм", n: 0 },
      { id: "payments", label: "Төлбөр", n: counts.payments },
    ]},
    { h: "Коучинг", items: [
      { id: "slots", label: "Цаг хуваарь", n: 0 },
      { id: "bookings", label: "Захиалга", n: counts.bookings },
    ]},
    { h: "Контент", items: [
      { id: "lessons", label: "Видео хичээл", n: 0 },
      { id: "readings", label: "Хамтын уншилт", n: 0 },
      { id: "articles", label: "Нийтлэл", n: 0 },
      { id: "tests", label: "Тест", n: 0 },
      { id: "community", label: "Нийгэмлэг", n: counts.community },
    ]},
    { h: "Систем", items: [
      { id: "users", label: "Хэрэглэгчид", n: 0 },
      { id: "email", label: "Имэйл", n: 0 },
      { id: "settings", label: "Тохиргоо", n: 0 },
    ]},
  ];

  return (
    <aside
      style={{
        width: 232,
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
                    transition: "background-color var(--u-dur-2) var(--u-ease)",
                  }}
                  onMouseEnter={(e) => {
                    if (!active) e.currentTarget.style.background = "rgba(255,255,255,.06)";
                  }}
                  onMouseLeave={(e) => {
                    if (!active) e.currentTarget.style.background = "transparent";
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
            {adminName || adminEmail || "Админ"}
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
  onMenu,
  showMenu,
}: {
  title: string;
  subtitle: string;
  onMenu: () => void;
  showMenu: boolean;
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
        {showMenu ? (
          <button
            type="button"
            aria-label="Цэс нээх"
            onClick={onMenu}
            style={{
              minWidth: 44,
              minHeight: 44,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              borderRadius: "var(--u-r-2)",
              border: "1px solid var(--u-rule-2)",
              background: "var(--u-surface-2)",
              cursor: "pointer",
              color: "var(--u-ink)",
            }}
          >
            <IconHamburger />
          </button>
        ) : null}
        <div>
          <div className="u-eyebrow">{subtitle}</div>
          <h1 style={{ fontFamily: "var(--u-display)", fontWeight: 700, fontSize: "clamp(28px, 5vw, 40px)", letterSpacing: "-0.02em", margin: "8px 0 0" }}>{title}</h1>
        </div>
      </div>
      <AdminBackHomeLink />
    </div>
  );
}

function KPIStrip({ kpis, pending }: { kpis: AdminOverviewKpis; pending: number }) {
  const isDesktop = useMediaQuery("(min-width: 641px)");
  const kpisList = [
    { l: "Идэвхтэй гишүүн", v: String(kpis.activeMembers), d: "Идэвхтэй + хугацаа хүчинтэй", ember: false },
    { l: "Хүлээгдэж буй төлбөр", v: String(pending), d: "Шалгах хэрэгтэй", ember: true },
    { l: "Сарын орлого", v: compactMnt(kpis.monthlyRevenueMnt), d: "Баталгаажсан төлбөр", ember: false },
    { l: "Нээлттэй цаг", v: String(kpis.upcomingAvailableSlots), d: "Боломжтой слот", ember: false },
  ];
  return (
    <section>
      <div
        style={{
          display: "grid",
          gridTemplateColumns: isDesktop ? "repeat(4, 1fr)" : "repeat(2, 1fr)",
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
  const isDesktop = useMediaQuery("(min-width: 641px)");
  const actions: { tab: AdminTab; title: string; sub: string; badge?: number }[] = [
    { tab: "payments", title: "Төлбөр шалгах", sub: "Хүлээгдэж буй гүйлгээ", badge: pendingPayments },
    { tab: "bookings", title: "Захиалга", sub: "Коучингийн баталгаажуулалт", badge: pendingBookings },
    { tab: "community", title: "Нийгэмлэг", sub: "Модерац, нуугдах пост" },
    { tab: "lessons", title: "Шинэ контент", sub: "Видео хичээл нэмэх" },
  ];

  return (
    <section>
      <div className="u-eyebrow" style={{ marginBottom: 14 }}>
        Шуурхай үйлдэл
      </div>
      <div
        style={{
          display: "grid",
          gridTemplateColumns: isDesktop ? "repeat(2, 1fr)" : "minmax(0,1fr)",
          gap: 12,
        }}
      >
        {actions.map((a) => (
          <button
            key={a.tab}
            type="button"
            onClick={() => onTab(a.tab)}
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
          aria-label="Хаах"
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
      <div className="u-eyebrow">Шалгалт</div>
      <div>
        <div style={{ font: "var(--u-h3)" }}>{cur.user_full_name ?? cur.user_email}</div>
        <div style={{ font: "var(--u-body-s)", color: "var(--u-ink-3)" }}>{cur.user_email}</div>
      </div>
      <div style={{ font: "var(--u-h4)", fontFamily: "var(--u-mono)" }}>{formatMNT(Number(cur.amount))}</div>
      {cur.bank_reference ? (
        <div style={{ font: "var(--u-body-s)", color: "var(--u-ink-2)" }}>
          <span className="u-eyebrow">Лавлагаа · </span>
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
        placeholder="Админ тэмдэглэл (татгалзахад)"
        className="u-field"
        style={{ resize: "vertical", minHeight: 64 }}
      />
      {err ? <p style={{ color: "var(--u-danger)", font: "var(--u-body-s)" }}>{err}</p> : null}
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
        <button
          type="button"
          disabled={pending}
          onClick={onDeny}
          style={{
            background: "transparent",
            border: "1px solid var(--u-danger-soft)",
            color: "var(--u-danger)",
            font: "var(--u-body-s)",
            fontWeight: 500,
            padding: "12px",
            borderRadius: "var(--u-r-2)",
            cursor: "pointer",
            minHeight: 48,
          }}
        >
          Татгалзах
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
          Зөвшөөрөх →
        </button>
      </div>
    </>
  );
}

function PaymentsSection({ rows }: { rows: PendingPaymentRow[] }) {
  const [sel, setSel] = useState<string | null>(rows[0]?.id ?? null);
  const [mobileSheet, setMobileSheet] = useState(false);
  const [note, setNote] = useState("");
  const [pending, startTransition] = useTransition();
  const [err, setErr] = useState<string | null>(null);
  const isWide = useMediaQuery("(min-width: 960px)");
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
        title="Хүлээгдэж буй төлбөр байхгүй"
        body="Шинэ төлбөр ирмэгц энд харагдана."
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
    <div style={{ display: "grid", gridTemplateColumns: isWide ? "1.4fr 1fr" : "minmax(0,1fr)", gap: 24 }}>
      <div style={{ display: "flex", flexDirection: "column", gap: isWide ? 0 : 12 }}>
        {isWide ? (
          <div style={{ background: "var(--u-surface-2)", border: "1px solid var(--u-rule)", borderRadius: "var(--u-r-3)", overflow: "hidden" }}>
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
              <div>Хэрэглэгч</div>
              <div>Дүн</div>
              <div>Огноо</div>
              <div>Статус</div>
              <div />
            </div>
            {rows.map((r) => (
              <button
                key={r.id}
                type="button"
                onClick={() => setSel(r.id)}
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
        ) : (
          rows.map((r) => (
            <button
              key={r.id}
              type="button"
              onClick={() => {
                setSel(r.id);
                setMobileSheet(true);
              }}
              style={{
                width: "100%",
                textAlign: "left",
                border: "1px solid var(--u-rule)",
                borderRadius: "var(--u-r-3)",
                cursor: "pointer",
                padding: "16px 18px",
                font: "var(--u-body-s)",
                background: sel === r.id ? "var(--u-ember-soft)" : "var(--u-surface-2)",
                display: "flex",
                flexDirection: "column",
                gap: 8,
              }}
            >
              <div style={{ fontWeight: 600 }}>{r.user_full_name ?? "—"}</div>
              <div style={{ fontSize: 11, color: "var(--u-ink-3)" }}>{r.user_email}</div>
              <div style={{ display: "flex", justifyContent: "space-between", gap: 12, marginTop: 4 }}>
                <span style={{ fontFamily: "var(--u-mono)", fontWeight: 600 }}>{formatMNT(Number(r.amount))}</span>
                <span style={{ color: "var(--u-ink-3)" }}>{formatRelative(r.submitted_at)}</span>
              </div>
            </button>
          ))
        )}
      </div>

      {detailProps && isWide ? (
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

      {detailProps && !isWide && mobileSheet ? (
        <>
          <div
            role="presentation"
            onClick={() => setMobileSheet(false)}
            style={{ position: "fixed", inset: 0, background: "rgba(20,17,13,.32)", zIndex: 39 }}
          />
          <div
            role="dialog"
            aria-modal
            style={{
              position: "fixed",
              bottom: 0,
              left: 0,
              right: 0,
              maxHeight: "85vh",
              overflowY: "auto",
              background: "var(--u-surface-2)",
              borderRadius: "var(--u-r-4) var(--u-r-4) 0 0",
              padding: "24px 24px calc(24px + env(safe-area-inset-bottom, 0px))",
              zIndex: 40,
              display: "flex",
              flexDirection: "column",
              gap: 16,
            }}
          >
            <PaymentDetailPanel {...detailProps} onClose={() => setMobileSheet(false)} showClose />
          </div>
        </>
      ) : null}
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
  const isDesktop = useMediaQuery("(min-width: 641px)");
  const isWide = useMediaQuery("(min-width: 900px)");
  const colTemplate = isWide ? [...cols.map(() => "1fr"), "auto"].join(" ") : "minmax(0,1fr)";
  const btnMinH = isDesktop ? 36 : 44;

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
            minHeight: btnMinH,
          }}
        >
          Засах
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
          minHeight: btnMinH,
          fontWeight: r.isPublished ? 400 : 600,
        }}
      >
        {r.isPublished ? "Ноорог болгох" : "Нийтлэх"}
      </button>
      <button
        type="button"
        disabled={busy}
        onClick={() => onDelete(r.id)}
        style={{
          padding: "6px 12px",
          borderRadius: "var(--u-r-2)",
          border: "1px solid var(--u-danger-soft)",
          background: "transparent",
          color: "var(--u-danger)",
          font: "var(--u-body-s)",
          cursor: busy ? "not-allowed" : "pointer",
          minHeight: btnMinH,
        }}
      >
        Устгах
      </button>
    </>
  );

  return (
    <div style={{ border: "1px solid var(--u-rule)", borderRadius: "var(--u-r-3)", overflow: "auto" }}>
      {isWide ? (
        <div
          style={{
            display: "grid",
            gridTemplateColumns: colTemplate,
            padding: "10px 16px",
            background: "var(--u-surface)",
            borderBottom: "1px solid var(--u-rule)",
            font: "var(--u-label)",
            color: "var(--u-ink-3)",
          }}
        >
          {cols.map((c) => (
            <div key={c}>{c}</div>
          ))}
          <div />
        </div>
      ) : null}
      {rows.length === 0 ? (
        <EmptyState title="Мэдээлэл байхгүй" body="Эхний контентоо нэмэхийн тулд дээрх товчийг ашиглана уу." />
      ) : null}
      {rows.map((r, i) =>
        isWide ? (
          <div
            key={r.id}
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
        ) : (
          <div
            key={r.id}
            style={{
              padding: "16px",
              borderTop: i === 0 ? "none" : "1px solid var(--u-rule)",
              font: "var(--u-body-s)",
              display: "flex",
              flexDirection: "column",
              gap: 10,
            }}
          >
            {r.cells.map((cell, j) => (
              <div key={j}>{cell}</div>
            ))}
            <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>{actionBtns(r)}</div>
          </div>
        ),
      )}
    </div>
  );
}

export function AdminExperience(props: AdminExperienceProps) {
  const router = useRouter();
  const toast = useToast();
  const [tab, setTab] = useState<AdminTab>(props.initialTab ?? "overview");
  const [navDrawer, setNavDrawer] = useState(false);
  const [lessonDrawer, setLessonDrawer] = useState(false);
  const [readingDrawer, setReadingDrawer] = useState(false);
  const [articleDrawer, setArticleDrawer] = useState(false);
  const [testDrawer, setTestDrawer] = useState(false);
  const [editLesson, setEditLesson] = useState<VideoLesson | null>(null);
  const [editReading, setEditReading] = useState<CollectiveReading | null>(null);
  const [editArticle, setEditArticle] = useState<Article | null>(null);
  const [editTest, setEditTest] = useState<PsychologyTest | null>(null);
  const [contentPending, startContentTransition] = useTransition();
  const desktopSidebar = useMediaQuery("(min-width: 641px)");
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

  const mobileTabs: AdminMobileTab[] = useMemo(
    () => [
      { key: "overview", label: "Тойм", icon: <IconOverview />, sectionHeader: "Хяналт" },
      { key: "payments", label: "Төлбөр", icon: <IconPayments /> },
      { key: "slots", label: "Цаг", icon: <IconSlots />, sectionHeader: "Коучинг" },
      { key: "bookings", label: "Захиалга", icon: <IconBookings /> },
      { key: "lessons", label: "Хичээл", icon: <IconLessons />, sectionHeader: "Контент" },
      { key: "readings", label: "Уншилт", icon: <IconReadings /> },
      { key: "articles", label: "Эссэ", icon: <IconArticles /> },
      { key: "tests", label: "Тест", icon: <IconTests /> },
      { key: "community", label: "Нийгэм", icon: <IconCommunity /> },
      { key: "users", label: "Хэрэглэгч", icon: <IconUsers />, sectionHeader: "Систем" },
      { key: "email", label: "Имэйл", icon: <IconEmail /> },
      { key: "settings", label: "Тохиргоо", icon: <IconSettings /> },
    ],
    [],
  );


  const lessonCategories = useMemo(
    () =>
      Array.from(
        new Set(props.videoLessons.map((l) => l.category).filter((c): c is string => Boolean(c))),
      ).sort(),
    [props.videoLessons],
  );

  return (
    <div style={{ display: "flex", minHeight: "100vh", background: "var(--u-bg)" }}>
      <AdminNav
        tab={tab}
        setTab={changeTab}
        counts={counts}
        desktop={desktopSidebar}
        adminName={props.adminName}
        adminEmail={props.adminEmail}
      />
      <AdminMobileSidebar activeTab={tab} onTabChange={(k) => changeTab(k as AdminTab)} tabs={mobileTabs} open={navDrawer} onClose={() => setNavDrawer(false)} />
      <div style={{ flex: 1, display: "flex", flexDirection: "column", minWidth: 0 }}>
        <AdminTopbar title={m.title} subtitle={m.sub} onMenu={() => setNavDrawer(true)} showMenu={!desktopSidebar} />
        <main style={{ padding: desktopSidebar ? "32px 36px 80px" : "20px 16px 80px", flex: 1 }}>
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
              <ContentCreateBar label="+ Шинэ хичээл" onClick={() => setLessonDrawer(true)} />
              <ContentActionsTable
                cols={["Гарчиг", "Ангилал", "Статус"]}
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
                  if (!window.confirm("Энэ хичээлийг устгах уу?")) return;
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
              <ContentCreateBar label="+ Шинэ уншилт" onClick={() => setReadingDrawer(true)} />
              <ContentActionsTable
                cols={["Гарчиг", "Статус"]}
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
                  if (!window.confirm("Энэ уншилтыг устгах уу?")) return;
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
              <ContentCreateBar label="+ Шинэ нийтлэл" onClick={() => setArticleDrawer(true)} />
              <ContentActionsTable
                cols={["Гарчиг", "Унших цаг", "Статус"]}
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
                  if (!window.confirm("Энэ нийтлэлийг устгах уу?")) return;
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
              <ContentCreateBar label="+ Шинэ тест" onClick={() => setTestDrawer(true)} />
              <ContentActionsTable
                cols={["Гарчиг", "Статус"]}
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
                  if (!window.confirm("Энэ тестийг устгах уу?")) return;
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
