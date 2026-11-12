create or replace function public.cancel_event_registration(registration_id bigint)
returns void
language plpgsql
security definer
set search_path = ''
as $$
declare
  registration public.event_registrations%rowtype;
begin
  select * into registration
  from public.event_registrations
  where id = registration_id
    and user_id = auth.uid()
    and status in ('Pending', 'Confirmed')
  for update;

  if not found then
    raise exception 'Active registration not found';
  end if;

  delete from public.event_registrations where id = registration_id;
  update public.events
  set spots_left = least(capacity, spots_left + registration.spots)
  where id = registration.event_id;
end;
$$;

grant execute on function public.cancel_event_registration(bigint) to authenticated;
