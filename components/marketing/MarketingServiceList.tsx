"use client";

import { useState } from "react";
import { MarketingReveal } from "./MarketingReveal";
import { ServicePreviewModal } from "./ServicePreviewModal";
import type {
  ServiceId,
  ServicePreviewItem,
} from "@/lib/queries/service-previews";

type ServiceItem = {
  n: string;
  serviceId: ServiceId;
  title: string;
  sub: string;
  body: string;
};

const items: ServiceItem[] = [
  {
    n: "",
    serviceId: "lessons",
    title: "Video lessons",
    sub: "Video lessons",
    body: "I have prepared these lessons in very simple language with examples, showing how to apply the research of PhDs to your own everyday life.",
  },
  {
    n: "",
    serviceId: "readings",
    title: "collective readings",
    sub: "Tarot readings",
    body: "Every week I read the tarot cards to see the current energy and what is worth paying attention to.",
  },
  {
    n: "",
    serviceId: "community",
    title: "community",
    sub: "Self-expression",
    body: "You can share the experience and knowledge you have gained with others.",
  },
  {
    n: "",
    serviceId: "tests",
    title: "psychology tests",
    sub: "Psychology tests",
    body: "Tests that are freely available online, translated and published together with their answers.",
  },
  {
    n: "",
    serviceId: "articles",
    title: "articles and essays",
    sub: "Articles",
    body: "I regularly publish what I read and study.",
  },
];

const rowClass =
  "u-card-lift group grid w-full gap-4 border-t border-[var(--u-rule)] py-6 text-left text-inherit first:border-t-0 hover:bg-[var(--u-surface)] sm:grid-cols-[64px_1fr] sm:gap-6 sm:py-8 md:grid-cols-[80px_1.2fr_2fr_40px] md:gap-8 md:items-baseline";

type MarketingServiceListProps = {
  previews?: Record<ServiceId, ServicePreviewItem[]>;
};

export function MarketingServiceList({ previews }: MarketingServiceListProps = {}) {
  const [openId, setOpenId] = useState<ServiceId | null>(null);
  const [lastOpened, setLastOpened] = useState<ServiceItem | null>(null);

  const handleOpen = (it: ServiceItem) => {
    setLastOpened(it);
    setOpenId(it.serviceId);
  };

  return (
    <MarketingReveal
      id="services"
      className="border-y border-[var(--u-rule)] [content-visibility:auto]"
      style={{ containIntrinsicSize: "auto 900px" }}
    >
      <div className="mx-auto max-w-container px-[var(--u-gutter)] pb-5 pt-[var(--u-s-12)] sm:pt-[var(--u-s-16)]">
        <div className="flex flex-wrap items-end justify-between gap-4">
          <div>
            <div className="u-eyebrow mb-2">Membership — all 5 services included</div>
            <p className="m-0 font-[var(--u-body)] text-[var(--u-ink-2)]">
              For <strong className="text-[var(--u-ink)]">50,000₮</strong> a month, you get access to all the services below.
            </p>
          </div>
          <span
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: 6,
              padding: "6px 14px",
              borderRadius: 999,
              border: "1px solid var(--u-rule-2)",
              font: "var(--u-body-s)",
              fontWeight: 600,
              color: "var(--u-ink-2)",
              background: "var(--u-surface)",
              whiteSpace: "nowrap",
            }}
          >
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden>
              <path d="M20 6L9 17l-5-5" />
            </svg>
            All in one place
          </span>
        </div>
      </div>
      <div className="mx-auto max-w-container px-[var(--u-gutter)] pb-[var(--u-s-10)]">
        {items.map((it) => (
          <button
            key={it.n}
            type="button"
            onClick={() => handleOpen(it)}
            aria-haspopup="dialog"
            aria-expanded={openId === it.serviceId}
            className={rowClass}
          >
            <div className="font-[family-name:var(--u-mono)] text-[13px] text-[var(--u-ink-3)]">{it.n}</div>
            <div>
              <div className="font-[family-name:var(--u-display)] text-[clamp(1.75rem,5vw,2.5rem)] font-bold leading-[1.05] tracking-[-0.02em]">
                {it.title}
              </div>
              <div className="mt-1 font-[family-name:var(--u-display)] text-xl font-light text-[var(--u-ink-3)]">
                {it.sub}
              </div>
            </div>
            <div className="font-[var(--u-body-l)] text-[var(--u-ink-2)] text-pretty md:max-w-[540px]">{it.body}</div>
            <div className="hidden text-right text-[var(--u-ink-3)] transition-colors duration-[var(--u-dur-2)] group-hover:text-[var(--u-ember)] md:block">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.4" aria-hidden>
                <path d="M7 17L17 7M10 7h7v7" />
              </svg>
            </div>
          </button>
        ))}
      </div>
      {lastOpened ? (
        <ServicePreviewModal
          open={openId !== null}
          onClose={() => setOpenId(null)}
          service={{
            n: lastOpened.n,
            title: lastOpened.title,
            sub: lastOpened.sub,
            body: lastOpened.body,
          }}
          items={previews?.[lastOpened.serviceId] ?? []}
        />
      ) : null}
    </MarketingReveal>
  );
}
