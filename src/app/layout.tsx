import type { Metadata } from "next";
import { Gowun_Dodum, Jua } from "next/font/google";
import { SITE_NAME } from "@/lib/constants";
import "./globals.css";

// 한글 폰트는 용량이 커서 preload하지 않는다 (next/font가 필요한 글자만 나눠서 받는다)
// 두 폰트 모두 굵기가 400 하나뿐이다. 굵게 보여야 하는 곳은 굵기 대신 주아(font-display)를 쓴다.
const jua = Jua({ variable: "--font-jua", weight: "400", preload: false }); // 제목·버튼·라벨
const gowunDodum = Gowun_Dodum({ variable: "--font-gowun-dodum", weight: "400", preload: false }); // 본문

export const metadata: Metadata = {
  title: SITE_NAME,
  description: "세 가지 고민 상황에서 나라면 어떻게 할지 고르는 익명 설문과 통계",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="ko" className={`${jua.variable} ${gowunDodum.variable} h-full antialiased`}>
      <body className="min-h-full flex flex-col">{children}</body>
    </html>
  );
}
