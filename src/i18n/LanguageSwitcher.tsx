"use client";

import { useFM } from "@/src/i18n/I18nProvider";
import type { FMLocale } from "@/src/i18n/types";

const OPTIONS: { locale: FMLocale; labelKey: string }[] = [
  { locale: "zh-CN", labelKey: "language.zh" },
  { locale: "vi-VN", labelKey: "language.vi" },
  { locale: "en-US", labelKey: "language.en" },
  { locale: "ja-JP", labelKey: "language.ja" },
];

export function LanguageSwitcher() {
  const { locale, setLocale, t } = useFM();

  return (
    <div className="relative shrink-0">
      <label className="sr-only" htmlFor="fm-lang">
        {t("language.label")}
      </label>
      <select
        id="fm-lang"
        value={locale}
        onChange={(e) => setLocale(e.target.value as FMLocale)}
        className="max-w-[7.5rem] cursor-pointer appearance-none rounded-lg border border-white/25 bg-black/15 py-1.5 pl-2 pr-6 text-[11px] font-semibold text-white shadow-sm outline-none ring-white/20 backdrop-blur-sm focus-visible:ring-2"
        style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='12' viewBox='0 0 24 24' fill='white'%3E%3Cpath d='M7 10l5 5 5-5z'/%3E%3C/svg%3E")`,
          backgroundRepeat: "no-repeat",
          backgroundPosition: "right 0.35rem center",
          backgroundSize: "12px",
        }}
      >
        {OPTIONS.map((o) => (
          <option key={o.locale} value={o.locale}>
            {t(o.labelKey)}
          </option>
        ))}
      </select>
    </div>
  );
}
