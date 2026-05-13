import type { ShareSource } from "@/lib/friend-mirror/share-source";

/** Absolute share URL for `/p/[share_code]` (works on client + server fallback). */
export function shareUrlFor(
  shareCode: string,
  source?: ShareSource | null,
): string {
  let origin = "";
  if (typeof window !== "undefined") {
    origin = window.location.origin;
  } else {
    origin =
      process.env.NEXT_PUBLIC_SITE_URL ||
      (process.env.VERCEL_URL
        ? `https://${process.env.VERCEL_URL}`
        : "http://localhost:3000");
  }
  const base = `${origin.replace(/\/$/, "")}/p/${encodeURIComponent(shareCode)}`;
  if (!source) return base;
  const u = new URL(base);
  u.searchParams.set("source", source);
  return u.toString();
}
