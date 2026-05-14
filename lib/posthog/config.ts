/**
 * PostHog master switch. While `false`: no SDK init, no `capture`, and a missing
 * `NEXT_PUBLIC_POSTHOG_KEY` never causes errors.
 *
 * To re-enable: set to `true`, then restore the implementation in
 * `components/providers/PostHogProvider.tsx` from the archived block at the
 * bottom of that file (includes uncommenting `posthog.init`).
 */
export const POSTHOG_SDK_ENABLED = false;

/** `true` only when the SDK switch is on and a non-empty project key is set. */
export function isPosthogConfigured(): boolean {
  if (!POSTHOG_SDK_ENABLED) return false;
  return Boolean(process.env.NEXT_PUBLIC_POSTHOG_KEY?.trim());
}

/** Ingestion API host, no trailing slash. */
export function getPosthogApiHost(): string {
  const raw =
    process.env.NEXT_PUBLIC_POSTHOG_HOST?.trim() ||
    "https://us.i.posthog.com";
  return raw.replace(/\/+$/, "");
}
