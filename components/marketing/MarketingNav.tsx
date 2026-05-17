"use client";

import Link from "next/link";
import { useState } from "react";
import { MobileDrawer } from "@/components/shell/MobileDrawer";
import { useMediaQuery } from "@/lib/hooks/useMediaQuery";
import { cn } from "@/lib/utils";

const MOBILE_MQ = "(max-width: 640px)";

function HamburgerIcon() {
  return (
    <span aria-hidden className="grid w-5 gap-[5px]">
      <span className="h-0.5 rounded-[1px] bg-current" />
      <span className="h-0.5 rounded-[1px] bg-current" />
      <span className="h-0.5 rounded-[1px] bg-current" />
    </span>
  );
}

type MarketingNavProps = {
  signInHref: string;
  memberHref: string;
};

const navLinkClass =
  "flex min-h-11 items-center rounded-[var(--u-r-2)] px-1 py-2.5 font-[var(--u-body)] font-medium text-inherit no-underline transition-[color,background-color] duration-[var(--u-dur-2)] ease-[var(--u-ease)] hover:text-[var(--u-ink)] focus-visible:outline-none";

const memberCtaClass =
  "inline-flex min-h-11 items-center justify-center rounded-[var(--u-r-2)] bg-[var(--u-ink)] px-4 py-2.5 text-center font-[var(--u-body-s)] font-medium text-[var(--u-bg)] no-underline transition-[transform,box-shadow,background-color] duration-[var(--u-dur-2)] ease-[var(--u-ease)] hover:-translate-y-px hover:shadow-[var(--u-shadow-2)] active:translate-y-0 active:shadow-[var(--u-shadow-press)] motion-reduce:transition-none motion-reduce:hover:translate-y-0";

export function MarketingNav({ signInHref, memberHref }: MarketingNavProps) {
  const isMobile = useMediaQuery(MOBILE_MQ);
  const [menuOpen, setMenuOpen] = useState(false);

  const logo = (
    <Link href="/" className="flex items-baseline no-underline">
      <span className="font-[family-name:var(--u-display)] text-[22px] font-bold tracking-[-0.04em] text-u-ink sm:text-[26px]">
        Union
      </span>
      <span className="ml-px text-[22px] font-bold text-u-ember sm:text-[26px]">.</span>
    </Link>
  );

  const drawerLinks = (
    <nav className="flex flex-col gap-1 px-5 pb-6 pt-2">
      <Link href="#services" className={navLinkClass} onClick={() => setMenuOpen(false)}>
        Үйлчилгээ
      </Link>
      <Link href="#articles" className={navLinkClass} onClick={() => setMenuOpen(false)}>
        Нийтлэл
      </Link>
      <Link href="#coaching" className={navLinkClass} onClick={() => setMenuOpen(false)}>
        1vs1 meeting
      </Link>
      <div className="mt-4 flex flex-col gap-2.5 border-t border-[var(--u-rule)] pt-4">
        <Link
          href={signInHref}
          className={cn(navLinkClass, "text-[var(--u-ink-2)]")}
          onClick={() => setMenuOpen(false)}
        >
          Нэвтрэх
        </Link>
        <Link href={memberHref} className={memberCtaClass} onClick={() => setMenuOpen(false)}>
          Гишүүн болох →
        </Link>
      </div>
    </nav>
  );

  return (
    <header className="sticky top-0 z-10 border-b border-[var(--u-rule)] bg-[color-mix(in_srgb,var(--u-bg)_88%,transparent)] backdrop-blur-[10px]">
      {isMobile ? (
        <div className="mx-auto flex max-w-container items-center justify-between gap-3 px-[var(--u-gutter)] py-3">
          {logo}
          <button
            type="button"
            aria-label="Цэс нээх"
            aria-expanded={menuOpen}
            onClick={() => setMenuOpen(true)}
            className="grid h-11 w-11 min-h-11 min-w-11 place-items-center rounded-[var(--u-r-2)] border-0 bg-transparent p-0 text-[var(--u-ink)] cursor-pointer"
          >
            <HamburgerIcon />
          </button>
          <MobileDrawer open={menuOpen} onClose={() => setMenuOpen(false)} side="right">
            {drawerLinks}
          </MobileDrawer>
        </div>
      ) : (
        <div className="mx-auto flex max-w-container items-center justify-between px-[var(--u-gutter)] py-[18px]">
          {logo}
          <nav className="flex gap-7 font-[var(--u-body-s)] font-medium text-[var(--u-ink-2)]">
            <Link href="#services" className="no-underline text-inherit transition-colors duration-[var(--u-dur-2)] hover:text-[var(--u-ink)]">
              Үйлчилгээ
            </Link>
            <Link href="#articles" className="no-underline text-inherit transition-colors duration-[var(--u-dur-2)] hover:text-[var(--u-ink)]">
              Нийтлэл
            </Link>
            <Link href="#coaching" className="no-underline text-inherit transition-colors duration-[var(--u-dur-2)] hover:text-[var(--u-ink)]">
              1:1 meeting
            </Link>
          </nav>
          <div className="flex items-center gap-3">
            <Link
              href={signInHref}
              className="min-h-11 flex items-center font-[var(--u-body-s)] font-medium text-[var(--u-ink-2)] no-underline transition-colors duration-[var(--u-dur-2)] hover:text-[var(--u-ink)]"
            >
              Нэвтрэх
            </Link>
            <Link href={memberHref} className={cn(memberCtaClass, "px-4 py-2")}>
              Гишүүн болох →
            </Link>
          </div>
        </div>
      )}
    </header>
  );
}
