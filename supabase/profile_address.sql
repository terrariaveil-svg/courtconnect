alter table public.profiles
  add column if not exists address text not null default '';

drop policy if exists "Users update own profile" on public.profiles;
create policy "Users update own profile"
  on public.profiles for update to authenticated
  using (id = (select auth.uid()))
  with check (id = (select auth.uid()));

revoke update on public.profiles from authenticated;
grant update (full_name, address) on public.profiles to authenticated;

notify pgrst, 'reload schema';
