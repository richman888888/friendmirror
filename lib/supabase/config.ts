/** Optional service role for admin scripts (not required for FriendMirror anon flow). */
export function isSupabaseServiceConfigured(): boolean {
  return Boolean(
    process.env.NEXT_PUBLIC_SUPABASE_URL &&
      process.env.SUPABASE_SERVICE_ROLE_KEY,
  );
}

export function isSupabaseAnonConfigured(): boolean {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL?.trim();
  const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY?.trim();
  return Boolean(
    url &&
      key &&
      /^https?:\/\//i.test(url) &&
      !url.includes(" ") &&
      !key.includes(" "),
  );
}

export { isPosthogConfigured } from "@/lib/posthog/config";
