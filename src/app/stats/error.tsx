"use client";

export default function StatsError({ retry }: { error: unknown; retry: () => void }) {
  return (
    <main className="mx-auto flex w-full max-w-xl flex-1 flex-col justify-center gap-4 px-4 py-12">
      <h1 className="text-2xl font-bold">통계를 불러오지 못했어요</h1>
      <p className="text-lg text-zinc-600 dark:text-zinc-400">잠시 후 다시 시도해 주세요.</p>
      <button
        type="button"
        onClick={() => retry()}
        className="self-start rounded-2xl bg-indigo-600 px-6 py-3 text-lg font-semibold text-white hover:bg-indigo-700"
      >
        다시 시도
      </button>
    </main>
  );
}
