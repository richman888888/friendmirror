"use client";

import {
  useCallback,
  useEffect,
  useLayoutEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import {
  createProfileAction,
  fetchVoteStatsForShareCode,
  getPublicEngagementAction,
  recordEventAction,
  recordVotePageOpenedAction,
  submitVotesAction,
} from "@/app/actions/friend-mirror";
import { TAG_IDS, type TagId } from "@/lib/friend-mirror/constants";
import { getOrCreateVisitorFingerprint } from "@/lib/friend-mirror/fingerprint";
import type { FriendMirrorProfile } from "@/lib/friend-mirror/profile-types";
import { shareUrlFor } from "@/lib/friend-mirror/share-url";
import type { ShareSource } from "@/lib/friend-mirror/share-source";
import { isSupabaseConfigured } from "@/lib/supabase";
import {
  computeTagStats,
  makeShareId,
  mockFriendReviews,
  type FriendReview,
  type TagStat,
} from "@/lib/friend-mirror/mock";
import { ResultWrappedExperience } from "@/components/friend-mirror/ResultWrappedExperience";
import {
  formatParticipantCount,
  PARTICIPANT_COUNT,
} from "@/lib/friend-mirror/viral-copy";
import { LanguageSwitcher } from "@/src/i18n/LanguageSwitcher";
import { interpolate } from "@/src/i18n/strings";
import { useFM } from "@/src/i18n/I18nProvider";

import { useRouter } from "next/navigation";

import type { FMLocaleBundle } from "@/src/i18n/types";

type Step = "home" | "invite" | "vote" | "result";
type PageDir = "forward" | "back";

export type FriendMirrorAppProps = {
  mode?: "owner" | "friend";
  initialProfile?: FriendMirrorProfile | null;
};

const STEP_ORDER: Record<Step, number> = {
  home: 0,
  invite: 1,
  vote: 2,
  result: 3,
};

function delay(ms: number) {
  return new Promise((r) => setTimeout(r, ms));
}

type LoadSceneKey =
  | "mirror"
  | "invite"
  | "friendView"
  | "vote"
  | "aggregate";

function loadScene(bundle: FMLocaleBundle, key: LoadSceneKey) {
  const loading = bundle.ui.loading as Record<
    string,
    { title: string; tips: readonly string[] }
  >;
  const node = loading[key];
  return { title: node.title, tips: [...node.tips] };
}

function initials(n: string) {
  const t = n.trim();
  if (!t) return "?";
  return t.slice(0, 2).toUpperCase();
}

const AVATAR_MAX_EDGE = 720;
const AVATAR_MAX_FILE = 12 * 1024 * 1024;

async function fileToAvatarDataUrl(file: File): Promise<string> {
  if (!file.type.startsWith("image/")) {
    throw new Error("type");
  }
  if (file.size > AVATAR_MAX_FILE) {
    throw new Error("size");
  }

  const drawToJpeg = (source: CanvasImageSource, sw: number, sh: number) => {
    let w = sw;
    let h = sh;
    const scale = Math.min(1, AVATAR_MAX_EDGE / Math.max(w, h));
    w = Math.max(1, Math.round(w * scale));
    h = Math.max(1, Math.round(h * scale));
    const canvas = document.createElement("canvas");
    canvas.width = w;
    canvas.height = h;
    const ctx = canvas.getContext("2d");
    if (!ctx) throw new Error("ctx");
    ctx.drawImage(source, 0, 0, w, h);
    return canvas.toDataURL("image/jpeg", 0.88);
  };

  try {
    const bitmap = await createImageBitmap(file);
    try {
      return drawToJpeg(bitmap, bitmap.width, bitmap.height);
    } finally {
      bitmap.close();
    }
  } catch {
    // HEIC / 部分环境 createImageBitmap 不可用时的回退
    return new Promise((resolve, reject) => {
      const url = URL.createObjectURL(file);
      const img = new Image();
      img.onload = () => {
        URL.revokeObjectURL(url);
        try {
          resolve(drawToJpeg(img, img.naturalWidth, img.naturalHeight));
        } catch (e) {
          reject(e);
        }
      };
      img.onerror = () => {
        URL.revokeObjectURL(url);
        reject(new Error("load"));
      };
      img.src = url;
    });
  }
}

function PhotoLightbox({
  src,
  onClose,
}: {
  src: string;
  onClose: () => void;
}) {
  const { t } = useFM();
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", onKey);
    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      window.removeEventListener("keydown", onKey);
      document.body.style.overflow = prevOverflow;
    };
  }, [onClose]);

  return (
    <div
      className="fixed inset-0 z-[200] flex flex-col items-center justify-center bg-black/86 p-3 backdrop-blur-md"
      onClick={onClose}
      role="presentation"
    >
      <button
        type="button"
        onClick={onClose}
        className="absolute right-3 top-[calc(0.5rem+env(safe-area-inset-top))] z-10 flex h-10 w-10 items-center justify-center rounded-full bg-white/14 text-lg font-light text-white ring-1 ring-white/35 transition hover:bg-white/22"
        aria-label={t("common.close")}
      >
        ✕
      </button>
      <img
        src={src}
        alt=""
        className="max-h-[min(88dvh,900px)] max-w-full rounded-lg object-contain shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      />
      <p className="mt-4 max-w-[20rem] text-center text-[12px] text-white/65">
        {t("common.closeLightboxHint")}
      </p>
    </div>
  );
}

type PortraitVariant = "invite" | "vote" | "result";

function UserPortrait({
  src,
  name,
  variant,
  className = "",
  onOpenPreview,
}: {
  src: string | null;
  name: string;
  variant: PortraitVariant;
  className?: string;
  onOpenPreview?: () => void;
}) {
  const { t } = useFM();
  const label = name.trim() || t("common.user");
  const shell =
    variant === "invite"
      ? "h-[15rem] w-full max-w-[300px] rounded-2xl ring-2 ring-[#0068ff]/28"
      : variant === "vote"
        ? "h-[6.25rem] w-[6.25rem] rounded-2xl ring-2 ring-[#0068ff]/18 sm:h-28 sm:w-28"
        : "h-[9rem] w-full max-w-[260px] rounded-2xl ring-2 ring-[#0068ff]/15";

  const textSz =
    variant === "vote" ? "text-xl sm:text-2xl" : "text-3xl sm:text-4xl";

  const ph = (
    <div
      className={`flex h-full w-full items-center justify-center bg-gradient-to-br from-[#dbe7f7] via-[#e8eef5] to-[#cfe2f5] font-bold tracking-tight text-[#0068ff] ${textSz}`}
      aria-hidden
    >
      {initials(label)}
    </div>
  );

  const img = src ? (
    <img
      src={src}
      alt=""
      className="h-full w-full object-cover"
      decoding="async"
    />
  ) : (
    ph
  );

  const base = `relative overflow-hidden bg-[#f2f6fb] shadow-[inset_0_1px_0_rgba(255,255,255,0.9)] ${shell} ${className}`;

  if (onOpenPreview && src) {
    return (
      <button
        type="button"
        onClick={onOpenPreview}
        className={`${base} block shrink-0 cursor-zoom-in border-0 p-0 outline-none transition hover:brightness-[1.04] focus-visible:ring-2 focus-visible:ring-[#0068ff]/40 active:scale-[0.99]`}
        aria-label={t("common.viewLargeImage")}
      >
        {img}
      </button>
    );
  }

  return <div className={`${base} shrink-0`}>{img}</div>;
}

function ZaloBackdrop() {
  return (
    <div
      aria-hidden
      className="pointer-events-none absolute inset-0 overflow-hidden"
    >
      <div className="fm-gradient-mesh absolute inset-0" />
      <div className="absolute inset-x-0 top-0 h-[55%] bg-[radial-gradient(ellipse_100%_80%_at_50%_-20%,rgba(255,255,255,0.55),transparent)] opacity-50" />
    </div>
  );
}

function LoadingDots() {
  return (
    <div className="mt-5 flex justify-center gap-1.5">
      {[0, 1, 2].map((i) => (
        <span
          key={i}
          className="fm-dot-bounce h-2 w-2 rounded-full bg-[#0068ff]"
          style={{ animationDelay: `${i * 140}ms` }}
        />
      ))}
    </div>
  );
}

function LoadingOverlay({
  label,
  tips,
  durationMs,
}: {
  label: string;
  tips: string[];
  durationMs: number;
}) {
  const { t } = useFM();
  const [tipIdx, setTipIdx] = useState(0);

  useEffect(() => {
    setTipIdx(0);
    const id = window.setInterval(() => {
      setTipIdx((i) => (i + 1) % Math.max(1, tips.length));
    }, 520);
    return () => window.clearInterval(id);
  }, [label, tips]);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-[#0f2347]/35 backdrop-blur-sm">
      <div
        className="fm-glass-panel--strong relative mx-6 w-[min(312px,92vw)] overflow-hidden rounded-[28px] px-7 py-10"
        style={
          { "--fm-load-ms": `${durationMs}ms` } as React.CSSProperties
        }
      >
        <div className="relative flex flex-col items-center">
          <div className="relative h-[72px] w-[72px]">
            <div
              className="absolute inset-0 animate-[spin_0.9s_linear_infinite] rounded-full border-[3px] border-[#dbe4ee]"
              aria-hidden
            />
            <div
              className="absolute inset-0 animate-[spin_0.9s_linear_infinite] rounded-full border-[3px] border-transparent border-t-[#0068ff] border-r-[#0068ff]/40"
              aria-hidden
            />
            <div className="absolute inset-[14px] rounded-full bg-[#f2f6fb]" />
          </div>

          <p className="mt-6 text-center text-[17px] font-bold tracking-tight text-[#1a1a1a]">
            {label}
          </p>
          <p className="mt-2 min-h-[2.5rem] px-2 text-center text-[12px] font-normal leading-snug text-[#728193] transition-all duration-300">
            {tips[tipIdx] ?? ""}
          </p>

          <div className="mt-5 w-full px-1">
            <div className="h-2 overflow-hidden rounded-full bg-[#e8eef5]">
              <div className="fm-load-bar-fill h-full" />
            </div>
            <p className="mt-2 text-center text-[10px] font-semibold uppercase tracking-[0.18em] text-[#728193]/80">
              {t("loading.footerLine")}
            </p>
          </div>

          <LoadingDots />

          <p className="mt-6 text-[10px] font-medium uppercase tracking-widest text-[#728193]">
            {t("common.fm")}
          </p>
        </div>
      </div>
    </div>
  );
}

function RouteSkeletonOverlay({ step }: { step: Step }) {
  return (
    <div className="fm-route-skel pointer-events-none absolute inset-0 z-[15] flex flex-col gap-3 rounded-[20px] border border-[#dbe4ee]/80 bg-white/88 p-5 backdrop-blur-sm">
      <div className="fm-skeleton-bar h-4 w-2/3" />
      <div className="fm-skeleton-bar h-10 w-full" />
      <div className="fm-skeleton-bar h-24 w-full rounded-3xl" />
      {step === "vote" ? (
        <div className="mt-2 flex flex-wrap gap-2">
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="fm-skeleton-bar h-10 w-[30%] rounded-full" />
          ))}
        </div>
      ) : null}
      {step === "result" ? (
        <>
          <div className="fm-skeleton-bar mt-2 h-32 w-full rounded-3xl" />
          <div className="fm-skeleton-bar h-24 w-full rounded-3xl" />
        </>
      ) : null}
    </div>
  );
}

function PageShell({
  children,
  stepKey,
  dir,
  showRouteSkeleton,
}: {
  children: React.ReactNode;
  stepKey: Step;
  dir: PageDir;
  showRouteSkeleton: boolean;
}) {
  const anim =
    dir === "back" ? "fm-page-enter-back" : "fm-page-enter-forward";
  return (
    <div
      key={stepKey}
      className={`${anim} relative flex min-h-0 flex-1 flex-col px-5 pb-28 pt-5`}
    >
      {showRouteSkeleton ? <RouteSkeletonOverlay step={stepKey} /> : null}
      {children}
    </div>
  );
}

function ParticipationLine({ liveCount }: { liveCount: number | null }) {
  const { t, locale } = useFM();
  const hasLive = liveCount != null && liveCount > 0;
  const countStr = formatParticipantCount(
    hasLive ? (liveCount as number) : PARTICIPANT_COUNT,
    locale,
  );
  return (
    <p className="border-b border-[#dbe4ee] bg-gradient-to-r from-white/90 via-[#f0f6ff]/95 to-white/90 px-4 py-2.5 text-center text-[12px] leading-snug text-[#475569]">
      {hasLive ? (
        <>
          <span className="font-bold text-[#0f172a]">{t("participation.liveHot")}</span>
          {" · "}
          <span className="tabular-nums text-[15px] font-black text-[#0068ff]">
            {t("participation.liveCountLine", { count: countStr })}
          </span>
        </>
      ) : (
        <>
          <span className="font-medium text-[#1a1a1a]/75">
            {t("participation.demoLabel")}
          </span>
          {" · "}
          <span className="tabular-nums font-semibold text-[#0068ff]">
            {t("participation.demoCountLine", { count: countStr })}
          </span>
        </>
      )}
    </p>
  );
}

function FloatingAction({
  step,
  onPress,
}: {
  step: Step;
  onPress: () => void;
}) {
  const { t } = useFM();
  const { label, emoji } = useMemo(() => {
    switch (step) {
      case "home":
        return { label: t("fab.start"), emoji: "✦" };
      case "invite":
        return { label: t("fab.copy"), emoji: "🔗" };
      case "vote":
        return { label: t("fab.submit"), emoji: "↑" };
      case "result":
        return { label: t("fab.share"), emoji: "⚡" };
      default:
        return { label: "Go", emoji: "→" };
    }
  }, [step, t]);

  return (
    <div className="pointer-events-none absolute bottom-[5.25rem] right-2 z-30 sm:bottom-[5.5rem]">
      <button
        type="button"
        onClick={onPress}
        className="fm-fab pointer-events-auto group relative flex h-[4.75rem] min-w-[4.75rem] items-center justify-center overflow-hidden rounded-full bg-[#0068ff] px-5 text-[15px] font-bold text-white shadow-lg transition-transform active:scale-[0.94] hover:bg-[#0056d6] md:hover:scale-[1.03]"
      >
        <span className="relative flex flex-col items-center gap-0.5 leading-none">
          <span className="text-xl transition group-hover:scale-105">
            {emoji}
          </span>
          <span className="text-[11px] font-bold tracking-[0.1em] text-white/95">
            {label}
          </span>
        </span>
      </button>
    </div>
  );
}

export default function FriendMirrorApp({
  mode = "owner",
  initialProfile = null,
}: FriendMirrorAppProps) {
  const fm = useFM();
  const router = useRouter();
  const [step, setStep] = useState<Step>(() =>
    mode === "friend" ? "vote" : "home",
  );
  const [nickname, setNickname] = useState(
    () => initialProfile?.nickname ?? "",
  );
  const [shareId, setShareId] = useState(
    () => initialProfile?.share_code ?? "",
  );
  const [selected, setSelected] = useState<TagId[]>([]);
  const [stats, setStats] = useState<TagStat[]>([]);
  const [reviews, setReviews] = useState<FriendReview[]>([]);
  const [loading, setLoading] = useState(false);
  const [loadingText, setLoadingText] = useState("");
  const [loadingTips, setLoadingTips] = useState<string[]>([]);
  const [loadingMs, setLoadingMs] = useState(800);
  const [toast, setToast] = useState<string | null>(null);
  const [routeSkeleton, setRouteSkeleton] = useState(false);
  const [avatarUrl, setAvatarUrl] = useState<string | null>(
    () => initialProfile?.avatar_url ?? null,
  );
  const [photoPreviewOpen, setPhotoPreviewOpen] = useState(false);
  const [engagementCount, setEngagementCount] = useState<number | null>(null);

  const prevStepRef = useRef<Step>(step);
  const [pageDir, setPageDir] = useState<PageDir>("forward");
  const skipFirstRouteSkel = useRef(true);
  const avatarInputRef = useRef<HTMLInputElement>(null);

  const shareLink = useMemo(
    () => (shareId ? shareUrlFor(shareId) : ""),
    [shareId],
  );

  useEffect(() => {
    if (!isSupabaseConfigured()) return;
    let cancelled = false;
    void getPublicEngagementAction().then((r) => {
      if (!cancelled && r.ok && r.participantCount > 0) {
        setEngagementCount(r.participantCount);
      }
    });
    return () => {
      cancelled = true;
    };
  }, []);

  useEffect(() => {
    if (step !== "result") return;
    const seed = shareId || nickname.trim() || "guest";
    setReviews(mockFriendReviews(seed, fm.bundle));
  }, [step, fm.locale, fm.bundle, shareId, nickname]);

  const logAnalytics = useCallback(
    (
      eventName: string,
      metadata?: Record<string, unknown>,
      opts?: { shareSource?: string | null; refShareCode?: string | null },
    ) => {
      void recordEventAction({
        eventName,
        shareCode: shareId || null,
        refShareCode: opts?.refShareCode,
        shareSource: opts?.shareSource ?? null,
        metadata: metadata ?? {},
      });
    },
    [shareId],
  );

  const goHome = useCallback(() => {
    if (mode === "friend") {
      logAnalytics("create_own_profile_clicked", { entry: "friend_nav_home" });
      router.push("/");
    } else {
      setStep("home");
    }
  }, [mode, router, logAnalytics]);

  const votePagePhRef = useRef(false);
  useEffect(() => {
    if (step !== "vote") {
      votePagePhRef.current = false;
      return;
    }
    if (!shareId) return;
    if (votePagePhRef.current) return;
    votePagePhRef.current = true;
    void recordVotePageOpenedAction(shareId);
    if (mode === "friend") {
      void recordEventAction({
        eventName: "referral_opened",
        shareCode: shareId,
        refShareCode: shareId,
        metadata: { mode },
      });
    }
  }, [step, shareId, mode]);

  const resultPagePhRef = useRef(false);
  useEffect(() => {
    if (step !== "result") {
      resultPagePhRef.current = false;
      return;
    }
    if (resultPagePhRef.current) return;
    resultPagePhRef.current = true;
    logAnalytics("result_viewed", { mode });
  }, [step, mode, logAnalytics]);

  useLayoutEffect(() => {
    const prev = prevStepRef.current;
    if (prev !== step) {
      setPageDir(
        STEP_ORDER[step] >= STEP_ORDER[prev] ? "forward" : "back",
      );
      prevStepRef.current = step;
    }
  }, [step]);

  useEffect(() => {
    if (skipFirstRouteSkel.current) {
      skipFirstRouteSkel.current = false;
      return;
    }
    setRouteSkeleton(true);
    const t = window.setTimeout(() => setRouteSkeleton(false), 320);
    return () => window.clearTimeout(t);
  }, [step]);

  useEffect(() => {
    setPhotoPreviewOpen(false);
  }, [step]);

  const showToast = useCallback((msg: string) => {
    setToast(msg);
    window.setTimeout(() => setToast(null), 2400);
  }, []);

  const handleAvatarFileChange = useCallback(
    async (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0];
      e.target.value = "";
      if (!file) return;
      if (file.size > AVATAR_MAX_FILE) {
        showToast(fm.t("toast.imageTooBig"));
        return;
      }
      try {
        const dataUrl = await fileToAvatarDataUrl(file);
        setAvatarUrl(dataUrl);
        logAnalytics("avatar_uploaded", {
          file_size: file.size,
          mime: file.type || "unknown",
        });
      } catch {
        showToast(fm.t("toast.imageReadFail"));
      }
    },
    [showToast, logAnalytics, fm],
  );

  const runLoading = useCallback(async (title: string, tips: string[], ms: number) => {
    setLoadingText(title);
    setLoadingTips(tips);
    setLoadingMs(ms);
    setLoading(true);
    await delay(ms);
    setLoading(false);
  }, []);

  const onStart = async () => {
    logAnalytics("create_own_profile_clicked", { entry: "primary_cta" });
    const name = nickname.trim() || fm.t("common.mysteriousUser");
    setNickname(name);
    const m = loadScene(fm.bundle, "mirror");
    await runLoading(m.title, m.tips, 820);
    const res = await createProfileAction({
      nickname: name,
      avatarDataUrl: avatarUrl,
    });
    if (!res.ok) {
      showToast(res.error ?? fm.t("toast.createFailed"));
      return;
    }
    setShareId(res.shareCode);
    logAnalytics("profile_created", {
      share_code: res.shareCode,
      has_profile_id: Boolean(res.profileId),
    });
    if (res.referralApplied) {
      void recordEventAction({
        eventName: "referral_converted",
        shareCode: res.shareCode,
        refShareCode: res.referrerShareCode ?? null,
        metadata: {
          new_user_share_code: res.shareCode,
          referrer_share_code: res.referrerShareCode ?? undefined,
        },
      });
    }
    setStep("invite");
  };

  const toggleTag = (t: TagId) => {
    setSelected((prev) => {
      const on = prev.includes(t);
      const next = on ? prev.filter((x) => x !== t) : [...prev, t];
      logAnalytics("tag_selected", {
        tag: t,
        action: on ? "deselected" : "selected",
        selected_count: next.length,
      });
      return next;
    });
  };

  const onSubmitVote = async () => {
    const picks = selected.length ? selected : [TAG_IDS[0]];
    const v = loadScene(fm.bundle, "vote");
    await runLoading(v.title, v.tips, 900);
    const name = nickname.trim() || fm.t("common.mysteriousUser");

    if (shareId) {
      const fp = await getOrCreateVisitorFingerprint();
      const sub = await submitVotesAction({
        shareCode: shareId,
        tags: [...picks],
        voterFingerprint: fp,
      });
      if (!sub.ok) {
        if (mode === "friend") {
          showToast(
            sub.error === "profile_not_found"
              ? fm.t("errors.invalidLink")
              : fm.t("errors.submitFail"),
          );
          return;
        }
        if (
          sub.error &&
          sub.error !== "supabase_not_configured" &&
          sub.error !== "profile_not_found"
        ) {
          logAnalytics("vote_submit_skipped", { reason: sub.error });
        }
      }
    }

    logAnalytics("vote_submitted", {
      tags: picks,
      share_code: shareId || undefined,
    });

    const remote = shareId ? await fetchVoteStatsForShareCode(shareId) : null;
    let nextStats = computeTagStats(name, picks);
    if (remote) {
      const total = remote.reduce((a, s) => a + s.count, 0);
      if (total > 0) nextStats = remote;
    }
    setStats(nextStats);
    setReviews(mockFriendReviews(shareId || name, fm.bundle));
    setStep("result");
  };

  const resetFlow = () => {
    logAnalytics("flow_reset");
    if (mode === "friend") {
      logAnalytics("create_own_profile_clicked", { entry: "friend_result_reset" });
      router.push("/");
      return;
    }
    setStep("home");
    setSelected([]);
    setShareId("");
    setStats([]);
    setReviews([]);
  };

  const goInvite = async () => {
    logAnalytics("invite_button_clicked", { from: step });
    const name = nickname.trim() || fm.t("common.mysteriousUser");
    if (!nickname.trim()) setNickname(name);
    if (!shareId) setShareId(makeShareId(name));
    if (step !== "invite") {
      const inv = loadScene(fm.bundle, "invite");
      await runLoading(inv.title, inv.tips, 480);
    }
    setStep("invite");
  };

  const goVote = async () => {
    logAnalytics("nav_to_vote", { from: step });
    const name = nickname.trim() || fm.t("common.mysteriousUser");
    if (!nickname.trim()) setNickname(name);
    if (!shareId) setShareId(makeShareId(name));
    if (step !== "invite") {
      const fv = loadScene(fm.bundle, "friendView");
      await runLoading(fv.title, fv.tips, 480);
    }
    setStep("vote");
  };

  const goResultDemo = async () => {
    logAnalytics("nav_to_result_demo", { from: step });
    const name = nickname.trim() || fm.t("common.mysteriousUser");
    if (!nickname.trim()) setNickname(name);
    if (!shareId) setShareId(makeShareId(name));
    const agg = loadScene(fm.bundle, "aggregate");
    await runLoading(agg.title, agg.tips, 640);
    const demoPicks: TagId[] = ["social_terror", "money_magnet", "love_brain"];
    setStats(computeTagStats(name, demoPicks));
    setReviews(mockFriendReviews(shareId || name, fm.bundle));
    setStep("result");
  };

  const copyLink = async () => {
    const url =
      step === "result" && shareId ? shareUrlFor(shareId, "link") : shareLink;
    if (!url) {
      showToast(fm.t("toast.needLinkFirst"));
      return;
    }
    try {
      await navigator.clipboard.writeText(url);
      if (step === "result") {
        logAnalytics(
          "result_shared",
          { surface: "copy_link" },
          { shareSource: "link" },
        );
      } else {
        logAnalytics("share_link_copied", { surface: "copy_link" });
      }
      showToast(fm.t("toast.copied"));
    } catch {
      showToast(fm.t("toast.copyFail"));
    }
  };

  const simulateShareToGroup = () => {
    logAnalytics("share_simulate_clicked");
    showToast(fm.t("toast.demoShareRecorded"));
  };

  const onFabPress = () => {
    logAnalytics("fab_pressed", { step });
    switch (step) {
      case "home":
        void onStart();
        break;
      case "invite":
        void copyLink();
        break;
      case "vote":
        void onSubmitVote();
        break;
      case "result":
        void copyLink();
        break;
    }
  };

  return (
    <div className="relative flex min-h-full justify-center overflow-x-hidden bg-[#e8eef5]">
      {loading ? (
        <LoadingOverlay
          label={loadingText}
          tips={loadingTips}
          durationMs={loadingMs}
        />
      ) : null}
      {toast ? (
        <div className="fm-glass-panel--strong fm-toast-enter fixed bottom-[6.5rem] left-1/2 z-[60] max-w-[min(340px,92vw)] -translate-x-1/2 rounded-2xl px-5 py-3.5 text-center text-[13px] font-semibold text-[#1a1a1a] shadow-lg ring-1 ring-[#dbe4ee]">
          {toast}
        </div>
      ) : null}
      {photoPreviewOpen && avatarUrl ? (
        <PhotoLightbox
          src={avatarUrl}
          onClose={() => setPhotoPreviewOpen(false)}
        />
      ) : null}

      <div className="relative flex min-h-full w-full max-w-[375px] flex-col overflow-hidden border-x border-[#dbe4ee] bg-[#e8eef5] shadow-[0_0_0_1px_rgba(15,34,58,0.04)]">
        <ZaloBackdrop />

        {!loading ? <FloatingAction step={step} onPress={onFabPress} /> : null}

        <header className="relative z-10 shrink-0 bg-[#0068ff] px-4 pb-3 pt-[calc(0.75rem+env(safe-area-inset-top))] text-white shadow-sm">
          <div className="flex items-center justify-between gap-2">
            <div className="flex min-w-0 flex-1 items-center gap-2.5">
              {avatarUrl ? (
                <button
                  type="button"
                  onClick={() => setPhotoPreviewOpen(true)}
                  className="relative h-10 w-10 shrink-0 cursor-zoom-in overflow-hidden rounded-xl bg-white/20 ring-1 ring-white/35 outline-none transition hover:bg-white/30 focus-visible:ring-2 focus-visible:ring-white/80 active:scale-[0.97]"
                  aria-label={fm.t("common.viewLargeImage")}
                >
                  <img
                    src={avatarUrl}
                    alt=""
                    className="h-full w-full object-cover"
                    decoding="async"
                  />
                </button>
              ) : (
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-white/20 text-[11px] font-bold text-white ring-1 ring-white/35">
                  FM
                </div>
              )}
              <div className="min-w-0">
                <p className="truncate text-[15px] font-semibold leading-tight text-white">
                  {fm.t("header.title")}
                </p>
                <p className="truncate text-[11px] text-white/80">
                  {fm.t("header.subtitle")}
                </p>
              </div>
            </div>
            <div className="flex shrink-0 items-center gap-2">
              <LanguageSwitcher />
              <span className="rounded-full bg-black/10 px-2.5 py-1 text-[10px] font-semibold uppercase tracking-wide text-white/90">
                {fm.t("common.mock")}
              </span>
            </div>
          </div>
        </header>

        <ParticipationLine liveCount={engagementCount} />

        {step === "home" ? (
          <PageShell
            stepKey="home"
            dir={pageDir}
            showRouteSkeleton={routeSkeleton}
          >
            <div className="mt-4 flex flex-1 flex-col">
              <div className="fm-glass-panel fm-card-elevated fm-card-interactive relative overflow-hidden rounded-[28px] p-6">
                <p className="text-center text-[10px] font-semibold uppercase tracking-widest text-[#728193]">
                  {fm.t("home.kicker")}
                </p>
                <h1 className="mt-3 text-center text-[30px] font-bold leading-tight tracking-tight text-[#1a1a1a]">
                  {fm.t("home.titleLine1")}
                  <br />
                  <span className="fm-text-accent text-[32px]">{fm.t("home.titleLine2")}</span>
                </h1>
                <p className="mt-4 text-center text-[14px] leading-relaxed text-[#728193]">
                  {fm.t("home.sub")}
                  <br />
                  <span className="text-[#728193]/90">{fm.t("home.subMock")}</span>
                </p>

                <input
                  ref={avatarInputRef}
                  id="fm-avatar-file"
                  type="file"
                  accept="image/*"
                  className="sr-only"
                  onChange={(e) => void handleAvatarFileChange(e)}
                />

                <div className="mt-7 rounded-2xl border border-[#dbe4ee] bg-gradient-to-b from-white to-[#f6f9fc] p-5 shadow-[0_1px_0_rgba(255,255,255,0.9)_inset]">
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <p className="text-[13px] font-semibold text-[#1a1a1a]">
                        {fm.t("home.photoTitle")}
                      </p>
                      <p className="mt-0.5 text-[11px] leading-snug text-[#728193]">
                        {fm.t("home.photoHint")}
                      </p>
                    </div>
                    {avatarUrl ? (
                      <button
                        type="button"
                        onClick={() => setAvatarUrl(null)}
                        className="shrink-0 rounded-full px-3 py-1.5 text-[11px] font-semibold text-[#0068ff] transition hover:bg-[#0068ff]/10 active:scale-[0.98]"
                      >
                        {fm.t("home.removePhoto")}
                      </button>
                    ) : null}
                  </div>

                  <div className="relative mt-5 w-full">
                    {avatarUrl ? (
                      <button
                        type="button"
                        onClick={() => setPhotoPreviewOpen(true)}
                        className="relative block w-full cursor-zoom-in overflow-hidden rounded-2xl border-2 border-[#dbe4ee] bg-[#f2f6fb] shadow-inner outline-none ring-2 ring-[#0068ff]/18 transition hover:brightness-[1.02] focus-visible:ring-[#0068ff]/40 active:scale-[0.995] aspect-[4/3] max-h-[min(72vw,380px)] min-h-[200px]"
                        aria-label={fm.t("common.viewLargeImage")}
                      >
                        <img
                          src={avatarUrl}
                          alt={fm.t("home.photoAlt")}
                          className="h-full w-full object-cover"
                          decoding="async"
                        />
                      </button>
                    ) : (
                      <button
                        type="button"
                        onClick={() => avatarInputRef.current?.click()}
                        className="relative flex w-full flex-col items-center justify-center gap-2 overflow-hidden rounded-2xl border-2 border-dashed border-[#dbe4ee] bg-[#f8fafc] py-10 text-[#728193] outline-none ring-2 ring-[#0068ff]/12 transition hover:border-[#0068ff]/35 hover:bg-[#f2f6fb] active:scale-[0.995] aspect-[4/3] max-h-[min(72vw,380px)] min-h-[200px]"
                        aria-label={fm.t("home.uploadAreaAria")}
                      >
                        <span className="text-3xl" aria-hidden>
                          +
                        </span>
                        <span className="text-[13px] font-semibold text-[#1a1a1a]/70">
                          {fm.t("home.uploadCta")}
                        </span>
                      </button>
                    )}
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        avatarInputRef.current?.click();
                      }}
                      className="absolute bottom-3 right-3 flex h-11 w-11 items-center justify-center rounded-full border-[2.5px] border-white bg-[#0068ff] text-white shadow-lg transition hover:bg-[#0056d6] active:scale-95"
                      aria-label={fm.t("home.cameraAria")}
                    >
                      <svg
                        viewBox="0 0 20 20"
                        className="h-4 w-4"
                        fill="currentColor"
                        aria-hidden
                      >
                        <path d="M4 5a2 2 0 00-2 2v8a2 2 0 002 2h12a2 2 0 002-2V7a2 2 0 00-2-2h-2.17l-1.4-2H7.57L6.17 5H4zm8 2.5a3.5 3.5 0 100 7 3.5 3.5 0 000-7z" />
                      </svg>
                    </button>
                  </div>
                  <p className="mt-2.5 text-center text-[11px] leading-snug text-[#728193]">
                    {avatarUrl ? (
                      <>
                        {fm.t("home.photoHelpWith")}
                        <span className="text-[#0068ff]">{fm.t("home.photoHelpChange")}</span>
                      </>
                    ) : (
                      <>{fm.t("home.photoHelpWithout")}</>
                    )}
                  </p>
                </div>

                <label className="mt-6 block text-[12px] font-medium text-[#728193]">
                  {fm.t("home.nicknameLabel")}
                  <input
                    value={nickname}
                    onChange={(e) => setNickname(e.target.value)}
                    placeholder={fm.t("home.nicknamePh")}
                    maxLength={16}
                    className="mt-2 w-full rounded-2xl border border-[#dbe4ee] bg-white px-4 py-3.5 text-[16px] font-medium text-[#1a1a1a] outline-none transition placeholder:text-[#728193]/70 focus:border-[#0068ff] focus:ring-2 focus:ring-[#0068ff]/20"
                  />
                </label>

                <button
                  type="button"
                  onClick={() => void onStart()}
                  className="group mt-6 flex w-full items-center justify-center gap-2 rounded-2xl bg-[#0068ff] py-4 text-[16px] font-semibold text-white shadow-md transition hover:bg-[#0056d6] active:scale-[0.99]"
                >
                  <span>{fm.t("home.startCta")}</span>
                  <span className="transition group-hover:translate-x-0.5">→</span>
                </button>
              </div>

              <nav className="fm-nav-glass relative mt-5 rounded-2xl p-3">
                <p className="mb-2 px-1 text-[10px] font-medium uppercase tracking-wider text-[#728193]">
                  {fm.t("home.flowPreview")}
                </p>
                <div className="grid grid-cols-2 gap-2">
                  <NavPill
                    active
                    label={fm.t("home.navHome")}
                    onClick={() => goHome()}
                  />
                  <NavPill label={fm.t("home.navInvite")} onClick={() => void goInvite()} />
                  <NavPill label={fm.t("home.navVote")} onClick={() => void goVote()} />
                  <NavPill label={fm.t("home.navResult")} onClick={() => void goResultDemo()} />
                </div>
              </nav>
            </div>
          </PageShell>
        ) : null}

        {step === "invite" ? (
          <PageShell
            stepKey="invite"
            dir={pageDir}
            showRouteSkeleton={routeSkeleton}
          >
            <div className="mt-4 flex flex-1 flex-col">
              <div className="fm-glass-panel fm-card-elevated fm-card-interactive relative flex flex-col items-center overflow-hidden rounded-[28px] px-5 pb-8 pt-9">
                <div className="relative w-full px-1">
                  <UserPortrait
                    src={avatarUrl}
                    name={nickname}
                    variant="invite"
                    onOpenPreview={
                      avatarUrl ? () => setPhotoPreviewOpen(true) : undefined
                    }
                  />
                </div>

                <p className="mt-6 text-xl font-semibold text-[#1a1a1a]">
                  {nickname.trim() || fm.t("common.mysteriousUser")}
                </p>
                <p className="mt-1 text-center text-[14px] text-[#728193]">
                  {fm.t("invite.subtitle")}
                </p>

                <div className="mt-7 w-full rounded-2xl border border-[#dbe4ee] bg-[#f8fafc] p-4">
                  <p className="text-[11px] font-medium uppercase tracking-wider text-[#728193]">
                    {fm.t("invite.shareLink")}
                  </p>
                  <p className="mt-2 break-all text-left text-[13px] leading-snug text-[#1a1a1a]">
                    {shareLink || "…"}
                  </p>
                  <button
                    type="button"
                    onClick={() => void copyLink()}
                    className="mt-3 w-full rounded-xl border border-[#dbe4ee] bg-white py-3 text-[14px] font-semibold text-[#0068ff] transition hover:bg-[#f2f6fb]"
                  >
                    {fm.t("invite.copyLink")}
                  </button>
                  <button
                    type="button"
                    onClick={simulateShareToGroup}
                    className="mt-2 w-full rounded-xl border border-dashed border-[#dbe4ee] py-2.5 text-[12px] font-medium text-[#728193] transition hover:border-[#0068ff]/40 hover:text-[#1a1a1a]"
                  >
                    {fm.t("invite.simulateShare")}
                  </button>
                </div>

                <button
                  type="button"
                  onClick={() => {
                    logAnalytics("invite_button_clicked", {
                      source: "simulate_friend_open_link",
                    });
                    void goVote();
                  }}
                  className="mt-4 w-full rounded-2xl bg-[#0068ff] py-3.5 text-[15px] font-semibold text-white shadow-md transition hover:bg-[#0056d6] active:scale-[0.99]"
                >
                  {fm.t("invite.simulateFriend")}
                </button>
              </div>

              <nav className="fm-nav-glass relative mt-4 grid grid-cols-4 gap-1.5 rounded-[22px] p-2">
                <MiniNav label={fm.t("nav.homeShort")} onClick={() => goHome()} />
                <MiniNav active label={fm.t("nav.inviteShort")} onClick={() => void goInvite()} />
                <MiniNav label={fm.t("nav.voteShort")} onClick={() => void goVote()} />
                <MiniNav label={fm.t("nav.resultShort")} onClick={() => void goResultDemo()} />
              </nav>
            </div>
          </PageShell>
        ) : null}

        {step === "vote" ? (
          <PageShell
            stepKey="vote"
            dir={pageDir}
            showRouteSkeleton={routeSkeleton}
          >
            <div className="mt-4 flex flex-1 flex-col">
              <div className="fm-glass-panel fm-card-elevated fm-card-interactive relative overflow-hidden rounded-[28px] p-5 pt-6">
                <div className="flex flex-col items-center">
                  <UserPortrait
                    src={avatarUrl}
                    name={nickname}
                    variant="vote"
                    onOpenPreview={
                      avatarUrl ? () => setPhotoPreviewOpen(true) : undefined
                    }
                  />
                  <p className="mt-3 text-center text-[11px] font-medium uppercase tracking-wider text-[#728193]">
                    {fm.t("vote.banner", {
                      name: nickname.trim() || fm.t("common.ta"),
                    })}
                  </p>
                </div>
                <h2 className="mt-4 text-center text-[26px] font-bold leading-tight tracking-tight text-[#1a1a1a]">
                  {fm.t("vote.titleLine1")}
                  <br />
                  <span className="fm-text-accent text-[28px]">{fm.t("vote.titleLine2")}</span>
                </h2>
                <p className="mt-3 text-center text-[12px] text-[#728193]">
                  {fm.t("vote.hint")}
                </p>

                <div className="mt-7 flex flex-wrap justify-center gap-2">
                  {TAG_IDS.map((tagId, i) => {
                    const on = selected.includes(tagId);
                    return (
                      <button
                        key={tagId}
                        type="button"
                        onClick={() => toggleTag(tagId)}
                        style={{ animationDelay: `${i * 40}ms` }}
                        className={`fm-tag-enter touch-manipulation rounded-full border px-[14px] py-2.5 text-[13px] font-medium transition ${
                          on
                            ? "border-transparent bg-[#0068ff] text-white shadow-md"
                            : "border-[#dbe4ee] bg-white text-[#1a1a1a] hover:border-[#0068ff]/35 active:scale-[0.98]"
                        }`}
                      >
                        {fm.tagLabel(tagId)}
                      </button>
                    );
                  })}
                </div>

                <button
                  type="button"
                  onClick={() => void onSubmitVote()}
                  className="mt-9 w-full rounded-2xl bg-[#0068ff] py-3.5 text-[16px] font-semibold text-white shadow-lg transition hover:bg-[#0056d6] active:scale-[0.99]"
                >
                  {fm.t("vote.submit")}
                </button>
              </div>

              <nav className="fm-nav-glass relative mt-4 grid grid-cols-4 gap-1.5 rounded-[22px] p-2">
                <MiniNav label={fm.t("nav.homeShort")} onClick={() => goHome()} />
                <MiniNav label={fm.t("nav.inviteShort")} onClick={() => void goInvite()} />
                <MiniNav active label={fm.t("nav.voteShort")} onClick={() => void goVote()} />
                <MiniNav label={fm.t("nav.resultShort")} onClick={() => void goResultDemo()} />
              </nav>
            </div>
          </PageShell>
        ) : null}

        {step === "result" ? (
          <PageShell
            stepKey="result"
            dir={pageDir}
            showRouteSkeleton={routeSkeleton}
          >
            <div className="mt-4 flex flex-1 flex-col gap-4">
              <ResultWrappedExperience
                seed={`${shareId}|${nickname.trim() || "user"}`}
                nickname={nickname}
                avatarUrl={avatarUrl}
                stats={stats}
                shareCode={shareId}
                shareUrl={shareLink}
                participantCount={engagementCount}
                reviews={reviews}
                onShareOutbound={(source: ShareSource) => {
                  logAnalytics(
                    "result_shared",
                    { surface: source },
                    { shareSource: source },
                  );
                }}
                showToast={showToast}
              />

              <div className="flex gap-3">
                <button
                  type="button"
                  onClick={() => void copyLink()}
                  className="flex-1 rounded-2xl bg-[#0068ff] py-3.5 text-[15px] font-semibold text-white shadow-md transition hover:bg-[#0056d6] active:scale-[0.99]"
                >
                  {fm.t("result.shareLink")}
                </button>
                <button
                  type="button"
                  onClick={resetFlow}
                  className="rounded-2xl border border-[#dbe4ee] bg-white px-4 py-3.5 text-[13px] font-medium text-[#1a1a1a] transition hover:bg-[#f8fafc]"
                >
                  {fm.t("result.again")}
                </button>
              </div>

              <nav className="fm-nav-glass grid grid-cols-4 gap-1.5 rounded-[22px] p-2">
                <MiniNav label={fm.t("nav.homeShort")} onClick={() => goHome()} />
                <MiniNav label={fm.t("nav.inviteShort")} onClick={() => void goInvite()} />
                <MiniNav label={fm.t("nav.voteShort")} onClick={() => void goVote()} />
                <MiniNav
                  active
                  label={fm.t("nav.resultShort")}
                  onClick={() => void goResultDemo()}
                />
              </nav>
            </div>
          </PageShell>
        ) : null}

        <footer className="relative z-10 mt-auto shrink-0 px-5 pb-[calc(1rem+env(safe-area-inset-bottom))] pt-2 text-center text-[10px] text-[#728193]">
          {fm.t("footer.line")}
        </footer>
      </div>
    </div>
  );
}

function NavPill({
  label,
  onClick,
  active,
}: {
  label: string;
  onClick: () => void;
  active?: boolean;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`rounded-xl py-2.5 text-[11px] font-medium transition active:scale-[0.98] ${
        active
          ? "border border-[#0068ff]/30 bg-[#0068ff]/10 text-[#0068ff]"
          : "border border-[#dbe4ee] bg-white text-[#728193] hover:border-[#0068ff]/25 hover:text-[#1a1a1a]"
      }`}
    >
      {label}
    </button>
  );
}

function MiniNav({
  label,
  onClick,
  active,
}: {
  label: string;
  onClick: () => void;
  active?: boolean;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`rounded-lg py-2 text-[10px] font-medium uppercase tracking-wide transition active:scale-[0.97] ${
        active
          ? "bg-[#0068ff] text-white shadow-sm"
          : "bg-white text-[#728193] hover:bg-[#f8fafc] hover:text-[#1a1a1a]"
      }`}
    >
      {label}
    </button>
  );
}
