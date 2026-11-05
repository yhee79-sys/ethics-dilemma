"use client";

import { useEffect, useRef, useState } from "react";
import type { Gender, TargetGroup } from "@/lib/constants";
import { reasonError, type SubmissionInput } from "@/lib/validation";
import type { DraftAnswer, SurveyDilemma } from "@/types/survey";
import { DilemmaCard } from "./DilemmaCard";
import { GroupGenderSelect } from "./GroupGenderSelect";
import { ProgressBar } from "./ProgressBar";
import { ReviewStep } from "./ReviewStep";

type Props = {
  dilemmas: SurveyDilemma[];
  /** 4단계에서 Server Action을 연결한다. 없으면 제출 버튼이 비활성화된다. */
  onSubmit?: (data: SubmissionInput) => Promise<void>;
};

const EMPTY: DraftAnswer = { choice: null, reason: "" };

const primaryBtn =
  "flex-1 rounded-2xl bg-indigo-600 px-6 py-4 text-lg font-semibold text-white transition-colors hover:bg-indigo-700 disabled:cursor-not-allowed disabled:bg-zinc-300 disabled:text-zinc-500 dark:bg-indigo-600 dark:hover:bg-indigo-500 dark:disabled:bg-zinc-800 dark:disabled:text-zinc-500";
const secondaryBtn =
  "rounded-2xl border-2 border-zinc-300 px-6 py-4 text-lg font-semibold transition-colors hover:bg-zinc-100 dark:border-zinc-700 dark:hover:bg-zinc-900";

export function SurveyForm({ dilemmas, onSubmit }: Props) {
  // step: 0 = 대상·성별, 1..n = 딜레마, n+1 = 확인
  const [step, setStep] = useState(0);
  const [group, setGroup] = useState<TargetGroup | null>(null);
  const [gender, setGender] = useState<Gender | null>(null);
  const [answers, setAnswers] = useState<Record<number, DraftAnswer>>({});
  const [showReasonError, setShowReasonError] = useState(false);
  const [editingFromReview, setEditingFromReview] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const headingRef = useRef<HTMLDivElement>(null);

  const total = dilemmas.length;
  const reviewStep = total + 1;
  const easy = group === "elementary";
  const dilemma = step >= 1 && step <= total ? dilemmas[step - 1] : null;
  const answer = dilemma ? (answers[dilemma.id] ?? EMPTY) : EMPTY;
  const currentReasonError = dilemma ? reasonError(answer.reason) : null;
  const dirty = group !== null || gender !== null || Object.keys(answers).length > 0;

  // 단계가 바뀌면 맨 위로 이동하고, 화면 낭독기 사용자를 위해 포커스를 옮긴다
  useEffect(() => {
    window.scrollTo({ top: 0 });
    headingRef.current?.focus({ preventScroll: true });
  }, [step]);

  // 작성 중에 페이지를 벗어나려 하면 확인
  useEffect(() => {
    if (!dirty || submitting) return;
    const handler = (e: BeforeUnloadEvent) => e.preventDefault();
    window.addEventListener("beforeunload", handler);
    return () => window.removeEventListener("beforeunload", handler);
  }, [dirty, submitting]);

  function goTo(next: number) {
    setShowReasonError(false);
    setStep(next);
  }

  function handleNext() {
    if (dilemma) {
      if (!answer.choice) return;
      if (currentReasonError) {
        setShowReasonError(true);
        return;
      }
    }
    if (editingFromReview) {
      setEditingFromReview(false);
      goTo(reviewStep);
      return;
    }
    goTo(step + 1);
  }

  function editFromReview(target: number) {
    setEditingFromReview(true);
    goTo(target);
  }

  async function handleSubmit() {
    if (!onSubmit || !group || !gender) return;
    setSubmitting(true);
    setSubmitError(null);
    try {
      await onSubmit({
        group,
        gender,
        answers: dilemmas.map((d) => ({
          dilemma_id: d.id,
          choice: answers[d.id]?.choice ?? "A",
          reason: answers[d.id]?.reason ?? null,
        })),
      });
    } catch {
      setSubmitError("제출하지 못했어요. 잠시 후 다시 시도해 주세요.");
      setSubmitting(false);
    }
  }

  const canNext = step === 0 ? group !== null && gender !== null : dilemma ? answer.choice !== null : false;
  const nextLabel = editingFromReview ? "확인 화면으로" : step === total ? "다 했어요" : "다음";

  return (
    <div className="space-y-8">
      <div ref={headingRef} tabIndex={-1} className="outline-none">
        {dilemma ? (
          <ProgressBar current={step} total={total} />
        ) : (
          <h1 className="text-3xl font-bold">윤리 딜레마 설문</h1>
        )}
      </div>

      {step === 0 && (
        <GroupGenderSelect group={group} gender={gender} onGroupChange={setGroup} onGenderChange={setGender} />
      )}

      {dilemma && (
        <DilemmaCard
          key={dilemma.id}
          dilemma={dilemma}
          easy={easy}
          answer={answer}
          onChange={(a) => setAnswers((prev) => ({ ...prev, [dilemma.id]: a }))}
          reasonError={showReasonError ? currentReasonError : null}
          onReasonBlur={() => setShowReasonError(true)}
        />
      )}

      {step === reviewStep && group && gender && (
        <ReviewStep
          group={group}
          gender={gender}
          dilemmas={dilemmas}
          answers={answers}
          easy={easy}
          onEditProfile={() => editFromReview(0)}
          onEditDilemma={(i) => editFromReview(i + 1)}
        />
      )}

      <div className="sticky bottom-0 -mx-4 flex gap-3 border-t border-zinc-200 bg-background/95 px-4 py-4 backdrop-blur dark:border-zinc-800">
        {step > 0 && !editingFromReview && (
          <button type="button" className={secondaryBtn} onClick={() => goTo(step - 1)} disabled={submitting}>
            이전
          </button>
        )}
        {step < reviewStep ? (
          <button type="button" className={primaryBtn} onClick={handleNext} disabled={!canNext}>
            {nextLabel}
          </button>
        ) : (
          <button type="button" className={primaryBtn} onClick={handleSubmit} disabled={!onSubmit || submitting}>
            {submitting ? "보내는 중…" : onSubmit ? "제출하기" : "제출 기능 준비 중"}
          </button>
        )}
      </div>

      {submitError && (
        <p role="alert" className="text-center text-base text-rose-600 dark:text-rose-400">
          {submitError}
        </p>
      )}
    </div>
  );
}
