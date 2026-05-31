"use client";

import { useEffect, useState } from "react";

/**
 * SSR-safe: returns `false` until after mount, then tracks `window.matchMedia(query)`.
 */
export function useMediaQuery(query: string): boolean {
  const [matches, setMatches] = useState(false);

  useEffect(() => {
    if (typeof window === "undefined" || typeof window.matchMedia !== "function") {
      return;
    }

    const mql = window.matchMedia(query);
    const apply = () => setMatches(mql.matches);
    apply();

    if (typeof mql.addEventListener === "function") {
      mql.addEventListener("change", apply);
      return () => mql.removeEventListener("change", apply);
    }

    mql.addListener(apply);
    return () => mql.removeListener(apply);
  }, [query]);

  return matches;
}
