import { TAG_IDS, type TagId } from "./constants";
import type { FMLocaleBundle } from "@/src/i18n/types";
import { interpolate } from "@/src/i18n/strings";

export type TagStat = { tag: TagId; count: number; percent: number };

export type FriendReview = { name: string; tags: TagId[]; time: string };

function hashString(s: string): number {
  let h = 0;
  for (let i = 0; i < s.length; i++) h = (Math.imul(31, h) + s.charCodeAt(i)) | 0;
  return Math.abs(h);
}

export function makeShareId(nickname: string): string {
  const h = hashString(nickname + Date.now().toString(36)).toString(36);
  return `fm-${h.slice(0, 8)}`;
}

/** Deterministic mock counts from nickname + optional friend picks */
export function computeTagStats(
  nickname: string,
  friendPicks: TagId[],
): TagStat[] {
  const seed = hashString(nickname || "guest");
  const base = TAG_IDS.map((tag, i) => {
    const noise = ((seed >> (i * 3)) & 0xff) % 40;
    return { tag, count: 12 + noise + i * 3 };
  });

  const bump = new Map<TagId, number>();
  for (const t of friendPicks) bump.set(t, (bump.get(t) ?? 0) + 18);

  const merged = base.map((b) => ({
    tag: b.tag,
    count: b.count + (bump.get(b.tag) ?? 0),
  }));

  const total = merged.reduce((s, m) => s + m.count, 0) || 1;
  return merged
    .map((m) => ({
      tag: m.tag,
      count: m.count,
      percent: Math.round((m.count / total) * 1000) / 10,
    }))
    .sort((a, b) => b.count - a.count);
}

export function mockFriendReviews(
  seed: string,
  bundle: FMLocaleBundle,
): FriendReview[] {
  const h = hashString(seed);
  const names = [...bundle.mock.names];
  const out: FriendReview[] = [];
  for (let i = 0; i < 4; i++) {
    const name = names[(h + i) % names.length];
    const t1 = TAG_IDS[(h + i * 2) % TAG_IDS.length];
    const t2 = TAG_IDS[(h + i * 2 + 3) % TAG_IDS.length];
    const tags = Array.from(new Set<TagId>([t1, t2]));
    const minutes = (h % 9) + 1 + i;
    out.push({
      name: i === 0 ? bundle.mock.anonymous : `${name}${i}`,
      tags,
      time: interpolate(bundle.mock.minutesAgo, { n: minutes }),
    });
  }
  return out;
}
