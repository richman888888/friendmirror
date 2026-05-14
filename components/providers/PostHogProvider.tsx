"use client";

import type { ReactNode } from "react";

/**
 * PostHog is **fully disabled** (no SDK init, no provider, no bundle from this file).
 *
 * **Re-enable:** set `POSTHOG_SDK_ENABLED` to `true` in `@/lib/posthog/config`, then replace
 * this component’s body with the archived implementation below (uncomment `posthog.init`
 * and the `PostHogProvider` tree).
 */
export function PostHogProviderWrapper({ children }: { children: ReactNode }) {
  return <>{children}</>;
}

/*
 * ---------------------------------------------------------------------------
 * ARCHIVED — PostHog bootstrap (restore when `POSTHOG_SDK_ENABLED` is true)
 * ---------------------------------------------------------------------------
 *
 * import posthog from "posthog-js";
 * import { PostHogProvider } from "posthog-js/react";
 * import { useEffect, useState } from "react";
 *
 * import { getPosthogApiHost, isPosthogConfigured } from "@/lib/posthog/config";
 * import { PostHogPageView } from "./PostHogPageView";
 *
 * export function PostHogProviderWrapper({ children }: { children: ReactNode }) {
 *   const [ready, setReady] = useState(false);
 *
 *   useEffect(() => {
 *     if (!isPosthogConfigured()) return;
 *     const key = process.env.NEXT_PUBLIC_POSTHOG_KEY?.trim();
 *     if (!key) return;
 *     try {
 *       posthog.init(key, {
 *         api_host: getPosthogApiHost(),
 *         capture_pageview: false,
 *         capture_pageleave: true,
 *         persistence: "localStorage+cookie",
 *       });
 *       setReady(true);
 *     } catch {
 *       // stay off for this session
 *     }
 *   }, []);
 *
 *   if (!isPosthogConfigured() || !ready) {
 *     return <>{children}</>;
 *   }
 *
 *   return (
 *     <PostHogProvider client={posthog}>
 *       <PostHogPageView />
 *       {children}
 *     </PostHogProvider>
 *   );
 * }
 */
