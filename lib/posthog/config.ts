/** PostHog project key (public). */
export function isPosthogConfigured(): boolean {
  return Boolean(process.env.NEXT_PUBLIC_POSTHOG_KEY?.trim());
}

/** Ingestion API host, no trailing slash. */
export function getPosthogApiHost(): string {
  const raw =
    process.env.NEXT_PUBLIC_POSTHOG_HOST?.trim() ||
    "https://us.i.posthog.com";
  return raw.replace(/\/+$/, "");
}
