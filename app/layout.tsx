import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "HAMS HP Palette",
  description: "메인 홈페이지 레이아웃과 마크다운 블록을 관리하는 편집 화면",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ko" className="h-full antialiased">
      <body className="min-h-full flex flex-col">{children}</body>
    </html>
  );
}
