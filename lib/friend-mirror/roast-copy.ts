import type { TagId } from "@/lib/friend-mirror/constants";
import type { FMLocaleBundle } from "@/src/i18n/types";

export function roastsForTag(
  bundle: FMLocaleBundle,
  tag: TagId,
): readonly string[] {
  return bundle.roasts[tag] ?? bundle.fallbackRoasts;
}

export function dareLinesForTag(
  bundle: FMLocaleBundle,
  tag: TagId,
): readonly string[] {
  return bundle.dare[tag] ?? bundle.fallbackRoasts;
}

export function hiddenTraitForTag(
  bundle: FMLocaleBundle,
  tag: TagId,
): readonly string[] {
  return bundle.hidden[tag] ?? bundle.fallbackRoasts;
}
