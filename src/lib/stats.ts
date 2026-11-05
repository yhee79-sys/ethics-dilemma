import "server-only";
import { cacheLife } from "next/cache";
import { MIN_SAMPLE, type Choice, type Gender, type TargetGroup } from "@/lib/constants";
import { countKeywords, type Keyword } from "@/lib/keywords";
import { createServerSupabase } from "@/lib/supabase/server";

export type CloudBucket = "all" | Choice;

/** 워드클라우드 한 칸. 표본이 MIN_SAMPLE 미만이면 keywords는 null (개인 추정 방지) */
export type Cloud = { n: number; keywords: Keyword[] | null };

export type DilemmaStats = {
  id: number;
  title: string;
  valueLabel: string;
  optionA: string;
  optionB: string;
  a: number;
  b: number;
  clouds: Record<CloudBucket, Cloud>;
};

export type StatsResult = {
  /** 필터 없이 전체 응답자 수 */
  total: number;
  /** 필터 조건의 응답자 수 */
  filtered: number;
  /** filtered >= MIN_SAMPLE 일 때만 true. false면 dilemmas의 수치와 키워드는 비어 있다 */
  enough: boolean;
  dilemmas: DilemmaStats[];
};

/** PostgREST max-rows(기본 1000) 때문에 서술형은 페이지 단위로 읽는다 */
export const REASON_PAGE_SIZE = 1000;

type Filters = { p_group?: TargetGroup; p_gender?: Gender };

async function fetchAllReasons(filters: Filters, pageSize = REASON_PAGE_SIZE) {
  const sb = createServerSupabase();
  const rows: { dilemma_id: number; choice: Choice; reason: string }[] = [];
  for (let from = 0; ; from += pageSize) {
    const { data, error } = await sb.rpc("get_reasons", filters).range(from, from + pageSize - 1);
    if (error) throw new Error(`서술형을 불러오지 못했습니다: ${error.message}`);
    rows.push(...data);
    if (data.length < pageSize) return rows;
  }
}

function toCloud(texts: string[]): Cloud {
  return { n: texts.length, keywords: texts.length >= MIN_SAMPLE ? countKeywords(texts) : null };
}

export async function getStats(group: TargetGroup | null, gender: Gender | null): Promise<StatsResult> {
  "use cache";
  cacheLife("minutes"); // 1분마다 갱신

  const sb = createServerSupabase();
  const filters: Filters = { p_group: group ?? undefined, p_gender: gender ?? undefined };
  const filtered = group !== null || gender !== null;

  const [dilemmasRes, statsRes, totalRes] = await Promise.all([
    sb.from("dilemmas").select("id, title, value_label, option_a, option_b").eq("is_active", true).order("sort_order"),
    sb.rpc("get_choice_stats", filters),
    filtered ? sb.rpc("get_choice_stats") : null,
  ]);
  for (const r of [dilemmasRes, statsRes, totalRes]) {
    if (r?.error) throw new Error(`통계를 불러오지 못했습니다: ${r.error.message}`);
  }

  const counts = new Map((statsRes.data ?? []).map((s) => [s.dilemma_id, s]));
  const respondents = (rows: { a_count: number; b_count: number }[] | null) =>
    rows && rows.length > 0 ? rows[0].a_count + rows[0].b_count : 0; // 모든 응답자가 모든 문항에 답한다

  const filteredCount = respondents(statsRes.data);
  const total = filtered ? respondents(totalRes?.data ?? null) : filteredCount;
  const enough = filteredCount >= MIN_SAMPLE;

  const reasons = enough ? await fetchAllReasons(filters) : [];

  const dilemmas = (dilemmasRes.data ?? []).map((d): DilemmaStats => {
    const c = counts.get(d.id);
    const mine = reasons.filter((r) => r.dilemma_id === d.id);
    const textsA = mine.filter((r) => r.choice === "A").map((r) => r.reason);
    const textsB = mine.filter((r) => r.choice === "B").map((r) => r.reason);
    return {
      id: d.id,
      title: d.title,
      valueLabel: d.value_label,
      optionA: d.option_a,
      optionB: d.option_b,
      a: enough ? (c?.a_count ?? 0) : 0,
      b: enough ? (c?.b_count ?? 0) : 0,
      clouds: enough
        ? { all: toCloud([...textsA, ...textsB]), A: toCloud(textsA), B: toCloud(textsB) }
        : { all: { n: 0, keywords: null }, A: { n: 0, keywords: null }, B: { n: 0, keywords: null } },
    };
  });

  return { total, filtered: filteredCount, enough, dilemmas };
}
