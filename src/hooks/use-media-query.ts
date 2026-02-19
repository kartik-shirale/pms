"use client";

import * as React from "react";

type UseMediaQueryOptions = {
  ssr?: boolean;
  fallback?: boolean;
};

export function useMediaQuery(
  query: string,
  options: UseMediaQueryOptions = {}
): boolean {
  const { ssr = true, fallback = false } = options;

  const [matches, setMatches] = React.useState<boolean>(() => {
    // During SSR, return the fallback value
    if (typeof window === "undefined") {
      return fallback;
    }
    return window.matchMedia(query).matches;
  });

  React.useEffect(() => {
    if (typeof window === "undefined") return;

    const mediaQuery = window.matchMedia(query);

    // Set initial value
    setMatches(mediaQuery.matches);

    // Create event listener
    const handleChange = (event: MediaQueryListEvent) => {
      setMatches(event.matches);
    };

    // Add listener
    mediaQuery.addEventListener("change", handleChange);

    // Cleanup
    return () => {
      mediaQuery.removeEventListener("change", handleChange);
    };
  }, [query]);

  return matches;
}
