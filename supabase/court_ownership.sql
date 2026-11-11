alter table public.facilities
  add column if not exists owner_id uuid references auth.users (id) on delete set null;
alter table public.facilities
  add column if not exists source_request_id bigint
  references public.court_requests (id) on delete set null;

create unique index if not exists facilities_source_request_uidx
  on public.facilities (source_request_id)
  where source_request_id is not null;
create index if not exists facilities_owner_idx
  on public.facilities (owner_id);

create or replace function public.get_my_facility_ids()
returns table (facility_id bigint)
language sql
stable
security definer
set search_path = ''
as $$
  select facility.id
  from public.facilities as facility
  where auth.uid() is not null
    and facility.owner_id = auth.uid();
$$;

revoke all on function public.get_my_facility_ids() from public;
grant execute on function public.get_my_facility_ids() to authenticated;

with request_matches as (
  select
    facility.id as facility_id,
    request.id as request_id,
    request.requester_id,
    count(*) over (partition by facility.id) as facility_match_count,
    count(*) over (partition by request.id) as request_match_count
  from public.facilities as facility
  join public.court_requests as request
    on request.status = 'Confirmed'
    and facility.name = request.name
    and facility.type = request.type
    and facility.location = request.location
    and facility.price = request.price
    and facility.image = request.image
    and facility.description = request.description
),
unambiguous_matches as (
  select facility_id, request_id, requester_id
  from request_matches
  where facility_match_count = 1 and request_match_count = 1
)
update public.facilities as facility
set owner_id = matched_court.requester_id,
    source_request_id = matched_court.request_id
from unambiguous_matches as matched_court
where facility.id = matched_court.facility_id
  and facility.owner_id is null
  and facility.source_request_id is null;

drop policy if exists "Admins update facilities" on public.facilities;
drop policy if exists "Admins delete facilities" on public.facilities;
create policy "Owners and admins update facilities"
  on public.facilities for update to authenticated
  using ((select public.is_admin()) or owner_id = (select auth.uid()))
  with check ((select public.is_admin()) or owner_id = (select auth.uid()));
create policy "Owners and admins delete facilities"
  on public.facilities for delete to authenticated
  using ((select public.is_admin()) or owner_id = (select auth.uid()));

revoke update on public.facilities from authenticated;
grant update (name, type, location, price, image, description)
  on public.facilities to authenticated;

create or replace function public.review_court_request(
  request_id bigint,
  new_status text
)
returns bigint
language plpgsql
security definer
set search_path = ''
as $$
declare
  requested public.court_requests%rowtype;
  new_facility_id bigint;
begin
  if not (select public.is_admin()) then
    raise exception 'Only administrators can review court requests';
  end if;
  if new_status not in ('Confirmed', 'Rejected') then
    raise exception 'Invalid court request status';
  end if;

  select * into requested
  from public.court_requests
  where id = request_id and status = 'Pending'
  for update;

  if not found then
    raise exception 'Pending court request not found';
  end if;

  if new_status = 'Confirmed' then
    insert into public.facilities (
      owner_id, source_request_id, name, type, location, price, image, description
    )
    values (
      requested.requester_id,
      requested.id,
      requested.name,
      requested.type,
      requested.location,
      requested.price,
      requested.image,
      requested.description
    )
    returning id into new_facility_id;
  end if;

  update public.court_requests
  set status = new_status
  where id = request_id;

  return new_facility_id;
end;
$$;

revoke all on function public.review_court_request(bigint, text) from public;
grant execute on function public.review_court_request(bigint, text) to authenticated;
