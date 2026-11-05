import { GENDERS, TARGET_GROUPS, type Gender, type TargetGroup } from "@/lib/constants";
import { ChoiceCard } from "./ChoiceCard";

type Props = {
  group: TargetGroup | null;
  gender: Gender | null;
  onGroupChange: (g: TargetGroup) => void;
  onGenderChange: (g: Gender) => void;
};

export function GroupGenderSelect({ group, gender, onGroupChange, onGenderChange }: Props) {
  return (
    <div className="space-y-8">
      <fieldset className="space-y-3">
        <legend className="mb-3 text-xl font-bold">나는 누구인가요?</legend>
        <div className="grid grid-cols-2 gap-3">
          {TARGET_GROUPS.map((g) => (
            <ChoiceCard key={g.value} name="group" value={g.value} checked={group === g.value} onChange={(v) => onGroupChange(v as TargetGroup)}>
              {g.label}
            </ChoiceCard>
          ))}
        </div>
      </fieldset>

      <fieldset className="space-y-3">
        <legend className="mb-3 text-xl font-bold">성별</legend>
        <div className="grid grid-cols-3 gap-3">
          {GENDERS.map((g) => (
            <ChoiceCard key={g.value} name="gender" value={g.value} checked={gender === g.value} onChange={(v) => onGenderChange(v as Gender)}>
              {g.label}
            </ChoiceCard>
          ))}
        </div>
      </fieldset>

      <p className="text-base text-zinc-500 dark:text-zinc-400">이름, 학교, 연락처는 묻지 않아요. 응답은 익명으로 모아서 통계로만 보여 줘요.</p>
    </div>
  );
}
