@AGENTS.md

# 너라면 어떻게 할래? (윤리 딜레마 설문 사이트)

익명 윤리 딜레마 설문과 누적 통계를 보여 주는 사이트. 사이트 이름은 "너라면 어떻게 할래?", 부제는 "세 가지 고민 상황"(`SITE_NAME`/`SITE_SUBTITLE`, `src/lib/constants.ts`). Next.js(App Router, TS, Tailwind) + Supabase + Vercel.

## 요구사항

- **대상**: 초등(`elementary`), 중등(`middle`), 고등(`high`), 성인(`adult`)
- **성별**: 남(`male`), 여(`female`), 응답하지 않음(`undisclosed`)
- **개인정보 수집 안 함**: 로그인, IP, 쿠키 ID, User-Agent를 저장하지 않는다.
- **응답 페이지** (`/survey`): 대상·성별 선택 → 딜레마 3개 → 문항마다 A/B 선택 + 서술형 이유
  - 서술형은 **3문항 모두 필수**이고, 앞뒤 공백을 뺀 뒤 **5~300자**여야 한다. 화면, zod, DB(NOT NULL + check + submit_survey 검증) 세 곳에서 모두 막는다.
    (중간에 선택 항목으로 바꿨다가 2026-11-05에 다시 필수로 확정했다. 마이그레이션 `*_reason_required.sql`)
  - 초등을 고르면 쉬운 문구(`*_easy`)를 보여 준다. 중·고·성인은 기본 문구. 저장되는 `dilemma_id`/`choice`는 같다.
  - **가치 대립 라벨(예: "정직 vs 우정")은 응답 페이지에서 숨긴다.**
- **통계 페이지** (`/stats`): 누적 통계, 대상·성별 필터(searchParams), 딜레마별 A/B 비율 그래프, 서술형 키워드 워드클라우드(딜레마 × A/B별)
  - 가치 대립 라벨은 통계 페이지에서만 보여 준다.
  - 필터 결과가 5명 미만이면 수치 대신 "응답이 부족합니다"를 표시한다(개인 추정 방지).
  - 워드클라우드는 모든 응답의 이유로 만든다(이유가 필수이므로).

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
- `answers`: id bigint PK, submission_id FK(cascade), dilemma_id FK, choice, reason text **not null**
  `check (char_length(reason) between 5 and 300)`, unique(submission_id, dilemma_id)
- RLS는 켜되 정책은 두지 않는다. anon/authenticated에는 테이블·함수 권한을 주지 않는다.
  모든 읽기·쓰기는 서버에서 secret key(`sb_secret_...`, service_role 권한)로만 한다.
- Supabase의 "Automatically expose new tables"가 꺼져 있다. **새 테이블·함수를 만들면 service_role에 필요한 GRANT를 마이그레이션에 직접 넣는다.**
  함수는 PUBLIC에 열린 EXECUTE를 revoke한 뒤 service_role에만 grant한다.
- RPC (모두 `security invoker`, `set search_path = ''`)
  - `submit_survey(p_group, p_gender, p_answers jsonb) → uuid`: 트랜잭션. 활성 문항 전부에 정확히 한 번씩 응답했는지, 이유가 공백 제거 후 5~300자인지 검증(위반 시 22023). 이유는 앞뒤 공백을 제거해 저장
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

- 그래프: HTML/CSS로 직접 그린 100% 가로 막대(`ChoiceRatioBar`). 막대가 2칸뿐이라 Recharts는 빼고 의존성도 지웠다.
  A/B 색은 dataviz 검증 팔레트 1·2번(파랑 `#2a78d6`/`#3987e5`, 주황 `#eb6834`/`#d95926`)이고, 글자용 진한 색은 `--choice-*-ink`다(`globals.css`). 선택지 문구, 비율, 인원을 직접 라벨로 붙여서 색만으로 구분하지 않게 했다.
- 워드클라우드: **`d3-cloud` v2**(`new CloudLayout()` + `getSprite`/`place`, 동기 API)로 배치하고 SVG로 그린다. v1용 `@types/d3-cloud`는 맞지 않아 지웠다. 시드를 고정해서 배치가 매번 같고, 웹폰트를 로드한 뒤(`document.fonts.ready`) 배치한다. 딜레마마다 전체/A 선택/B 선택 탭이 있고, "키워드 목록으로 보기" 표를 함께 둔다.
- 키워드(`src/lib/keywords.ts`): 형태소 분석기 없이 규칙으로 뽑는다(Vercel 서버리스 제약).
  순서: 토큰화 → 조사 제거 → 어미 제거 → 활용형 끝말(`PREDICATE_END`)로 끝나는 동사·형용사 제거 → 불용어·금칙어 제거 → 2글자 이상.
  `PREDICATE_END`에 걸리지만 의미 있는 명사는 `NOUN_EXCEPTIONS`(배려, 격려, 이해, 신고…)로 살린다.
  한 응답 안에서 같은 단어는 한 번만 센다(문서 빈도). **2명 이상이 쓴 단어만**, 상위 40개까지 보여 준다. 노이즈 단어가 보이면 `STOPWORDS`/`PREDICATE_END`/`STEM_FIXES`로 조정한다.
- 통계 데이터(`src/lib/stats.ts`의 `getStats`): `"use cache"` + `cacheLife("minutes")`이고 필터 값이 캐시 키다. 필터 결과가 5명 미만이면 수치와 키워드를 아예 계산하지 않는다. 키워드 칸(전체/A/B)도 각각 5건 미만이면 숨긴다.
- `/stats`는 searchParams를 `<Suspense>` 안에서만 읽어서 정적 셸 + 스트리밍(Partial Prerender)으로 동작한다. 잘못된 쿼리 값은 "전체"로 처리한다.
- 제출: `submitSurvey` Server Action(`src/app/survey/actions.ts`)이 같은 zod 스키마로 다시 검증하고 RPC를 호출한다. 결과는 `{ ok } | { ok: false, error }`로 돌려주고, 클라이언트에서 `router.replace("/survey/done")`로 이동한다(redirect를 쓰지 않는다). 입력값 오류(22023/23514/22P02/23503)와 서버 오류는 안내 문구를 다르게 보여 준다.
- 중복 제출: localStorage 플래그(`ethics-dilemma:submitted-at`, `src/lib/submitted-flag.ts`)로 가볍게만 막는다. **학교에서는 기기를 같이 쓰므로 차단하지 않는다.** "이미 참여했어요" 안내와 "새로 참여하기" 버튼만 보여 준다. 플래그는 `useSyncExternalStore`로 읽는다(hydration 불일치 방지).
- 레이트 리밋은 하지 않는다. 서버리스에서는 메모리 기반 제한이 의미가 없고, IP를 저장하지 않는 방침이기 때문이다.
- **Next.js 16 + Cache Components(`cacheComponents: true`)를 쓴다.** `export const revalidate`, `dynamic` 같은 route segment config는 쓸 수 없다. 대신 `"use cache"`와 `cacheLife()`를 쓴다.
  - 문항 조회(`getSurveyDilemmas`): `cacheLife("hours")`. 통계: `cacheLife("minutes")` 예정
  - error.tsx의 props는 `{ error, retry }`다(`reset` 아님).
- 폰트: 제목·버튼·라벨·숫자는 주아(`Jua`, `font-display`), 본문은 고운돋움(`Gowun_Dodum`, `font-sans`). next/font, preload: false.
  둘 다 굵기가 400 하나뿐이라 `font-bold`/`font-semibold`는 쓰지 않고 `font-display`로 강조한다. `font-synthesis-weight: none`으로 가짜 굵게를 막는다.
- 줄바꿈: `word-break: keep-all`(단어 중간에서 안 끊김) + `overflow-wrap: break-word`(화면보다 긴 단어만 예외). 제목은 `text-wrap: balance`, 본문은 `pretty`.
  두 문장 이상인 안내 문구는 `<span className="block">`으로 문장(또는 뜻 단위)마다 줄을 나눈다.
- 색: "숲길" 팔레트. 따뜻한 미색 바탕 + 숲 초록 포인트(`--accent`). 모든 색은 `globals.css` 토큰(`background`, `surface`, `muted`, `line`, `line-strong`, `accent`, `accent-soft`, `on-accent`, `accent-ink`, `danger`)이고
  라이트·다크 값을 한곳에서 바꾼다. 컴포넌트에 `zinc`/`indigo` 같은 고정 색이나 `dark:` 색 클래스를 새로 쓰지 않는다. 글자 4.5:1, 입력칸 테두리 3:1 이상.
  예외: A/B 그래프 색(`--choice-*`), "이미 참여했어요" 안내(amber).
- 버튼: `btn-primary`(아래 그림자, 누르면 들어감, `disabled`·`aria-disabled` 모두 비활성 모양) / `btn-secondary` (`globals.css`의 `@layer components`).
- 그림(`src/components/art/Art.tsx`): 직접 그린 SVG. 색은 `--art-*` 토큰만 쓰고 모두 `aria-hidden`. 새싹 흔들림(`art-sway`)은 동작 줄이기 설정에서 멈춘다.
  첫 화면 `HomeArt`, 완료 화면 `DoneArt`, 딜레마별 `DilemmaIcon`(id 1 시험지, 2 이젤, 3 트로피, 그 밖은 새싹)을 설문 상황 카드와 통계 카드에 쓴다.
  **응답에 영향이 없도록** 딜레마 그림은 상황 속 물건만 그리고(인물·표정 없음), A·B 선택지에는 그림 없이 똑같은 모양만 쓴다.
- 운영 DB에 테스트 데이터를 넣으면 확인 후 **내가 넣은 행만 id로 지정해서** 지운다. 다른 행은 사용자 확인 없이 건드리지 않는다.
- 응답 폼은 `SurveyForm`(클라이언트) 하나가 단계(대상·성별 → 문항 1..n → 확인)를 관리한다. 확인 화면에서 "고치기"를 누르면 해당 단계로 갔다가 확인 화면으로 돌아온다.
- 초등용 문구 여부는 `group === "elementary"` 하나로 정한다. 대상을 바꾸면 문구도 바로 바뀐다.
- `SUPABASE_SERVICE_ROLE_KEY`에는 새 형식의 secret key(`sb_secret_...`)가 들어 있다. 서버 전용이므로 `NEXT_PUBLIC_` 접두사를 붙이지 않는다.
- 서술형 길이 검증은 DB `char_length`(코드포인트 기준)와 맞추기 위해 JS에서 `[...str].length`를 쓴다(`.length`는 쓰지 않는다).

## 작업 단계

1. ✅ 프로젝트 세팅 (Next.js, 의존성, 폴더 골격, env 예시, supabase init)
2. ✅ DB 마이그레이션(스키마·권한·RPC·문항) + 타입 생성
3. ✅ 응답 페이지 UI (모바일 우선, 초등도 읽기 쉬운 글자 크기)
4. ✅ 제출 처리 (Server Action + zod + RPC + 완료 페이지 + 중복 방지) + 서술형 필수화
5. ✅ 통계 집계 + 필터 바 + 총 응답 수
6. ✅ A/B 비율 그래프
7. ✅ 키워드 추출 + 워드클라우드(딜레마별, 전체/A/B 탭) + 표본 5명 미만 처리
8. ✅ 점검 (대량 테스트 데이터, RLS 우회 시도, 키보드·화면 낭독기 코드 점검, 실제 휴대폰)
9. ✅ Vercel 배포 (https://ethics-dilemma.vercel.app)
10. ✅ 디자인 다듬기 (숲길 색, 주아·고운돋움 폰트, 그림, 사이트 이름 변경, 줄바꿈 정리)

## 진행 상황 (2026-11-05 기준)

- 1~10단계 완료. 모두 커밋해서 GitHub(`origin/main`, https://github.com/yhee79-sys/ethics-dilemma)에 올렸다.
- 운영 Supabase DB(`ododcndqhxuepyhiinaq`)에는 마이그레이션 3개가 적용되어 있다(init, dilemmas, reason_required).
- **운영 DB의 응답 데이터는 0건이다.** 테스트 데이터는 사용자가 확인한 뒤 모두 지웠다.
- 사용자가 통계 화면(필터, 비율 막대, 워드클라우드 탭, 표본 부족 처리)을 테스트 데이터로 확인하고 승인했다.
- 8단계 점검 결과 (2026-11-05)
  - RLS 우회: publishable 키, legacy anon 키, 키 없음으로 테이블 조회·추가·수정·삭제와 RPC 3개를 호출했고 모두 거부됐다(42501/401). OpenAPI 스키마와 GraphQL도 막혀 있다.
    `rls_auto_enable`(Supabase가 만든 이벤트 트리거 함수)은 anon에 EXECUTE가 있지만 RPC로 호출되지 않아(0A000) 그대로 둔다.
  - 대량 데이터: 1000명(서술형 3000건)을 `submit_survey`로 넣어 확인했다. 서술형 4페이지 누락·중복 없음, `/stats` 처음 계산 약 1초·캐시 후 약 0.03초,
    `get_reasons` 실행 1.4ms라 인덱스는 추가하지 않았다. 사용자 확인 후 넣은 id만 지워서 운영 DB는 다시 0건이다.
  - 키워드: 노이즈(`먼저예`, `팀으`, `공평함이`, `어려워`, `없이` 등)를 보고 `~예요/~이에요` 조사, 1글자+`으로`, `PREDICATE_END`, 불용어를 보강했다.
  - 키보드·화면 낭독기(코드 점검): 설문 "다음" 버튼은 `disabled` 대신 `aria-disabled`(포커스 유지 + 누르면 "골라 주세요" 안내),
    이유 오류 시 입력칸으로 포커스, 알림 영역(`role="alert"`)은 항상 두고 내용만 바꿈, 진행 막대 `aria-valuetext`,
    하단 고정 바에 포커스가 가리지 않게 `scroll-padding-bottom`, 키워드 탭은 ARIA 탭 패턴(←/→/Home/End, 선택된 탭만 Tab 순서),
    통계 인원 칸 `aria-live`로 필터 변경 알림.
  - 실제 휴대폰: 사용자가 배포 주소에서 제출해 보고 화면에 문제가 없다고 확인했다.
- 9단계 배포 결과 (2026-11-05)
  - Vercel 프로젝트를 GitHub `main`에 연결했다. `main`에 push하면 자동 배포된다. 주소: https://ethics-dilemma.vercel.app
  - 환경변수 `SUPABASE_URL`, `SUPABASE_SERVICE_ROLE_KEY`(secret key, `NEXT_PUBLIC_` 없음)를 등록했다. 빌드할 때 `/survey`를 미리 렌더링하면서 DB를 조회하므로 빌드 환경에도 필요하다.
  - Function Region은 Supabase(`ap-northeast-2`)와 같은 서울(`icn1`)이다.
  - 배포 확인: 모든 페이지 200, 없는 주소 404, 클라이언트 JS 12개에 secret·환경변수 이름·Supabase 주소 없음,
    휴대폰 제출 → DB 저장(공백 정리) → 1분 안에 `/stats` 반영. 그 테스트 응답 1건은 사용자 확인 후 지웠다(운영 DB 0건).
  - Preview 배포(다른 브랜치)도 같은 운영 DB를 쓴다.

## 다음에 할 일

### 확인이 남은 것
- 통계 딜레마 카드의 그림·워드클라우드(주아)는 응답이 5명 이상일 때만 보여서, 디자인 변경 뒤 실제 데이터로는 아직 보지 못했다.
  응답이 쌓이면 라이트·다크에서 확인한다.

### 운영 중 할 일
- **이제 실제 응답이 쌓이는 운영 DB다.** 테스트 응답을 넣으면 반드시 id를 기록하고 그 행만 지운다.
- 키워드 품질: 실제 응답이 쌓이면 노이즈 단어를 보고 `STOPWORDS`/`PREDICATE_END`/`NOUN_EXCEPTIONS`를 조정한다.
  (`협력적으로` → `협력적`으로 남는 문제가 있다. 조사 `으로`가 어미 `적으로`보다 먼저 떼어지기 때문)
- 운영 DB에 id 목록으로 지울 때는 SQL이 길어 명령줄 제한에 걸리므로 파일로 만들어 `db query --remote --yes -f <파일>`로 실행한다.

### 참고
- Supabase CLI는 `--remote`를 붙여야 원격에 적용된다. 운영 DB에 쓰는 쿼리는 사용자 동의를 받은 뒤 `--yes`로 실행한다.
- 로컬 확인용 서버는 `node node_modules/next/dist/bin/next start -p 3123`으로 띄운다. `npx`로 띄우면 종료할 때 자식 프로세스가 남아 포트를 계속 잡는다. 3000번 포트는 충돌한 적이 있다.

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
