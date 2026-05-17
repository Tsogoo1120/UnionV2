"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useMemo, useState, useTransition } from "react";
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
import { AdminMobileSidebar, type AdminMobileTab } from "@/components/shell/AdminMobileSidebar";
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
                    background: active ? "rgba(255,255,255,.10)" : "transparent",
                    color: active ? "var(--u-indigo-ink)" : "rgba(242,238,227,.78)",
                    border: "none",
                    cursor: "pointer",
                    font: "var(--u-body)",
                    fontWeight: active ? 500 : 400,
                    padding: "8px 10px",
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
              width: 44,
              height: 44,
              borderRadius: "var(--u-r-2)",
              border: "1px solid var(--u-rule-2)",
              background: "var(--u-surface-2)",
              cursor: "pointer",
            }}
          >
            ☰
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
  const isWide = useMediaQuery("(min-width: 900px)");
  const kpisList = [
    { l: "Идэвхтэй гишүүн", v: String(kpis.activeMembers), d: "Идэвхтэй + хугацаа хүчинтэй" },
    { l: "Хүлээгдэж буй төлбөр", v: String(pending), d: "Шалгах хэрэгтэй", ember: true },
    { l: "Сарын орлого", v: compactMnt(kpis.monthlyRevenueMnt), d: "Баталгаажсан төлбөр" },
    { l: "Нээлттэй цаг", v: String(kpis.upcomingAvailableSlots), d: "Боломжтой слот" },
  ];
  return (
    <section>
      <div style={{ display: "grid", gridTemplateColumns: isWide ? "repeat(4, 1fr)" : "minmax(0,1fr)", gap: 16 }}>
        {kpisList.map((k) => (
          <div key={k.l} style={{ background: "var(--u-surface-2)", border: "1px solid var(--u-rule)", borderRadius: "var(--u-r-3)", padding: "20px 22px" }}>
            <div className="u-eyebrow">{k.l}</div>
            <div style={{ fontFamily: "var(--u-display)", fontWeight: 700, fontSize: 40, letterSpacing: "-0.02em", marginTop: 8 }}>{k.v}</div>
            <div style={{ font: "var(--u-body-s)", color: k.ember ? "var(--u-ember)" : "var(--u-ink-3)", marginTop: 6 }}>{k.d}</div>
          </div>
        ))}
      </div>
    </section>
  );
}

function PaymentsSection({ rows }: { rows: PendingPaymentRow[] }) {
  const [sel, setSel] = useState<string | null>(rows[0]?.id ?? null);
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
    return <p style={{ color: "var(--u-ink-2)" }}>Хүлээгдэж буй төлбөр байхгүй.</p>;
  }

  return (
    <div style={{ display: "grid", gridTemplateColumns: isWide ? "1.4fr 1fr" : "minmax(0,1fr)", gap: 24 }}>
      <div style={{ background: "var(--u-surface-2)", border: "1px solid var(--u-rule)", borderRadius: "var(--u-r-3)", overflow: "hidden" }}>
        <div
          style={{
            display: "grid",
            gridTemplateColumns: isWide ? "1.6fr 1fr 1fr .8fr 1fr" : "minmax(0,1fr)",
            padding: "10px 22px",
            background: "var(--u-surface)",
            borderBottom: "1px solid var(--u-rule)",
            font: "var(--u-label)",
            letterSpacing: ".12em",
            textTransform: "uppercase",
            color: "var(--u-ink-3)",
          }}
        >
          {isWide ? (
            <>
              <div>Хэрэглэгч</div>
              <div>Дүн</div>
              <div>Огноо</div>
              <div>Статус</div>
              <div />
            </>
          ) : (
            <div>Төлбөр</div>
          )}
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
              gridTemplateColumns: isWide ? "1.6fr 1fr 1fr .8fr 1fr" : "minmax(0,1fr)",
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
            {isWide ? (
              <>
                <div style={{ fontFamily: "var(--u-mono)" }}>{formatMNT(Number(r.amount))}</div>
                <div style={{ color: "var(--u-ink-3)" }}>{formatRelative(r.submitted_at)}</div>
                <div>{statusLabel(r.status, "payment").label}</div>
                <div />
              </>
            ) : (
              <div style={{ marginTop: 6, fontFamily: "var(--u-mono)" }}>{formatMNT(Number(r.amount))}</div>
            )}
          </button>
        ))}
      </div>

      {cur ? (
        <div
          style={{
            background: "var(--u-surface-2)",
            border: "1px solid var(--u-rule)",
            borderRadius: "var(--u-r-3)",
            padding: 24,
            display: "flex",
            flexDirection: "column",
            gap: 16,
            position: isWide ? "sticky" : "relative",
            top: 24,
            height: "fit-content",
          }}
        >
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
            <img src={cur.screenshot_url} alt="" style={{ width: "100%", borderRadius: "var(--u-r-2)", border: "1px solid var(--u-rule)" }} />
          ) : null}
          <textarea
            value={note}
            onChange={(e) => setNote(e.target.value)}
            placeholder="Админ тэмдэглэл (татгалзахад)"
            style={{
              background: "var(--u-surface)",
              border: "1px solid var(--u-rule-2)",
              borderRadius: "var(--u-r-2)",
              padding: "10px 14px",
              font: "var(--u-body)",
              color: "var(--u-ink)",
              resize: "vertical",
              minHeight: 64,
              outline: "none",
            }}
          />
          {err ? <p style={{ color: "var(--u-danger)", font: "var(--u-body-s)" }}>{err}</p> : null}
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
            <button
              type="button"
              disabled={pending}
              onClick={() => run(() => denyPayment(cur.id, note))}
              style={{ background: "var(--u-surface)", border: "1px solid var(--u-rule-2)", color: "var(--u-danger)", font: "var(--u-body-s)", fontWeight: 500, padding: "12px", borderRadius: "var(--u-r-2)", cursor: "pointer", minHeight: 44 }}
            >
              Татгалзах
            </button>
            <button
              type="button"
              disabled={pending}
              onClick={() => run(() => approvePayment(cur.id))}
              style={{ background: "var(--u-ink)", color: "var(--u-bg)", border: "none", font: "var(--u-body-s)", fontWeight: 500, padding: "12px", borderRadius: "var(--u-r-2)", cursor: "pointer", minHeight: 44 }}
            >
              Зөвшөөрөх →
            </button>
          </div>
        </div>
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
  rows: { id: string; cells: (string | number)[]; isPublished: boolean }[];
  cols: string[];
  onEdit?: (id: string) => void;
  onTogglePublish: (id: string, publish: boolean) => void;
  onDelete: (id: string) => void;
  busy: boolean;
}) {
  const isWide = useMediaQuery("(min-width: 900px)");
  const colTemplate = isWide
    ? [...cols.map(() => "1fr"), "auto"].join(" ")
    : "minmax(0,1fr)";

  return (
    <div style={{ border: "1px solid var(--u-rule)", borderRadius: "var(--u-r-3)", overflow: "auto" }}>
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
        {cols.map((c) => <div key={c}>{c}</div>)}
        {isWide && <div />}
      </div>
      {rows.length === 0 && (
        <div style={{ padding: "24px 16px", color: "var(--u-ink-3)", font: "var(--u-body-s)", textAlign: "center" }}>
          Мэдээлэл байхгүй.
        </div>
      )}
      {rows.map((r, i) => (
        <div
          key={r.id}
          style={{
            display: "grid",
            gridTemplateColumns: colTemplate,
            padding: "12px 16px",
            borderTop: i === 0 ? "none" : "1px solid var(--u-rule)",
            font: "var(--u-body-s)",
            gap: isWide ? 8 : 4,
            alignItems: "center",
          }}
        >
          {r.cells.map((cell, j) => <div key={j}>{cell}</div>)}
          <div style={{ display: "flex", gap: 6, justifyContent: isWide ? "flex-end" : "flex-start", marginTop: isWide ? 0 : 6, flexWrap: "wrap" }}>
            {onEdit ? (
              <button
                type="button"
                disabled={busy}
                onClick={() => onEdit(r.id)}
                style={{
                  padding: "4px 10px",
                  borderRadius: "var(--u-r-2)",
                  border: "1px solid var(--u-rule-2)",
                  background: "transparent",
                  color: "var(--u-ink)",
                  font: "var(--u-body-s)",
                  cursor: busy ? "not-allowed" : "pointer",
                  minHeight: 32,
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
                padding: "4px 10px",
                borderRadius: "var(--u-r-2)",
                border: "1px solid var(--u-rule-2)",
                background: r.isPublished ? "var(--u-surface)" : "var(--u-ink)",
                color: r.isPublished ? "var(--u-ink-2)" : "var(--u-bg)",
                font: "var(--u-body-s)",
                cursor: busy ? "not-allowed" : "pointer",
                whiteSpace: "nowrap",
                minHeight: 32,
              }}
            >
              {r.isPublished ? "Ноорог болгох" : "Нийтлэх"}
            </button>
            <button
              type="button"
              disabled={busy}
              onClick={() => onDelete(r.id)}
              style={{
                padding: "4px 10px",
                borderRadius: "var(--u-r-2)",
                border: "1px solid var(--u-rule-2)",
                background: "transparent",
                color: "var(--u-danger)",
                font: "var(--u-body-s)",
                cursor: busy ? "not-allowed" : "pointer",
                minHeight: 32,
              }}
            >
              Устгах
            </button>
          </div>
        </div>
      ))}
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
      { key: "overview", label: "Тойм", icon: <span>◎</span> },
      { key: "payments", label: "Төлбөр", icon: <span>₮</span> },
      { key: "slots", label: "Цаг", icon: <span>◷</span> },
      { key: "bookings", label: "Захиалга", icon: <span>☰</span> },
      { key: "lessons", label: "Хичээл", icon: <span>▶</span> },
      { key: "readings", label: "Уншилт", icon: <span>◆</span> },
      { key: "articles", label: "Эссэ", icon: <span>✎</span> },
      { key: "tests", label: "Тест", icon: <span>?</span> },
      { key: "community", label: "Нийгэм", icon: <span>◎</span> },
      { key: "users", label: "Хэрэглэгч", icon: <span>👤</span> },
      { key: "settings", label: "Тохиргоо", icon: <span>⚙</span> },
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
              <button type="button" onClick={() => changeTab("payments")} style={{ alignSelf: "flex-start", padding: "12px 18px", borderRadius: "var(--u-r-2)", background: "var(--u-ember)", color: "var(--u-ember-ink)", border: "none", cursor: "pointer", fontWeight: 600 }}>
                Төлбөр шалгах →
              </button>
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
                  cells: [l.title, l.category ?? "—", l.is_published ? "Нийтэлсэн" : "Ноорог"],
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
                  cells: [l.title, l.is_published ? "Нийтэлсэн" : "Ноорог"],
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
                  cells: [a.title, a.reading_minutes ?? "—", a.is_published ? "Нийтэлсэн" : "Ноорог"],
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
                  cells: [t.title, t.is_published ? "Нийтэлсэн" : "Ноорог"],
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
