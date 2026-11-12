drop policy if exists "Users read own bookings and admins read all"
  on public.bookings;
create policy "Users read own bookings and admins read all"
  on public.bookings for select to authenticated
  using (user_id = (select auth.uid()) or (select public.is_admin()));

grant select on public.bookings to authenticated;
