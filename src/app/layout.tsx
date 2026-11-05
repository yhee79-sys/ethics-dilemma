import type { Metadata } from "next";
import { Noto_Sans_KR } from "next/font/google";
import "./globals.css";

// 한글 폰트는 용량이 커서 preload하지 않는다 (next/font가 필요한 글자만 나눠서 받는다)
const notoSansKr = Noto_Sans_KR({
  variable: "--font-noto-sans-kr",
  weight: ["400", "600", "700"],
  preload: false,
});

export const metadata: Metadata = {
  title: "윤리 딜레마 설문",
  description: "익명 윤리 딜레마 설문과 통계",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="ko" className={`${notoSansKr.variable} h-full antialiased`}>
      <body className="min-h-full flex flex-col">{children}</body>
    </html>
  );
}
