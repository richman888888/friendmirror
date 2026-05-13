import { notFound } from "next/navigation";

import { recordVotePageOpenedAction } from "@/app/actions/friend-mirror";
import FriendMirrorApp from "@/components/friend-mirror/FriendMirrorApp";
import { VotePageNotConfigured } from "@/components/friend-mirror/VotePageNotConfigured";
import { normalizeShareSource } from "@/lib/friend-mirror/share-source";
import { getPublicProfileByShareCode } from "@/lib/server/profiles";
import { isSupabaseConfigured } from "@/lib/supabase";

export default async function FriendVotePage({
  params,
  searchParams,
}: {
  params: Promise<{ shareCode: string }>;
  searchParams: Promise<{ source?: string }>;
}) {
  const [{ shareCode: raw }, sp] = await Promise.all([params, searchParams]);
  const shareCode = decodeURIComponent(raw);
  if (!shareCode) notFound();

  if (!isSupabaseConfigured()) {
    return <VotePageNotConfigured />;
  }

  const profile = await getPublicProfileByShareCode(shareCode);
  if (!profile) notFound();

  const shareSource = normalizeShareSource(
    typeof sp?.source === "string" ? sp.source : undefined,
  );
  await recordVotePageOpenedAction(shareCode, shareSource);

  return <FriendMirrorApp mode="friend" initialProfile={profile} />;
}
