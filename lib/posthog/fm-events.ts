"use client";

import { safePosthogCapture } from "@/lib/posthog/client-ready";

/** Product analytics event names (PostHog + optional Supabase `events.event_name`). */
export const FRIEND_MIRROR_POSTHOG_EVENTS = [
  "profile_created",
  "avatar_uploaded",
  "invite_button_clicked",
  "share_link_copied",
  "vote_page_opened",
  "referral_opened",
  "referral_converted",
  "tag_selected",
  "vote_submitted",
  "result_viewed",
  "result_shared",
  "create_own_profile_clicked",
] as const;

export type FriendMirrorPosthogEvent =
  (typeof FRIEND_MIRROR_POSTHOG_EVENTS)[number];

const ALLOWED = new Set<string>(FRIEND_MIRROR_POSTHOG_EVENTS);

/** Sends to PostHog only for known FriendMirror events (no-op if key missing / not listed). */
export function captureFriendMirrorEvent(
  name: FriendMirrorPosthogEvent | string,
  props?: Record<string, unknown>,
): void {
  if (!ALLOWED.has(name)) return;
  safePosthogCapture(name, props);
}
