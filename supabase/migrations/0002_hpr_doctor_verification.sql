-- ABDM HPR (Healthcare Professionals Registry) verification data.
-- Separate from public.staff (shared by ASHA/FacilityAdmin/CHO/Doctor roles) so this
-- integration never touches that table's schema or rows — it only reads staff.id.
--
-- HPR does not expose a bulk "list all doctors" API; it is used here to verify one
-- doctor's HPR ID at registration time and store the officially returned profile
-- fields for the admin verification screen. If ABDM is unreachable or credentials
-- are not yet approved, verification_status stays 'unavailable' and the existing
-- self-registration flow (public.staff, verification_status = 'Pending') is
-- unaffected — admins still verify manually from the uploaded credential.

create table if not exists public.doctors (
  id text primary key default ('doc-hpr-' || extract(epoch from clock_timestamp())::text),
  staff_id text not null unique references public.staff(id) on delete cascade,
  hpr_id text,
  verification_status text not null default 'unavailable'
    check (verification_status in ('pending', 'verified', 'failed', 'unavailable')),
  verified_name text,
  verified_qualification text,
  verified_specialization text,
  verified_facility text,
  error_message text,
  raw_response jsonb,
  checked_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

grant usage on schema public to anon, authenticated;
grant select, insert, update, delete on public.doctors to anon, authenticated;

alter table public.doctors enable row level security;
drop policy if exists "anon_all_doctors" on public.doctors;
create policy "anon_all_doctors" on public.doctors for all using (true) with check (true);

do $$
begin
  execute 'alter publication supabase_realtime add table public.doctors';
exception when duplicate_object then
  null;
end $$;
