"use client";

export default function SurveyError({ retry }: { error: unknown; retry: () => void }) {
  return (
    <main className="mx-auto flex w-full max-w-xl flex-1 flex-col justify-center gap-4 px-4 py-12">
      <h1 className="text-2xl font-display">설문을 불러오지 못했어요</h1>
      <p className="text-lg text-muted">잠시 후 다시 시도해 주세요.</p>
      <button
        type="button"
        onClick={() => retry()}
        className="btn-primary self-start px-6 py-3 text-lg"
      >
        다시 시도
      </button>
    </main>
  );
}
