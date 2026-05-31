import Link from "next/link";
import { cn } from "@/lib/utils";
import { MarketingReveal } from "./MarketingReveal";

type MarketingHeroProps = {
  memberCtaHref: string;
};

const ctaBase =
  "inline-flex min-h-11 items-center justify-center gap-[10px] rounded-[var(--u-r-2)] px-[26px] py-4 text-[15px] font-medium leading-[1.55] no-underline transition-[transform,box-shadow,background-color,color,border-color] duration-[var(--u-dur-2)] ease-[var(--u-ease)] hover:-translate-y-px hover:shadow-[var(--u-shadow-2)] active:translate-y-0 active:shadow-[var(--u-shadow-press)] motion-reduce:transition-none motion-reduce:hover:translate-y-0 motion-reduce:hover:shadow-none";

export function MarketingHero({ memberCtaHref }: MarketingHeroProps) {
  return (
    <MarketingReveal
      eager
      className="max-w-container mx-auto px-[var(--u-gutter)] pb-[var(--u-s-16)] pt-[var(--u-s-12)] sm:pb-[var(--u-s-20)] sm:pt-[var(--u-s-20)] md:pt-[var(--u-s-24)]"
    >
      <div className="mb-[var(--u-s-8)] flex min-w-0 max-w-full flex-wrap items-center gap-x-[10px] gap-y-2 font-[var(--u-label)] uppercase tracking-[0.12em] text-[var(--u-ink-3)] sm:mb-[var(--u-s-10)] sm:gap-[14px] sm:tracking-[0.16em]">
        <span className="shrink-0">Vol. II · 2026</span>
        <span className="hidden h-px w-6 shrink-0 bg-[var(--u-rule-2)] min-[480px]:inline-block" aria-hidden />
        <span className="min-w-0 text-pretty">Jean-Paul French philosopher</span>
      </div>

      <h1 className="max-w-[68ch] text-balance font-[family-name:var(--u-display)] text-[clamp(2.75rem,9vw,8.25rem)] font-bold leading-[0.92] tracking-[-0.035em]">
        Existence precedes
        <br />
        <span className="font-light">essence</span>
      </h1>

      <div
        className="mt-[var(--u-s-10)] grid items-end gap-[var(--u-s-8)] sm:gap-[var(--u-s-12)] md:grid-cols-2 md:gap-[var(--u-s-16)]"
      >
        <p className="m-0 max-w-[30ch] font-[var(--u-body-l)] text-[var(--u-ink-2)] text-pretty sm:max-w-[32rem]">
          It means a person first exists, and only then, through their own choices, actions, and experience, creates “who they
          become”.
        </p>
        <div className="flex w-full min-w-0 flex-col gap-3 sm:w-auto sm:flex-row sm:flex-wrap sm:justify-end">
          <Link
            href={memberCtaHref}
            className={cn(ctaBase, "w-full bg-[var(--u-ink)] text-[var(--u-bg)] sm:w-auto")}
          >
            Become a member
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden>
              <path d="M5 12h14M13 6l6 6-6 6" />
            </svg>
          </Link>
          <Link
            href="#services"
            className={cn(
              ctaBase,
              "w-full border border-[var(--u-rule-2)] bg-[var(--u-surface-2)] text-[var(--u-ink)] sm:w-auto"
            )}
          >
            Explore services
          </Link>
        </div>
      </div>
    </MarketingReveal>
  );
}
