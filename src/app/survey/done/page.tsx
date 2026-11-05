import type { Metadata } from "next";
import Link from "next/link";
import { DoneArt } from "@/components/art/Art";
import { SITE_NAME } from "@/lib/constants";

export const metadata: Metadata = { title: `참여 완료 | ${SITE_NAME}` };

export default function DonePage() {
  return (
    <main className="mx-auto flex w-full max-w-xl flex-1 flex-col justify-center gap-8 px-4 py-12">
      <DoneArt className="mx-auto w-full max-w-60" />
      <div className="space-y-3 text-center">
        <h1 className="font-display text-3xl">참여해 줘서 고마워요!</h1>
        {/* 뜻이 끊기는 곳에서 줄을 나눈다. 좁은 화면에서 한 줄이 넘치면 그 줄 안에서만 띄어쓰기 단위로 줄바꿈된다 */}
        <p className="text-lg leading-relaxed text-muted">
          <span className="block">응답이 저장되었어요.</span>
          <span className="block">다른 사람들은 어떻게 선택했는지</span>
          <span className="block">통계에서 확인해 보세요.</span>
        </p>
      </div>
      <div className="flex flex-col gap-3 sm:flex-row sm:justify-center">
        <Link href="/stats" className="btn-primary px-6 py-4 text-center text-lg">
          통계 보기
        </Link>
        <Link href="/" className="btn-secondary px-6 py-4 text-center text-lg">
          처음으로
        </Link>
      </div>
    </main>
  );
}
