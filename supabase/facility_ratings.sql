create table if not exists public.facility_ratings (
  facility_id bigint not null references public.facilities (id) on delete cascade,
  user_id uuid not null references auth.users (id) on delete cascade,
  rating smallint not null check (rating between 1 and 5),
  created_at timestamptz not null default now(),
  primary key (facility_id, user_id)
);

alter table public.facility_ratings enable row level security;

drop policy if exists "Authenticated users read facility ratings"
  on public.facility_ratings;
create policy "Authenticated users read facility ratings"
  on public.facility_ratings for select to authenticated using (true);

drop policy if exists "Users insert own facility ratings"
  on public.facility_ratings;
create policy "Users insert own facility ratings"
  on public.facility_ratings for insert to authenticated
  with check (user_id = (select auth.uid()));

drop policy if exists "Users update own facility ratings"
  on public.facility_ratings;
create policy "Users update own facility ratings"
  on public.facility_ratings for update to authenticated
  using (user_id = (select auth.uid()))
  with check (user_id = (select auth.uid()));

grant select, insert, update on public.facility_ratings to authenticated;
