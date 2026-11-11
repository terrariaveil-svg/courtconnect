create or replace function public.get_booking_availability(target_date date)
returns table (
  facility_id bigint,
  start_time text,
  end_time text,
  status text
)
language sql
stable
security definer
set search_path = ''
as $$
  select
    (booking.facility ->> 'id')::bigint,
    booking.start_time,
    booking.end_time,
    booking.status
  from public.bookings as booking
  where auth.uid() is not null
    and booking.booking_date = target_date
    and booking.status in ('Pending', 'Confirmed');
$$;

create or replace function public.create_booking(
  requested_facility jsonb,
  requested_customer text,
  requested_date date,
  requested_start_time text,
  requested_end_time text
)
returns bigint
language plpgsql
security definer
set search_path = ''
as $$
declare
  target_facility_id bigint;
  target_start time;
  target_end time;
  local_now timestamp;
  created_booking_id bigint;
begin
  if auth.uid() is null then
    raise exception 'Sign in before booking a court';
  end if;

  if requested_facility is null
    or jsonb_typeof(requested_facility) <> 'object'
    or not (requested_facility ? 'id')
    or nullif(trim(requested_customer), '') is null
    or length(requested_customer) > 200 then
    raise exception 'Valid court and customer details are required';
  end if;

  target_facility_id := (requested_facility ->> 'id')::bigint;
  target_start := requested_start_time::time;
  target_end := requested_end_time::time;

  if target_end <= target_start then
    raise exception 'End time must be later than start time';
  end if;

  local_now := timezone('Asia/Manila', now());
  if requested_date < local_now::date
    or (
      requested_date = local_now::date
      and target_start <= local_now::time
    ) then
    raise exception 'This time slot has already passed';
  end if;

  perform pg_advisory_xact_lock(
    hashtextextended(
      target_facility_id::text || ':' || requested_date::text,
      0
    )
  );

  if exists (
    select 1
    from public.bookings as existing
    where (existing.facility ->> 'id')::bigint = target_facility_id
      and existing.booking_date = requested_date
      and existing.status in ('Pending', 'Confirmed')
      and existing.start_time::time < target_end
      and existing.end_time::time > target_start
  ) then
    raise exception 'This court and time are already unavailable';
  end if;

  insert into public.bookings (
    user_id,
    facility,
    customer,
    booking_date,
    start_time,
    end_time
  )
  values (
    auth.uid(),
    requested_facility,
    trim(requested_customer),
    requested_date,
    requested_start_time,
    requested_end_time
  )
  returning id into created_booking_id;

  return created_booking_id;
end;
$$;

revoke all on function public.get_booking_availability(date) from public;
grant execute on function public.get_booking_availability(date) to authenticated;
revoke all on function public.create_booking(jsonb, text, date, text, text) from public;
grant execute on function public.create_booking(jsonb, text, date, text, text) to authenticated;

revoke insert on public.bookings from authenticated;
