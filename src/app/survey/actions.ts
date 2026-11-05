"use server";

import { createServerSupabase } from "@/lib/supabase/server";
import { submissionSchema } from "@/lib/validation";

export type SubmitResult = { ok: true } | { ok: false; error: string };

// DB가 입력값 문제로 거부한 경우의 에러 코드
// 22023: submit_survey 검증 실패, 23514: check 제약(이유 길이), 22P02: 잘못된 enum·숫자, 23503: 없는 문항
const INVALID_INPUT_CODES = new Set(["22023", "23514", "22P02", "23503"]);

const INVALID_MESSAGE = "답이 올바르지 않아요. 페이지를 새로고침한 뒤 다시 시도해 주세요.";
const SERVER_MESSAGE = "제출하지 못했어요. 잠시 후 다시 시도해 주세요.";

/**
 * 설문 제출. 클라이언트 검증과 같은 zod 스키마로 다시 검증한 뒤 submit_survey RPC를 호출한다.
 * 개인정보를 받지 않으므로 IP나 헤더는 읽지도 저장하지도 않는다.
 */
export async function submitSurvey(input: unknown): Promise<SubmitResult> {
  const parsed = submissionSchema.safeParse(input);
  if (!parsed.success) return { ok: false, error: INVALID_MESSAGE };

  const { group, gender, answers } = parsed.data;

  try {
    const { error } = await createServerSupabase().rpc("submit_survey", {
      p_group: group,
      p_gender: gender,
      p_answers: answers,
    });

    if (error) {
      if (error.code && INVALID_INPUT_CODES.has(error.code)) return { ok: false, error: INVALID_MESSAGE };
      console.error("submit_survey failed", error.code, error.message);
      return { ok: false, error: SERVER_MESSAGE };
    }
  } catch (e) {
    console.error("submit_survey threw", e);
    return { ok: false, error: SERVER_MESSAGE };
  }

  return { ok: true };
}
