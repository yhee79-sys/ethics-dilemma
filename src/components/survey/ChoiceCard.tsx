import type { ReactNode } from "react";

type Props = {
  name: string;
  value: string;
  checked: boolean;
  onChange: (value: string) => void;
  children: ReactNode;
  badge?: string;
};

/** 큰 터치 영역의 라디오 카드. 실제 input은 화면에서 숨기고 label 전체를 누를 수 있게 한다. */
export function ChoiceCard({ name, value, checked, onChange, children, badge }: Props) {
  return (
    <label
      className="flex cursor-pointer items-center gap-3 rounded-2xl border-2 border-zinc-200 bg-white p-4 text-lg transition-colors
        hover:border-zinc-400 has-checked:border-indigo-600 has-checked:bg-indigo-50
        has-focus-visible:ring-4 has-focus-visible:ring-indigo-300
        dark:border-zinc-700 dark:bg-zinc-900 dark:hover:border-zinc-500 dark:has-checked:border-indigo-400 dark:has-checked:bg-indigo-950"
    >
      <input
        type="radio"
        name={name}
        value={value}
        checked={checked}
        onChange={() => onChange(value)}
        className="sr-only"
      />
      {badge && (
        <span
          aria-hidden
          className={`flex size-9 shrink-0 items-center justify-center rounded-full text-base font-bold ${
            checked ? "bg-indigo-600 text-white dark:bg-indigo-400 dark:text-zinc-900" : "bg-zinc-100 text-zinc-600 dark:bg-zinc-800 dark:text-zinc-300"
          }`}
        >
          {badge}
        </span>
      )}
      <span className="leading-snug">{children}</span>
    </label>
  );
}
