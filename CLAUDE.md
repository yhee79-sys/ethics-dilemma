@AGENTS.md

# 윤리 딜레마 설문 사이트

익명 윤리 딜레마 설문과 누적 통계를 보여 주는 사이트. Next.js(App Router, TS, Tailwind) + Supabase + Vercel.

## 요구사항

- **대상**: 초등(`elementary`), 중등(`middle`), 고등(`high`), 성인(`adult`)
- **성별**: 남(`male`), 여(`female`), 응답하지 않음(`undisclosed`)
- **개인정보 수집 안 함**: 로그인, IP, 쿠키 ID, User-Agent를 저장하지 않는다.
- **응답 페이지** (`/survey`): 대상·성별 선택 → 딜레마 3개 → 문항마다 A/B 선택 + 서술형 이유
  - 서술형은 **선택 항목**. 비워 두면 null로 저장하고(공백만 입력해도 null), 입력하면 **5~300자**.
  - 초등을 고르면 쉬운 문구(`*_easy`)를 보여 준다. 중·고·성인은 기본 문구. 저장되는 `dilemma_id`/`choice`는 같다.
  - **가치 대립 라벨(예: "정직 vs 우정")은 응답 페이지에서 숨긴다.**
- **통계 페이지** (`/stats`): 누적 통계, 대상·성별 필터(searchParams), 딜레마별 A/B 비율 그래프, 서술형 키워드 워드클라우드(딜레마 × A/B별)
  - 가치 대립 라벨은 통계 페이지에서만 보여 준다.
  - 필터 결과가 5명 미만이면 수치 대신 "응답이 부족합니다"를 표시한다(개인 추정 방지).
  - 워드클라우드는 이유를 쓴 응답만 집계하고 "서술형 응답 n건 기준"을 표시한다.

## 폴더 구조

```
src/
  app/
    page.tsx                 # 랜딩
    survey/page.tsx          # 문항 조회(서버) → SurveyForm
    survey/error.tsx
    survey/actions.ts        # Server Action: 제출
    survey/done/page.tsx
    stats/page.tsx           # "use cache" + cacheLife("minutes")
  components/survey/*, components/stats/*
  lib/supabase/server.ts     # service role 클라이언트 (서버 전용)
  lib/validation.ts          # zod
  lib/keywords.ts            # 한국어 키워드 추출 (조사 제거, 불용어, 빈도)
  lib/constants.ts
  types/db.ts
supabase/migrations/       # 스키마 + 딜레마 문항
```

## DB 설계

- enum `target_group`(elementary|middle|high|adult), `gender`(male|female|undisclosed), `choice`(A|B)
- `dilemmas`: id smallint PK, sort_order, title, value_label(통계 전용), scenario, option_a, option_b, scenario_easy, option_a_easy, option_b_easy, is_active
- `submissions`: id uuid PK, target_group, gender, created_at
- `answers`: id bigint PK, submission_id FK(cascade), dilemma_id FK, choice, reason text null
  `check (reason is null or char_length(reason) between 5 and 300)`, unique(submission_id, dilemma_id)
- RLS는 켜되 정책은 두지 않는다. anon/authenticated에는 테이블·함수 권한을 주지 않는다.
  모든 읽기·쓰기는 서버에서 secret key(`sb_secret_...`, service_role 권한)로만 한다.
- Supabase의 "Automatically expose new tables"가 꺼져 있다. **새 테이블·함수를 만들면 service_role에 필요한 GRANT를 마이그레이션에 직접 넣는다.**
  함수는 PUBLIC에 열린 EXECUTE를 revoke한 뒤 service_role에만 grant한다.
- RPC (모두 `security invoker`, `set search_path = ''`)
  - `submit_survey(p_group, p_gender, p_answers jsonb) → uuid`: 트랜잭션. 활성 문항 전부에 정확히 한 번씩 응답했는지 검증하고, 공백만 있는 이유는 null로 저장
  - `get_choice_stats(p_group?, p_gender?) → (dilemma_id, a_count, b_count)`: 응답이 없는 문항도 0으로 반환
  - `get_reasons(p_group?, p_gender?) → (id, dilemma_id, choice, reason)`: 키워드 추출 전용. PostgREST max-rows(1000) 제한 때문에 `.range()`로 페이지 단위로 읽는다.
- 서술형 원문은 브라우저로 내보내지 않는다. 서버에서 키워드로 집계한 결과만 전달한다.
- 딜레마 문항은 운영 DB에도 필요하므로 `seed.sql`이 아니라 마이그레이션(`*_dilemmas.sql`)으로 넣는다. 문구를 고칠 때는 새 마이그레이션을 만든다.
- **Supabase CLI(v3)는 기본 대상이 로컬이다. 원격 프로젝트에 쓰려면 `--remote`를 붙인다.**
  - 적용: `npx supabase db push --remote` (사용자가 직접 실행)
  - 타입: `npx supabase gen types typescript --remote --schema public > src/types/db.ts`
  - 조회: `npx supabase db query --remote --read-only "<SQL>"` (쓰기 쿼리는 사용자 동의를 받은 뒤 `--yes`)
  - 로그인과 비밀번호 입력은 TTY가 필요하므로 사용자가 별도 터미널에서 한다.
- 마이그레이션 검증: Docker가 없으므로 PGlite(인메모리 Postgres)에 anon/authenticated/service_role 롤을 만들어 실행하고 권한까지 확인한다.

## 기술 결정

- 그래프: Recharts (100% 누적 가로 막대). 워드클라우드: `d3-cloud` + 직접 SVG (`react-wordcloud`는 쓰지 않는다)
- 키워드: 규칙 기반 JS(토큰화 → 조사·어미 제거 → 불용어·금칙어 제거 → 2글자 이상 → 상위 50개). 형태소 분석기는 쓰지 않는다(Vercel 서버리스 제약).
- 중복 제출: localStorage 플래그로 가볍게만 막는다.
- **Next.js 16 + Cache Components(`cacheComponents: true`)를 쓴다.** `export const revalidate`, `dynamic` 같은 route segment config는 쓸 수 없다. 대신 `"use cache"`와 `cacheLife()`를 쓴다.
  - 문항 조회(`getSurveyDilemmas`): `cacheLife("hours")`. 통계: `cacheLife("minutes")` 예정
  - error.tsx의 props는 `{ error, retry }`다(`reset` 아님).
- 폰트는 Noto Sans KR(next/font, preload: false)이고 `word-break: keep-all`을 쓴다.
- 응답 폼은 `SurveyForm`(클라이언트) 하나가 단계(대상·성별 → 문항 1..n → 확인)를 관리한다. 확인 화면에서 "고치기"를 누르면 해당 단계로 갔다가 확인 화면으로 돌아온다.
- 초등용 문구 여부는 `group === "elementary"` 하나로 정한다. 대상을 바꾸면 문구도 바로 바뀐다.
- `SUPABASE_SERVICE_ROLE_KEY`에는 새 형식의 secret key(`sb_secret_...`)가 들어 있다. 서버 전용이므로 `NEXT_PUBLIC_` 접두사를 붙이지 않는다.
- 서술형 길이 검증은 DB `char_length`(코드포인트 기준)와 맞추기 위해 JS에서 `[...str].length`를 쓴다(`.length`는 쓰지 않는다).

## 작업 단계

1. 프로젝트 세팅 (Next.js, 의존성, 폴더 골격, env 예시, supabase init)
2. DB 마이그레이션(스키마·권한·RPC·문항) + 타입 생성
3. 응답 페이지 UI (모바일 우선, 초등도 읽기 쉬운 글자 크기)
4. 제출 처리 (Server Action + zod + RPC + 완료 페이지 + 중복 방지)
5. 통계 집계 + 필터 바 + 총 응답 수
6. A/B 비율 그래프
7. 키워드 추출 + 워드클라우드 + 표본 5명 미만 처리
8. 점검 (대량 테스트 데이터, 모바일, RLS 우회 시도)
9. Vercel 배포

## 딜레마 문항 (확정)

### 1. 친구의 부정행위 — 정직 vs 우정
- **기본**: 가장 친한 친구가 중요한 시험에서 부정행위를 하는 것을 우연히 보았다. 이 시험 결과는 친구의 진로에 영향을 준다. 친구는 최근 집안 사정으로 무척 힘들어하고 있었다. 이 장면을 본 사람은 당신뿐이다.
  - A: 감독관에게 사실을 알린다 / B: 알리지 않는다
- **초등**: 제일 친한 친구가 시험 시간에 몰래 다른 친구의 답을 보는 걸 봤어요. 친구는 요즘 집에 힘든 일이 있어서 많이 속상해하고 있었어요. 이 장면을 본 사람은 나밖에 없어요. 말하면 친구는 시험 점수가 0점이 될 수도 있어요.
  - A: 선생님께 말씀드린다 / B: 말하지 않는다

### 2. 솔직한 의견 — 정직 vs 배려
- **기본**: 친구가 몇 달 동안 준비한 작품을 내일 공모전에 제출하려 한다. 친구가 솔직한 의견을 물었는데, 당신이 보기에는 완성도가 많이 부족하다. 지금 지적해도 고칠 시간은 거의 없고, 친구는 크게 실망할 것 같다.
  - A: 아쉬운 점을 솔직하게 말한다 / B: 좋다고 격려해 준다
- **초등**: 친구가 몇 달 동안 열심히 그린 그림을 내일 대회에 내려고 해요. 친구가 "솔직하게 어때?" 하고 물었는데, 내 눈에는 잘 그린 그림 같지 않아요. 지금 말해도 고칠 시간이 거의 없고, 친구가 많이 속상해할 것 같아요.
  - A: 아쉬운 점을 솔직하게 말해 준다 / B: 잘했다고 응원해 준다

### 3. 상 나누기 — 평등 vs 기여
- **기본**: 5명이 함께한 팀 프로젝트가 상을 받아 상금 50만 원이 나왔다. 그중 한 명은 작업의 절반 이상을 혼자 해냈고, 한 명은 거의 참여하지 않았다. 상금을 어떻게 나눌지는 당신이 정해야 한다.
  - A: 모두 똑같이 나눈다 (10만 원씩) / B: 기여한 만큼 차등해서 나눈다
- **초등**: 친구 5명이 함께한 모둠 활동으로 상을 받아서 간식 10개를 받았어요. 한 친구는 혼자서 절반 넘게 일을 했고, 한 친구는 거의 아무것도 하지 않았어요. 간식을 어떻게 나눌지는 내가 정해야 해요.
  - A: 모두 똑같이 2개씩 나눈다 / B: 많이 한 친구에게 더 많이 준다
