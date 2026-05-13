"use client";

import {
  createContext,
  useCallback,
  useContext,
  useLayoutEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";

import type { TagId } from "@/lib/friend-mirror/constants";
import { enUSBundle } from "@/src/i18n/locales/en-US";
import { interpolate } from "@/src/i18n/strings";
import { jaJPBundle } from "@/src/i18n/locales/ja-JP";
import { viVNBundle } from "@/src/i18n/locales/vi-VN";
import { zhCNBundle } from "@/src/i18n/locales/zh-CN";
import {
  FM_DEFAULT_LOCALE,
  FM_LOCALE_STORAGE_KEY,
  FM_LOCALES,
  type FMLocale,
  type FMLocaleBundle,
} from "@/src/i18n/types";

export const fmBundles: Record<FMLocale, FMLocaleBundle> = {
  "zh-CN": zhCNBundle,
  "en-US": enUSBundle,
  "vi-VN": viVNBundle,
  "ja-JP": jaJPBundle,
};

export function normalizeLocale(raw: string | null | undefined): FMLocale {
  if (!raw) return FM_DEFAULT_LOCALE;
  const l = raw.toLowerCase().replace("_", "-");
  if (l.startsWith("zh")) return "zh-CN";
  if (l.startsWith("vi")) return "vi-VN";
  if (l.startsWith("ja")) return "ja-JP";
  if (l.startsWith("en")) return "en-US";
  return FM_DEFAULT_LOCALE;
}

export function readStoredLocale(): FMLocale | null {
  if (typeof window === "undefined") return null;
  const v = window.localStorage.getItem(FM_LOCALE_STORAGE_KEY)?.trim();
  if (!v) return null;
  return (FM_LOCALES as readonly string[]).includes(v) ? (v as FMLocale) : null;
}

function getNestedString(obj: unknown, path: string): string | undefined {
  let cur: unknown = obj;
  for (const p of path.split(".")) {
    if (cur == null || typeof cur !== "object") return undefined;
    cur = (cur as Record<string, unknown>)[p];
  }
  return typeof cur === "string" ? cur : undefined;
}

export type FMContextValue = {
  locale: FMLocale;
  setLocale: (l: FMLocale) => void;
  bundle: FMLocaleBundle;
  t: (path: string, vars?: Record<string, string | number>) => string;
  tagLabel: (id: TagId) => string;
};

const FMContext = createContext<FMContextValue | null>(null);

export function I18nProvider({ children }: { children: ReactNode }) {
  const [locale, setLocaleState] = useState<FMLocale>(FM_DEFAULT_LOCALE);

  useLayoutEffect(() => {
    setLocaleState(readStoredLocale() ?? normalizeLocale(navigator.language));
  }, []);

  useLayoutEffect(() => {
    document.documentElement.lang = locale;
    window.localStorage.setItem(FM_LOCALE_STORAGE_KEY, locale);
  }, [locale]);

  const setLocale = useCallback((l: FMLocale) => {
    setLocaleState(l);
  }, []);

  const bundle = fmBundles[locale];

  const t = useCallback(
    (path: string, vars?: Record<string, string | number>) => {
      const raw = getNestedString(bundle.ui, path) ?? path;
      return vars ? interpolate(raw, vars) : raw;
    },
    [bundle],
  );

  const tagLabel = useCallback(
    (id: TagId) => bundle.tags[id] ?? id,
    [bundle],
  );

  const value = useMemo(
    () => ({ locale, setLocale, bundle, t, tagLabel }),
    [locale, setLocale, bundle, t, tagLabel],
  );

  return <FMContext.Provider value={value}>{children}</FMContext.Provider>;
}

export function useFM(): FMContextValue {
  const c = useContext(FMContext);
  if (!c) throw new Error("useFM must be used within I18nProvider");
  return c;
}
