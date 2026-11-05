import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = { title: "참여 완료 | 윤리 딜레마 설문" };

export default function DonePage() {
  return (
    <main className="mx-auto flex w-full max-w-xl flex-1 flex-col justify-center gap-8 px-4 py-12">
      <div className="space-y-3">
        <h1 className="text-3xl font-bold">참여해 줘서 고마워요!</h1>
        <p className="text-lg text-zinc-600 dark:text-zinc-400">
          응답이 저장되었어요. 다른 사람들은 어떻게 선택했는지 통계에서 확인해 보세요.
        </p>
      </div>
      <div className="flex flex-col gap-3 sm:flex-row">
        <Link href="/stats" className="rounded-2xl bg-indigo-600 px-6 py-4 text-center text-lg font-semibold text-white hover:bg-indigo-700">
          통계 보기
        </Link>
        <Link href="/" className="rounded-2xl border-2 border-zinc-300 px-6 py-4 text-center text-lg font-semibold hover:bg-zinc-100 dark:border-zinc-700 dark:hover:bg-zinc-900">
          처음으로
        </Link>
      </div>
    </main>
  );
}
