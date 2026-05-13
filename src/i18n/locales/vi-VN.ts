import type { TagId } from "@/lib/friend-mirror/constants";
import type { FMLocaleBundle, TagLineTable } from "@/src/i18n/types";

import { enUSBundle } from "@/src/i18n/locales/en-US";

const tag = (id: TagId, label: string) => [id, label] as const;

/** Roast / dare / hidden: same strings as en-US for bundle size; UI + tags fully Vietnamese. */
function copyTagLines(b: FMLocaleBundle["roasts"]): FMLocaleBundle["roasts"] {
  return Object.fromEntries(
    (Object.keys(b) as TagId[]).map((k) => [k, [...b[k]]]),
  ) as unknown as TagLineTable;
}

export const viVNBundle: FMLocaleBundle = {
  ...enUSBundle,
  locale: "vi-VN",
  tags: Object.fromEntries([
    tag("love_brain", "Đầu óc yêu đương"),
    tag("born_boss", "Bẩm sinh là sếp"),
    tag("money_magnet", "Thần tài ghé"),
    tag("midnight_emperor", "Vua emo nửa đêm"),
    tag("master_slack", "Bậc thầy buông xuôi"),
    tag("social_terror", "Khủng bố hội thoại"),
  ]) as FMLocaleBundle["tags"],
  roasts: copyTagLines(enUSBundle.roasts),
  dare: copyTagLines(enUSBundle.dare),
  hidden: copyTagLines(enUSBundle.hidden),
  mock: {
    names: ["Azi", "Kobayashi", "Người dùng Zalo", "Minh", "Lan", "Kai"],
    anonymous: "Bạn ẩn danh",
    minutesAgo: "{{n}} phút trước",
  },
  ui: {
    common: {
      user: "Người dùng",
      mysteriousUser: "Người bí ẩn",
      ta: "họ",
      close: "Đóng",
      viewLargeImage: "Xem ảnh lớn",
      closeLightboxHint: "Chạm ra ngoài để đóng · Esc",
      fm: "FriendMirror",
      mock: "Demo",
    },
    header: {
      title: "Bạn bè nhìn bạn thế nào",
      subtitle: "Mời · Bỏ phiếu · Kết quả (demo)",
    },
    participation: {
      liveHot: "Đang hot",
      liveCountLine: "{{count}} lượt tham gia (trực tiếp)",
      demoLabel: "Dữ liệu demo",
      demoCountLine: "{{count}} tương tác (mock)",
    },
    fab: { start: "Bắt đầu", copy: "Sao chép", submit: "Gửi", share: "Chia sẻ" },
    loading: {
      footerLine: "SYNC · MOCK · NO BACKEND",
      mirror: {
        title: "Đang tạo bản phản chiếu của bạn…",
        tips: [
          "Đang ghi hạt giống viral…",
          "Đang tạo link chia sẻ…",
          "Đang làm nóng hồ bỏ phiếu…",
        ],
      },
      invite: {
        title: "Đang mở thiệp mời…",
        tips: ["Đang áp template…", "Đang thêm caption…", "Sắp xong."],
      },
      friendView: {
        title: "Đang vào góc nhìn bạn bè…",
        tips: ["Đang đổi chế độ ẩn danh…", "Đang tải tag…"],
      },
      vote: {
        title: "Bạn bè đang bỏ phiếu…",
        tips: [
          "Đang thu thập nhận xét…",
          "Đang tính ai “độc miệng” nhất…",
          "Đang dựng bảng TOP…",
        ],
      },
      aggregate: {
        title: "Đang tổng hợp phiếu…",
        tips: ["Đang lấy số mock…", "Đang render kết quả…"],
      },
    },
    home: {
      kicker: "FriendMirror",
      titleLine1: "Xem bạn bè",
      titleLine2: "chọc bạn (nhẹ nhàng)",
      sub: "Tạo link, bạn chọn tag ẩn danh, nhận thẻ vui.",
      subMock: "Chỉ mock frontend—không backend thật.",
      photoTitle: "Ảnh",
      photoAlt: "Ảnh hồ sơ",
      photoHint:
        "Bạn bè bỏ phiếu khi xem ảnh này · chỉ lưu trên trình duyệt này",
      removePhoto: "Gỡ ảnh",
      uploadCta: "Chạm để tải lên",
      uploadAreaAria: "Tải ảnh hồ sơ",
      cameraAria: "Chọn từ thư viện hoặc chụp ảnh",
      photoHelpWith: "Chạm ảnh để xem full · nút máy ảnh để ",
      photoHelpChange: "đổi ảnh",
      photoHelpWithout: "Thư viện hoặc chụp nhanh · chỉ lưu cục bộ",
      nicknameLabel: "Biệt danh",
      nicknamePh: "Alex / Minh",
      startCta: "Bắt đầu ngay",
      flowPreview: "Xem trước luồng",
      navHome: "① Trang chủ",
      navInvite: "② Mời",
      navVote: "③ Bỏ phiếu",
      navResult: "④ Kết quả",
    },
    invite: {
      subtitle: "Mời bạn bè chấm mình",
      shareLink: "Link chia sẻ",
      copyLink: "Sao chép link",
      simulateShare: "Demo: chia sẻ nhóm (chỉ toast)",
      simulateFriend: "Giả lập bạn mở link",
    },
    vote: {
      banner: "Bỏ phiếu cho {{name}}",
      titleLine1: "Bạn nghĩ họ",
      titleLine2: "giống gì nhất?",
      hint: "Chọn nhiều · gửi ẩn danh",
      submit: "Gửi đánh giá",
    },
    result: { shareLink: "Chia sẻ link", again: "Chơi lại" },
    footer: { line: "FriendMirror · demo" },
    nav: {
      homeShort: "Trang chủ",
      inviteShort: "Mời",
      voteShort: "Vote",
      resultShort: "Kết quả",
    },
    toast: {
      imageTooBig: "Ảnh cần nhỏ hơn 12MB",
      imageReadFail: "Không đọc được ảnh—thử JPG / PNG",
      createFailed: "Tạo hồ sơ thất bại",
      needLinkFirst: "Hãy bắt đầu từ trang chủ để tạo link",
      copied: "Đã sao chép link",
      copyFail: "Sao chép thất bại—nhấn giữ link",
      demoShareRecorded: "Đã ghi demo chia sẻ",
      posterSaved: "Đã lưu poster",
      posterFail: "Lưu thất bại—chụp màn hình",
      storySaved: "Đã lưu ảnh",
      storyFail: "Lưu thất bại—thử chụp màn hình",
      trackedCopied: "Đã sao chép link có tracking",
    },
    votePage: {
      notConfiguredTitle: "Không tải được trang vote",
      notConfiguredBody:
        "Chưa cấu hình Supabase. Đặt NEXT_PUBLIC_SUPABASE_URL và NEXT_PUBLIC_SUPABASE_ANON_KEY trong .env.local rồi thử lại.",
    },
    errors: { invalidLink: "Link không hợp lệ", submitFail: "Gửi thất bại" },
    language: {
      label: "Ngôn ngữ",
      zh: "中文",
      vi: "Tiếng Việt",
      en: "English",
      ja: "日本語",
    },
    resultPoster: {
      tagEmphasis: "「{{tag}}」",
      posterDownloadName: "FriendMirror-Report-{{name}}.png",
      downloadNameFallback: "User",
      friendMatch: "Khớp bạn bè",
      friendSeesYou: "Bạn bè nhìn bạn",
      moreTags: "+{{n}} tag ẩn",
      roast: "Châm chọc",
      dare: "Không dám nói",
      hidden: "Ẩn",
      livePlaying: "{{count}} người đang chơi",
      demoCount: "Demo {{count}} lượt",
      friendsActed: "{{n}} bạn đã bỏ phiếu",
      disclaimer: "Vui là chính · sẵn sàng chụp story",
      savePoster: "Lưu poster HD",
      savingPoster: "Đang xuất…",
    },
    story: {
      sectionKicker: "Thẻ Story",
      sectionTitle: "Dọc một chạm",
      sectionSub: "Lưu cho story · link có thống kê nguồn",
      primaryLabel: "Tag chính",
      matchBadge: "Khớp",
      downloadBasename: "FriendMirror-{{name}}",
      saveImage: "Lưu ảnh",
      generating: "Đang xử lý…",
      copyLink: "Sao chép link",
      preview: "Xem trước (không tracking):",
    },
  },
};
