"use client";

import type { Ref } from "react";
import { DilemmaIcon } from "@/components/art/Art";
import type { Choice } from "@/lib/constants";
import type { DraftAnswer, SurveyDilemma } from "@/types/survey";
import { ChoiceCard } from "./ChoiceCard";
import { ReasonInput } from "./ReasonInput";

type Props = {
  dilemma: SurveyDilemma;
  easy: boolean;
  answer: DraftAnswer;
  onChange: (answer: DraftAnswer) => void;
  reasonError: string | null;
  onReasonBlur: () => void;
  reasonRef?: Ref<HTMLTextAreaElement>;
};

export function optionText(d: SurveyDilemma, choice: Choice, easy: boolean) {
  if (choice === "A") return easy ? d.option_a_easy : d.option_a;
  return easy ? d.option_b_easy : d.option_b;
}

export function DilemmaCard({ dilemma, easy, answer, onChange, reasonError, onReasonBlur, reasonRef }: Props) {
  return (
    <div className="space-y-6">
      <div className="space-y-3">
        <div className="flex items-center gap-3">
          <DilemmaIcon id={dilemma.id} className="size-16 shrink-0" />
          <h2 className="font-display text-2xl leading-snug">{dilemma.title}</h2>
        </div>
        <p className="rounded-2xl bg-surface p-5 text-lg leading-relaxed">
          {easy ? dilemma.scenario_easy : dilemma.scenario}
        </p>
      </div>

      <fieldset className="space-y-3">
        <legend className="mb-3 text-lg font-display">{easy ? "나라면 어떻게 할까요?" : "당신의 선택은?"}</legend>
        {(["A", "B"] as const).map((c) => (
          <ChoiceCard
            key={c}
            name={`dilemma-${dilemma.id}`}
            value={c}
            badge={c}
            checked={answer.choice === c}
            onChange={() => onChange({ ...answer, choice: c })}
          >
            {optionText(dilemma, c, easy)}
          </ChoiceCard>
        ))}
      </fieldset>

      <ReasonInput
        value={answer.reason}
        onChange={(reason) => onChange({ ...answer, reason })}
        onBlur={onReasonBlur}
        error={reasonError}
        easy={easy}
        inputRef={reasonRef}
      />
    </div>
  );
}
