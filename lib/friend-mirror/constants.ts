/** Canonical tag ids stored in DB (`votes.tag`) — never locale-specific copy. */
export const TAG_IDS = [
  "love_brain",
  "born_boss",
  "money_magnet",
  "midnight_emperor",
  "master_slack",
  "social_terror",
] as const;

export type TagId = (typeof TAG_IDS)[number];

/** Legacy rows before tag-id migration (Chinese labels). */
export const LEGACY_TAG_TO_ID: Record<string, TagId> = {
  恋爱脑: "love_brain",
  天生老板: "born_boss",
  财神附体: "money_magnet",
  "深夜 emo 王": "midnight_emperor",
  摆烂大师: "master_slack",
  社交恐怖分子: "social_terror",
};

export function isTagId(s: string): s is TagId {
  return (TAG_IDS as readonly string[]).includes(s);
}

export function normalizeVoteTag(raw: string): TagId | null {
  const t = raw.trim();
  if (isTagId(t)) return t;
  return LEGACY_TAG_TO_ID[t] ?? null;
}
