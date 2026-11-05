type Props = { optionA: string; optionB: string; a: number; b: number };

function pct(n: number, total: number) {
  return total === 0 ? 0 : Math.round((n / total) * 100);
}

/**
 * A/B 비율 100% 가로 막대.
 * 범례 겸 직접 라벨(선택지 문구 + 비율 + 인원)을 막대 위에 두어 색만으로 구분하지 않게 한다.
 */
export function ChoiceRatioBar({ optionA, optionB, a, b }: Props) {
  const total = a + b;
  const pa = pct(a, total);
  const pb = total === 0 ? 0 : 100 - pa;

  const rows = [
    { key: "A", text: optionA, n: a, p: pa, swatch: "bg-choice-a" },
    { key: "B", text: optionB, n: b, p: pb, swatch: "bg-choice-b" },
  ];

  return (
    <figure className="space-y-3">
      <figcaption className="sr-only">
        A {optionA} {pa}% ({a}명), B {optionB} {pb}% ({b}명)
      </figcaption>

      <ul className="space-y-2" aria-hidden>
        {rows.map((r) => (
          <li key={r.key} className="flex items-start gap-3">
            <span className={`mt-1 inline-flex size-6 shrink-0 items-center justify-center rounded-full text-xs font-bold text-white ${r.swatch}`}>
              {r.key}
            </span>
            <span className="flex-1 text-base leading-snug">{r.text}</span>
            <span className="shrink-0 text-right tabular-nums">
              <span className="text-xl font-bold">{r.p}%</span>
              <span className="ml-1 text-sm text-zinc-500 dark:text-zinc-400">{r.n}명</span>
            </span>
          </li>
        ))}
      </ul>

      <div className="flex h-4 w-full gap-0.5 overflow-hidden rounded bg-zinc-100 dark:bg-zinc-800" aria-hidden>
        {pa > 0 && <div className="h-full rounded bg-choice-a" style={{ width: `${pa}%` }} title={`A ${pa}% (${a}명)`} />}
        {pb > 0 && <div className="h-full rounded bg-choice-b" style={{ width: `${pb}%` }} title={`B ${pb}% (${b}명)`} />}
      </div>
    </figure>
  );
}
