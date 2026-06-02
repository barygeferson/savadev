
-- Roles
create type public.app_role as enum ('admin');

create table public.user_roles (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null,
  role public.app_role not null,
  created_at timestamptz not null default now(),
  unique (user_id, role)
);
grant select on public.user_roles to authenticated;
grant all on public.user_roles to service_role;
alter table public.user_roles enable row level security;
create policy "users see own roles" on public.user_roles for select to authenticated using (auth.uid() = user_id);

create or replace function public.has_role(_user_id uuid, _role public.app_role)
returns boolean
language sql stable security definer set search_path = public
as $$
  select exists (select 1 from public.user_roles where user_id = _user_id and role = _role)
$$;

-- Backfill admin for the requested email
insert into public.user_roles (user_id, role)
select id, 'admin'::public.app_role from auth.users where email = 'barygeferson@gmail.com'
on conflict do nothing;

-- Invite codes
create table public.invite_codes (
  code text primary key,
  created_by uuid not null,
  max_uses int not null default 1,
  uses int not null default 0,
  expires_at timestamptz,
  note text,
  created_at timestamptz not null default now()
);
grant select on public.invite_codes to anon, authenticated;
grant insert, update, delete on public.invite_codes to authenticated;
grant all on public.invite_codes to service_role;
alter table public.invite_codes enable row level security;

create policy "anyone can read invite codes" on public.invite_codes for select using (true);
create policy "admins create invite codes" on public.invite_codes for insert to authenticated with check (public.has_role(auth.uid(), 'admin'));
create policy "admins update invite codes" on public.invite_codes for update to authenticated using (public.has_role(auth.uid(), 'admin'));
create policy "admins delete invite codes" on public.invite_codes for delete to authenticated using (public.has_role(auth.uid(), 'admin'));

-- Atomic redemption
create or replace function public.redeem_invite(_code text)
returns boolean
language plpgsql security definer set search_path = public
as $$
declare updated_count int;
begin
  update public.invite_codes
  set uses = uses + 1
  where code = _code
    and uses < max_uses
    and (expires_at is null or expires_at > now());
  get diagnostics updated_count = row_count;
  return updated_count > 0;
end; $$;

grant execute on function public.redeem_invite(text) to anon, authenticated;
