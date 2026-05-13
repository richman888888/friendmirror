/** Mock viral aggregate (numeric only). */

export const PARTICIPANT_COUNT = 13_813_521;

export function formatParticipantCount(n: number, locale: string): string {
  const map: Record<string, string> = {
    "zh-CN": "zh-CN",
    "vi-VN": "vi-VN",
    "en-US": "en-US",
    "ja-JP": "ja-JP",
  };
  const loc = map[locale] ?? "en-US";
  return n.toLocaleString(loc);
}

export const UNLOCK_FRIEND_SLOTS = 3;
