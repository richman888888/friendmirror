export const SHARE_SOURCE_VALUES = ["zalo", "facebook", "link"] as const;

export type ShareSource = (typeof SHARE_SOURCE_VALUES)[number];

export function normalizeShareSource(
  raw: string | null | undefined,
): ShareSource | null {
  const s = (raw ?? "").trim().toLowerCase();
  if ((SHARE_SOURCE_VALUES as readonly string[]).includes(s)) {
    return s as ShareSource;
  }
  return null;
}
