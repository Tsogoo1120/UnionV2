"use client";

import { usePathname, useSearchParams } from "next/navigation";
import { useEffect, useRef, useState, Suspense } from "react";

function ProgressBarInner() {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [width, setWidth] = useState(0);
  const [visible, setVisible] = useState(false);
  const [fading, setFading] = useState(false);
  const timers = useRef<ReturnType<typeof setTimeout>[]>([]);

  useEffect(() => {
    timers.current.forEach(clearTimeout);
    timers.current = [];
    setWidth(0);
    setVisible(true);
    setFading(false);

    const t1 = setTimeout(() => setWidth(25), 30);
    const t2 = setTimeout(() => setWidth(60), 250);
    const t3 = setTimeout(() => setWidth(85), 600);
    const t4 = setTimeout(() => {
      setWidth(100);
      setFading(true);
    }, 900);
    const t5 = setTimeout(() => setVisible(false), 1150);

    timers.current = [t1, t2, t3, t4, t5];
    return () => timers.current.forEach(clearTimeout);
  }, [pathname, searchParams]);

  if (!visible) return null;

  return (
    <div
      aria-hidden
      style={{
        position: "fixed",
        top: 0,
        left: 0,
        right: 0,
        height: 2,
        zIndex: 9999,
        pointerEvents: "none",
        opacity: fading ? 0 : 1,
        transition: "opacity 0.25s ease",
      }}
    >
      <div
        style={{
          height: "100%",
          background: "var(--u-ember)",
          width: `${width}%`,
          transition: width === 0 ? "none" : "width 0.35s var(--u-ease-out)",
        }}
      />
    </div>
  );
}

export function ProgressBar() {
  return (
    <Suspense>
      <ProgressBarInner />
    </Suspense>
  );
}
