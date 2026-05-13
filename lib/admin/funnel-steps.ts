/** Admin funnel event_name values — must match `events.event_name` in DB. */
export const ADMIN_FUNNEL_STEPS = [
  "profile_created",
  "invite_button_clicked",
  "vote_page_opened",
  "vote_submitted",
  "create_own_profile_clicked",
] as const;

export type AdminFunnelStep = (typeof ADMIN_FUNNEL_STEPS)[number];
