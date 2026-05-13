"use server";

import { randomBytes, randomUUID } from "crypto";
import { cookies } from "next/headers";

import { TAG_IDS, normalizeVoteTag, type TagId } from "@/lib/friend-mirror/constants";
import { makeShareId } from "@/lib/friend-mirror/mock";
import type { TagStat } from "@/lib/friend-mirror/mock";
import { normalizeShareSource } from "@/lib/friend-mirror/share-source";
import { FM_REF_SHARE_COOKIE, FM_SHARE_SOURCE_COOKIE } from "@/lib/referral-cookie";
import {
  createServerSupabase,
  isSupabaseConfigured,
  type Json,
  type TypedSupabaseClient,
} from "@/lib/supabase";

async function allocateShareCode(
  supabase: TypedSupabaseClient,
): Promise<string> {
  for (let i = 0; i < 14; i++) {
    const code = randomBytes(9)
      .toString("base64url")
      .replace(/[^a-zA-Z0-9]/g, "")
      .slice(0, 12);
    if (code.length < 8) continue;
    const { data } = await supabase
      .from("profiles")
      .select("id")
      .eq("share_code", code)
      .maybeSingle();
    if (!data) return code;
  }
  throw new Error("share_code_collision");
}

function parseDataUrl(
  dataUrl: string,
): { buffer: Buffer; contentType: string } | null {
  const m = /^data:([^;]+);base64,([\s\S]+)$/.exec(dataUrl.trim());
  if (!m) return null;
  try {
    return {
      buffer: Buffer.from(m[2], "base64"),
      contentType: m[1] || "image/jpeg",
    };
  } catch {
    return null;
  }
}

export async function createProfileAction(input: {
  nickname: string;
  avatarDataUrl: string | null;
}): Promise<
  | {
      ok: true;
      shareCode: string;
      profileId: string | null;
      referralApplied: boolean;
      referrerShareCode: string | null;
    }
  | { ok: false; error: string }
> {
  const nickname = input.nickname.trim() || "神秘用户";

  if (!isSupabaseConfigured()) {
    return {
      ok: true,
      shareCode: makeShareId(nickname),
      profileId: null,
      referralApplied: false,
      referrerShareCode: null,
    };
  }

  const supabase = await createServerSupabase();
  if (!supabase) {
    return {
      ok: true,
      shareCode: makeShareId(nickname),
      profileId: null,
      referralApplied: false,
      referrerShareCode: null,
    };
  }

  const cookieStore = await cookies();
  const refShareRaw = cookieStore.get(FM_REF_SHARE_COOKIE)?.value?.trim() ?? "";
  const refShare = refShareRaw.slice(0, 128);

  const signupShareSource = normalizeShareSource(
    cookieStore.get(FM_SHARE_SOURCE_COOKIE)?.value,
  );

  let referredBy: string | null = null;
  if (refShare) {
    const { data: refProfile } = await supabase
      .from("profiles")
      .select("id")
      .eq("share_code", refShare)
      .maybeSingle();
    if (refProfile?.id) referredBy = refProfile.id as string;
  }

  let avatarUrl: string | null = null;
  if (input.avatarDataUrl?.startsWith("data:")) {
    const parsed = parseDataUrl(input.avatarDataUrl);
    if (parsed) {
      const ext = parsed.contentType.includes("png")
        ? "png"
        : parsed.contentType.includes("webp")
          ? "webp"
          : "jpg";
      /* Single path segment (no `/`) avoids some Storage URL-encoding edge cases. */
      const path = `${randomUUID()}.${ext}`;
      const { error: upErr } = await supabase.storage
        .from("avatars")
        .upload(path, parsed.buffer, {
          contentType: parsed.contentType,
          upsert: true,
        });
      if (!upErr) {
        const { data: pub } = supabase.storage.from("avatars").getPublicUrl(path);
        avatarUrl = pub.publicUrl;
      }
    }
  }

  const shareCode = await allocateShareCode(supabase);

  const { data: inserted, error: insErr } = await supabase
    .from("profiles")
    .insert({
      nickname,
      avatar_url: avatarUrl,
      share_code: shareCode,
      referred_by: referredBy,
      signup_share_source: signupShareSource,
    })
    .select("id")
    .single();

  if (insErr || !inserted) {
    return { ok: false, error: insErr?.message ?? "insert_failed" };
  }

  const profileId = inserted.id as string;
  const referralApplied = Boolean(referredBy);

  cookieStore.delete(FM_REF_SHARE_COOKIE);
  cookieStore.delete(FM_SHARE_SOURCE_COOKIE);

  return {
    ok: true,
    shareCode,
    profileId,
    referralApplied,
    referrerShareCode: referralApplied ? refShare : null,
  };
}

export async function getPublicEngagementAction(): Promise<{
  ok: boolean;
  participantCount: number;
}> {
  const supabase = await createServerSupabase();
  if (!supabase) return { ok: false, participantCount: 0 };

  const { data, error } = await supabase.rpc("fetch_public_engagement");
  if (error || !data?.[0]) {
    return { ok: false, participantCount: 0 };
  }
  const row = data[0];
  const n =
    Number(row.profile_count ?? 0) + Number(row.vote_count ?? 0);
  return { ok: true, participantCount: Number.isFinite(n) ? n : 0 };
}

export async function recordEventAction(input: {
  eventName: string;
  shareCode?: string | null;
  refShareCode?: string | null;
  shareSource?: string | null;
  metadata?: Record<string, unknown>;
}): Promise<{ ok: boolean }> {
  const supabase = await createServerSupabase();
  if (!supabase) return { ok: false };

  let profileId: string | null = null;
  if (input.shareCode) {
    const { data } = await supabase
      .from("profiles")
      .select("id")
      .eq("share_code", input.shareCode)
      .maybeSingle();
    profileId = (data?.id as string | undefined) ?? null;
  }

  const refShare =
    input.refShareCode != null && input.refShareCode !== ""
      ? String(input.refShareCode).slice(0, 128)
      : null;

  const shareSrc =
    input.shareSource != null && input.shareSource !== ""
      ? String(input.shareSource).slice(0, 32)
      : null;

  const { error } = await supabase.from("events").insert({
    event_name: input.eventName,
    profile_id: profileId,
    ref_share_code: refShare,
    share_source: shareSrc,
    metadata: (input.metadata ?? {}) as Json,
  });
  return { ok: !error };
}

export async function recordVotePageOpenedAction(
  shareCode: string,
  shareSource?: string | null,
): Promise<{ ok: boolean }> {
  const code = shareCode.trim().slice(0, 128);
  const src = shareSource ? String(shareSource).slice(0, 32) : null;
  return recordEventAction({
    eventName: "vote_page_opened",
    shareCode: code,
    refShareCode: code,
    shareSource: src,
    metadata: { share_code: code, ...(src ? { source: src } : {}) },
  });
}

export async function submitVotesAction(input: {
  shareCode: string;
  tags: string[];
  voterFingerprint: string;
}): Promise<{ ok: boolean; error?: string }> {
  const supabase = await createServerSupabase();
  if (!supabase) return { ok: false, error: "supabase_not_configured" };

  const fp = input.voterFingerprint.slice(0, 256);
  const { error: rpcErr } = await supabase.rpc("replace_votes_for_share", {
    p_share_code: input.shareCode,
    p_fingerprint: fp,
    p_tags: input.tags,
  });

  if (rpcErr) {
    const msg = rpcErr.message ?? "";
    if (msg.includes("profile_not_found")) {
      return { ok: false, error: "profile_not_found" };
    }
    return { ok: false, error: msg || "rpc_failed" };
  }

  const { data: profile } = await supabase
    .from("profiles")
    .select("id")
    .eq("share_code", input.shareCode)
    .maybeSingle();

  if (profile?.id) {
    await supabase.from("events").insert({
      event_name: "vote_submitted",
      profile_id: profile.id as string,
      ref_share_code: null,
      share_source: null,
      metadata: {
        share_code: input.shareCode,
        tags: input.tags,
      },
    });
  }

  return { ok: true };
}

export async function fetchVoteStatsForShareCode(
  shareCode: string,
): Promise<TagStat[] | null> {
  const supabase = await createServerSupabase();
  if (!supabase) return null;

  const { data: profile } = await supabase
    .from("profiles")
    .select("id")
    .eq("share_code", shareCode)
    .maybeSingle();
  if (!profile) return null;

  const { data: rows, error } = await supabase.rpc("fetch_vote_tag_counts", {
    p_share_code: shareCode,
  });
  if (error) return null;

  const counts = new Map<TagId, number>();
  for (const r of rows ?? []) {
    const id = normalizeVoteTag(String(r.tag ?? ""));
    if (!id) continue;
    counts.set(id, (counts.get(id) ?? 0) + Number(r.cnt));
  }

  const stats: TagStat[] = TAG_IDS.map((tag) => ({
    tag,
    count: counts.get(tag) ?? 0,
    percent: 0,
  }));
  const total = stats.reduce((a, s) => a + s.count, 0);
  if (total === 0) {
    return stats;
  }
  for (const s of stats) {
    s.percent = Math.round((s.count / total) * 1000) / 10;
  }
  stats.sort((a, b) => b.count - a.count);
  return stats;
}
