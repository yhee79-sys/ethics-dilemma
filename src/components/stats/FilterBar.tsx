import Link from "next/link";
import { GENDERS, TARGET_GROUPS, type Gender, type TargetGroup } from "@/lib/constants";

type Props = { group: TargetGroup | null; gender: Gender | null };

function href(group: TargetGroup | null, gender: Gender | null) {
  const query: Record<string, string> = {};
  if (group) query.group = group;
  if (gender) query.gender = gender;
  return { pathname: "/stats", query };
}

function Segment({ label, options }: { label: string; options: { key: string; text: string; href: ReturnType<typeof href>; active: boolean }[] }) {
  return (
    <nav aria-label={label} className="space-y-2">
      <div className="text-sm font-display text-muted">{label}</div>
      <div className="flex flex-wrap gap-2">
        {options.map((o) => (
          <Link
            key={o.key}
            href={o.href}
            scroll={false}
            aria-current={o.active ? "page" : undefined}
            className="rounded-full border-2 border-line px-4 py-2 text-base font-display transition-colors hover:border-line-strong
              aria-[current=page]:border-accent aria-[current=page]:bg-accent aria-[current=page]:text-on-accent"
          >
            {o.text}
          </Link>
        ))}
      </div>
    </nav>
  );
}

/** 대상·성별 필터. URL 쿼리(?group=&gender=)로 동작하므로 링크를 공유할 수 있고 JS 없이도 동작한다. */
export function FilterBar({ group, gender }: Props) {
  return (
    <div className="space-y-4">
      <Segment
        label="대상"
        options={[
          { key: "all", text: "전체", href: href(null, gender), active: group === null },
          ...TARGET_GROUPS.map((g) => ({ key: g.value, text: g.label, href: href(g.value, gender), active: group === g.value })),
        ]}
      />
      <Segment
        label="성별"
        options={[
          { key: "all", text: "전체", href: href(group, null), active: gender === null },
          ...GENDERS.map((g) => ({ key: g.value, text: g.label, href: href(group, g.value), active: gender === g.value })),
        ]}
      />
    </div>
  );
}
