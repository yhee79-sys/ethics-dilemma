import type { Choice } from "@/lib/constants";

/** 응답 페이지에 보내는 문항. value_label(가치 대립 라벨)은 포함하지 않는다. */
export type SurveyDilemma = {
  id: number;
  title: string;
  scenario: string;
  option_a: string;
  option_b: string;
  scenario_easy: string;
  option_a_easy: string;
  option_b_easy: string;
};

export type DraftAnswer = { choice: Choice | null; reason: string };
