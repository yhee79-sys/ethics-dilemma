import type { DilemmaStats } from "@/lib/stats";
import { ChoiceRatioBar } from "./ChoiceRatioBar";
import { KeywordCloud } from "./KeywordCloud";

export function DilemmaStatsCard({ d, index }: { d: DilemmaStats; index: number }) {
  return (
    <article className="space-y-6 rounded-3xl border border-zinc-200 p-5 dark:border-zinc-800" aria-labelledby={`dilemma-${d.id}`}>
      <header className="space-y-2">
        <span className="inline-block rounded-full bg-zinc-100 px-3 py-1 text-sm font-semibold text-zinc-700 dark:bg-zinc-800 dark:text-zinc-300">
          {d.valueLabel}
        </span>
        <h2 id={`dilemma-${d.id}`} className="text-2xl font-bold">
          {index + 1}. {d.title}
        </h2>
      </header>

      <section className="space-y-3">
        <h3 className="text-lg font-semibold">선택 비율</h3>
        <ChoiceRatioBar optionA={d.optionA} optionB={d.optionB} a={d.a} b={d.b} />
      </section>

      <section className="space-y-3">
        <h3 className="text-lg font-semibold">이유에 많이 나온 단어</h3>
        <KeywordCloud clouds={d.clouds} optionA={d.optionA} optionB={d.optionB} />
      </section>
    </article>
  );
}
