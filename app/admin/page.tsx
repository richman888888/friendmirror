import Link from "next/link";

import { adminLogoutAction } from "@/app/admin/actions";
import { AdminDashboardView } from "@/components/admin/AdminDashboardView";
import { AdminLoginForm } from "@/components/admin/AdminLoginForm";
import { getAdminDashboardData } from "@/lib/server/admin-dashboard";
import {
  isAdminAuthenticated,
  isAdminPasswordConfigured,
} from "@/lib/server/admin-auth";

export const dynamic = "force-dynamic";

export default async function AdminPage() {
  const authed = await isAdminAuthenticated();

  if (!authed) {
    return (
      <div className="mx-auto flex min-h-[min(100vh,760px)] max-w-md flex-col justify-center px-4 py-16">
        <div className="rounded-2xl border border-slate-200/90 bg-white p-8 shadow-lg ring-1 ring-slate-900/[0.04] sm:p-10">
          <p className="text-[11px] font-semibold uppercase tracking-widest text-indigo-600">
            FriendMirror
          </p>
          <h1 className="mt-2 text-2xl font-bold tracking-tight text-slate-900">
            管理看板登录
          </h1>
          <p className="mt-2 text-[13px] leading-relaxed text-slate-600">
            查看运营数据前请先验证身份。管理员密码由服务端环境变量{" "}
            <code className="rounded bg-slate-100 px-1 font-mono text-[11px] text-slate-800">
              ADMIN_PASSWORD
            </code>{" "}
            提供，不会出现在网页代码里。
          </p>
          {!isAdminPasswordConfigured() ? (
            <div
              className="mt-4 rounded-xl border border-amber-200 bg-amber-50 px-3 py-2.5 text-[12px] leading-relaxed text-amber-950"
              role="status"
            >
              当前环境未配置{" "}
              <code className="font-mono text-[11px]">ADMIN_PASSWORD</code>
              ，无法登录。请在部署环境或{" "}
              <code className="font-mono text-[11px]">.env.local</code>{" "}
              中设置后重启服务。
            </div>
          ) : null}
          <AdminLoginForm />
        </div>
      </div>
    );
  }

  const data = await getAdminDashboardData();

  return (
    <div className="mx-auto max-w-6xl px-4 py-8 sm:px-6 sm:py-10">
      <header className="flex flex-col gap-4 border-b border-slate-200/90 pb-6 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <p className="text-[11px] font-semibold uppercase tracking-widest text-indigo-600">
            FriendMirror
          </p>
          <h1 className="mt-1 text-2xl font-bold tracking-tight text-slate-900 sm:text-3xl">
            运营数据看板
          </h1>
          <p className="mt-2 max-w-xl text-[13px] leading-relaxed text-slate-600">
            聚合自 Supabase。今日指标按{" "}
            <span className="font-medium text-slate-800">Asia/Shanghai</span>{" "}
            自然日统计，便于对齐本地运营节奏。
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <form action={adminLogoutAction}>
            <button
              type="submit"
              className="inline-flex items-center justify-center rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-[13px] font-medium text-slate-800 shadow-sm transition hover:bg-slate-50"
            >
              退出登录
            </button>
          </form>
          <Link
            href="/"
            className="inline-flex items-center justify-center rounded-xl bg-indigo-600 px-4 py-2.5 text-[13px] font-semibold text-white shadow-sm transition hover:bg-indigo-700"
          >
            ← 返回用户端
          </Link>
        </div>
      </header>

      <AdminDashboardView data={data} />
    </div>
  );
}
