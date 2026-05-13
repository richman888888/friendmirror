"use client";

import { usePathname, useSearchParams } from "next/navigation";
import { Suspense, useEffect } from "react";
import { usePostHog } from "posthog-js/react";

import { isPosthogConfigured } from "@/lib/posthog/config";

/**
 * App Router: manual `$pageview` when PostHog is initialised with `capture_pageview: false`.
 * Wrapped in Suspense because `useSearchParams()` requires it in the App Router root layout.
 */
function PostHogPageViewInner() {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const posthog = usePostHog();

  useEffect(() => {
    if (!pathname || !posthog) return;
    const q = searchParams?.toString();
    const path = q ? `${pathname}?${q}` : pathname;
    posthog.capture("$pageview", {
      path,
      pathname,
      search: q || undefined,
    });
  }, [pathname, posthog, searchParams]);

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
