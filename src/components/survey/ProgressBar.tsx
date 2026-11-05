type Props = { current: number; total: number };

export function ProgressBar({ current, total }: Props) {
  const pct = Math.round((current / total) * 100);
  return (
    <div className="space-y-2">
      <div className="text-base font-semibold text-indigo-700 dark:text-indigo-300">
        질문 {current} / {total}
      </div>
      <div
        role="progressbar"
        aria-valuemin={0}
        aria-valuemax={total}
        aria-valuenow={current}
        aria-label="설문 진행도"
        className="h-2 overflow-hidden rounded-full bg-zinc-200 dark:bg-zinc-800"
      >
        <div className="h-full rounded-full bg-indigo-600 transition-[width] dark:bg-indigo-400" style={{ width: `${pct}%` }} />
      </div>
    </div>
  );
}
