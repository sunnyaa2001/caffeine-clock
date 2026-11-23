-- Caffeine Clock 연구용 서버 스키마 (Supabase SQL Editor에 한 번 붙여 넣어 실행)
-- 참가자는 연구팀이 발급한 입장코드로만 기록을 읽고 쓸 수 있다.
-- 테이블은 RLS로 직접 접근을 막고, 아래 함수(RPC)로만 접근한다.

create extension if not exists pgcrypto;

-- ── 테이블 ───────────────────────────────────────────────
create table if not exists public.participants (
  code text primary key,
  label text,                 -- 연구팀 메모 (예: 참가자 번호). 개인정보는 넣지 않기
  active boolean not null default true,
  settings jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  last_seen_at timestamptz
);

create table if not exists public.intake_entries (
  id uuid primary key,
  code text not null references public.participants(code) on delete cascade,
  drink_id text,
  drink_name text not null,
  cafe_name text not null,
  size text,
  caffeine_mg numeric not null check (caffeine_mg >= 0 and caffeine_mg < 2000),
  intake_at timestamptz not null,
  day date not null,          -- 새벽 4시 기준 하루 (Asia/Seoul)
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  deleted_at timestamptz      -- 삭제는 표시만 (연구 데이터 보존)
);
create index if not exists intake_entries_code_day on public.intake_entries(code, day);

create table if not exists public.bedtimes (
  code text not null references public.participants(code) on delete cascade,
  day date not null,
  bedtime text not null check (bedtime ~ '^[0-2][0-9]:[0-5][0-9]$'),
  updated_at timestamptz not null default now(),
  primary key (code, day)
);

alter table public.participants enable row level security;
alter table public.intake_entries enable row level security;
alter table public.bedtimes enable row level security;
revoke all on public.participants, public.intake_entries, public.bedtimes from anon, authenticated;

-- ── 함수 (앱이 호출) ─────────────────────────────────────
create or replace function public.cc_norm(p_code text) returns text
language sql immutable as $$ select upper(regexp_replace(coalesce(p_code, ''), '\s', '', 'g')) $$;

create or replace function public.cc_check(p_code text) returns text
language plpgsql security definer set search_path = public as $$
declare c text := cc_norm(p_code);
begin
  if not exists (select 1 from participants where code = c and active) then
    raise exception 'invalid_code' using errcode = 'P0001';
  end if;
  update participants set last_seen_at = now() where code = c;
  return c;
end $$;

create or replace function public.cc_login(p_code text) returns boolean
language plpgsql security definer set search_path = public as $$
begin
  return exists (select 1 from participants where code = cc_norm(p_code) and active);
end $$;

create or replace function public.cc_load(p_code text) returns json
language plpgsql security definer set search_path = public as $$
declare c text := cc_check(p_code);
begin
  return json_build_object(
    'code', c,
    'settings', (select settings from participants where code = c),
    'entries', coalesce((
      select json_agg(json_build_object(
        'id', id, 'drinkId', drink_id,
        'drinkSnapshot', json_build_object('name', drink_name, 'cafeName', cafe_name, 'size', size, 'caffeineMg', caffeine_mg),
        'intakeAt', intake_at, 'createdAt', created_at, 'updatedAt', updated_at) order by intake_at)
      from intake_entries where code = c and deleted_at is null), '[]'::json),
    'bedtimes', coalesce((select json_object_agg(day::text, bedtime) from bedtimes where code = c), '{}'::json)
  );
end $$;

create or replace function public.cc_upsert_entry(p_code text, p_entry json) returns void
language plpgsql security definer set search_path = public as $$
declare c text := cc_check(p_code);
declare t timestamptz := (p_entry->>'intakeAt')::timestamptz;
begin
  insert into intake_entries (id, code, drink_id, drink_name, cafe_name, size, caffeine_mg, intake_at, day, created_at, updated_at)
  values ((p_entry->>'id')::uuid, c, p_entry->>'drinkId',
          p_entry->'drinkSnapshot'->>'name', p_entry->'drinkSnapshot'->>'cafeName', p_entry->'drinkSnapshot'->>'size',
          (p_entry->'drinkSnapshot'->>'caffeineMg')::numeric, t,
          ((t at time zone 'Asia/Seoul') - interval '4 hours')::date,
          coalesce((p_entry->>'createdAt')::timestamptz, now()), now())
  on conflict (id) do update
    set intake_at = excluded.intake_at, day = excluded.day, updated_at = now(), deleted_at = null
    where intake_entries.code = c;
end $$;

create or replace function public.cc_delete_entry(p_code text, p_id uuid) returns void
language plpgsql security definer set search_path = public as $$
declare c text := cc_check(p_code);
begin
  update intake_entries set deleted_at = now(), updated_at = now() where id = p_id and code = c;
end $$;

create or replace function public.cc_set_bedtime(p_code text, p_day date, p_bedtime text) returns void
language plpgsql security definer set search_path = public as $$
declare c text := cc_check(p_code);
begin
  insert into bedtimes (code, day, bedtime) values (c, p_day, p_bedtime)
  on conflict (code, day) do update set bedtime = excluded.bedtime, updated_at = now();
end $$;

create or replace function public.cc_save_settings(p_code text, p_settings jsonb) returns void
language plpgsql security definer set search_path = public as $$
declare c text := cc_check(p_code);
begin
  update participants set settings = p_settings where code = c;
end $$;

revoke all on function public.cc_check(text) from public, anon, authenticated;
grant execute on function public.cc_login(text), public.cc_load(text), public.cc_upsert_entry(text, json),
  public.cc_delete_entry(text, uuid), public.cc_set_bedtime(text, date, text), public.cc_save_settings(text, jsonb)
  to anon, authenticated;

-- ── 연구용 일별 요약 (Table Editor 또는 SQL에서 CSV로 내보내기) ──
-- 앱과 같은 식: 잔존량 = Σ 카페인 × 0.5^(경과시간/5h), 취침 전 48시간 기록 포함
create or replace view public.research_daily_summary as
with days as (
  select code, day from intake_entries where deleted_at is null group by code, day
), bt as (
  select d.code, d.day, b.bedtime,
    case when b.bedtime is null then null
         else ((d.day + (case when split_part(b.bedtime, ':', 1)::int < 12 then 1 else 0 end))::timestamp
               + b.bedtime::time) at time zone 'Asia/Seoul' end as bedtime_at
  from days d left join bedtimes b on b.code = d.code and b.day = d.day
)
select
  bt.code,
  bt.day,
  (select sum(caffeine_mg) from intake_entries e where e.code = bt.code and e.day = bt.day and e.deleted_at is null) as daily_caffeine_mg,
  (select to_char(min(intake_at) at time zone 'Asia/Seoul', 'HH24:MI') from intake_entries e where e.code = bt.code and e.day = bt.day and e.deleted_at is null) as first_caffeine_time,
  (select to_char(max(intake_at) at time zone 'Asia/Seoul', 'HH24:MI') from intake_entries e where e.code = bt.code and e.day = bt.day and e.deleted_at is null) as last_caffeine_time,
  bt.bedtime as planned_bedtime,
  round((select sum(caffeine_mg * power(0.5, extract(epoch from (bt.bedtime_at - intake_at)) / 3600 / 5))
         from intake_entries e where e.code = bt.code and e.deleted_at is null
           and e.intake_at <= bt.bedtime_at and e.intake_at >= bt.bedtime_at - interval '48 hours'), 1) as estimated_caffeine_at_bedtime,
  (select count(*) from intake_entries e where e.code = bt.code and e.day = bt.day and e.deleted_at is null) as drink_count,
  exists (select 1 from intake_entries e where e.code = bt.code and e.day = bt.day and e.deleted_at is null
            and bt.bedtime_at - e.intake_at >= interval '0' and bt.bedtime_at - e.intake_at < interval '6 hours') as caffeine_within_6h_of_bedtime
from bt
order by bt.code, bt.day;

revoke all on public.research_daily_summary from anon, authenticated;
