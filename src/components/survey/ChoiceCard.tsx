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
      className="flex cursor-pointer items-center gap-3 rounded-2xl border-2 border-line bg-background p-4 text-lg transition-colors
        hover:border-line-strong has-checked:border-accent has-checked:bg-accent-soft
        has-focus-visible:ring-4 has-focus-visible:ring-accent/40"
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
          className={`flex size-9 shrink-0 items-center justify-center rounded-full text-base font-display ${
            checked ? "bg-accent text-on-accent" : "bg-surface text-muted"
          }`}
        >
          {badge}
        </span>
      )}
      <span className="leading-snug">{children}</span>
    </label>
  );
}
