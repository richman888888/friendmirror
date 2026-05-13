/** Public profile fields shared by server + client (no server-only import). */
export type FriendMirrorProfile = {
  id: string;
  nickname: string;
  avatar_url: string | null;
  share_code: string;
};
