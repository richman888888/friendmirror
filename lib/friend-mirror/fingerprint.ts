"use client";

const STORAGE_KEY = "fm_visitor_fp_v1";

/** Stable anonymous fingerprint for votes (hashed, no PII sent raw). */
export async function getOrCreateVisitorFingerprint(): Promise<string> {
  if (typeof window === "undefined") return "ssr";
  let id = localStorage.getItem(STORAGE_KEY);
  if (!id) {
    const bytes = crypto.getRandomValues(new Uint8Array(16));
    id = Array.from(bytes)
      .map((b) => b.toString(16).padStart(2, "0"))
      .join("");
    localStorage.setItem(STORAGE_KEY, id);
  }
  const raw = `${id}|${navigator.userAgent}`;
  const buf = await crypto.subtle.digest(
    "SHA-256",
    new TextEncoder().encode(raw),
  );
  return Array.from(new Uint8Array(buf))
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("");
}
