import type { Metadata } from "next";
import "./globals.css";
import { LanguageSelect } from "./components/LanguageSelect";
import { I18nProvider } from "./utils/i18n";

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
      <body className="min-h-full flex flex-col">
        <I18nProvider>
          <div className="px-6 pt-6">
            <div className="mx-auto flex w-full max-w-[1880px] justify-end">
              <LanguageSelect />
            </div>
          </div>
          <div className="flex-1">
            {children}
          </div>
        </I18nProvider>
      </body>
    </html>
  );
}
