import type { TagId } from "@/lib/friend-mirror/constants";
import type { FMLocaleBundle, TagLineTable } from "@/src/i18n/types";

import { enUSBundle } from "@/src/i18n/locales/en-US";

const tag = (id: TagId, label: string) => [id, label] as const;

function copyTagLines(b: FMLocaleBundle["roasts"]): FMLocaleBundle["roasts"] {
  return Object.fromEntries(
    (Object.keys(b) as TagId[]).map((k) => [k, [...b[k]]]),
  ) as unknown as TagLineTable;
}

/** Roast / dare / hidden: English copy from en-US; UI + tags in Japanese. */
export const jaJPBundle: FMLocaleBundle = {
  ...enUSBundle,
  locale: "ja-JP",
  tags: Object.fromEntries([
    tag("love_brain", "恋愛脳"),
    tag("born_boss", "生まれつきボス"),
    tag("money_magnet", "金運つき"),
    tag("midnight_emperor", "深夜のエモ王"),
    tag("master_slack", "やる気のない達人"),
    tag("social_terror", "社交界のテロリスト"),
  ]) as FMLocaleBundle["tags"],
  roasts: copyTagLines(enUSBundle.roasts),
  dare: copyTagLines(enUSBundle.dare),
  hidden: copyTagLines(enUSBundle.hidden),
  mock: {
    names: ["阿紫", "小林", "Zaloユーザー", "Minh", "Lan", "Kai"],
    anonymous: "匿名の友だち",
    minutesAgo: "{{n}}分前",
  },
  ui: {
    common: {
      user: "ユーザー",
      mysteriousUser: "謎のユーザー",
      ta: "その人",
      close: "閉じる",
      viewLargeImage: "大きな画像を見る",
      closeLightboxHint: "外側をタップで閉じる · Esc",
      fm: "FriendMirror",
      mock: "デモ",
    },
    header: {
      title: "友だちから見たあなた",
      subtitle: "招待 · 投票 · 結果（デモ）",
    },
    participation: {
      liveHot: "盛り上がり",
      liveCountLine: "{{count}} 人が参加（ライブ）",
      demoLabel: "デモデータ",
      demoCountLine: "{{count}} 回のやり取り（モック）",
    },
    fab: { start: "開始", copy: "コピー", submit: "送信", share: "共有" },
    loading: {
      footerLine: "SYNC · MOCK · NO BACKEND",
      mirror: {
        title: "あなた専用のミラーを作成中…",
        tips: [
          "バイラルの種を書き込み中…",
          "共有リンクを生成中…",
          "投票プールを準備中…",
        ],
      },
      invite: {
        title: "招待カードを開いています…",
        tips: ["テンプレ適用中…", "煽り文を追加中…", "もうすぐ。"],
      },
      friendView: {
        title: "友だち視点に入ります…",
        tips: ["匿名モードに切替中…", "タグを読み込み中…"],
      },
      vote: {
        title: "友だちが投票中…",
        tips: ["辛口コメント収集中…", "一番辛辣な人を計算中…", "TOPを生成中…"],
      },
      aggregate: {
        title: "投票を集計中…",
        tips: ["モック統計を取得中…", "結果を描画中…"],
      },
    },
    home: {
      kicker: "FriendMirror",
      titleLine1: "友だちは",
      titleLine2: "どう見てる？",
      sub: "リンクを作り、友だちが匿名でタグを選び、楽しいカードを表示。",
      subMock: "フロントのモックのみ。本番バックエンドはありません。",
      photoTitle: "写真",
      photoAlt: "プロフィール写真",
      photoHint:
        "友だちはこの写真を見ながらタグを選びます · このブラウザ内だけに保存",
      removePhoto: "写真を削除",
      uploadCta: "タップしてアップロード",
      uploadAreaAria: "プロフィール写真をアップロード",
      cameraAria: "アルバムから選ぶか撮影",
      photoHelpWith: "写真タップで全画面 · 右下カメラで",
      photoHelpChange: "差し替え",
      photoHelpWithout: "アルバムかその場で撮影 · 端末内のみ保存",
      nicknameLabel: "ニックネーム",
      nicknamePh: "たろう / Minh",
      startCta: "今すぐ始める",
      flowPreview: "流れのプレビュー",
      navHome: "① ホーム",
      navInvite: "② 招待",
      navVote: "③ 投票",
      navResult: "④ 結果",
    },
    invite: {
      subtitle: "友だちに評価してもらう",
      shareLink: "共有リンク",
      copyLink: "リンクをコピー",
      simulateShare: "デモ：グループ共有（トーストのみ）",
      simulateFriend: "友だちがリンクを開くのをシミュレート",
    },
    vote: {
      banner: "{{name}}に投票",
      titleLine1: "この人、",
      titleLine2: "一番何に似てる？",
      hint: "複数選択 · 匿名送信",
      submit: "評価を送信",
    },
    result: { shareLink: "リンクを共有", again: "もう一度" },
    footer: { line: "FriendMirror · デモ" },
    nav: {
      homeShort: "ホーム",
      inviteShort: "招待",
      voteShort: "投票",
      resultShort: "結果",
    },
    toast: {
      imageTooBig: "12MB 未満の画像を使ってください",
      imageReadFail: "読み取れませんでした。JPG / PNG を試してください",
      createFailed: "プロフィールを作成できませんでした",
      needLinkFirst: "ホームからリンクを生成してください",
      copied: "リンクをコピーしました",
      copyFail: "コピーに失敗しました。長押しでコピーしてください",
      demoShareRecorded: "デモ共有を記録しました",
      posterSaved: "ポスターを保存しました",
      posterFail: "保存に失敗しました。スクショも可です",
      storySaved: "画像を保存しました",
      storyFail: "保存に失敗しました。スクショを試してください",
      trackedCopied: "計測付きリンクをコピーしました",
    },
    votePage: {
      notConfiguredTitle: "投票ページを読み込めません",
      notConfiguredBody:
        "Supabase が未設定です。.env.local に NEXT_PUBLIC_SUPABASE_URL と NEXT_PUBLIC_SUPABASE_ANON_KEY を設定して再試行してください。",
    },
    errors: { invalidLink: "無効なリンク", submitFail: "送信に失敗しました" },
    language: {
      label: "言語",
      zh: "中文",
      vi: "Tiếng Việt",
      en: "English",
      ja: "日本語",
    },
    resultPoster: {
      tagEmphasis: "「{{tag}}」",
      posterDownloadName: "FriendMirror-Report-{{name}}.png",
      downloadNameFallback: "User",
      friendMatch: "友だち一致度",
      friendSeesYou: "友だちから見たあなた",
      moreTags: "+{{n}} 件のタグは非表示",
      roast: "辛口",
      dare: "言えない本音",
      hidden: "隠れ属性",
      livePlaying: "全員で {{count}} 人がプレイ中",
      demoCount: "デモ {{count}} 回",
      friendsActed: "{{n}} 人の友だちが投票",
      disclaimer: "エンジョイ向け · ストーリー用スクショOK",
      savePoster: "高画質ポスターを保存",
      savingPoster: "書き出し中…",
    },
    story: {
      sectionKicker: "ストーリーカード",
      sectionTitle: "縦画面ワンタップ",
      sectionSub: "ストーリー用に保存 · リンクに流入元",
      primaryLabel: "メインタグ",
      matchBadge: "一致度",
      downloadBasename: "FriendMirror-{{name}}",
      saveImage: "画像を保存",
      generating: "処理中…",
      copyLink: "リンクをコピー",
      preview: "プレビュー（計測なし）：",
    },
  },
};
