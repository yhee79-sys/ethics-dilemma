import { GENDERS, TARGET_GROUPS, type Gender, type TargetGroup } from "@/lib/constants";
import { normalizeReason } from "@/lib/validation";
import type { DraftAnswer, SurveyDilemma } from "@/types/survey";
import { optionText } from "./DilemmaCard";

type Props = {
  group: TargetGroup;
  gender: Gender;
  dilemmas: SurveyDilemma[];
  answers: Record<number, DraftAnswer>;
  easy: boolean;
  onEditProfile: () => void;
  onEditDilemma: (index: number) => void;
};

function EditButton({ onClick, label }: { onClick: () => void; label: string }) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-label={label}
      className="shrink-0 rounded-lg px-3 py-1.5 text-base font-semibold text-indigo-700 hover:bg-indigo-50 dark:text-indigo-300 dark:hover:bg-indigo-950"
    >
      고치기
    </button>
  );
}

export function ReviewStep({ group, gender, dilemmas, answers, easy, onEditProfile, onEditDilemma }: Props) {
  const groupLabel = TARGET_GROUPS.find((g) => g.value === group)?.label;
  const genderLabel = GENDERS.find((g) => g.value === gender)?.label;

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold">{easy ? "내 답을 확인해요" : "응답 확인"}</h2>

      <section className="flex items-center justify-between gap-3 rounded-2xl border border-zinc-200 p-4 dark:border-zinc-800">
        <p className="text-lg">
          {groupLabel} · {genderLabel}
        </p>
        <EditButton onClick={onEditProfile} label="대상과 성별 고치기" />
      </section>

      <ol className="space-y-4">
        {dilemmas.map((d, i) => {
          const a = answers[d.id];
          const reason = normalizeReason(a?.reason);
          return (
            <li key={d.id} className="space-y-2 rounded-2xl border border-zinc-200 p-4 dark:border-zinc-800">
              <div className="flex items-start justify-between gap-3">
                <h3 className="text-lg font-bold">
                  {i + 1}. {d.title}
                </h3>
                <EditButton onClick={() => onEditDilemma(i)} label={`${i + 1}번 질문 고치기`} />
              </div>
              {a?.choice && (
                <p className="text-lg">
                  <span className="mr-2 inline-flex size-7 items-center justify-center rounded-full bg-indigo-600 text-sm font-bold text-white dark:bg-indigo-400 dark:text-zinc-900">
                    {a.choice}
                  </span>
                  {optionText(d, a.choice, easy)}
                </p>
              )}
              <p className="whitespace-pre-wrap text-base text-zinc-600 dark:text-zinc-400">
                {reason}
              </p>
            </li>
          );
        })}
      </ol>
    </div>
  );
}
