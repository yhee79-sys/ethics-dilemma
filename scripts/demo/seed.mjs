// 시연용 예시 응답 30명을 운영 DB에 넣는다. 실제 제출 경로(submit_survey RPC)를 쓴다.
// 넣은 submission id는 demo-submission-ids.txt에 한 줄씩 바로 저장한다(중간에 멈춰도 넣은 만큼 지울 수 있다).
//
// 사용: node --env-file=.env.local scripts/demo/seed.mjs
// 지우기: node --env-file=.env.local scripts/demo/delete.mjs --yes
import { appendFileSync, existsSync, readFileSync } from "node:fs";
import { createClient } from "@supabase/supabase-js";
import { DEMO_RESPONSES } from "./demo-responses.mjs";

const IDS_FILE = new URL("./demo-submission-ids.txt", import.meta.url);

const existing = existsSync(IDS_FILE) ? readFileSync(IDS_FILE, "utf8").trim() : "";
if (existing) {
  console.error("demo-submission-ids.txt에 이미 id가 있습니다. 두 번 넣지 않도록 멈춥니다. 먼저 delete.mjs로 지우세요.");
  process.exit(1);
}

const { SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY } = process.env;
if (!SUPABASE_URL || !SUPABASE_SERVICE_ROLE_KEY) {
  console.error("SUPABASE_URL / SUPABASE_SERVICE_ROLE_KEY가 없습니다. node --env-file=.env.local 로 실행하세요.");
  process.exit(1);
}
const sb = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY, { auth: { persistSession: false, autoRefreshToken: false } });

let ok = 0;
for (const r of DEMO_RESPONSES) {
  const { data, error } = await sb.rpc("submit_survey", {
    p_group: r.group,
    p_gender: r.gender,
    p_answers: r.answers.map(([choice, reason], i) => ({ dilemma_id: i + 1, choice, reason })),
  });
  if (error) {
    console.error(`실패 (${ok}명까지 넣음):`, error.code, error.message);
    process.exit(1);
  }
  appendFileSync(IDS_FILE, data + "\n");
  ok++;
}
console.log(`${ok}명을 넣었습니다. id: scripts/demo/demo-submission-ids.txt`);
