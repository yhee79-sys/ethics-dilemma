import type { Metadata } from "next";
import Link from "next/link";
import { Suspense } from "react";
import { DilemmaStatsCard } from "@/components/stats/DilemmaStatsCard";
import { FilterBar } from "@/components/stats/FilterBar";
import { GENDERS, MIN_SAMPLE, TARGET_GROUPS, type Gender, type TargetGroup } from "@/lib/constants";
import { getStats } from "@/lib/stats";

export const metadata: Metadata = { title: "통계 | 윤리 딜레마 설문" };

type SearchParams = Promise<Record<string, string | string[] | undefined>>;

function pick<T extends string>(value: string | string[] | undefined, allowed: readonly { value: T }[]): T | null {
  const v = Array.isArray(value) ? value[0] : value;
  return allowed.find((a) => a.value === v)?.value ?? null;
}

async function StatsContent({ searchParams }: { searchParams: SearchParams }) {
  const sp = await searchParams;
  const group = pick<TargetGroup>(sp.group, TARGET_GROUPS);
  const gender = pick<Gender>(sp.gender, GENDERS);
  const stats = await getStats(group, gender);

  const filterLabel = [TARGET_GROUPS.find((g) => g.value === group)?.label, GENDERS.find((g) => g.value === gender)?.label]
    .filter(Boolean)
    .join(" · ");

  return (
    <>
      <FilterBar group={group} gender={gender} />

      <dl className="grid grid-cols-2 gap-3">
        <div className="rounded-2xl bg-zinc-100 p-4 dark:bg-zinc-900">
          <dt className="text-sm text-zinc-600 dark:text-zinc-400">전체 응답</dt>
          <dd className="text-3xl font-bold tabular-nums">{stats.total}명</dd>
        </div>
        <div className="rounded-2xl bg-zinc-100 p-4 dark:bg-zinc-900">
          <dt className="text-sm text-zinc-600 dark:text-zinc-400">{filterLabel || "선택한 조건"}</dt>
          <dd className="text-3xl font-bold tabular-nums">{stats.filtered}명</dd>
        </div>
      </dl>

      {stats.enough ? (
        <div className="space-y-6">
          {stats.dilemmas.map((d, i) => (
            <DilemmaStatsCard key={d.id} d={d} index={i} />
          ))}
        </div>
      ) : (
        <div role="status" className="rounded-2xl border-2 border-dashed border-zinc-300 p-8 text-center dark:border-zinc-700">
          <p className="text-xl font-bold">응답이 부족합니다</p>
          <p className="mt-2 text-base text-zinc-600 dark:text-zinc-400">
            응답이 {MIN_SAMPLE}명 이상 모이면 통계를 보여 줘요. 다른 조건을 골라 보세요.
          </p>
        </div>
      )}

      <p className="text-sm text-zinc-500 dark:text-zinc-400">
        통계는 1분마다 새로 계산돼요. 키워드는 두 명 이상이 쓴 단어만 보여 줘요.
      </p>
    </>
  );
}

function StatsSkeleton() {
  return (
    <div className="space-y-6" aria-busy aria-label="통계를 불러오는 중">
      <div className="h-24 animate-pulse rounded-2xl bg-zinc-100 dark:bg-zinc-900" />
      <div className="h-20 animate-pulse rounded-2xl bg-zinc-100 dark:bg-zinc-900" />
      <div className="h-96 animate-pulse rounded-3xl bg-zinc-100 dark:bg-zinc-900" />
    </div>
  );
}

export default function StatsPage({ searchParams }: { searchParams: SearchParams }) {
  return (
    <main className="mx-auto w-full max-w-2xl flex-1 space-y-8 px-4 py-6">
      <div className="space-y-2">
        <Link href="/" className="inline-block text-base text-zinc-500 hover:underline dark:text-zinc-400">
          ← 처음으로
        </Link>
        <h1 className="text-3xl font-bold">설문 통계</h1>
      </div>
      <Suspense fallback={<StatsSkeleton />}>
        <StatsContent searchParams={searchParams} />
      </Suspense>
    </main>
  );
}
