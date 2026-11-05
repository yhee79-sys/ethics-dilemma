-- 서술형 이유를 3문항 모두 필수(앞뒤 공백 제거 후 5~300자)로 변경
-- 적용 전에 reason이 NULL인 행이 없어야 한다 (NOT NULL 추가가 실패한다).

alter table public.answers drop constraint answers_reason_check;
alter table public.answers alter column reason set not null;
alter table public.answers
  add constraint answers_reason_check check (char_length(reason) between 5 and 300);

-- submit_survey: 이유 검증을 함수 안에서 먼저 해서 명확한 에러(22023)를 낸다.
-- CREATE OR REPLACE는 기존 권한을 유지하지만, 아래에서 권한을 다시 명시한다.
create or replace function public.submit_survey(
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

  if exists (
    select 1
    from jsonb_array_elements(p_answers) as a
    where char_length(btrim(coalesce(a ->> 'reason', ''), E' \t\r\n')) not between 5 and 300
  ) then
    raise exception 'every reason must be 5 to 300 characters' using errcode = '22023';
  end if;

  insert into public.submissions (target_group, gender)
  values (p_group, p_gender)
  returning id into v_id;

  insert into public.answers (submission_id, dilemma_id, choice, reason)
  select v_id,
         (a ->> 'dilemma_id')::smallint,
         (a ->> 'choice')::public.choice,
         btrim(a ->> 'reason', E' \t\r\n')
  from jsonb_array_elements(p_answers) as a;

  return v_id;
end;
$$;

revoke execute on function public.submit_survey(public.target_group, public.gender, jsonb) from public, anon, authenticated;
grant  execute on function public.submit_survey(public.target_group, public.gender, jsonb) to service_role;
