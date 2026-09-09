-- what2do · Supabase schema
-- Run once in the Supabase SQL editor (Dashboard → SQL → New query → Run).
-- Safe to re-run: every statement is idempotent.

create extension if not exists pgcrypto with schema extensions;

-- ---------- Tables ----------

create table if not exists public.sessions (
  id              text primary key,
  title           text not null,
  context         jsonb not null default '{}'::jsonb,
  host_token_hash text not null,
  created_at      timestamptz not null default now()
);

create table if not exists public.responses (
  id             uuid primary key default gen_random_uuid(),
  session_id     text not null references public.sessions (id) on delete cascade,
  nickname       text not null,
  schema_version text not null,
  answers        jsonb not null,
  submitted_at   timestamptz not null default now()
);

create index if not exists responses_session_idx on public.responses (session_id, submitted_at);

alter table public.sessions  enable row level security;
alter table public.responses enable row level security;

-- ---------- Participants (publishable key) ----------
-- May read a session's public columns (never the host token hash),
-- may insert a response into an existing session, may never read responses.

revoke all on public.sessions  from anon, authenticated;
revoke all on public.responses from anon, authenticated;

grant select (id, title, context, created_at) on public.sessions to anon, authenticated;
grant insert on public.responses to anon, authenticated;

drop policy if exists "sessions are readable" on public.sessions;
create policy "sessions are readable"
  on public.sessions for select
  to anon, authenticated
  using (true);

drop policy if exists "anyone may submit to an existing session" on public.responses;
create policy "anyone may submit to an existing session"
  on public.responses for insert
  to anon, authenticated
  with check (
    exists (select 1 from public.sessions s where s.id = session_id)
    and length(nickname) between 1 and 40
    and pg_column_size(answers) < 20000
  );

-- ---------- Host functions ----------
-- The host token is generated once, returned once, and stored only as a hash.

create or replace function public.create_session(p_title text, p_context jsonb default '{}'::jsonb)
returns table (session_id text, host_token text)
language plpgsql
security definer
set search_path = public, extensions
as $$
declare
  v_id    text;
  v_token text;
begin
  if p_title is null or length(trim(p_title)) = 0 or length(p_title) > 80 then
    raise exception 'title required (max 80 chars)';
  end if;
  -- 8 lowercase alphanumerics, unambiguous enough for a shared link
  v_id    := lower(translate(substr(encode(gen_random_bytes(8), 'base64'), 1, 8), '+/=OI0l', 'abcxyzk'));
  v_token := encode(gen_random_bytes(24), 'hex');
  insert into public.sessions (id, title, context, host_token_hash)
  values (v_id, trim(p_title), coalesce(p_context, '{}'::jsonb), encode(digest(v_token, 'sha256'), 'hex'));
  return query select v_id, v_token;
end
$$;

create or replace function public.host_responses(p_session text, p_token text)
returns setof public.responses
language sql
security definer
set search_path = public, extensions
stable
as $$
  select r.*
  from public.responses r
  join public.sessions s on s.id = r.session_id
  where s.id = p_session
    and s.host_token_hash = encode(digest(p_token, 'sha256'), 'hex')
  order by r.submitted_at;
$$;

create or replace function public.host_delete_response(p_session text, p_token text, p_response uuid)
returns void
language sql
security definer
set search_path = public, extensions
as $$
  delete from public.responses r
  using public.sessions s
  where r.id = p_response
    and r.session_id = p_session
    and s.id = r.session_id
    and s.host_token_hash = encode(digest(p_token, 'sha256'), 'hex');
$$;

revoke all on function public.create_session(text, jsonb) from public;
revoke all on function public.host_responses(text, text) from public;
revoke all on function public.host_delete_response(text, text, uuid) from public;
grant execute on function public.create_session(text, jsonb) to anon, authenticated;
grant execute on function public.host_responses(text, text) to anon, authenticated;
grant execute on function public.host_delete_response(text, text, uuid) to anon, authenticated;
