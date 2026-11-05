-- 윤리 딜레마 설문: 스키마, RLS, 권한, RPC
-- 이 프로젝트는 "Automatically expose new tables"가 꺼져 있으므로 필요한 권한은 아래에서 직접 GRANT한다.
-- 모든 읽기·쓰기는 서버(secret key = service_role)에서만 한다. anon/authenticated에는 아무 권한도 주지 않는다.

-- ───────────── Enum ─────────────
create type public.target_group as enum ('elementary', 'middle', 'high', 'adult');
create type public.gender as enum ('male', 'female', 'undisclosed');
create type public.choice as enum ('A', 'B');

-- ───────────── Tables ─────────────
create table public.dilemmas (
  id            smallint primary key,
  sort_order    smallint not null unique,
  title         text not null,
  value_label   text not null,          -- 예: '정직 vs 우정'. 통계 페이지에서만 표시
  scenario      text not null,          -- 중·고·성인용
  option_a      text not null,
  option_b      text not null,
  scenario_easy text not null,          -- 초등용
  option_a_easy text not null,
  option_b_easy text not null,
  is_active     boolean not null default true
);

create table public.submissions (
  id           uuid primary key default gen_random_uuid(),
  target_group public.target_group not null,
  gender       public.gender not null,
  created_at   timestamptz not null default now()
);
create index submissions_group_gender_idx on public.submissions (target_group, gender);

create table public.answers (
  id            bigint generated always as identity primary key,
  submission_id uuid not null references public.submissions (id) on delete cascade,
  dilemma_id    smallint not null references public.dilemmas (id),
  choice        public.choice not null,
  reason        text check (reason is null or char_length(reason) between 5 and 300),
  unique (submission_id, dilemma_id)
);
create index answers_dilemma_choice_idx on public.answers (dilemma_id, choice);

-- ───────────── RLS ─────────────
-- 정책을 두지 않으므로 anon/authenticated는 RLS로도 막힌다. service_role은 RLS를 우회한다.
alter table public.dilemmas    enable row level security;
alter table public.submissions enable row level security;
alter table public.answers     enable row level security;

-- ───────────── 권한 ─────────────
revoke all on public.dilemmas, public.submissions, public.answers from public, anon, authenticated;

grant usage on schema public to service_role;
grant select         on public.dilemmas                    to service_role;
grant select, insert on public.submissions, public.answers to service_role;
grant usage          on sequence public.answers_id_seq     to service_role;

-- ───────────── RPC: 제출 ─────────────
-- p_answers: [{"dilemma_id": 1, "choice": "A", "reason": "..." | null}, ...]
-- 활성 문항 전부에 정확히 한 번씩 응답해야 한다. 공백만 있는 이유는 null로 저장한다.
create function public.submit_survey(
  p_group   public.target_group,
  p_gender  public.gender,
  p_answers jsonb
)
returns uuid
language plpgsql
security invoker
set search_path = ''
as $$
declare
  v_id      uuid;
  v_active  int;
  v_matched int;
begin
  if p_group is null or p_gender is null then
    raise exception 'group and gender are required' using errcode = '22023';
  end if;
  if p_answers is null or jsonb_typeof(p_answers) <> 'array' then
    raise exception 'answers must be a JSON array' using errcode = '22023';
  end if;

  select count(*) into v_active from public.dilemmas where is_active;

  select count(distinct d.id) into v_matched
  from jsonb_array_elements(p_answers) as a
  join public.dilemmas as d
    on d.is_active and d.id::text = a ->> 'dilemma_id';

  if jsonb_array_length(p_answers) <> v_active or v_matched <> v_active then
    raise exception 'every active dilemma must be answered exactly once' using errcode = '22023';
  end if;

  insert into public.submissions (target_group, gender)
  values (p_group, p_gender)
  returning id into v_id;

  insert into public.answers (submission_id, dilemma_id, choice, reason)
  select v_id,
         (a ->> 'dilemma_id')::smallint,
         (a ->> 'choice')::public.choice,
         nullif(btrim(a ->> 'reason', E' \t\r\n'), '')
  from jsonb_array_elements(p_answers) as a;

  return v_id;
end;
$$;

-- ───────────── RPC: A/B 집계 ─────────────
-- 필터가 null이면 전체. 응답이 없는 문항도 0으로 반환한다.
create function public.get_choice_stats(
  p_group  public.target_group default null,
  p_gender public.gender default null
)
returns table (dilemma_id smallint, a_count bigint, b_count bigint)
language sql
stable
security invoker
set search_path = ''
as $$
  select d.id,
         count(x.choice) filter (where x.choice = 'A'),
         count(x.choice) filter (where x.choice = 'B')
  from public.dilemmas as d
  left join (
    select a.dilemma_id, a.choice
    from public.answers as a
    join public.submissions as s on s.id = a.submission_id
    where (p_group is null or s.target_group = p_group)
      and (p_gender is null or s.gender = p_gender)
  ) as x on x.dilemma_id = d.id
  where d.is_active
  group by d.id, d.sort_order
  order by d.sort_order;
$$;

-- ───────────── RPC: 서술형 원문 (서버의 키워드 추출 전용) ─────────────
-- PostgREST max-rows(기본 1000) 제한이 있으므로 서버에서 .range()로 페이지 단위로 읽는다. 정렬 기준은 id.
create function public.get_reasons(
  p_group  public.target_group default null,
  p_gender public.gender default null
)
returns table (id bigint, dilemma_id smallint, choice public.choice, reason text)
language sql
stable
security invoker
set search_path = ''
as $$
  select a.id, a.dilemma_id, a.choice, a.reason
  from public.answers as a
  join public.submissions as s on s.id = a.submission_id
  where a.reason is not null
    and (p_group is null or s.target_group = p_group)
    and (p_gender is null or s.gender = p_gender)
  order by a.id;
$$;

-- 함수는 기본적으로 PUBLIC에 EXECUTE가 열리므로 회수하고 service_role에만 준다.
revoke execute on function public.submit_survey(public.target_group, public.gender, jsonb)  from public, anon, authenticated;
revoke execute on function public.get_choice_stats(public.target_group, public.gender)      from public, anon, authenticated;
revoke execute on function public.get_reasons(public.target_group, public.gender)           from public, anon, authenticated;
grant  execute on function public.submit_survey(public.target_group, public.gender, jsonb)  to service_role;
grant  execute on function public.get_choice_stats(public.target_group, public.gender)      to service_role;
grant  execute on function public.get_reasons(public.target_group, public.gender)           to service_role;
