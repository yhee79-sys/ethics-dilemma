import "server-only";
import { cacheLife } from "next/cache";
import { createServerSupabase } from "@/lib/supabase/server";
import type { SurveyDilemma } from "@/types/survey";

// value_label(가치 대립 라벨)은 응답 페이지에 노출하지 않으므로 아예 조회하지 않는다.

export async function getSurveyDilemmas(): Promise<SurveyDilemma[]> {
  "use cache";
  cacheLife("hours"); // 문항은 거의 바뀌지 않는다

  const { data, error } = await createServerSupabase()
    .from("dilemmas")
    .select("id, title, scenario, option_a, option_b, scenario_easy, option_a_easy, option_b_easy")
    .eq("is_active", true)
    .order("sort_order");

  if (error) throw new Error(`문항을 불러오지 못했습니다: ${error.message}`);
  return data;
}
