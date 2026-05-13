import type { Metadata, Viewport } from "next";
import { Noto_Sans_SC } from "next/font/google";

import { PostHogProviderWrapper } from "@/components/providers/PostHogProvider";
import { I18nProvider } from "@/src/i18n/I18nProvider";

import "./globals.css";

const notoSansSc = Noto_Sans_SC({
  weight: ["400", "500", "600", "700"],
  subsets: ["latin", "vietnamese"],
  variable: "--font-noto-sc",
  display: "swap",
});

export const metadata: Metadata = {
  title: "FriendMirror · 朋友眼中的你",
  description: "邀请好友匿名评价你，看看你在朋友眼里最像什么。",
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  themeColor: "#0068ff",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="zh-CN" className={`${notoSansSc.variable} h-full antialiased`}>
      <body className="min-h-full bg-[#e8eef5] font-sans text-[#1a1a1a]">
        <PostHogProviderWrapper>
          <I18nProvider>{children}</I18nProvider>
        </PostHogProviderWrapper>
      </body>
    </html>
  );
}
