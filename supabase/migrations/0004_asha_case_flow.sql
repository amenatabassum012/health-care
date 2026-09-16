-- Adds the ASHA-assisted appointment flow: a patient can opt in to ASHA help
-- when booking, an ASHA worker at that facility claims the case, and the
-- assigned doctor + ASHA worker can message each other about that specific
-- case in real time.
--
-- Additive only: no existing column is changed or dropped, no row is removed.

alter table public.appointments add column if not exists wants_asha boolean not null default false;
alter table public.appointments add column if not exists asha_worker_id text references public.staff(id);

alter table public.staff add column if not exists bio text;

create table if not exists public.case_messages (
  id text primary key default ('msg-' || extract(epoch from clock_timestamp())::text),
  appointment_id text not null references public.appointments(id) on delete cascade,
  sender_staff_id text not null references public.staff(id),
  body text not null,
  created_at timestamptz not null default now()
);

grant usage on schema public to anon, authenticated;
grant select, insert on public.case_messages to anon, authenticated;

alter table public.case_messages enable row level security;
drop policy if exists "anon_all_case_messages" on public.case_messages;
create policy "anon_all_case_messages" on public.case_messages for all using (true) with check (true);

do $$
begin
  execute 'alter publication supabase_realtime add table public.case_messages';
exception when duplicate_object then
  null;
end $$;
