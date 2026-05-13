"use client";

import html2canvas from "html2canvas";
import { useCallback, useMemo, useRef, useState } from "react";

import { TAG_IDS, type TagId } from "@/lib/friend-mirror/constants";
import type { FriendReview, TagStat } from "@/lib/friend-mirror/mock";
import {
  formatParticipantCount,
  PARTICIPANT_COUNT,
} from "@/lib/friend-mirror/viral-copy";
import { pickSeeded } from "@/lib/friend-mirror/result-mock-pick";
import {
  dareLinesForTag,
  hiddenTraitForTag,
  roastsForTag,
} from "@/lib/friend-mirror/roast-copy";
import type { ShareSource } from "@/lib/friend-mirror/share-source";
import { shareUrlFor } from "@/lib/friend-mirror/share-url";
import { ResultShareStorySection } from "@/components/friend-mirror/ResultShareStorySection";
import { useFM } from "@/src/i18n/I18nProvider";
import { interpolate } from "@/src/i18n/strings";

export type ResultWrappedExperienceProps = {
  seed: string;
  nickname: string;
  avatarUrl: string | null;
  stats: TagStat[];
  shareCode: string;
  shareUrl: string;
  participantCount: number | null;
  reviews: FriendReview[];
  onShareOutbound?: (source: ShareSource) => void;
  showToast: (msg: string) => void;
};

function initials(n: string) {
  const t = n.trim();
  if (!t) return "?";
  return t.slice(0, 2).toUpperCase();
}

export function ResultWrappedExperience({
  seed,
  nickname,
  avatarUrl,
  stats,
  shareCode,
  shareUrl,
  participantCount,
  reviews,
  onShareOutbound,
  showToast,
}: ResultWrappedExperienceProps) {
  const fm = useFM();
  const { t, tagLabel, bundle, locale } = fm;
  const posterRef = useRef<HTMLDivElement>(null);
  const [posterSaving, setPosterSaving] = useState(false);

  const sorted = useMemo(
    () => [...stats].sort((a, b) => b.percent - a.percent),
    [stats],
  );
  const top = sorted[0];
  const topTag: TagId = top?.tag ?? TAG_IDS[0];

  const roast = useMemo(
    () => pickSeeded(roastsForTag(bundle, topTag), seed, "roast-v1"),
    [seed, topTag, bundle],
  );
  const dare = useMemo(
    () => pickSeeded(dareLinesForTag(bundle, topTag), seed, "dare-v1"),
    [seed, topTag, bundle],
  );
  const hidden = useMemo(
    () => pickSeeded(hiddenTraitForTag(bundle, topTag), seed, "hidden-v1"),
    [seed, topTag, bundle],
  );

  const maxPct = Math.max(1, ...sorted.map((s) => s.percent));

  const saveResultPoster = useCallback(async () => {
    const el = posterRef.current;
    if (!el) return;
    setPosterSaving(true);
    try {
      const canvas = await html2canvas(el, {
        scale: Math.min(3, (window.devicePixelRatio || 2) * 1.35),
        useCORS: true,
        allowTaint: true,
        backgroundColor: "#05040a",
        logging: false,
      });
      const stem = interpolate(t("resultPoster.posterDownloadName"), {
        name:
          nickname.trim().slice(0, 10) || t("resultPoster.downloadNameFallback"),
      });
      await new Promise<void>((resolve, reject) => {
        canvas.toBlob(
          (blob) => {
            try {
              if (blob) {
                const url = URL.createObjectURL(blob);
                const a = document.createElement("a");
                a.href = url;
                a.download = stem;
                a.click();
                URL.revokeObjectURL(url);
                showToast(t("toast.posterSaved"));
              } else {
                const a = document.createElement("a");
                a.href = canvas.toDataURL("image/png");
                a.download = stem;
                a.click();
                showToast(t("toast.posterSaved"));
              }
              resolve();
            } catch (e) {
              reject(e);
            }
          },
          "image/png",
          0.92,
        );
      });
    } catch {
      showToast(t("toast.posterFail"));
    } finally {
      setPosterSaving(false);
    }
  }, [nickname, showToast, t]);

  const displayName = nickname.trim() || t("common.mysteriousUser");
  const posterTags = sorted.slice(0, 4);
  const moreTagCount = Math.max(0, sorted.length - posterTags.length);

  return (
    <div className="flex flex-col gap-3">
      <div className="relative overflow-hidden rounded-[1.75rem] ring-1 ring-white/[0.12] shadow-[0_24px_80px_-24px_rgba(0,0,0,0.65)]">
        {/* 可导出区域：信息压到「一张封面」可读层级 */}
        <div
          ref={posterRef}
          className="relative overflow-hidden text-white"
        >
          {/* 底：更收敛的色光，避免糊成一团 */}
          <div
            className="pointer-events-none absolute inset-0"
            style={{
              background:
                "linear-gradient(168deg, #030208 0%, #0a0718 38%, #100a1c 62%, #06040c 100%), radial-gradient(ellipse 90% 55% at 50% -5%, rgba(167,139,250,0.22), transparent 58%), radial-gradient(ellipse 70% 50% at 100% 100%, rgba(34,211,238,0.12), transparent 55%)",
            }}
          />
          <div
            className="pointer-events-none absolute inset-0 bg-[length:200%_200%] opacity-[0.22] mix-blend-screen animate-[fm-gradient-flow_22s_ease-in-out_infinite]"
            style={{
              backgroundImage:
                "linear-gradient(118deg, rgba(139,92,246,0.45) 0%, transparent 42%, rgba(236,72,153,0.2) 58%, transparent 78%, rgba(45,212,191,0.15) 100%)",
            }}
          />
          <div
            className="pointer-events-none absolute -left-[35%] top-[18%] h-[42%] w-[85%] rounded-full bg-violet-500/[0.14] blur-[88px]"
            aria-hidden
          />
          <div
            className="pointer-events-none absolute -right-[30%] bottom-[-5%] h-[38%] w-[70%] rounded-full bg-fuchsia-600/[0.1] blur-[72px]"
            aria-hidden
          />
          <div
            className="pointer-events-none absolute inset-0 opacity-[0.04]"
            style={{
              backgroundImage:
                "url(\"data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E\")",
            }}
            aria-hidden
          />
          <div
            className="pointer-events-none absolute inset-0 rounded-[1.75rem] ring-1 ring-inset ring-white/[0.06]"
            aria-hidden
          />

          <div className="relative px-5 pb-7 pt-6 sm:px-6 sm:pb-8 sm:pt-7">
            <div className="flex items-start justify-between gap-3">
              <p className="text-[9px] font-bold uppercase tracking-[0.42em] text-white/38">
                FriendMirror
              </p>
              <p className="font-mono text-2xl font-black tabular-nums tracking-tighter text-white/88">
                2026
              </p>
            </div>

            {/* 主视觉：标签 + 匹配度 */}
            {top ? (
              <div className="mt-5 text-center">
                <p className="text-balance bg-gradient-to-br from-white via-violet-100 to-cyan-100 bg-clip-text text-[clamp(1.85rem,6.5vw,2.35rem)] font-black leading-[1.05] tracking-tight text-transparent drop-shadow-[0_2px_24px_rgba(0,0,0,0.45)]">
                  {interpolate(t("resultPoster.tagEmphasis"), {
                    tag: tagLabel(top.tag),
                  })}
                </p>
                <div className="mt-2 flex items-baseline justify-center gap-1.5">
                  <span className="text-[2.65rem] font-black leading-none tabular-nums tracking-tight text-emerald-300 drop-shadow-[0_0_20px_rgba(52,211,153,0.25)]">
                    {top.percent}
                  </span>
                  <span className="pb-1 text-lg font-extrabold text-emerald-200/90">
                    %
                  </span>
                  <span className="pb-1.5 text-[11px] font-semibold text-white/40">
                    {t("resultPoster.friendMatch")}
                  </span>
                </div>
              </div>
            ) : null}

            <div className="mt-6 flex items-center gap-3.5">
              <div className="relative shrink-0">
                <div className="absolute -inset-0.5 rounded-2xl bg-gradient-to-tr from-fuchsia-500/35 via-violet-500/25 to-cyan-400/30 blur-md" />
                <div className="relative h-[4.25rem] w-[4.25rem] overflow-hidden rounded-2xl ring-[1.5px] ring-white/25 shadow-lg sm:h-[4.5rem] sm:w-[4.5rem]">
                  {avatarUrl ? (
                    <img
                      src={avatarUrl}
                      alt=""
                      className="h-full w-full object-cover"
                      crossOrigin={
                        avatarUrl.startsWith("http") ? "anonymous" : undefined
                      }
                      referrerPolicy="no-referrer"
                    />
                  ) : (
                    <div className="flex h-full w-full items-center justify-center bg-white/[0.08] text-xl font-black text-white/90">
                      {initials(displayName)}
                    </div>
                  )}
                </div>
              </div>
              <div className="min-w-0 flex-1">
                <p className="truncate text-[17px] font-bold tracking-tight text-white sm:text-lg">
                  {displayName}
                </p>
                <p className="mt-0.5 text-[12px] text-white/42">
                  {t("resultPoster.friendSeesYou")}
                </p>
              </div>
            </div>

            {/* TOP 标签条：最多 4 条，其余折叠为 +N */}
            {posterTags.length > 0 ? (
              <div className="mt-6 space-y-2">
                {posterTags.map((s, i) => (
                  <div key={s.tag} className="space-y-1">
                    <div className="flex items-baseline justify-between gap-2 text-[11px]">
                      <span className="truncate font-semibold text-white/[0.82]">
                        {tagLabel(s.tag)}
                      </span>
                      <span className="shrink-0 tabular-nums text-[11px] font-bold text-emerald-300/90">
                        {s.percent}%
                      </span>
                    </div>
                    <div className="h-[5px] overflow-hidden rounded-full bg-white/[0.08]">
                      <div
                        className="h-full rounded-full bg-gradient-to-r from-violet-500 via-fuchsia-500 to-amber-300/90"
                        style={{
                          width: `${Math.max(6, Math.round((s.percent / maxPct) * 100))}%`,
                          opacity: 1 - i * 0.06,
                        }}
                      />
                    </div>
                  </div>
                ))}
                {moreTagCount > 0 ? (
                  <p className="pt-0.5 text-center text-[10px] font-medium text-white/32">
                    {interpolate(t("resultPoster.moreTags"), {
                      n: moreTagCount,
                    })}
                  </p>
                ) : null}
              </div>
            ) : null}

            {/* 文案区：轻分割，少标题字 */}
            <div className="mt-7 space-y-4 border-t border-white/[0.08] pt-6">
              <div>
                <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-fuchsia-300/75">
                  {t("resultPoster.roast")}
                </p>
                <p className="mt-1.5 whitespace-pre-line text-[15px] font-semibold leading-snug text-white/[0.92] [text-shadow:0_1px_18px_rgba(0,0,0,0.35)]">
                  {roast}
                </p>
              </div>
              <div className="border-l-[3px] border-amber-400/55 pl-3.5">
                <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-amber-200/70">
                  {t("resultPoster.dare")}
                </p>
                <p className="mt-1.5 text-[13.5px] font-medium leading-snug text-white/[0.78]">
                  {dare}
                </p>
              </div>
              <div>
                <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-cyan-200/70">
                  {t("resultPoster.hidden")}
                </p>
                <p className="mt-1.5 text-[13.5px] font-semibold leading-snug text-white/[0.84]">
                  {hidden}
                </p>
              </div>
            </div>

            <div className="mt-6 flex flex-col items-center gap-1 border-t border-white/[0.06] pt-5">
              <p className="text-center text-[11px] font-medium text-white/48">
                {participantCount != null && participantCount > 0
                  ? interpolate(t("resultPoster.livePlaying"), {
                      count: formatParticipantCount(
                        participantCount,
                        locale,
                      ),
                    })
                  : interpolate(t("resultPoster.demoCount"), {
                      count: formatParticipantCount(
                        PARTICIPANT_COUNT,
                        locale,
                      ),
                    })}
              </p>
              {reviews.length > 0 ? (
                <p className="text-[10px] text-white/35">
                  {interpolate(t("resultPoster.friendsActed"), {
                    n: reviews.length,
                  })}
                </p>
              ) : null}
            </div>
          </div>
        </div>

        <p className="border-t border-white/[0.06] bg-black/20 px-4 py-2 text-center text-[10px] text-white/38">
          {t("resultPoster.disclaimer")}
        </p>
      </div>

      <button
        type="button"
        disabled={posterSaving}
        onClick={() => void saveResultPoster()}
        className="flex min-h-[48px] w-full touch-manipulation items-center justify-center gap-2 rounded-2xl border border-white/12 bg-gradient-to-r from-zinc-900 via-zinc-800 to-zinc-900 py-3.5 text-[14px] font-bold text-white shadow-lg transition active:scale-[0.99] disabled:opacity-55"
      >
        <svg className="h-5 w-5 shrink-0 opacity-90" viewBox="0 0 24 24" fill="currentColor" aria-hidden>
          <path d="M19 12v7H5v-7H3v7c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2v-7h-2zm-6 .67l2.59-2.58L17 11.5l-5 5-5-5 1.41-1.41L11 12.67V3h2v9.67z" />
        </svg>
        {posterSaving
          ? t("resultPoster.savingPoster")
          : t("resultPoster.savePoster")}
      </button>

      <ResultShareStorySection
        shareCode={shareCode}
        nickname={nickname}
        avatarUrl={avatarUrl}
        topRows={sorted.slice(0, 3).map((r) => ({
          tag: r.tag,
          percent: r.percent,
        }))}
        shareUrl={shareUrl || (shareCode ? shareUrlFor(shareCode) : "")}
        participantCount={participantCount}
        onShareOutbound={onShareOutbound}
        showToast={showToast}
      />
    </div>
  );
}
