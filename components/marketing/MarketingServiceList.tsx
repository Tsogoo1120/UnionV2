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
    sub: "Видео хичээлүүд",
    body: "Би та бүхэнд Докторуудын судалгааны ажлуудыг өөрийнхөө амьдралд хэрхэн ашиглаж болох талаас маш энгийн үг хэллэг жишээ ашиглаж хичээл бэлдсэн",
  },
  {
    n: "",
    serviceId: "readings",
    title: "collective readings",
    sub: "Тарот уншлага",
    body: "7 хоног тутам тарот хөзрөөр ямар энерги төлөвтэй байна бас юун дээр анхаарах хэрэгтэй талаар уншлага хийх болно",
  },
  {
    n: "",
    serviceId: "community",
    title: "community",
    sub: "өөрийгөө илэрхийлэх",
    body: "Та өөрийнхөө сурсан туршлага мэдлэгээ бусадтай хуваалцах боломжтой",
  },
  {
    n: "",
    serviceId: "tests",
    title: "psychology tests",
    sub: "сэтгэл зүйн тестүүд",
    body: "Internet-д нээлттэй байдаг тэстүүдийг хариутай нь хамт орчуулан нийтэлсэн болно",
  },
  {
    n: "",
    serviceId: "articles",
    title: "articles and essays",
    sub: "нийтлэл",
    body: "Та бүхэнд өөрийнхөө уншиж судалсанаа тогтмол нийтлэх.",
  },
];

const rowClass =
  "group grid w-full gap-4 border-t border-[var(--u-rule)] py-6 text-left text-inherit no-underline transition-[background-color,box-shadow] duration-[var(--u-dur-2)] ease-[var(--u-ease)] first:border-t-0 hover:bg-[var(--u-surface)] sm:grid-cols-[64px_1fr] sm:gap-6 sm:py-8 md:grid-cols-[80px_1.2fr_2fr_40px] md:gap-8 md:items-baseline motion-reduce:transition-none";

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
        <div className="flex flex-wrap items-baseline justify-between gap-3">
          <div className="u-eyebrow">Үйлчилгээ — 5</div>
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
