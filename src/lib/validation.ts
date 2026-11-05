import { z } from "zod";
import { GENDERS, REASON_MAX, REASON_MIN, TARGET_GROUPS } from "@/lib/constants";

/** DB char_length와 같은 기준(코드포인트)으로 센다. 이모지가 2글자로 세지는 String.length를 쓰지 않는다. */
export function charCount(text: string): number {
  return [...text].length;
}

/** 코드포인트 기준으로 최대 길이까지 자른다. */
export function clampChars(text: string, max: number): string {
  const chars = [...text];
  return chars.length > max ? chars.slice(0, max).join("") : text;
}

/** 앞뒤 공백 제거. 비어 있으면 null (서술형은 선택 항목) */
export function normalizeReason(text: string | null | undefined): string | null {
  const trimmed = (text ?? "").trim();
  return trimmed === "" ? null : trimmed;
}

/** 서술형 검증. 문제 없으면 null, 있으면 안내 문구 */
export function reasonError(text: string | null | undefined): string | null {
  const reason = normalizeReason(text);
  if (reason === null) return null;
  const n = charCount(reason);
  if (n < REASON_MIN) return `이유를 쓰려면 ${REASON_MIN}자 이상 써 주세요. (비워 둬도 괜찮아요)`;
  if (n > REASON_MAX) return `${REASON_MAX}자까지 쓸 수 있어요.`;
  return null;
}

const values = <T extends readonly { value: string }[]>(items: T) =>
  items.map((i) => i.value) as [T[number]["value"], ...T[number]["value"][]];

/** 제출 데이터 스키마 (클라이언트·서버 공용) */
export const submissionSchema = z.object({
  group: z.enum(values(TARGET_GROUPS)),
  gender: z.enum(values(GENDERS)),
  answers: z
    .array(
      z.object({
        dilemma_id: z.number().int().positive(),
        choice: z.enum(["A", "B"]),
        reason: z
          .string()
          .nullable()
          .transform(normalizeReason)
          .refine((r) => reasonError(r) === null, { message: `이유는 ${REASON_MIN}~${REASON_MAX}자로 써 주세요.` }),
      }),
    )
    .min(1),
});

export type SubmissionInput = z.input<typeof submissionSchema>;
export type Submission = z.output<typeof submissionSchema>;
