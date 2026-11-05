import Link from "next/link";
import { HomeArt } from "@/components/art/Art";
import { SITE_NAME, SITE_SUBTITLE } from "@/lib/constants";

export default function Home() {
  return (
    <main className="mx-auto flex min-h-dvh max-w-xl flex-col justify-center gap-8 px-4 py-12">
      <HomeArt className="mx-auto w-full max-w-72" />
      <div className="space-y-4">
        <div className="space-y-1">
          <h1 className="font-display text-4xl leading-tight text-balance">{SITE_NAME}</h1>
          <p className="font-display text-lg text-accent-ink">{SITE_SUBTITLE}</p>
        </div>
        {/* 문장마다 줄을 나눈다. 좁은 화면에서는 각 문장 안에서 자연스럽게 줄바꿈된다 */}
        <div className="space-y-1 text-lg leading-relaxed text-muted">
          <p>세 가지 상황에서 여러분이라면 어떤 선택을 할지 알려 주세요.</p>
          <p>이름이나 연락처는 묻지 않아요.</p>
        </div>
      </div>
      <div className="flex flex-col gap-3 sm:flex-row">
        <Link href="/survey" className="btn-primary px-6 py-4 text-center text-lg">
          설문 참여하기
        </Link>
        <Link href="/stats" className="btn-secondary px-6 py-4 text-center text-lg">
          통계 보기
        </Link>
      </div>
    </main>
  );
}
