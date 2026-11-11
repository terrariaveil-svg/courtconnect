create or replace function public.review_booking(
  booking_id bigint,
  new_status text
)
returns text
language plpgsql
security definer
set search_path = ''
as $$
declare
  requested public.bookings%rowtype;
  target_facility_id bigint;
begin
  if auth.uid() is null then
    raise exception 'Sign in before reviewing a booking';
  end if;
  if new_status not in ('Confirmed', 'Rejected') then
    raise exception 'Booking status must be Confirmed or Rejected';
  end if;

  select * into requested
  from public.bookings
  where id = booking_id and status = 'Pending'
  for update;

  if not found then
    raise exception 'Pending booking not found';
  end if;

  target_facility_id := (requested.facility ->> 'id')::bigint;
  if not (select public.is_admin()) and not exists (
    select 1
    from public.facilities as facility
    where facility.id = target_facility_id
      and facility.owner_id = auth.uid()
  ) then
    raise exception 'Only an administrator or the court owner can review this booking';
  end if;

  if new_status = 'Confirmed' then
    perform pg_advisory_xact_lock(
      hashtextextended(
        target_facility_id::text || ':' || requested.booking_date::text,
        0
      )
    );

    if exists (
      select 1
      from public.bookings as existing
      where existing.id <> requested.id
        and (existing.facility ->> 'id')::bigint = target_facility_id
        and existing.booking_date = requested.booking_date
        and existing.status = 'Confirmed'
        and existing.start_time::time < requested.end_time::time
        and existing.end_time::time > requested.start_time::time
    ) then
      raise exception 'This court and time overlap an approved booking';
    end if;
  end if;

  update public.bookings
  set status = new_status
  where id = requested.id;

  return new_status;
end;
$$;

revoke all on function public.review_booking(bigint, text) from public;
grant execute on function public.review_booking(bigint, text) to authenticated;
