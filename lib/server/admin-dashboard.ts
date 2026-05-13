import "server-only";

import { ADMIN_FUNNEL_STEPS } from "@/lib/admin/funnel-steps";
import { SHARE_SOURCE_VALUES } from "@/lib/friend-mirror/share-source";
import { tryCreateServiceClient } from "@/lib/supabase/admin";

/** Start/end of current calendar day in Asia/Shanghai (ISO strings, UTC instant). */
function shanghaiDayBoundsUtc(): { startIso: string; endIso: string } {
  const now = new Date();
  const ymd = new Intl.DateTimeFormat("en-CA", {
    timeZone: "Asia/Shanghai",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).format(now);
  const start = new Date(`${ymd}T00:00:00+08:00`);
  const end = new Date(start.getTime() + 24 * 60 * 60 * 1000);
  return { startIso: start.toISOString(), endIso: end.toISOString() };
}

function aggregateCounts(values: readonly string[]): { key: string; count: number }[] {
  const m = new Map<string, number>();
  for (const v of values) {
    const k = v.trim() || "(empty)";
    m.set(k, (m.get(k) ?? 0) + 1);
  }
  return [...m.entries()]
    .map(([key, count]) => ({ key, count }))
    .sort((a, b) => b.count - a.count);
}

const PAGE = 1000;

async function fetchAllTags(
  supabase: NonNullable<ReturnType<typeof tryCreateServiceClient>>,
): Promise<string[]> {
  const tags: string[] = [];
  let from = 0;
  for (;;) {
    const { data, error } = await supabase
      .from("votes")
      .select("tag")
      .order("id", { ascending: true })
      .range(from, from + PAGE - 1);
    if (error) throw error;
    if (!data?.length) break;
    for (const row of data) {
      if (row.tag) tags.push(row.tag);
    }
    if (data.length < PAGE) break;
    from += PAGE;
  }
  return tags;
}

async function fetchAllEventNames(
  supabase: NonNullable<ReturnType<typeof tryCreateServiceClient>>,
): Promise<string[]> {
  const names: string[] = [];
  let from = 0;
  for (;;) {
    const { data, error } = await supabase
      .from("events")
      .select("event_name")
      .order("id", { ascending: true })
      .range(from, from + PAGE - 1);
    if (error) throw error;
    if (!data?.length) break;
    for (const row of data) {
      if (row.event_name) names.push(row.event_name);
    }
    if (data.length < PAGE) break;
    from += PAGE;
  }
  return names;
}

async function fetchAllRefShareCodes(
  supabase: NonNullable<ReturnType<typeof tryCreateServiceClient>>,
): Promise<string[]> {
  const codes: string[] = [];
  let from = 0;
  for (;;) {
    const { data, error } = await supabase
      .from("events")
      .select("ref_share_code")
      .not("ref_share_code", "is", null)
      .order("id", { ascending: true })
      .range(from, from + PAGE - 1);
    if (error) throw error;
    if (!data?.length) break;
    for (const row of data) {
      const c = row.ref_share_code?.trim();
      if (c) codes.push(c);
    }
    if (data.length < PAGE) break;
    from += PAGE;
  }
  return codes;
}

async function resolveNicknamesByShareCodes(
  supabase: NonNullable<ReturnType<typeof tryCreateServiceClient>>,
  shareCodes: readonly string[],
): Promise<Map<string, string>> {
  const map = new Map<string, string>();
  const unique = [...new Set(shareCodes)].filter(Boolean);
  for (let i = 0; i < unique.length; i += 80) {
    const slice = unique.slice(i, i + 80);
    const { data, error } = await supabase
      .from("profiles")
      .select("share_code, nickname")
      .in("share_code", slice);
    if (error) throw error;
    for (const row of data ?? []) {
      if (row.share_code) map.set(row.share_code, row.nickname ?? "");
    }
  }
  return map;
}

async function fetchEventsWithShareSource(
  supabase: NonNullable<ReturnType<typeof tryCreateServiceClient>>,
): Promise<{ event_name: string; share_source: string }[]> {
  const out: { event_name: string; share_source: string }[] = [];
  let from = 0;
  for (;;) {
    const { data, error } = await supabase
      .from("events")
      .select("event_name, share_source")
      .not("share_source", "is", null)
      .order("id", { ascending: true })
      .range(from, from + PAGE - 1);
    if (error) throw error;
    if (!data?.length) break;
    for (const row of data) {
      const s = row.share_source?.trim();
      if (s && row.event_name) {
        out.push({ event_name: row.event_name, share_source: s });
      }
    }
    if (data.length < PAGE) break;
    from += PAGE;
  }
  return out;
}

async function fetchAllSignupShareSources(
  supabase: NonNullable<ReturnType<typeof tryCreateServiceClient>>,
): Promise<string[]> {
  const vals: string[] = [];
  let from = 0;
  for (;;) {
    const { data, error } = await supabase
      .from("profiles")
      .select("signup_share_source")
      .not("signup_share_source", "is", null)
      .order("created_at", { ascending: true })
      .range(from, from + PAGE - 1);
    if (error) throw error;
    if (!data?.length) break;
    for (const row of data) {
      const s = row.signup_share_source?.trim();
      if (s) vals.push(s);
    }
    if (data.length < PAGE) break;
    from += PAGE;
  }
  return vals;
}

export type AdminDashboardPayload =
  | {
      ok: true;
      totals: { profiles: number; votes: number; events: number };
      today: { profiles: number; votes: number };
      tagLeaderboard: { tag: string; count: number }[];
      eventLeaderboard: { event_name: string; count: number }[];
      funnel: { step: (typeof ADMIN_FUNNEL_STEPS)[number]; count: number }[];
      referralInviteLeaderboard: {
        nickname: string;
        share_code: string;
        invite_count: number;
      }[];
      referralShareOpens: {
        share_code: string;
        nickname: string | null;
        opens: number;
      }[];
      shareLandingBySource: { source: string; count: number }[];
      shareOutboundBySource: { source: string; count: number }[];
      shareSourceConversion: {
        source: string;
        opens: number;
        signups: number;
        ratePercent: number | null;
      }[];
    }
  | { ok: false; reason: "no_service_key" | "error"; message?: string };

export async function getAdminDashboardData(): Promise<AdminDashboardPayload> {
  const supabase = tryCreateServiceClient();
  if (!supabase) {
    return { ok: false, reason: "no_service_key" };
  }

  try {
    const { startIso, endIso } = shanghaiDayBoundsUtc();

    const [
      profilesTotal,
      votesTotal,
      eventsTotal,
      profilesToday,
      votesToday,
      tagValues,
      eventNames,
      refOpenCodeValues,
      conversionQuery,
      eventShareRows,
      signupShareValues,
      ...funnelResponses
    ] = await Promise.all([
      supabase.from("profiles").select("id", { count: "exact", head: true }),
      supabase.from("votes").select("id", { count: "exact", head: true }),
      supabase.from("events").select("id", { count: "exact", head: true }),
      supabase
        .from("profiles")
        .select("id", { count: "exact", head: true })
        .gte("created_at", startIso)
        .lt("created_at", endIso),
      supabase
        .from("votes")
        .select("id", { count: "exact", head: true })
        .gte("created_at", startIso)
        .lt("created_at", endIso),
      fetchAllTags(supabase),
      fetchAllEventNames(supabase),
      fetchAllRefShareCodes(supabase),
      supabase
        .from("profiles")
        .select("nickname, share_code, invite_count")
        .gt("invite_count", 0)
        .order("invite_count", { ascending: false })
        .order("created_at", { ascending: true })
        .limit(40),
      fetchEventsWithShareSource(supabase),
      fetchAllSignupShareSources(supabase),
      ...ADMIN_FUNNEL_STEPS.map((step) =>
        supabase
          .from("events")
          .select("id", { count: "exact", head: true })
          .eq("event_name", step),
      ),
    ]);

    if (profilesTotal.error) throw profilesTotal.error;
    if (votesTotal.error) throw votesTotal.error;
    if (eventsTotal.error) throw eventsTotal.error;
    if (profilesToday.error) throw profilesToday.error;
    if (votesToday.error) throw votesToday.error;
    if (conversionQuery.error) throw conversionQuery.error;

    const tagRows = aggregateCounts(tagValues).map(({ key, count }) => ({
      tag: key,
      count,
    }));
    const eventRows = aggregateCounts(eventNames).map(({ key, count }) => ({
      event_name: key,
      count,
    }));

    const funnel = ADMIN_FUNNEL_STEPS.map((step, i) => {
      const r = funnelResponses[i];
      if (!r || r.error) throw r?.error ?? new Error("funnel query missing");
      return { step, count: r.count ?? 0 };
    });

    const referralInviteLeaderboard = (conversionQuery.data ?? []).map((row) => ({
      nickname: row.nickname ?? "",
      share_code: row.share_code ?? "",
      invite_count: Number(row.invite_count ?? 0),
    }));

    const refOpenTop = aggregateCounts(refOpenCodeValues).slice(0, 40);
    const nickByShare = await resolveNicknamesByShareCodes(
      supabase,
      refOpenTop.map((r) => r.key),
    );
    const referralShareOpens = refOpenTop.map(({ key, count }) => ({
      share_code: key,
      opens: count,
      nickname: nickByShare.get(key) ?? null,
    }));

    const inbound: string[] = [];
    const outbound: string[] = [];
    for (const r of eventShareRows) {
      if (r.event_name === "vote_page_opened") inbound.push(r.share_source);
      else if (r.event_name === "result_shared") outbound.push(r.share_source);
    }
    const shareLandingBySource = aggregateCounts(inbound).map(({ key, count }) => ({
      source: key,
      count,
    }));
    const shareOutboundBySource = aggregateCounts(outbound).map(({ key, count }) => ({
      source: key,
      count,
    }));
    const signupByShareSource = aggregateCounts(signupShareValues).map(
      ({ key, count }) => ({
        source: key,
        count,
      }),
    );

    const openMap = new Map(shareLandingBySource.map((x) => [x.source, x.count]));
    const signupMap = new Map(signupByShareSource.map((x) => [x.source, x.count]));
    const shareSourceConversion = [...SHARE_SOURCE_VALUES]
      .map((source) => {
        const opens = openMap.get(source) ?? 0;
        const signups = signupMap.get(source) ?? 0;
        const ratePercent =
          opens > 0 ? Math.round((signups / opens) * 10000) / 100 : null;
        return { source, opens, signups, ratePercent };
      })
      .sort((a, b) => {
        const ra = a.ratePercent ?? -1;
        const rb = b.ratePercent ?? -1;
        if (rb !== ra) return rb - ra;
        return b.signups - a.signups;
      });

    return {
      ok: true,
      totals: {
        profiles: profilesTotal.count ?? 0,
        votes: votesTotal.count ?? 0,
        events: eventsTotal.count ?? 0,
      },
      today: {
        profiles: profilesToday.count ?? 0,
        votes: votesToday.count ?? 0,
      },
      tagLeaderboard: tagRows.slice(0, 40),
      eventLeaderboard: eventRows.slice(0, 40),
      funnel,
      referralInviteLeaderboard,
      referralShareOpens,
      shareLandingBySource,
      shareOutboundBySource,
      shareSourceConversion,
    };
  } catch (e) {
    const message = e instanceof Error ? e.message : String(e);
    return { ok: false, reason: "error", message };
  }
}
