"use client";

import { useEffect, useRef, useState, type ReactNode } from "react";
import { cn } from "@/lib/utils";

type MarketingRevealProps = {
  children: ReactNode;
  className?: string;
  id?: string;
  style?: React.CSSProperties;
  /** Above-the-fold sections: visible on first paint (no scroll wait). */
  eager?: boolean;
};

/**
 * Scroll-triggered section entrance. Toggles `.is-in` once (~12% visible).
 * Respects prefers-reduced-motion (visible immediately, no transition).
 */
export function MarketingReveal({ children, className, id, style, eager = false }: MarketingRevealProps) {
  const ref = useRef<HTMLElement>(null);
  const [inView, setInView] = useState(eager);

  useEffect(() => {
    if (eager) return;
    const el = ref.current;
    if (!el) return;

    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      setInView(true);
      return;
    }

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry?.isIntersecting) {
          setInView(true);
          observer.disconnect();
        }
      },
      { threshold: 0.12, rootMargin: "0px 0px -6% 0px" }
    );

    observer.observe(el);
    return () => observer.disconnect();
  }, [eager]);

  return (
    <section
      id={id}
      ref={ref}
      className={cn(
        "opacity-0 translate-y-2 transition-[opacity,transform] duration-[var(--u-dur-3)] ease-[var(--u-ease-out)] motion-reduce:opacity-100 motion-reduce:translate-y-0 motion-reduce:transition-none",
        inView && "is-in opacity-100 translate-y-0",
        className
      )}
      style={style}
    >
      {children}
    </section>
  );
}
