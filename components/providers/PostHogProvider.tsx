"use client";

import posthog from "posthog-js";
import { PostHogProvider } from "posthog-js/react";
import { useEffect, useState, type ReactNode } from "react";

import { getPosthogApiHost, isPosthogConfigured } from "@/lib/posthog/config";

import { PostHogPageView } from "./PostHogPageView";

export function PostHogProviderWrapper({ children }: { children: ReactNode }) {
  const [ready, setReady] = useState(false);

  useEffect(() => {
    if (!isPosthogConfigured()) return;
    const key = process.env.NEXT_PUBLIC_POSTHOG_KEY!.trim();
    posthog.init(key, {
      api_host: getPosthogApiHost(),
      capture_pageview: false,
      capture_pageleave: true,
      persistence: "localStorage+cookie",
    });
    setReady(true);
  }, []);

  if (!isPosthogConfigured() || !ready) {
    return <>{children}</>;
  }

  return (
    <PostHogProvider client={posthog}>
      <PostHogPageView />
      {children}
    </PostHogProvider>
  );
}
