export type { FMLocale, FMLocaleBundle, FMUiTree, TagLineTable } from "@/src/i18n/types";
export {
  FM_DEFAULT_LOCALE,
  FM_LOCALE_STORAGE_KEY,
  FM_LOCALES,
} from "@/src/i18n/types";
export {
  fmBundles,
  I18nProvider,
  normalizeLocale,
  readStoredLocale,
  useFM,
} from "@/src/i18n/I18nProvider";
export { interpolate } from "@/src/i18n/strings";
