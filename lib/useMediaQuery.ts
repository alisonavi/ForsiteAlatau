"use client";

import { useEffect, useState } from "react";

/**
 * SSR-safe media-query hook. Returns `false` on the server and on first paint,
 * then updates once mounted so layout can react to breakpoint changes without
 * a hydration mismatch.
 */
export function useMediaQuery(query: string): boolean {
  const [matches, setMatches] = useState(false);

  useEffect(() => {
    const mql = window.matchMedia(query);
    const onChange = () => setMatches(mql.matches);
    onChange();
    mql.addEventListener("change", onChange);
    return () => mql.removeEventListener("change", onChange);
  }, [query]);

  return matches;
}

/** True below Tailwind's `md` breakpoint (phones / small tablets). */
export function useIsMobile(): boolean {
  return useMediaQuery("(max-width: 767px)");
}
