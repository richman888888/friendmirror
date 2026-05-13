"use server";

import { createHash, timingSafeEqual } from "crypto";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";

import {
  FM_ADMIN_SESSION_COOKIE,
  adminSessionCookieOptions,
  createAdminSessionToken,
  isAdminPasswordConfigured,
} from "@/lib/server/admin-auth";

function comparePassword(input: string, expected: string): boolean {
  const a = createHash("sha256").update(input, "utf8").digest();
  const b = createHash("sha256").update(expected, "utf8").digest();
  return a.length === b.length && timingSafeEqual(a, b);
}

export async function adminLoginAction(
  _prev: { error?: string } | null,
  formData: FormData,
): Promise<{ error?: string } | null> {
  if (!isAdminPasswordConfigured()) {
    return {
      error: "未配置环境变量 ADMIN_PASSWORD，无法登录。请在服务端环境中设置后再试。",
    };
  }
  const expected = process.env.ADMIN_PASSWORD as string;
  const password = String(formData.get("password") ?? "");
  if (!comparePassword(password, expected)) {
    return { error: "密码错误，请重试。" };
  }
  const jar = await cookies();
  jar.set(
    FM_ADMIN_SESSION_COOKIE,
    createAdminSessionToken(),
    adminSessionCookieOptions(),
  );
  redirect("/admin");
}

export async function adminLogoutAction() {
  const jar = await cookies();
  jar.delete({ name: FM_ADMIN_SESSION_COOKIE, path: "/admin" });
  redirect("/admin");
}
