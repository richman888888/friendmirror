import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

import { normalizeShareSource } from "@/lib/friend-mirror/share-source";
import {
  FM_REF_SHARE_COOKIE,
  FM_REF_SHARE_MAX_AGE_SEC,
  FM_SHARE_SOURCE_COOKIE,
  FM_SHARE_SOURCE_MAX_AGE_SEC,
} from "@/lib/referral-cookie";

export function middleware(request: NextRequest) {
  const m = /^\/p\/([^/]+)/.exec(request.nextUrl.pathname);
  if (!m) return NextResponse.next();

  let code = m[1];
  try {
    code = decodeURIComponent(code);
  } catch {
    /* keep raw */
  }
  code = code.trim().slice(0, 128);
  if (!code) return NextResponse.next();

  const res = NextResponse.next();
  res.cookies.set(FM_REF_SHARE_COOKIE, code, {
    path: "/",
    maxAge: FM_REF_SHARE_MAX_AGE_SEC,
    sameSite: "lax",
    httpOnly: true,
  });

  const src = normalizeShareSource(
    request.nextUrl.searchParams.get("source"),
  );
  if (src) {
    res.cookies.set(FM_SHARE_SOURCE_COOKIE, src, {
      path: "/",
      maxAge: FM_SHARE_SOURCE_MAX_AGE_SEC,
      sameSite: "lax",
      httpOnly: true,
    });
  }

  return res;
}

export const config = {
  matcher: "/p/:path*",
};
