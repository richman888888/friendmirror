"use client";

import { useFM } from "@/src/i18n/I18nProvider";

export function VotePageNotConfigured() {
  const { t } = useFM();
  return (
    <div className="mx-auto max-w-md px-6 py-16 text-center text-[14px] text-[#728193]">
      <p className="font-semibold text-[#1a1a1a]">{t("votePage.notConfiguredTitle")}</p>
      <p className="mt-2 leading-relaxed">{t("votePage.notConfiguredBody")}</p>
    </div>
  );
}
