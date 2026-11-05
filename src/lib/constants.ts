export const TARGET_GROUPS = [
  { value: "elementary", label: "초등학생" },
  { value: "middle", label: "중학생" },
  { value: "high", label: "고등학생" },
  { value: "adult", label: "성인" },
] as const;

export const GENDERS = [
  { value: "male", label: "남" },
  { value: "female", label: "여" },
  { value: "undisclosed", label: "응답하지 않음" },
] as const;

export type TargetGroup = (typeof TARGET_GROUPS)[number]["value"];
export type Gender = (typeof GENDERS)[number]["value"];
export type Choice = "A" | "B";

export const REASON_MIN = 5;
export const REASON_MAX = 300;
/** 통계 표시 최소 표본 수 (미만이면 "응답이 부족합니다") */
export const MIN_SAMPLE = 5;
