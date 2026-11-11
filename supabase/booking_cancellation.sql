drop policy if exists "Users cancel own pending bookings" on public.bookings;
drop policy if exists "Users delete own bookings" on public.bookings;

create policy "Users delete own bookings"
  on public.bookings for delete to authenticated
  using (user_id = (select auth.uid()));

grant delete on public.bookings to authenticated;
