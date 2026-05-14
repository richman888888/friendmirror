"use client";

import posthog from "posthog-js";

import { isPosthogConfigured, POSTHOG_SDK_ENABLED } from "@/lib/posthog/config";

type PosthogWithLoaded = { __loaded?: boolean };

/** Same default singleton as `PostHogProvider` when passing `client={posthog}`. */
export function isPosthogClientReady(): boolean {
  if (!isPosthogConfigured()) return false;
  return Boolean((posthog as unknown as PosthogWithLoaded).__loaded);
}

/**
 * Safe no-op when PostHog is off or not initialised. Never throws; does not call
 * `posthog.capture` unless the SDK is enabled and ready.
 */
export function safePosthogCapture(
  _event: string,
  _properties?: Record<string, unknown>,
): void {
  if (!POSTHOG_SDK_ENABLED) return;
  if (!isPosthogClientReady()) return;
  try {
    posthog.capture(_event, _properties);
  } catch {
    /* ignore */
  }
}
