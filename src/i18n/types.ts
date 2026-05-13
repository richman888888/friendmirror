import type { TagId } from "@/lib/friend-mirror/constants";

export type FMLocale = "zh-CN" | "vi-VN" | "en-US" | "ja-JP";

export const FM_LOCALE_STORAGE_KEY = "fm_locale";

export const FM_LOCALES: readonly FMLocale[] = [
  "zh-CN",
  "vi-VN",
  "en-US",
  "ja-JP",
] as const;

export const FM_DEFAULT_LOCALE: FMLocale = "en-US";

export type TagLineTable = Record<TagId, readonly string[]>;

/** Nested UI strings — accessed via dot path, e.g. `home.titleLine1` */
export type FMUiTree = Record<string, unknown>;

export interface FMLocaleBundle {
  locale: FMLocale;
  tags: Record<TagId, string>;
  roasts: TagLineTable;
  dare: TagLineTable;
  hidden: TagLineTable;
  fallbackRoasts: readonly string[];
  mock: {
    names: readonly string[];
    anonymous: string;
    minutesAgo: string;
  };
  ui: FMUiTree;
}
