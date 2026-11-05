"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useRef, useState, useSyncExternalStore } from "react";
import { submitSurvey } from "@/app/survey/actions";
import { SITE_NAME, type Gender, type TargetGroup } from "@/lib/constants";
import { hasSubmitted, markSubmitted } from "@/lib/submitted-flag";
import { reasonError, type SubmissionInput } from "@/lib/validation";
import type { DraftAnswer, SurveyDilemma } from "@/types/survey";
import { DilemmaCard } from "./DilemmaCard";
import { GroupGenderSelect } from "./GroupGenderSelect";
import { ProgressBar } from "./ProgressBar";
import { ReviewStep } from "./ReviewStep";

type Props = { dilemmas: SurveyDilemma[] };

const noopSubscribe = () => () => {};

const EMPTY: DraftAnswer = { choice: null, reason: "" };

// "다음"은 disabled 대신 aria-disabled를 쓴다. disabled면 Tab 순서에서 빠져서 키보드·화면 낭독기 사용자가 이유를 알 수 없다.
// 버튼 모양(비활성 포함)은 globals.css의 btn-primary / btn-secondary
const primaryBtn = "btn-primary flex-1 px-6 py-4 text-lg";
const secondaryBtn = "btn-secondary px-6 py-4 text-lg";

export function SurveyForm({ dilemmas }: Props) {
  const router = useRouter();
  // 서버 렌더링에서는 false, 브라우저에서는 localStorage 값을 읽는다 (hydration 불일치 없음)
  const submittedBefore = useSyncExternalStore(noopSubscribe, hasSubmitted, () => false);
  const [noticeDismissed, setNoticeDismissed] = useState(false);
  const showNotice = submittedBefore && !noticeDismissed;
  // step: 0 = 대상·성별, 1..n = 딜레마, n+1 = 확인
  const [step, setStep] = useState(0);
  const [group, setGroup] = useState<TargetGroup | null>(null);
  const [gender, setGender] = useState<Gender | null>(null);
  const [answers, setAnswers] = useState<Record<number, DraftAnswer>>({});
  const [showReasonError, setShowReasonError] = useState(false);
  const [showMissing, setShowMissing] = useState(false);
  const [editingFromReview, setEditingFromReview] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const headingRef = useRef<HTMLDivElement>(null);
  const reasonRef = useRef<HTMLTextAreaElement>(null);

  const total = dilemmas.length;
  const reviewStep = total + 1;
  const easy = group === "elementary";
  const dilemma = step >= 1 && step <= total ? dilemmas[step - 1] : null;
  const answer = dilemma ? (answers[dilemma.id] ?? EMPTY) : EMPTY;
  const currentReasonError = dilemma ? reasonError(answer.reason) : null;
  const dirty = group !== null || gender !== null || Object.keys(answers).length > 0;
  const canNext = step === 0 ? group !== null && gender !== null : dilemma ? answer.choice !== null : false;
  const missingMessage = showMissing && !canNext ? (step === 0 ? "대상과 성별을 골라 주세요." : "A나 B 중 하나를 골라 주세요.") : "";

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
    setShowMissing(false);
    setStep(next);
  }

  function handleNext() {
    if (!canNext) {
      setShowMissing(true);
      return;
    }
    if (dilemma && currentReasonError) {
      setShowReasonError(true);
      reasonRef.current?.focus(); // 고칠 곳으로 바로 이동
      return;
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
    if (!group || !gender || submitting) return;
    setSubmitting(true);
    setSubmitError(null);

    const payload: SubmissionInput = {
      group,
      gender,
      answers: dilemmas.map((d) => ({
        dilemma_id: d.id,
        choice: answers[d.id]?.choice ?? "A", // 확인 화면까지 왔다면 모든 문항에 선택이 있다
        reason: answers[d.id]?.reason ?? "",
      })),
    };

    try {
      const result = await submitSurvey(payload);
      if (result.ok) {
        markSubmitted();
        router.replace("/survey/done"); // 뒤로 가기로 다시 확인 화면에 오지 않도록 replace
        return;
      }
      setSubmitError(result.error);
    } catch {
      setSubmitError("인터넷 연결을 확인한 뒤 다시 시도해 주세요.");
    }
    setSubmitting(false);
  }

  const nextLabel = editingFromReview ? "확인 화면으로" : step === total ? "다 했어요" : "다음";

  return (
    <div className="space-y-8">
      <div ref={headingRef} tabIndex={-1} className="outline-none">
        {dilemma ? (
          <ProgressBar current={step} total={total} />
        ) : (
          <h1 className="font-display text-3xl">{SITE_NAME}</h1>
        )}
      </div>

      {step === 0 && showNotice && (
        <div role="status" className="space-y-3 rounded-2xl border-2 border-amber-300 bg-amber-50 p-4 dark:border-amber-700 dark:bg-amber-950">
          <p className="text-lg font-display">이 기기에서 이미 설문에 참여했어요.</p>
          <p className="text-base text-muted">
            <span className="block">다른 사람이 이 기기로 참여하는 거라면 새로 시작해 주세요.</span>
            <span className="block">같은 사람이 여러 번 참여하면 통계가 정확하지 않아요.</span>
          </p>
          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              onClick={() => setNoticeDismissed(true)}
              className="rounded-xl bg-amber-600 px-4 py-2 text-base font-display text-white hover:bg-amber-700"
            >
              새로 참여하기
            </button>
            <Link href="/stats" className="rounded-xl border border-amber-400 px-4 py-2 text-base font-display hover:bg-amber-100 dark:border-amber-700 dark:hover:bg-amber-900">
              통계 보기
            </Link>
          </div>
        </div>
      )}

      {step === 0 && !showNotice && (
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
          reasonRef={reasonRef}
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

      {!(step === 0 && showNotice) && (
        <div className="sticky bottom-0 -mx-4 space-y-2 border-t border-line bg-background/95 px-4 py-4 backdrop-blur">
          {/* 알림 영역은 항상 두고 내용만 바꾼다. 비어 있을 때는 자리를 차지하지 않게 sr-only */}
          <p role="alert" className="text-center text-base font-display text-danger empty:sr-only">
            {missingMessage}
          </p>
          <div className="flex gap-3">
            {step > 0 && !editingFromReview && (
              <button type="button" className={secondaryBtn} onClick={() => goTo(step - 1)} disabled={submitting}>
                이전
              </button>
            )}
            {step < reviewStep ? (
              <button type="button" className={primaryBtn} onClick={handleNext} aria-disabled={!canNext}>
                {nextLabel}
              </button>
            ) : (
              <button type="button" className={primaryBtn} onClick={handleSubmit} disabled={submitting} aria-busy={submitting}>
                {submitting ? "보내는 중…" : "제출하기"}
              </button>
            )}
          </div>
        </div>
      )}

      {submitError && (
        <p role="alert" className="text-center text-base text-danger">
          {submitError}
        </p>
      )}
    </div>
  );
}
