import Link from "next/link";

export default function Home() {
  return (
    <main className="mx-auto flex min-h-dvh max-w-xl flex-col justify-center gap-8 px-4 py-12">
      <div className="space-y-3">
        <h1 className="text-3xl font-bold">윤리 딜레마 설문</h1>
        <p className="text-lg text-zinc-600 dark:text-zinc-400">
          세 가지 상황에서 여러분이라면 어떤 선택을 할지 알려 주세요. 이름이나 연락처는 묻지 않아요.
        </p>
      </div>
      <div className="flex flex-col gap-3 sm:flex-row">
        <Link href="/survey" className="rounded-xl bg-zinc-900 px-6 py-4 text-center text-lg font-semibold text-white dark:bg-white dark:text-zinc-900">
          설문 참여하기
        </Link>
        <Link href="/stats" className="rounded-xl border border-zinc-300 px-6 py-4 text-center text-lg font-semibold dark:border-zinc-700">
          통계 보기
        </Link>
      </div>
    </main>
  );
}
