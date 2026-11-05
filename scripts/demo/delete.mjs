// seed.mjs로 넣은 시연용 응답만 지운다. demo-submission-ids.txt에 적힌 id만 지우고 다른 응답은 건드리지 않는다.
// 응답(answers)은 submissions를 지우면 함께 지워진다(on delete cascade).
//
// 사용: node --env-file=.env.local scripts/demo/delete.mjs --yes
import { existsSync, readFileSync, writeFileSync } from "node:fs";
import { createClient } from "@supabase/supabase-js";

const IDS_FILE = new URL("./demo-submission-ids.txt", import.meta.url);
const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

const ids = existsSync(IDS_FILE)
  ? readFileSync(IDS_FILE, "utf8").split(/\r?\n/).map((s) => s.trim()).filter((s) => UUID.test(s))
  : [];
if (ids.length === 0) {
  console.log("지울 시연용 응답이 없습니다.");
  process.exit(0);
}
if (!process.argv.includes("--yes")) {
  console.log(`시연용 응답 ${ids.length}명을 지우려면 --yes를 붙여 다시 실행하세요.`);
  process.exit(0);
}

const { SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY } = process.env;
if (!SUPABASE_URL || !SUPABASE_SERVICE_ROLE_KEY) {
  console.error("SUPABASE_URL / SUPABASE_SERVICE_ROLE_KEY가 없습니다. node --env-file=.env.local 로 실행하세요.");
  process.exit(1);
}
const sb = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY, { auth: { persistSession: false, autoRefreshToken: false } });

const { data: deleted, error } = await sb.from("submissions").delete().in("id", ids).select("id");
if (error) {
  console.error("삭제 실패:", error.code, error.message);
  process.exit(1);
}
const { count, error: countError } = await sb.from("submissions").select("id", { count: "exact", head: true }).in("id", ids);
if (countError || count !== 0) {
  console.error("일부가 남아 있습니다. id 파일을 그대로 둡니다.", countError?.message ?? `남은 수: ${count}`);
  process.exit(1);
}
writeFileSync(IDS_FILE, "");
console.log(`시연용 응답 ${deleted.length}명을 지웠습니다(파일의 id ${ids.length}개). id 파일을 비웠습니다.`);
