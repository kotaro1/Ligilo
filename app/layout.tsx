import type { Metadata, Viewport } from "next";
import { Noto_Serif_JP, Noto_Serif_SC } from "next/font/google";
import { PwaRegister } from "@/components/PwaRegister";
import { Ridges } from "@/components/Scenery";
import "./globals.css";

// 漢字の字形は中国語（簡体字）のものを使う。CJKはサブセットが無いので preload は切る。
const serifSc = Noto_Serif_SC({
  variable: "--font-serif-sc",
  weight: ["500", "700"],
  preload: false,
  display: "swap",
});
const serifJp = Noto_Serif_JP({
  variable: "--font-serif-jp",
  weight: ["500", "700"],
  preload: false,
  display: "swap",
});

export const metadata: Metadata = {
  title: "Ligilo",
  description: "中国語の単語を暗記するフラッシュカード",
  appleWebApp: { capable: true, statusBarStyle: "default", title: "Ligilo" },
};

export const viewport: Viewport = {
  themeColor: "#2f5d3a",
  width: "device-width",
  initialScale: 1,
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html
      lang="ja"
      className={`${serifSc.variable} ${serifJp.variable} h-full antialiased`}
    >
      <body className="relative flex min-h-full flex-col">
        <PwaRegister />
        <Ridges />
        <div className="relative z-10 flex min-h-screen flex-col">{children}</div>
      </body>
    </html>
  );
}
