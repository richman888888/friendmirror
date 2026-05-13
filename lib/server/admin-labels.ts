import type { AdminFunnelStep } from "@/lib/admin/funnel-steps";

/** DB `event_name` → 中文展示（字段名不变，仅 UI） */
export const EVENT_NAME_ZH: Record<string, string> = {
  profile_created: "创建人设人数",
  invite_button_clicked: "点击邀请按钮",
  vote_page_opened: "打开投票页",
  vote_submitted: "提交投票人数",
  create_own_profile_clicked: "投票后也想创建自己的人设",
  result_viewed: "查看结果页",
  result_shared: "分享结果页",
  share_link_copied: "复制分享链接",
  tag_selected: "选择标签",
  avatar_uploaded: "上传头像",
};

export function eventNameDisplay(name: string): string {
  return EVENT_NAME_ZH[name] ?? name;
}

export const SHARE_SOURCE_ZH: Record<string, string> = {
  zalo: "Zalo",
  facebook: "Facebook",
  link: "复制链接",
};

export function shareSourceDisplay(source: string): string {
  return SHARE_SOURCE_ZH[source] ?? source;
}

/** 漏斗每一步下方说明 */
export const FUNNEL_STEP_HINT: Record<AdminFunnelStep, string> = {
  profile_created: "完成自建人设的用户量，是转化漏斗的起点。",
  invite_button_clicked: "用户有分享意愿的关键指标。",
  vote_page_opened: "访客进入为他人投票页面的次数。",
  vote_submitted: "朋友实际完成评价的次数，代表互动深度。",
  create_own_profile_clicked: "裂变回流指标：投完票也想自己玩，越高越好。",
};
