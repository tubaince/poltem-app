begin;

-- 1) Add stable per-user participant code column on profiles.
alter table public.profiles
  add column if not exists participant_code text;

-- 2) Sequence used to generate AC-XXXXXX codes.
create sequence if not exists public.participant_code_seq
  as bigint
  start with 100000
  increment by 1
  minvalue 100000;

-- 3) Generator function.
create or replace function public.generate_participant_code()
returns text
language plpgsql
as $$
declare
  v_code text;
begin
  loop
    v_code := 'AC-' || lpad(nextval('public.participant_code_seq')::text, 6, '0');
    exit when not exists (
      select 1
      from public.profiles p
      where p.participant_code = v_code
    );
  end loop;

  return v_code;
end;
$$;

-- 4) Backfill existing users.
update public.profiles
set participant_code = public.generate_participant_code()
where participant_code is null;

-- 5) Enforce uniqueness and required field.
create unique index if not exists profiles_participant_code_uidx
  on public.profiles (participant_code);

alter table public.profiles
  alter column participant_code set not null;

-- 6) Auto-fill on future profile inserts.
create or replace function public.set_participant_code_on_insert()
returns trigger
language plpgsql
as $$
begin
  if new.participant_code is null then
    new.participant_code := public.generate_participant_code();
  end if;

  return new;
end;
$$;

drop trigger if exists trg_set_participant_code_on_insert on public.profiles;
create trigger trg_set_participant_code_on_insert
before insert on public.profiles
for each row
execute function public.set_participant_code_on_insert();

-- 7) Make participant_code immutable after first assignment.
create or replace function public.prevent_participant_code_update()
returns trigger
language plpgsql
as $$
begin
  if old.participant_code is not null
     and old.participant_code is distinct from new.participant_code then
    raise exception 'participant_code cannot be updated once assigned';
  end if;

  return new;
end;
$$;

drop trigger if exists trg_prevent_participant_code_update on public.profiles;
create trigger trg_prevent_participant_code_update
before update of participant_code on public.profiles
for each row
execute function public.prevent_participant_code_update();

-- 8) RPC for client: return current user code, create if somehow null.
create or replace function public.ensure_my_participant_code()
returns text
language plpgsql
security definer
set search_path = public
as $$
declare
  v_uid uuid;
  v_code text;
begin
  v_uid := auth.uid();

  if v_uid is null then
    raise exception 'Not authenticated';
  end if;

  update public.profiles
  set participant_code = public.generate_participant_code()
  where id = v_uid
    and participant_code is null;

  select p.participant_code
  into v_code
  from public.profiles p
  where p.id = v_uid;

  if v_code is null then
    raise exception 'Profile row not found for authenticated user: %', v_uid;
  end if;

  return v_code;
end;
$$;

revoke all on function public.ensure_my_participant_code() from public;
grant execute on function public.ensure_my_participant_code() to authenticated;

commit;
