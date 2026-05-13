"use client";

import html2canvas from "html2canvas";
import { useCallback, useMemo, useRef, useState } from "react";

import type { TagId } from "@/lib/friend-mirror/constants";
import {
  formatParticipantCount,
  PARTICIPANT_COUNT,
} from "@/lib/friend-mirror/viral-copy";
import type { ShareSource } from "@/lib/friend-mirror/share-source";
import { shareUrlFor } from "@/lib/friend-mirror/share-url";
import { useFM } from "@/src/i18n/I18nProvider";
import { interpolate } from "@/src/i18n/strings";

export type StoryTopRow = { tag: TagId; percent: number };

export type ResultShareStorySectionProps = {
  shareCode: string;
  nickname: string;
  avatarUrl: string | null;
  topRows: StoryTopRow[];
  /** Plain URL without tracking (display / fallback). */
  shareUrl: string;
  participantCount: number | null;
  /** Fire after user taps an outbound share surface (DB + PostHog handled upstream). */
  onShareOutbound?: (source: ShareSource) => void | Promise<void>;
  showToast: (msg: string) => void;
};

function openShareWindow(url: string) {
  window.open(url, "_blank", "noopener,noreferrer,width=560,height=640");
}

function formatStoryClock(d: Date, locale: string) {
  return d.toLocaleTimeString(locale, {
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
  });
}

export function ResultShareStorySection({
  shareCode,
  nickname,
  avatarUrl,
  topRows,
  shareUrl,
  participantCount,
  onShareOutbound,
  showToast,
}: ResultShareStorySectionProps) {
  const { t, tagLabel, locale } = useFM();
  const cardRef = useRef<HTMLDivElement>(null);
  const [saving, setSaving] = useState(false);
  const [storyInstant] = useState(() => new Date());
  const storyTime = useMemo(
    () => formatStoryClock(storyInstant, locale),
    [storyInstant, locale],
  );

  const displayName = nickname.trim() || t("common.mysteriousUser");
  const primary = topRows[0];
  const secondary = topRows.slice(1, 3);

  const participantLine = useMemo(() => {
    const countStr = (n: number) => formatParticipantCount(n, locale);
    if (participantCount != null && participantCount > 0) {
      return interpolate(t("participation.liveCountLine"), {
        count: countStr(participantCount),
      });
    }
    return interpolate(t("participation.demoCountLine"), {
      count: countStr(PARTICIPANT_COUNT),
    });
  }, [participantCount, locale, t]);

  const urlZalo = useMemo(() => shareUrlFor(shareCode, "zalo"), [shareCode]);
  const urlFacebook = useMemo(() => shareUrlFor(shareCode, "facebook"), [shareCode]);
  const urlLink = useMemo(() => shareUrlFor(shareCode, "link"), [shareCode]);

  const shareEncodedZalo = encodeURIComponent(urlZalo);
  const shareEncodedFb = encodeURIComponent(urlFacebook);

  const trace = useCallback(
    (source: ShareSource) => {
      void onShareOutbound?.(source);
    },
    [onShareOutbound],
  );

  const shareFacebook = useCallback(() => {
    if (!shareCode) {
      showToast(t("toast.needLinkFirst"));
      return;
    }
    trace("facebook");
    openShareWindow(
      `https://www.facebook.com/sharer/sharer.php?u=${shareEncodedFb}`,
    );
  }, [shareCode, shareEncodedFb, showToast, t, trace]);

  const shareZalo = useCallback(() => {
    if (!shareCode) {
      showToast(t("toast.needLinkFirst"));
      return;
    }
    trace("zalo");
    openShareWindow(`https://zalo.me/share/url?url=${shareEncodedZalo}`);
  }, [shareCode, shareEncodedZalo, showToast, t, trace]);

  const copyTracked = useCallback(async () => {
    if (!shareCode) {
      showToast(t("toast.needLinkFirst"));
      return;
    }
    trace("link");
    try {
      await navigator.clipboard.writeText(urlLink);
      showToast(t("toast.trackedCopied"));
    } catch {
      showToast(t("toast.copyFail"));
    }
  }, [shareCode, showToast, t, trace, urlLink]);

  const saveStoryImage = useCallback(async () => {
    const el = cardRef.current;
    if (!el) return;
    setSaving(true);
    try {
      const canvas = await html2canvas(el, {
        scale: Math.min(2.75, (window.devicePixelRatio || 2) * 1.35),
        useCORS: true,
        allowTaint: true,
        backgroundColor: "#030712",
        logging: false,
      });
      const base = interpolate(t("story.downloadBasename"), {
        name: displayName.slice(0, 12),
      });
      const filename = `${base}.png`;
      await new Promise<void>((resolve, reject) => {
        canvas.toBlob(
          (blob) => {
            try {
              if (blob) {
                const url = URL.createObjectURL(blob);
                const a = document.createElement("a");
                a.href = url;
                a.download = filename;
                a.click();
                URL.revokeObjectURL(url);
                showToast(t("toast.storySaved"));
              } else {
                const dataUrl = canvas.toDataURL("image/png");
                const a = document.createElement("a");
                a.href = dataUrl;
                a.download = filename;
                a.click();
                showToast(t("toast.storySaved"));
              }
              resolve();
            } catch (e) {
              reject(e);
            }
          },
          "image/png",
          0.95,
        );
      });
    } catch {
      showToast(t("toast.storyFail"));
    } finally {
      setSaving(false);
    }
  }, [displayName, showToast, t]);

  const btnBase =
    "flex min-h-[46px] touch-manipulation items-center justify-center gap-2 rounded-2xl px-3 py-3 text-[13px] font-bold shadow-lg transition active:scale-[0.97] sm:min-h-[48px] sm:text-[14px]";

  return (
    <div className="relative">
      <div className="mb-3 flex flex-col items-center gap-1 text-center">
        <p className="text-[10px] font-bold uppercase tracking-[0.28em] text-[#0068ff]/75">
          {t("story.sectionKicker")}
        </p>
        <h3 className="text-[19px] font-black leading-tight tracking-tight text-[#0f172a]">
          {t("story.sectionTitle")}
        </h3>
        <p className="max-w-[17rem] text-[11px] leading-snug text-[#64748b]">
          {t("story.sectionSub")}
        </p>
      </div>

      {/* 9:16 TikTok-style story */}
      <div
        ref={cardRef}
        className="relative mx-auto aspect-[9/16] w-full max-w-[min(300px,90vw)] overflow-hidden rounded-[2.35rem] shadow-[0_28px_80px_-16px_rgba(15,23,42,0.55),0_0_0_1px_rgba(255,255,255,0.14)] ring-1 ring-white/25"
      >
        <div
          className="absolute inset-0 bg-[length:220%_220%] animate-[fm-gradient-flow_14s_ease-in-out_infinite]"
          style={{
            backgroundImage:
              "linear-gradient(152deg, #020617 0%, #1e1b4b 22%, #4c0519 48%, #0c4a6e 72%, #0f172a 100%)",
          }}
        />
        <div
          className="fm-story-blob pointer-events-none absolute -left-[20%] top-[6%] h-[48%] w-[72%] rounded-full bg-fuchsia-600/18 blur-[52px]"
          aria-hidden
        />
        <div
          className="fm-story-blob pointer-events-none absolute -right-[18%] bottom-[4%] h-[46%] w-[68%] rounded-full bg-amber-500/14 blur-[48px] [animation-delay:-3.5s]"
          aria-hidden
        />
        <div
          className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_50%_-10%,rgba(255,255,255,0.12),transparent_52%)]"
          aria-hidden
        />
        <div
          className="pointer-events-none absolute inset-0 opacity-[0.09] mix-blend-soft-light"
          style={{
            backgroundImage:
              "url(\"data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.85' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)' opacity='0.5'/%3E%3C/svg%3E\")",
          }}
          aria-hidden
        />
        <div
          className="pointer-events-none absolute inset-0 overflow-hidden rounded-[2.35rem]"
          aria-hidden
        >
          <div className="absolute inset-0 animate-[fm-shimmer_5s_ease-in-out_infinite] bg-gradient-to-r from-transparent via-white/12 to-transparent opacity-35" />
        </div>

        <div className="relative flex h-full flex-col px-4 pb-5 pt-3 text-white sm:px-5 sm:pb-6 sm:pt-4">
          {/* Story chrome */}
          <div className="flex items-center gap-1.5 px-0.5">
            {[0.92, 0.45, 0.2, 0.08, 0.04].map((w, i) => (
              <div
                key={i}
                className="h-0.5 flex-1 overflow-hidden rounded-full bg-white/25"
              >
                <div
                  className="h-full rounded-full bg-white/90"
                  style={{ width: `${w * 100}%` }}
                />
              </div>
            ))}
          </div>
          <div className="mt-2 flex items-center justify-between gap-2 px-0.5">
            <div className="flex items-center gap-2">
              <span className="rounded-full bg-black/25 px-2.5 py-0.5 text-[9px] font-black uppercase tracking-[0.2em] text-white/95 backdrop-blur-md">
                LIVE
              </span>
              <span className="text-[10px] font-semibold text-white/75">
                FriendMirror
              </span>
            </div>
            <span className="font-mono text-[11px] font-semibold tabular-nums text-white/85">
              {storyTime}
            </span>
          </div>

          <div className="mt-5 flex flex-col items-center">
            <div className="relative animate-[fm-float-y_5s_ease-in-out_infinite]">
              <div className="absolute -inset-1.5 rounded-full bg-gradient-to-tr from-cyan-500/45 via-fuchsia-600/40 to-violet-600/45 blur-md" />
              <div className="absolute -inset-0.5 rounded-full border border-white/25" />
              <div className="relative h-[92px] w-[92px] overflow-hidden rounded-full ring-[3px] ring-white/50 shadow-2xl">
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
                  <div className="flex h-full w-full items-center justify-center bg-white/12 text-3xl font-black text-white/95">
                    {displayName.slice(0, 1)}
                  </div>
                )}
              </div>
            </div>
            <p className="mt-4 max-w-[15rem] truncate text-center text-[19px] font-black tracking-tight drop-shadow-[0_2px_12px_rgba(0,0,0,0.35)]">
              @{displayName}
            </p>
          </div>

          <div className="mt-auto space-y-2.5 sm:space-y-3">
            {primary ? (
              <div className="relative overflow-hidden rounded-2xl border border-white/30 bg-black/25 p-4 shadow-xl backdrop-blur-xl">
                <div className="pointer-events-none absolute -right-6 -top-6 h-24 w-24 rounded-full bg-amber-400/25 blur-2xl" />
                <p className="relative text-[10px] font-bold uppercase tracking-[0.2em] text-amber-200/80">
                  {t("story.primaryLabel")}
                </p>
                <p className="relative mt-1 line-clamp-2 text-[22px] font-black leading-[1.15] tracking-tight">
                  {tagLabel(primary.tag)}
                </p>
                <div className="relative mt-3 flex items-end justify-between gap-2">
                  <span className="text-[2.75rem] font-black leading-none tabular-nums tracking-tight drop-shadow-lg">
                    {primary.percent}
                    <span className="text-[1.65rem] font-extrabold">%</span>
                  </span>
                  <span className="mb-1 rounded-full bg-white/15 px-2 py-0.5 text-[10px] font-bold text-white/90 ring-1 ring-white/25">
                    {t("story.matchBadge")}
                  </span>
                </div>
              </div>
            ) : null}

            {secondary.length > 0 ? (
              <div className="flex gap-2">
                {secondary.map((row, i) => (
                  <div
                    key={row.tag}
                    className="flex-1 rounded-xl border border-white/22 bg-black/20 px-2 py-2 text-center shadow-md backdrop-blur-lg"
                  >
                    <p className="text-[8px] font-black uppercase tracking-wider text-white/55">
                      TOP {i + 2}
                    </p>
                    <p className="mt-0.5 line-clamp-2 min-h-[2.1rem] text-[11px] font-bold leading-snug">
                      {tagLabel(row.tag)}
                    </p>
                    <p className="mt-0.5 font-mono text-base font-black tabular-nums text-amber-100">
                      {row.percent}%
                    </p>
                  </div>
                ))}
              </div>
            ) : null}

            <div className="rounded-xl border border-white/18 bg-black/22 px-3 py-2 text-center backdrop-blur-md">
              <p className="text-[11px] font-bold leading-snug text-white/92">
                {participantLine}
              </p>
            </div>
          </div>
        </div>
      </div>

      <div className="mx-auto mt-6 grid max-w-[min(380px,94vw)] grid-cols-2 gap-2.5 sm:gap-3">
        <button
          type="button"
          disabled={saving}
          onClick={() => void saveStoryImage()}
          className={`${btnBase} bg-gradient-to-br from-violet-600 via-fuchsia-600 to-pink-500 text-white hover:brightness-110 disabled:opacity-55`}
        >
          <svg className="h-5 w-5 shrink-0" viewBox="0 0 24 24" fill="currentColor" aria-hidden>
            <path d="M19 12v7H5v-7H3v7c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2v-7h-2zm-6 .67l2.59-2.58L17 11.5l-5 5-5-5 1.41-1.41L11 12.67V3h2v9.67z" />
          </svg>
          {saving ? t("story.generating") : t("story.saveImage")}
        </button>
        <button
          type="button"
          onClick={() => void copyTracked()}
          className={`${btnBase} bg-gradient-to-br from-slate-800 to-slate-950 text-white ring-1 ring-white/10 hover:brightness-110`}
        >
          <svg className="h-5 w-5 shrink-0" viewBox="0 0 24 24" fill="currentColor" aria-hidden>
            <path d="M16 1H4c-1.1 0-2 .9-2 2v14h2V3h12V1zm3 4H8c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h11c1.1 0 2-.9 2-2V7c0-1.1-.9-2-2-2zm0 16H8V7h11v14z" />
          </svg>
          {t("story.copyLink")}
        </button>
        <button
          type="button"
          onClick={shareZalo}
          className={`${btnBase} bg-[#0068ff] text-white shadow-[0_8px_24px_-6px_rgba(0,104,255,0.65)] hover:bg-[#0056d6]`}
        >
          <span className="text-lg font-black leading-none" aria-hidden>
            Z
          </span>
          Zalo
        </button>
        <button
          type="button"
          onClick={shareFacebook}
          className={`${btnBase} bg-gradient-to-br from-[#1877f2] to-[#0a4cbd] text-white shadow-[0_8px_24px_-6px_rgba(24,119,242,0.55)] hover:brightness-110`}
        >
          <svg className="h-5 w-5 shrink-0" viewBox="0 0 24 24" fill="currentColor" aria-hidden>
            <path d="M22 12c0-5.52-4.48-10-10-10S2 6.48 2 12c0 4.84 3.44 8.87 8 9.8V15H8v-4h2v-1.5C10 8.57 11.57 7 13.5 7H16v4h-2c-.55 0-1 .45-1 1v1.5h3v4h-3v6.95c5.05-.5 9-4.76 9-9.95z" />
          </svg>
          Facebook
        </button>
      </div>

      <p className="mx-auto mt-2 max-w-[min(380px,94vw)] text-center text-[10px] text-[#94a3b8]">
        {t("story.preview")}{" "}
        <span className="break-all font-mono text-[9px] text-[#64748b]">
          {shareUrl || "—"}
        </span>
      </p>
    </div>
  );
}
