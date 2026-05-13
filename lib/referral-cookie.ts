/** Cookie set when visiting `/p/[share_code]` so home flow can attribute `referred_by`. */
export const FM_REF_SHARE_COOKIE = "fm_ref_share";
export const FM_REF_SHARE_MAX_AGE_SEC = 60 * 60 * 24 * 30;

/** `?source=zalo|facebook|link` on share landing — copied into profile on signup. */
export const FM_SHARE_SOURCE_COOKIE = "fm_share_src";
export const FM_SHARE_SOURCE_MAX_AGE_SEC = FM_REF_SHARE_MAX_AGE_SEC;
