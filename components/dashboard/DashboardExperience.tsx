"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useState, type CSSProperties } from "react";
import type { CurrentProfile } from "@/lib/queries/profile";
import type { TransactionRow } from "@/lib/queries/transactions";
import type { VideoLesson } from "@/lib/types";
import type { CoachingSlot, CoachingBooking } from "@/lib/types";
import {
  formatDate,
  formatHM,
  formatMNT,
  formatMongolianLongDate,
  formatMongolianShortWeekday,
  formatRelative,
  statusLabel,
  subscriptionDaysRemaining,
} from "@/lib/format";
import { PAYMENT_INFO } from "@/lib/constants";
import { getEffectiveStatus } from "@/lib/auth/getEffectiveStatus";
import { canAccessSubscriberContent } from "@/lib/subscription";
import { LockedContentLink } from "@/components/dashboard/LockedContentLink";
import { useMediaQuery } from "@/lib/hooks/useMediaQuery";
import { gradForKey } from "@/lib/ui-gradients";
import {
  toneToBadgeStyle,
  transactionKindShort,
} from "@/components/transactions/transaction-ui";
import { MobileBottomNav, type MobileBottomNavItem } from "@/components/shell/MobileBottomNav";
import { EmptyState } from "@/components/ui/empty-state";
import { signOut } from "@/app/actions/auth";

type Tab = "hub" | "lessons" | "coaching" | "profile";

const dashBackLinkStyle: CSSProperties = {
  display: "inline-flex",
  alignItems: "center",
  minHeight: 44,
  padding: "4px 0",
  marginBottom: "var(--u-s-4)",
  font: "var(--u-body-s)",
  fontWeight: 600,
  color: "var(--u-ember)",
  textDecoration: "none",
};

function DashBackToHub({ label = "← Хяналт" }: { label?: string }) {
  return (
    <Link href="/dashboard?tab=hub" style={dashBackLinkStyle}>
      {label}
    </Link>
  );
}

function thumbUrl(path: string | null | undefined): string | null {
  if (!path) return null;
  return `${process.env.NEXT_PUBLIC_SUPABASE_URL}/storage/v1/object/public/media-thumbnails/${path}`;
}

function rowCardGridStyle(isWide: boolean, cols: string): CSSProperties {
  return {
    display: "grid",
    gridTemplateColumns: isWide ? cols : "minmax(0,1fr)",
    gap: isWide ? undefined : 12,
    alignItems: isWide ? "center" : "stretch",
    padding: isWide ? "20px 28px" : "16px 18px",
    borderTop: "1px solid var(--u-rule)",
  };
}

function DashNav({
  tab,
  onTab,
  profile,
  showDesktop,
}: {
  tab: Tab;
  onTab: (t: Tab) => void;
  profile: CurrentProfile;
  showDesktop: boolean;
}) {
  const tabs: { id: Tab; label: string }[] = [
    { id: "hub", label: "dashboard" },
    { id: "coaching", label: "1vs1 meeting" },
    { id: "profile", label: "profile" },
  ];

  const eff = getEffectiveStatus(profile);
  const subLbl = statusLabel(eff === "admin" ? "active" : eff, "subscription");
  const badge = toneToBadgeStyle(subLbl.tone);
  const rel =
    profile.subscription_expires_at && (eff === "active" || eff === "admin")
      ? formatRelative(profile.subscription_expires_at)
      : "—";

  const initials =
    (profile.full_name?.trim()?.[0] ?? profile.email?.[0] ?? "?").toUpperCase();

  if (!showDesktop) return null;

  return (
    <header
      style={{
        position: "sticky",
        top: 0,
        zIndex: 10,
        background: "var(--u-surface)",
        borderBottom: "1px solid var(--u-rule)",
      }}
    >
      <div
        style={{
          maxWidth: 1240,
          margin: "0 auto",
          padding: "12px 32px",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: 24, flexWrap: "wrap" }}>
          <Link href="/" style={{ display: "flex", alignItems: "baseline", textDecoration: "none" }}>
            <span
              style={{
                fontFamily: "var(--u-display)",
                fontWeight: 700,
                fontSize: 22,
                letterSpacing: "-0.04em",
                color: "var(--u-ink)",
              }}
            >
              Union
            </span>
            <span style={{ color: "var(--u-ember)", fontSize: 22, fontWeight: 700 }}>.</span>
          </Link>
          <span
            style={{
              font: "var(--u-mono)",
              fontSize: 11,
              color: "var(--u-ink-3)",
              borderLeft: "1px solid var(--u-rule)",
              paddingLeft: 16,
            }}
          >
          </span>
          <nav style={{ display: "flex", gap: 4, marginLeft: 16, flexWrap: "wrap" }}>
            {tabs.map((t) => {
              const active = tab === t.id;
              return (
                <button
                  key={t.id}
                  type="button"
                  onClick={() => onTab(t.id)}
                  className={active ? "u-dash-tab u-dash-tab--active" : "u-dash-tab"}
                >
                  {t.label}
                </button>
              );
            })}
          </nav>
        </div>
        <div style={{ display: "flex", gap: 12, alignItems: "center" }}>
          <span
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: 6,
              ...badge,
              font: "var(--u-body-s)",
              fontWeight: 500,
              padding: "6px 12px",
              borderRadius: "var(--u-r-pill)",
            }}
          >
            <span style={{ width: 6, height: 6, borderRadius: 999, background: "currentColor" }} />
            {subLbl.label} · {rel}
          </span>
          <div
            style={{
              width: 32,
              height: 32,
              borderRadius: 999,
              background: "#D4B98C",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              font: "var(--u-body-s)",
              fontWeight: 600,
            }}
          >
            {initials}
          </div>
        </div>
      </div>
    </header>
  );
}

function StatusCard({
  profile,
}: {
  profile: CurrentProfile;
}) {
  const eff = getEffectiveStatus(profile);
  const days = subscriptionDaysRemaining(profile.subscription_expires_at);
  const subLbl = statusLabel(eff === "admin" ? "active" : eff, "subscription");
  const isWide = useMediaQuery("(min-width: 900px)");
  const isMobileCard = useMediaQuery("(max-width: 640px)");

  const nextPay = profile.subscription_expires_at
    ? formatDate(profile.subscription_expires_at)
    : "—";

  const renewCta = (
    <Link
      href="/payment"
      style={{
        background: isMobileCard ? "var(--u-ember)" : "var(--u-ink)",
        color: isMobileCard ? "var(--u-ember-ink)" : "var(--u-bg)",
        padding: "12px 18px",
        textAlign: "center",
        borderRadius: "var(--u-r-2)",
        textDecoration: "none",
        font: "var(--u-body-s)",
        fontWeight: 600,
        display: "inline-flex",
        alignItems: "center",
        justifyContent: "center",
        minHeight: isMobileCard ? 52 : 48,
        width: isWide ? undefined : "100%",
        boxSizing: "border-box",
      }}
    >
      Сунгах
    </Link>
  );

  const statusHeadline = (
    <div>
      <div className="u-eyebrow">Гишүүнчлэл</div>
      <div
        style={{
          fontFamily: "var(--u-display)",
          fontWeight: 700,
          fontSize: isMobileCard ? 26 : isWide ? 32 : 26,
          letterSpacing: "-0.015em",
          marginTop: 6,
        }}
      >
        {subLbl.label}
        {days != null ? (
          <>
            {" "}
            ·{" "}
            <span style={{ fontWeight: 300, color: "var(--u-ink-2)" }}>{days} өдөр үлдсэн</span>
          </>
        ) : null}
      </div>
    </div>
  );

  const metaNext = (
    <div>
      <div className="u-eyebrow">Дараагийн төлбөр</div>
      <div style={{ font: "var(--u-h3)", marginTop: 6 }}>{nextPay}</div>
    </div>
  );

  const metaAmount = (
    <div>
      <div className="u-eyebrow">Дүн</div>
      <div style={{ font: "var(--u-h3)", marginTop: 6, fontFamily: "var(--u-mono)" }}>
        {formatMNT(PAYMENT_INFO.amount)}
      </div>
    </div>
  );

  return (
    <section
      style={{
        background: "var(--u-surface-2)",
        border: "1px solid var(--u-rule)",
        borderRadius: "var(--u-r-3)",
        padding: isWide ? "28px 32px" : "20px 18px",
        display: isWide ? "grid" : "flex",
        flexDirection: isWide ? undefined : "column",
        gridTemplateColumns: isWide ? "1.4fr 1fr 1fr 180px" : undefined,
        gap: isWide ? 32 : isMobileCard ? 12 : 14,
        alignItems: isWide ? "center" : "stretch",
      }}
    >
      {isWide ? (
        <>
          {statusHeadline}
          {metaNext}
          {metaAmount}
          {renewCta}
        </>
      ) : (
        <>
          {statusHeadline}
          {renewCta}
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14 }}>{metaNext}{metaAmount}</div>
        </>
      )}
    </section>
  );
}

type HubStats = {
  videoLessons: number;
  collectiveReadings: number;
  articles: number;
  tests: number;
  communityPostsWeek: number;
};

function ServiceHub({
  profile,
  hubStats,
  firstReadingSlug,
  firstArticleSlug,
  firstTestSlug,
  contentLocked,
}: {
  profile: CurrentProfile;
  hubStats: HubStats;
  firstReadingSlug: string | null;
  firstArticleSlug: string | null;
  firstTestSlug: string | null;
  contentLocked: boolean;
}) {
  const displayName = profile.full_name?.trim() || "Хэрэглэгч";
  const isDesktop = useMediaQuery("(min-width: 1100px)");
  const isTablet = useMediaQuery("(min-width: 641px)") && !isDesktop;
  const cardMinHeight = isDesktop ? 160 : 140;
  const gridCols = isDesktop ? "repeat(5, 1fr)" : isTablet ? "repeat(3, 1fr)" : "repeat(2, 1fr)";
  const today = formatMongolianLongDate(new Date());

  const services: {
    n: string;
    title: string;
    meta: string;
    inverted?: boolean;
    emberMeta?: boolean;
    href: string;
  }[] = [
    {
      n: "01",
      title: "Видео хичээл",
      meta: `${hubStats.videoLessons} хичээл`,
      href: "/dashboard?tab=lessons",
    },
    {
      n: "02",
      title: "Хамтын уншилт",
      meta: `${hubStats.collectiveReadings} уншилт`,
      inverted: true,
      href: firstReadingSlug ? `/readings/${firstReadingSlug}` : "#",
    },
    {
      n: "03",
      title: "Community",
      meta: `7 хоногт ${hubStats.communityPostsWeek} пост`,
      emberMeta: true,
      href: "/community",
    },
    {
      n: "04",
      title: "Тест",
      meta: `${hubStats.tests} тест`,
      href: "/tests",
    },
    {
      n: "05",
      title: "Нийтлэл",
      meta: `${hubStats.articles} нийтлэл`,
      href: firstArticleSlug ? `/articles/${firstArticleSlug}` : "#",
    },
  ];

  return (
    <section>
      <div
        style={{
          display: "flex",
          alignItems: "baseline",
          justifyContent: "space-between",
          marginBottom: 20,
          flexWrap: "wrap",
          gap: 12,
        }}
      >
        <h2
          style={{
            fontFamily: "var(--u-display)",
            fontWeight: 700,
            fontSize: "clamp(32px, 6vw, 48px)",
            letterSpacing: "-0.02em",
            margin: 0,
          }}
        >
          Сайн уу,
          <br />
          <span style={{ fontWeight: 300, color: "var(--u-ink-2)", whiteSpace: "nowrap" }}>{displayName}.</span>
        </h2>
        <div style={{ font: "var(--u-body-s)", color: "var(--u-ink-3)" }}>{today}</div>
      </div>
      <div
        style={{
          display: "grid",
          gridTemplateColumns: gridCols,
          gap: 12,
        }}
      >
        {services.map((s, idx) => (
          <LockedContentLink
            key={s.n}
            href={s.href}
            locked={contentLocked}
            className="u-card-lift"
            style={{
              textDecoration: "none",
              color: "inherit",
              background: s.inverted ? "var(--u-ink)" : "var(--u-surface-2)",
              border: s.inverted ? "none" : "1px solid var(--u-rule)",
              borderRadius: "var(--u-r-3)",
              padding: "20px 22px",
              display: "flex",
              flexDirection: "column",
              gap: 12,
              minHeight: cardMinHeight,
              gridColumn:
                !isDesktop && !isTablet && services.length % 2 !== 0 && idx === services.length - 1
                  ? "1 / -1"
                  : undefined,
            }}
          >
            <div
              style={{
                font: "var(--u-mono)",
                fontSize: 11,
                color: s.inverted ? "var(--u-dark-ink-2)" : "var(--u-ink-3)",
              }}
            >
              {s.n} / 05
            </div>
            <div
              style={{
                fontFamily: "var(--u-display)",
                fontWeight: 700,
                fontSize: "clamp(22px, 3.5vw, 30px)",
                letterSpacing: "-0.015em",
                lineHeight: 1.02,
                color: s.inverted ? "var(--u-dark-ink)" : "var(--u-ink)",
                flex: 1,
              }}
            >
              {s.title}
            </div>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <span
                style={{
                  font: "var(--u-body-s)",
                  color: s.emberMeta ? "var(--u-ember)" : s.inverted ? "var(--u-dark-ink-2)" : "var(--u-ink-3)",
                  fontWeight: s.emberMeta ? 500 : 400,
                }}
              >
                {s.meta}
              </span>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke={s.inverted ? "var(--u-dark-ink)" : "currentColor"} strokeWidth="1.5">
                <path d="M7 17L17 7M10 7h7v7" />
              </svg>
            </div>
          </LockedContentLink>
        ))}
      </div>
    </section>
  );
}

function ContinueRow({
  lessons,
  contentLocked,
}: {
  lessons: VideoLesson[];
  contentLocked: boolean;
}) {
  const isWide = useMediaQuery("(min-width: 900px)");
  if (lessons.length === 0) return null;

  return (
    <section style={{ marginTop: 48 }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", marginBottom: 14 }}>
        <div className="u-eyebrow">Үргэлжлүүлэх</div>
        <Link href="/dashboard?tab=lessons" style={{ font: "var(--u-body-s)", color: "var(--u-ink-2)" }}>
          Бүх хичээл →
        </Link>
      </div>
      <div
        style={{
          display: "grid",
          gridTemplateColumns: isWide ? "repeat(3, 1fr)" : "minmax(0,1fr)",
          gap: 16,
        }}
      >
        {lessons.map((it, i) => (
          <LockedContentLink
            key={it.id}
            href={`/lessons/${it.slug}`}
            locked={contentLocked}
            className="u-card-lift"
            style={{
              textDecoration: "none",
              color: "inherit",
              borderRadius: "var(--u-r-3)",
              overflow: "hidden",
              border: "1px solid var(--u-rule)",
              background: "var(--u-surface-2)",
              display: "flex",
              flexDirection: "column",
              minHeight: 220,
            }}
          >
            <div
              style={{
                aspectRatio: "16/9",
                background: gradForKey(it.id),
                position: "relative",
                display: "flex",
                alignItems: "flex-end",
                padding: 16,
              }}
            >
              {thumbUrl(it.thumbnail_path) ? (
                <img
                  src={thumbUrl(it.thumbnail_path)!}
                  alt=""
                  loading="lazy"
                  style={{ position: "absolute", inset: 0, width: "100%", height: "100%", objectFit: "cover" }}
                />
              ) : null}
              <span
                style={{
                  position: "absolute",
                  top: 12,
                  left: 14,
                  font: "var(--u-mono)",
                  fontSize: 11,
                  color: "var(--u-dark-ink-2)",
                  zIndex: 1,
                }}
              >
                Хичээл {String(i + 1).padStart(2, "0")}
              </span>
              <div
                style={{
                  fontFamily: "var(--u-display)",
                  fontWeight: 700,
                  fontSize: 22,
                  letterSpacing: "-0.015em",
                  color: "var(--u-dark-ink)",
                  lineHeight: 1.05,
                  zIndex: 1,
                  textShadow: thumbUrl(it.thumbnail_path) ? "0 1px 4px rgba(0,0,0,0.6)" : undefined,
                }}
              >
                {it.title}
              </div>
              <svg style={{ position: "absolute", right: 14, top: 14, zIndex: 1 }} width="22" height="22" viewBox="0 0 32 32">
                <circle cx="16" cy="16" r="15" fill="none" stroke="#F2EEE3" strokeWidth="1.2" />
                <path d="M13 11l8 5-8 5z" fill="#F2EEE3" />
              </svg>
            </div>
            <div style={{ padding: "12px 16px 14px" }}>
              <div style={{ height: 3, background: "var(--u-rule)", borderRadius: 2, overflow: "hidden" }}>
                <div style={{ width: "8%", height: "100%", background: "var(--u-ember)" }} />
              </div>
              <div style={{ font: "var(--u-body-s)", color: "var(--u-ink-3)", marginTop: 8 }}>Шинэ</div>
            </div>
          </LockedContentLink>
        ))}
      </div>
    </section>
  );
}

function LessonGridSection({
  lessons,
  lessonCategories,
  levelFilter,
  contentLocked,
}: {
  lessons: VideoLesson[];
  lessonCategories: string[];
  levelFilter: string | null;
  contentLocked: boolean;
}) {
  const isWide = useMediaQuery("(min-width: 900px)");
  const pills = ["Бүгд", ...lessonCategories];

  return (
    <section>
      <DashBackToHub />
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "flex-end",
          marginBottom: 24,
          flexWrap: "wrap",
          gap: 12,
        }}
      >
        <div>
          <div className="u-eyebrow">Видео хичээл · 01</div>
          <h2 style={{ fontFamily: "var(--u-display)", fontWeight: 700, fontSize: "clamp(36px, 7vw, 56px)", letterSpacing: "-0.02em", margin: "8px 0 0" }}>
            Хичээлүүд<span style={{ color: "var(--u-ember)" }}>.</span>
          </h2>
        </div>
        <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
          {pills.map((c) => {
            const active =
              c === "Бүгд" ? !levelFilter : levelFilter === c;
            const href =
              c === "Бүгд"
                ? "/dashboard?tab=lessons"
                : `/dashboard?tab=lessons&level=${encodeURIComponent(c)}`;
            return (
              <Link
                key={c}
                href={href}
                className={active ? "u-filter-pill u-filter-pill--active" : "u-filter-pill"}
              >
                {c}
              </Link>
            );
          })}
        </div>
      </div>
      <div
        style={{
          display: "grid",
          gridTemplateColumns: isWide ? "repeat(3, 1fr)" : "minmax(0,1fr)",
          gap: 18,
        }}
      >
        {lessons.length === 0 ? (
          <div style={{ gridColumn: isWide ? "1 / -1" : undefined }}>
            <EmptyState
              icon={
                <svg width={32} height={32} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.4" aria-hidden>
                  <rect x="3" y="5" width="14" height="12" rx="1" />
                  <path d="M17 9l4-2v10l-4-2" />
                </svg>
              }
              title="Энэ шүүлтээр хичээл алга"
              body="Ангилал өөрчлөх эсвэл дараа дахин шалгана уу."
              ctaHref="/dashboard?tab=lessons"
              ctaLabel="Бүх ангиллыг харах"
            />
          </div>
        ) : (
          lessons.map((l, idx) => (
          <LockedContentLink
            key={l.id}
            href={`/lessons/${l.slug}`}
            locked={contentLocked}
            className="u-card-lift"
            style={{
              textDecoration: "none",
              color: "inherit",
              background: "var(--u-surface-2)",
              borderRadius: "var(--u-r-3)",
              border: "1px solid var(--u-rule)",
              overflow: "hidden",
              display: "flex",
              flexDirection: "column",
              minHeight: 260,
            }}
          >
            <div
              style={{
                aspectRatio: "16/9",
                background: gradForKey(l.slug),
                position: "relative",
                display: "flex",
                alignItems: "flex-end",
                padding: 16,
              }}
            >
              {thumbUrl(l.thumbnail_path) ? (
                <img
                  src={thumbUrl(l.thumbnail_path)!}
                  alt=""
                  loading="lazy"
                  style={{ position: "absolute", inset: 0, width: "100%", height: "100%", objectFit: "cover" }}
                />
              ) : null}
              <span
                style={{
                  position: "absolute",
                  top: 12,
                  left: 14,
                  font: "var(--u-mono)",
                  fontSize: 11,
                  color: "var(--u-dark-ink-2)",
                  zIndex: 1,
                }}
              >
                Хичээл {String(idx + 1).padStart(2, "0")}
              </span>
              {l.duration_seconds != null ? (
                <span style={{ position: "absolute", top: 12, right: 14, font: "var(--u-body-s)", color: "var(--u-dark-ink-2)", zIndex: 1 }}>
                  {Math.round(l.duration_seconds / 60)} мин
                </span>
              ) : null}
              <div
                style={{
                  fontFamily: "var(--u-display)",
                  fontWeight: 700,
                  fontSize: 24,
                  letterSpacing: "-0.015em",
                  color: "var(--u-dark-ink)",
                  lineHeight: 1.02,
                  zIndex: 1,
                  textShadow: thumbUrl(l.thumbnail_path) ? "0 1px 4px rgba(0,0,0,0.6)" : undefined,
                }}
              >
                {l.title}
              </div>
              <svg style={{ position: "absolute", right: 14, bottom: 14, zIndex: 1 }} width="28" height="28" viewBox="0 0 32 32">
                <circle cx="16" cy="16" r="15" fill="none" stroke="#F2EEE3" strokeWidth="1.2" />
                <path d="M13 11l8 5-8 5z" fill="#F2EEE3" />
              </svg>
            </div>
            <div style={{ padding: "14px 18px 16px", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <span style={{ font: "var(--u-body-s)", color: "var(--u-ink-3)" }}>{l.category ?? "—"}</span>
              <span style={{ font: "var(--u-body-s)", color: "var(--u-ink-3)" }}>Шинэ</span>
            </div>
          </LockedContentLink>
        ))
        )}
      </div>
    </section>
  );
}

function slotRowState(slot: CoachingSlot, myPendingSlotIds: Set<string>): "available" | "pending" | "booked" {
  if (slot.status === "booked") return "booked";
  if (myPendingSlotIds.has(slot.id)) return "pending";
  return "available";
}

function CoachingSection({
  upcomingSlots,
  myBookings,
}: {
  upcomingSlots: CoachingSlot[];
  myBookings: CoachingBooking[];
}) {
  const isTable = useMediaQuery("(min-width: 641px)");
  const myPendingSlotIds = new Set(
    myBookings.filter((b) => b.status === "pending").map((b) => b.slot_id),
  );

  const stateChip = {
    available: { bg: "transparent", fg: "var(--u-ember)", txt: "Захиалах →" },
    pending: { bg: "var(--u-warn-soft)", fg: "#7A4F00", txt: "Хүлээгдэж буй" },
    booked: { bg: "var(--u-rule)", fg: "var(--u-ink-3)", txt: "Захиалагдсан" },
  };

  return (
    <section>
      <DashBackToHub />
      <div style={{ marginBottom: 28 }}>
        <div className="u-eyebrow">1:1 коучинг</div>
        <h2 style={{ fontFamily: "var(--u-display)", fontWeight: 700, fontSize: "clamp(36px, 7vw, 56px)", letterSpacing: "-0.02em", margin: "8px 0 0" }}>
          Нээлттэй цаг<span style={{ color: "var(--u-ember)" }}>.</span>
        </h2>
      </div>

      {myBookings.length > 0 ? (
        <div style={{ marginBottom: 24 }}>
          <div className="u-eyebrow" style={{ marginBottom: 8 }}>
            Миний захиалга
          </div>
          <div style={{ border: "1px solid var(--u-rule)", borderRadius: "var(--u-r-3)", overflow: "hidden" }}>
            {myBookings.map((b, i) => (
              <div
                key={b.id}
                style={{
                  ...rowCardGridStyle(isTable, "1fr 1fr auto"),
                  borderTop: i === 0 ? "none" : "1px solid var(--u-rule)",
                  font: "var(--u-body-s)",
                }}
              >
                <span>{formatDate(b.submitted_at, { withTime: true })}</span>
                <span style={{ fontFamily: "var(--u-mono)" }}>{formatMNT(b.amount)}</span>
                <span>{statusLabel(b.status, "booking").label}</span>
              </div>
            ))}
          </div>
        </div>
      ) : null}

      <div style={{ border: "1px solid var(--u-rule)", borderRadius: "var(--u-r-3)", background: "var(--u-surface-2)", overflow: "hidden" }}>
        {upcomingSlots.length === 0 ? (
          <EmptyState
            icon={
              <svg width={32} height={32} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.4" aria-hidden>
                <circle cx="12" cy="12" r="9" />
                <path d="M12 7v5l3 2" />
              </svg>
            }
            title="Нээлттэй цаг алга"
            body="Шинэ цаг нэмэгдмэгц энд харагдана. Хяналтын хэсгээс үргэлжлүүлнэ үү."
            ctaHref="/dashboard?tab=hub"
            ctaLabel="Хяналт руу буцах"
          />
        ) : isTable ? (
          upcomingSlots.map((slot, i) => {
            const start = new Date(slot.start_at);
            const end = new Date(slot.end_at);
            const s = {
              date: String(start.getDate()),
              month: `${start.getMonth() + 1}-р сар`,
              day: formatMongolianShortWeekday(start),
              time: `${formatHM(start)} — ${formatHM(end)}`,
              state: slotRowState(slot, myPendingSlotIds),
            };
            const c = stateChip[s.state];
            return (
              <div
                key={slot.id}
                style={{
                  display: "grid",
                  gridTemplateColumns: "80px 1.5fr 1.4fr 1fr 160px",
                  gap: 16,
                  alignItems: "center",
                  padding: "20px 28px",
                  borderTop: i === 0 ? "none" : "1px solid var(--u-rule)",
                  opacity: s.state === "booked" ? 0.55 : 1,
                }}
              >
                <div style={{ fontFamily: "var(--u-display)", fontWeight: 700, fontSize: 36, lineHeight: 1, letterSpacing: "-0.02em" }}>{s.date}</div>
                <div>
                  <div style={{ font: "var(--u-body-s)", color: "var(--u-ink-3)" }}>
                    {s.month} · {s.day}
                  </div>
                  <div style={{ font: "var(--u-h4)", marginTop: 2 }}>{s.time}</div>
                </div>
                <div style={{ font: "var(--u-body)", color: "var(--u-ink-2)" }}>1 цагийн уулзалт · онлайн</div>
                <div style={{ font: "var(--u-mono)", color: "var(--u-ink-2)" }}>{formatMNT(slot.price)}</div>
                <div style={{ textAlign: "right" }}>
                  {s.state === "available" ? (
                    <Link
                      href={`/coaching/book/${slot.id}`}
                      style={{
                        display: "inline-flex",
                        alignItems: "center",
                        minHeight: 44,
                        background: c.bg,
                        color: c.fg,
                        font: "var(--u-body-s)",
                        fontWeight: 500,
                        padding: "8px 14px",
                        borderRadius: "var(--u-r-pill)",
                        border: "1px solid var(--u-rule-2)",
                        textDecoration: "none",
                      }}
                    >
                      {c.txt}
                    </Link>
                  ) : (
                    <span
                      style={{
                        display: "inline-flex",
                        alignItems: "center",
                        background: c.bg,
                        color: c.fg,
                        font: "var(--u-body-s)",
                        fontWeight: 500,
                        padding: "8px 14px",
                        borderRadius: "var(--u-r-pill)",
                        border: "none",
                      }}
                    >
                      {c.txt}
                    </span>
                  )}
                </div>
              </div>
            );
          })
        ) : (
          <div style={{ display: "flex", flexDirection: "column", gap: 12, padding: 16 }}>
            {upcomingSlots.map((slot) => {
              const start = new Date(slot.start_at);
              const end = new Date(slot.end_at);
              const state = slotRowState(slot, myPendingSlotIds);
              const c = stateChip[state];
              return (
                <div
                  key={slot.id}
                  style={{
                    background: "var(--u-surface-2)",
                    border: "1px solid var(--u-rule)",
                    borderRadius: "var(--u-r-3)",
                    padding: 20,
                    display: "flex",
                    flexDirection: "column",
                    gap: 14,
                    opacity: state === "booked" ? 0.55 : 1,
                  }}
                >
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: 12 }}>
                    <div
                      style={{
                        fontFamily: "var(--u-display)",
                        fontWeight: 700,
                        fontSize: 48,
                        lineHeight: 1,
                        letterSpacing: "-0.02em",
                        color: "var(--u-ink)",
                      }}
                    >
                      {String(start.getDate())}
                    </div>
                    <div style={{ textAlign: "right", font: "var(--u-body-s)", color: "var(--u-ink-3)" }}>
                      <div>{`${start.getMonth() + 1}-р сар`}</div>
                      <div style={{ marginTop: 2 }}>{formatMongolianShortWeekday(start)}</div>
                    </div>
                  </div>
                  <div style={{ font: "var(--u-h4)", color: "var(--u-ink)" }}>{`${formatHM(start)} — ${formatHM(end)}`}</div>
                  <div
                    style={{
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "space-between",
                      gap: 12,
                    }}
                  >
                    <span style={{ font: "var(--u-mono)", color: "var(--u-ink-2)" }}>{formatMNT(slot.price)}</span>
                    {state === "available" ? (
                      <Link
                        href={`/coaching/book/${slot.id}`}
                        style={{
                          display: "inline-flex",
                          alignItems: "center",
                          justifyContent: "center",
                          minHeight: 48,
                          padding: "0 18px",
                          background: "var(--u-ember)",
                          color: "var(--u-ember-ink)",
                          font: "var(--u-body-s)",
                          fontWeight: 600,
                          borderRadius: "var(--u-r-2)",
                          textDecoration: "none",
                        }}
                      >
                        {c.txt}
                      </Link>
                    ) : (
                      <span
                        style={{
                          display: "inline-flex",
                          alignItems: "center",
                          minHeight: 48,
                          padding: "0 14px",
                          background: c.bg,
                          color: c.fg,
                          font: "var(--u-body-s)",
                          fontWeight: 500,
                          borderRadius: "var(--u-r-pill)",
                        }}
                      >
                        {c.txt}
                      </span>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </section>
  );
}

function Toggle({ label, defaultOn }: { label: string; defaultOn?: boolean }) {
  const [on, setOn] = useState(!!defaultOn);
  return (
    <label style={{ display: "flex", justifyContent: "space-between", alignItems: "center", cursor: "pointer" }}>
      <span style={{ font: "var(--u-body)", color: "var(--u-ink)" }}>{label}</span>
      <button
        type="button"
        aria-pressed={on}
        onClick={() => setOn((v) => !v)}
        style={{
          width: 38,
          height: 22,
          borderRadius: 999,
          background: on ? "var(--u-ember)" : "var(--u-rule-2)",
          position: "relative",
          transition: "background 160ms",
          border: "none",
          padding: 0,
          cursor: "pointer",
        }}
      >
        <span
          style={{
            position: "absolute",
            top: 2,
            left: on ? 18 : 2,
            width: 18,
            height: 18,
            borderRadius: 999,
            background: "var(--u-bg)",
            transition: "left 160ms",
          }}
        />
      </button>
    </label>
  );
}

function ProfileScreen({
  profile,
  recentTransactions,
}: {
  profile: CurrentProfile;
  recentTransactions: TransactionRow[];
}) {
  const isWide = useMediaQuery("(min-width: 900px)");
  const displayName = profile.full_name?.trim() || "Хэрэглэгч";

  return (
    <section>
      <DashBackToHub />
      <div className="u-eyebrow">Профайл</div>
      <h2
        style={{
          fontFamily: "var(--u-display)",
          fontWeight: 700,
          fontSize: "clamp(36px, 7vw, 56px)",
          letterSpacing: "-0.02em",
          margin: "8px 0 32px",
        }}
      >
        {displayName}{" "}
        <span style={{ fontWeight: 300, color: "var(--u-ink-2)" }}>
          · {profile.email}
        </span>
      </h2>

      <div
        style={{
          display: "grid",
          gridTemplateColumns: isWide ? "1.6fr 1fr" : "minmax(0,1fr)",
          gap: 24,
        }}
      >
        <div
          style={{
            background: "var(--u-surface-2)",
            border: "1px solid var(--u-rule)",
            borderRadius: "var(--u-r-3)",
            overflow: "hidden",
          }}
        >
          <div
            style={{
              padding: "20px 28px",
              borderBottom: "1px solid var(--u-rule)",
              display: "flex",
              justifyContent: "space-between",
              alignItems: "baseline",
              flexWrap: "wrap",
              gap: 8,
            }}
          >
            <div style={{ font: "var(--u-h3)" }}>Сүүлийн 5 гүйлгээ</div>
            <Link
              href="/transactions"
              style={{
                font: "var(--u-body-s)",
                fontWeight: 600,
                color: "var(--u-ember)",
                textDecoration: "none",
              }}
            >
              Бүгдийг харах →
            </Link>
          </div>
          {recentTransactions.length === 0 ? (
            <EmptyState
              icon={
                <svg width={28} height={28} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.4" aria-hidden>
                  <path d="M4 6h16v12H4zM8 10h8M8 14h5" />
                </svg>
              }
              title="Гүйлгээ байхгүй"
              body="Төлбөр төлөх эсвэл гүйлгээний түүхээ эндээс харна."
              ctaHref="/payment"
              ctaLabel="Төлбөр илгээх"
            />
          ) : (
            recentTransactions.map((row, i) => {
              const { label, tone } = statusLabel(row.status, "payment");
              const badge = toneToBadgeStyle(tone);
              return (
                <div
                  key={`${row.kind}-${row.id}`}
                  style={{
                    display: "grid",
                    gridTemplateColumns: isWide
                      ? "minmax(0,1fr) minmax(0,1fr) minmax(0,0.9fr) auto"
                      : "1fr 1fr",
                    gridTemplateRows: isWide ? undefined : "auto auto",
                    gap: isWide ? 12 : "6px 10px",
                    padding: isWide ? "16px 28px" : "14px 18px",
                    borderTop: i === 0 ? "none" : "1px solid var(--u-rule)",
                    alignItems: isWide ? "center" : "start",
                    font: "var(--u-body-s)",
                  }}
                >
                  <span>{formatDate(row.submitted_at, { withTime: true })}</span>
                  {isWide ? (
                    <>
                      <span style={{ fontWeight: 500 }}>{transactionKindShort(row.kind)}</span>
                      <span style={{ fontFamily: "var(--u-mono)", fontWeight: 600 }}>{formatMNT(row.amount)}</span>
                      <span style={{ textAlign: "right" }}>
                        <span style={{ ...badge, padding: "4px 10px", borderRadius: 999, fontWeight: 600, display: "inline-block" }}>
                          {label}
                        </span>
                      </span>
                    </>
                  ) : (
                    <>
                      <span style={{ fontFamily: "var(--u-mono)", fontWeight: 600, textAlign: "right" }}>
                        {formatMNT(row.amount)}
                      </span>
                      <span style={{ fontWeight: 500 }}>{transactionKindShort(row.kind)}</span>
                      <span>
                        <span style={{ ...badge, padding: "4px 10px", borderRadius: 999, fontWeight: 600, display: "inline-block" }}>
                          {label}
                        </span>
                      </span>
                    </>
                  )}
                </div>
              );
            })
          )}
        </div>

        <div
          style={{
            background: "var(--u-surface-2)",
            border: "1px solid var(--u-rule)",
            borderRadius: "var(--u-r-3)",
            padding: 28,
            display: "flex",
            flexDirection: "column",
            gap: 18,
          }}
        >
          <div className="u-eyebrow">Тохиргоо</div>
          <Toggle label="И-мэйл сануулга" defaultOn />
          <Toggle label="Шинэ нийтлэлийн мэдэгдэл" defaultOn />
          <Toggle label="Коучингын сануулга" />
          <form action={signOut}>
            <button
              type="submit"
              className="u-btn-danger-ghost"
              style={{
                marginTop: 12,
                width: "100%",
                padding: "12px 16px",
                minHeight: 48,
                display: "inline-flex",
                alignItems: "center",
                justifyContent: "center",
                gap: 8,
              }}
            >
              <svg width={16} height={16} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" aria-hidden>
                <path d="M9 6L4 12l5 6M4 12h16" />
              </svg>
              Гарах
            </button>
          </form>
        </div>
      </div>
    </section>
  );
}

export type DashboardExperienceProps = {
  profile: CurrentProfile;
  recentTransactions: TransactionRow[];
  continueLessons: VideoLesson[];
  lessonGrid: VideoLesson[];
  lessonCategories: string[];
  levelFilter: string | null;
  upcomingSlots: CoachingSlot[];
  myBookings: CoachingBooking[];
  initialTab: Tab;
  hubStats: HubStats;
  firstReadingSlug: string | null;
  firstArticleSlug: string | null;
  firstTestSlug: string | null;
};

export function DashboardExperience({
  profile,
  recentTransactions,
  continueLessons,
  lessonGrid,
  lessonCategories,
  levelFilter,
  upcomingSlots,
  myBookings,
  initialTab,
  hubStats,
  firstReadingSlug,
  firstArticleSlug,
  firstTestSlug,
}: DashboardExperienceProps) {
  const router = useRouter();
  const pathname = usePathname();
  const tab = initialTab;
  const showDesktopNav = useMediaQuery("(min-width: 641px)");
  const showMobileNav = useMediaQuery("(max-width: 640px)");
  const contentLocked = !canAccessSubscriberContent(profile);

  function goTab(t: Tab) {
    const sp = new URLSearchParams();
    sp.set("tab", t);
    if (t === "lessons" && levelFilter) {
      sp.set("level", levelFilter);
    }
    const qs = sp.toString();
    router.replace(qs ? `${pathname}?${qs}` : pathname);
  }

  const bottomItems: MobileBottomNavItem[] = [
    {
      key: "hub",
      label: "Хяналт",
      href: "/dashboard?tab=hub",
      active: tab === "hub",
      icon: (
        <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6">
          <path d="M4 10.5L12 4l8 6.5V20a1 1 0 01-1 1h-5v-7H10v7H5a1 1 0 01-1-1v-9.5z" />
        </svg>
      ),
    },
    {
      key: "lessons",
      label: "Хичээл",
      href: "/dashboard?tab=lessons",
      active: tab === "lessons",
      icon: (
        <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6">
          <rect x="3" y="5" width="14" height="12" rx="1" />
          <path d="M17 9l4-2v10l-4-2" />
        </svg>
      ),
    },
    {
      key: "coaching",
      label: "Зөвлөгөө",
      href: "/dashboard?tab=coaching",
      active: tab === "coaching",
      icon: (
        <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6">
          <circle cx="12" cy="8" r="3" />
          <path d="M6 20v-1a6 6 0 0112 0v1" />
        </svg>
      ),
    },
    {
      key: "profile",
      label: "Профайл",
      href: "/dashboard?tab=profile",
      active: tab === "profile",
      icon: (
        <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6">
          <circle cx="12" cy="8" r="3.5" />
          <path d="M5 20c.8-3.5 3.5-6 7-6s6.2 2.5 7 6" />
        </svg>
      ),
    },
  ];

  return (
    <div>
      <DashNav tab={tab} onTab={goTab} profile={profile} showDesktop={showDesktopNav} />
      <main
        style={{
          maxWidth: 1240,
          margin: "0 auto",
          padding: showMobileNav ? "40px 16px 100px" : "40px 32px 120px",
          display: "flex",
          flexDirection: "column",
          gap: 40,
        }}
      >
        {tab === "hub" && (
          <>
            <StatusCard profile={profile} />
            <ServiceHub
              profile={profile}
              hubStats={hubStats}
              firstReadingSlug={firstReadingSlug}
              firstArticleSlug={firstArticleSlug}
              firstTestSlug={firstTestSlug}
              contentLocked={contentLocked}
            />
            <ContinueRow lessons={continueLessons} contentLocked={contentLocked} />
          </>
        )}
        {tab === "lessons" && (
          <LessonGridSection
            lessons={lessonGrid}
            lessonCategories={lessonCategories}
            levelFilter={levelFilter}
            contentLocked={contentLocked}
          />
        )}
        {tab === "coaching" && <CoachingSection upcomingSlots={upcomingSlots} myBookings={myBookings} />}
        {tab === "profile" && <ProfileScreen profile={profile} recentTransactions={recentTransactions} />}
      </main>
      {showMobileNav ? <MobileBottomNav items={bottomItems} /> : null}
    </div>
  );
}
