import type { Metadata } from "next";
import type { ReactNode } from "react";

/**
 * 管理看板布局。访问控制由 `app/admin/page.tsx` 结合 httpOnly Cookie 与
 * `ADMIN_PASSWORD` 服务端校验完成。
 */
export const metadata: Metadata = {
  title: "运营数据看板 · FriendMirror",
  description: "内部运营统计（需 ADMIN_PASSWORD 与 Supabase Service Role）",
  robots: { index: false, follow: false },
};

export default function AdminLayout({ children }: { children: ReactNode }) {
  return (
    <div className="min-h-screen bg-slate-100 text-slate-900 antialiased">
      {children}
    </div>
  );
}
