import { DilemmaIcon } from "@/components/art/Art";
import type { DilemmaStats } from "@/lib/stats";
import { ChoiceRatioBar } from "./ChoiceRatioBar";
import { KeywordCloud } from "./KeywordCloud";

export function DilemmaStatsCard({ d, index }: { d: DilemmaStats; index: number }) {
  return (
    <article className="space-y-6 rounded-3xl border border-line p-5" aria-labelledby={`dilemma-${d.id}`}>
      <header className="flex items-center gap-3">
        <DilemmaIcon id={d.id} className="size-16 shrink-0" />
        <div className="min-w-0 space-y-1">
          <span className="inline-block rounded-full bg-accent-soft px-3 py-1 text-sm font-display text-accent-ink">
            {d.valueLabel}
          </span>
          <h2 id={`dilemma-${d.id}`} className="font-display text-2xl leading-snug">
            {index + 1}. {d.title}
          </h2>
        </div>
      </header>

      <section className="space-y-3">
        <h3 className="text-lg font-display">선택 비율</h3>
        <ChoiceRatioBar optionA={d.optionA} optionB={d.optionB} a={d.a} b={d.b} />
      </section>

      <section className="space-y-3">
        <h3 className="text-lg font-display">이유에 많이 나온 단어</h3>
        <KeywordCloud clouds={d.clouds} optionA={d.optionA} optionB={d.optionB} />
      </section>
    </article>
  );
}
