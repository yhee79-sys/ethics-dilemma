"use client";

import { useId } from "react";
import { REASON_MAX } from "@/lib/constants";
import { charCount, clampChars } from "@/lib/validation";

type Props = {
  value: string;
  onChange: (value: string) => void;
  onBlur?: () => void;
  error: string | null;
  easy: boolean;
};

export function ReasonInput({ value, onChange, onBlur, error, easy }: Props) {
  const id = useId();
  const count = charCount(value.trim());

  return (
    <div className="space-y-2">
      <label htmlFor={id} className="block text-lg font-semibold">
        {easy ? "왜 그렇게 골랐나요?" : "그렇게 선택한 이유는 무엇인가요?"}{" "}
        <span className="text-base font-normal text-zinc-500 dark:text-zinc-400">(선택)</span>
      </label>
      <textarea
        id={id}
        value={value}
        onChange={(e) => onChange(clampChars(e.target.value, REASON_MAX))}
        onBlur={onBlur}
        rows={4}
        placeholder={easy ? "생각을 자유롭게 써 주세요. 안 써도 괜찮아요." : "자유롭게 적어 주세요. 비워 두어도 됩니다."}
        aria-invalid={error ? true : undefined}
        aria-describedby={`${id}-help`}
        className="w-full resize-y rounded-2xl border-2 border-zinc-200 bg-white p-4 text-lg leading-relaxed outline-none
          focus:border-indigo-600 aria-invalid:border-rose-500
          dark:border-zinc-700 dark:bg-zinc-900 dark:focus:border-indigo-400"
      />
      <div id={`${id}-help`} className="flex justify-between gap-4 text-sm">
        <span className="text-rose-600 dark:text-rose-400" role={error ? "alert" : undefined}>
          {error}
        </span>
        <span className="shrink-0 tabular-nums text-zinc-500 dark:text-zinc-400">
          {count}/{REASON_MAX}
        </span>
      </div>
    </div>
  );
}
