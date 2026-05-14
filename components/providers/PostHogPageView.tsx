"use client";

import { usePathname, useSearchParams } from "next/navigation";
import { Suspense, useEffect } from "react";

import { safePosthogCapture } from "@/lib/posthog/client-ready";
import { isPosthogConfigured } from "@/lib/posthog/config";

/**
 * App Router: manual `$pageview` when PostHog is initialised with `capture_pageview: false`.
 * Wrapped in Suspense because `useSearchParams()` requires it in the App Router root layout.
 */
function PostHogPageViewInner() {
  const pathname = usePathname();
  const searchParams = useSearchParams();

  useEffect(() => {
    if (!pathname) return;
    const q = searchParams?.toString();
    const path = q ? `${pathname}?${q}` : pathname;
    safePosthogCapture("$pageview", {
      path,
      pathname,
      search: q || undefined,
    });
  }, [pathname, searchParams]);

  return null;
}

export function PostHogPageView() {
  if (!isPosthogConfigured()) return null;
  return (
    <Suspense fallback={null}>
      <PostHogPageViewInner />
    </Suspense>
  );
}
