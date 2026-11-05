"use client";

import { useId, type Ref } from "react";
import { REASON_MAX } from "@/lib/constants";
import { charCount, clampChars } from "@/lib/validation";

type Props = {
  value: string;
  onChange: (value: string) => void;
  onBlur?: () => void;
  error: string | null;
  easy: boolean;
  inputRef?: Ref<HTMLTextAreaElement>;
};

export function ReasonInput({ value, onChange, onBlur, error, easy, inputRef }: Props) {
  const id = useId();
  const count = charCount(value.trim());

  return (
    <div className="space-y-2">
      <label htmlFor={id} className="block text-lg font-display">
        {easy ? "왜 그렇게 골랐나요?" : "그렇게 선택한 이유는 무엇인가요?"}
      </label>
      <textarea
        ref={inputRef}
        id={id}
        value={value}
        onChange={(e) => onChange(clampChars(e.target.value, REASON_MAX))}
        onBlur={onBlur}
        rows={4}
        required
        aria-required
        placeholder={easy ? "내 생각을 5자 이상 써 주세요." : "선택한 이유를 5자 이상 적어 주세요."}
        aria-invalid={error ? true : undefined}
        aria-describedby={`${id}-help`}
        className="w-full resize-y rounded-2xl border-2 border-line-strong bg-background p-4 text-lg leading-relaxed outline-none
          focus:border-accent aria-invalid:border-danger"
      />
      <div id={`${id}-help`} className="flex justify-between gap-4 text-sm">
        {/* 알림 영역은 항상 두고 내용만 바꾼다 (오류와 함께 role을 붙이면 읽지 않는 화면 낭독기가 있다) */}
        <span className="text-danger" role="alert">
          {error}
        </span>
        <span className="shrink-0 tabular-nums text-muted">
          {count}/{REASON_MAX}
        </span>
      </div>
    </div>
  );
}
