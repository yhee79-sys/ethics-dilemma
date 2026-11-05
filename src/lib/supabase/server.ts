import "server-only";
import { createClient } from "@supabase/supabase-js";

/** 서버 전용 Supabase 클라이언트 (service role). 브라우저 번들에 포함되면 빌드 오류가 난다. */
export function createServerSupabase() {
  const url = process.env.SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !key) {
    throw new Error("SUPABASE_URL / SUPABASE_SERVICE_ROLE_KEY 환경변수가 없습니다. .env.local.example 참고");
  }
  return createClient(url, key, { auth: { persistSession: false, autoRefreshToken: false } });
}
