"use client";

import { useActionState } from "react";

import { adminLoginAction } from "@/app/admin/actions";

export function AdminLoginForm() {
  const [state, formAction, pending] = useActionState(adminLoginAction, null);

  return (
    <form action={formAction} className="mt-6 space-y-4">
      <div>
        <label
          htmlFor="admin-password"
          className="block text-[13px] font-medium text-slate-700"
        >
          管理员密码
        </label>
        <input
          id="admin-password"
          name="password"
          type="password"
          autoComplete="current-password"
          required
          className="mt-1.5 w-full rounded-xl border border-slate-200 bg-white px-3.5 py-2.5 text-[15px] text-slate-900 shadow-sm outline-none ring-slate-200 transition placeholder:text-slate-400 focus:border-indigo-400 focus:ring-2 focus:ring-indigo-100"
          placeholder="输入环境变量 ADMIN_PASSWORD"
        />
      </div>
      {state?.error ? (
        <p
          className="rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-[13px] text-red-800"
          role="alert"
        >
          {state.error}
        </p>
      ) : null}
      <button
        type="submit"
        disabled={pending}
        className="flex w-full items-center justify-center rounded-xl bg-indigo-600 px-4 py-2.5 text-[14px] font-semibold text-white shadow-sm transition hover:bg-indigo-700 disabled:cursor-not-allowed disabled:opacity-60"
      >
        {pending ? "验证中…" : "进入看板"}
      </button>
      <p className="text-center text-[11px] leading-relaxed text-slate-500">
        密码仅保存在服务端环境变量，不会出现在前端代码中。
      </p>
    </form>
  );
}
