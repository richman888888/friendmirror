import "server-only";

import type { FriendMirrorProfile } from "@/lib/friend-mirror/profile-types";
import { createServerSupabase } from "@/lib/supabase";

export async function getPublicProfileByShareCode(
  shareCode: string,
): Promise<FriendMirrorProfile | null> {
  const supabase = await createServerSupabase();
  if (!supabase) return null;
  const { data, error } = await supabase
    .from("profiles")
    .select("id, nickname, avatar_url, share_code")
    .eq("share_code", shareCode)
    .maybeSingle();
  if (error || !data) return null;
  return data as FriendMirrorProfile;
}
