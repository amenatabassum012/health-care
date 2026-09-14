-- Run this once in the Supabase SQL Editor (Project -> SQL Editor -> New query -> paste -> Run).
-- Creates every table the app needs to move off mock/local data, seeds reference
-- data (facilities, specialties, shops, shop stock, stock items) from the
-- mocks that shipped in src/mocks/*.ts, and enables Realtime + permissive RLS
-- (demo-grade: the app has no Supabase Auth session, only a local "staff"/"patient"
-- object, so policies allow the anon key full access — do not use this posture
-- for a real deployment with real patient data).

-- ---------------------------------------------------------------------------
-- facilities
-- ---------------------------------------------------------------------------
create table if not exists public.facilities (
  id text primary key,
  name text not null,
  tier text not null,
  district text not null,
  state text not null,
  distance_km numeric,
  latitude double precision,
  longitude double precision,
  created_at timestamptz not null default now()
);

insert into public.facilities (id, name, tier, district, state, distance_km, latitude, longitude) values
  ('fac-sc-001', 'Sub-Centre Bhagwanpur', 'SubCentre', 'Haridwar', 'Uttarakhand', 2.1, 29.8639, 77.7511),
  ('fac-sc-002', 'Sub-Centre Rampur Kalan', 'SubCentre', 'Haridwar', 'Uttarakhand', 4.8, 29.8931, 78.0715),
  ('fac-phc-001', 'PHC Bahadrabad', 'PHC', 'Haridwar', 'Uttarakhand', 7.3, 29.9264, 78.0322),
  ('fac-phc-002', 'PHC Narsan', 'PHC', 'Haridwar', 'Uttarakhand', 11.6, 29.8408, 78.0619),
  ('fac-rh-001', 'Rural Hospital Roorkee', 'RuralHospital', 'Haridwar', 'Uttarakhand', 18.2, 29.8543, 77.8880),
  ('fac-dh-001', 'District Hospital Haridwar', 'DistrictHospital', 'Haridwar', 'Uttarakhand', 26.4, 29.9457, 78.1642)
on conflict (id) do nothing;

-- ---------------------------------------------------------------------------
-- specialties
-- ---------------------------------------------------------------------------
create table if not exists public.specialties (
  id text primary key,
  label text not null
);

insert into public.specialties (id, label) values
  ('spec-general', 'General Medicine'),
  ('spec-gynae', 'Gynaecology & Obstetrics'),
  ('spec-peds', 'Paediatrics'),
  ('spec-cardio', 'Cardiology'),
  ('spec-ortho', 'Orthopaedics'),
  ('spec-derma', 'Dermatology'),
  ('spec-psych', 'Psychiatry'),
  ('spec-ent', 'ENT')
on conflict (id) do nothing;

-- ---------------------------------------------------------------------------
-- patients (superset of the ASHA shape already used + the patient-app Patient type)
-- ---------------------------------------------------------------------------
create table if not exists public.patients (
  id text primary key default ('patient-' || extract(epoch from clock_timestamp())::text),
  name text not null,
  age int,
  gender text,
  phone text,
  dob text,
  village text,
  address text,
  condition text,
  symptoms text,
  emergency_contact text,
  status text not null default 'New',
  priority text not null default 'Normal',
  risk text,
  last_visit text,
  next_action text,
  preferred_language text,
  is_guardian_managed boolean not null default false,
  abha_id text,
  registered_date text,
  facility_id text references public.facilities(id),
  created_at timestamptz not null default now()
);

-- ---------------------------------------------------------------------------
-- appointments
-- ---------------------------------------------------------------------------
create table if not exists public.appointments (
  id text primary key,
  patient_id text not null references public.patients(id) on delete cascade,
  facility_id text references public.facilities(id),
  doctor_id text,
  type text not null,
  slot_time timestamptz not null,
  queue_position int,
  estimated_wait_minutes int,
  status text not null default 'Booked',
  booked_for_name text,
  booked_for_relation text,
  cancellation_reason text,
  created_at timestamptz not null default now()
);

-- ---------------------------------------------------------------------------
-- referrals
-- ---------------------------------------------------------------------------
create table if not exists public.referrals (
  id text primary key,
  patient_id text not null references public.patients(id) on delete cascade,
  patient_name text,
  from_facility_id text references public.facilities(id),
  from_doctor_id text,
  to_facility_id text references public.facilities(id),
  to_doctor_id text,
  specialty_id text references public.specialties(id),
  urgency text not null default 'Routine',
  structured_summary text,
  status text not null default 'Pending',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- ---------------------------------------------------------------------------
-- health_records
-- ---------------------------------------------------------------------------
create table if not exists public.health_records (
  id text primary key,
  patient_id text not null references public.patients(id) on delete cascade,
  facility_id text references public.facilities(id),
  facility_name text,
  type text not null,
  title text not null,
  summary text,
  date date not null default current_date,
  created_at timestamptz not null default now()
);

-- ---------------------------------------------------------------------------
-- follow_ups
-- ---------------------------------------------------------------------------
create table if not exists public.follow_ups (
  id text primary key,
  patient_id text not null references public.patients(id) on delete cascade,
  patient_name text,
  risk_category text,
  due_at timestamptz,
  channel text not null default 'App',
  status text not null default 'Pending',
  created_at timestamptz not null default now()
);

-- ---------------------------------------------------------------------------
-- feedback
-- ---------------------------------------------------------------------------
create table if not exists public.feedback (
  id text primary key,
  appointment_id text references public.appointments(id) on delete cascade,
  doctor_id text,
  patient_id text references public.patients(id) on delete cascade,
  rating int not null,
  comment text,
  created_at timestamptz not null default now()
);

-- ---------------------------------------------------------------------------
-- stock_items (government facility stock)
-- ---------------------------------------------------------------------------
create table if not exists public.stock_items (
  id text primary key,
  facility_id text references public.facilities(id),
  name text not null,
  category text not null,
  status text not null default 'Available',
  updated_at timestamptz not null default now()
);

insert into public.stock_items (id, facility_id, name, category, status, updated_at) values
  ('stk-001', 'fac-phc-001', 'Paracetamol 500mg', 'Medicine', 'Available', '2026-08-24T08:00:00+05:30'),
  ('stk-002', 'fac-phc-001', 'Iron & Folic Acid tablets', 'Medicine', 'LowStock', '2026-08-24T08:00:00+05:30'),
  ('stk-003', 'fac-phc-001', 'ORS Sachets', 'Medicine', 'Available', '2026-08-24T08:00:00+05:30'),
  ('stk-004', 'fac-phc-001', 'Chest X-ray', 'Diagnostic', 'Unavailable', '2026-08-23T18:00:00+05:30'),
  ('stk-005', 'fac-dh-001', 'Chest X-ray', 'Diagnostic', 'Available', '2026-08-24T08:00:00+05:30'),
  ('stk-006', 'fac-dh-001', 'Amoxicillin 500mg', 'Medicine', 'Available', '2026-08-24T08:00:00+05:30')
on conflict (id) do nothing;

-- ---------------------------------------------------------------------------
-- medical_shops
-- ---------------------------------------------------------------------------
create table if not exists public.medical_shops (
  id text primary key,
  name text not null,
  address text,
  district text,
  state text,
  phone text,
  latitude double precision not null,
  longitude double precision not null
);

insert into public.medical_shops (id, name, address, district, state, phone, latitude, longitude) values
  ('shop-001', 'Sharma Medical Store', 'Main Bazaar, Bahadrabad', 'Haridwar', 'Uttarakhand', '+911334200001', 29.9250, 78.0340),
  ('shop-002', 'Jai Mata Di Pharmacy', 'Station Road, Roorkee', 'Haridwar', 'Uttarakhand', '+911332200002', 29.8560, 77.8865),
  ('shop-003', 'Ganga Medicos', 'Upper Road, Haridwar', 'Haridwar', 'Uttarakhand', '+911334200003', 29.9475, 78.1610),
  ('shop-004', 'Kisan Pharmacy', 'Bus Stand, Narsan', 'Haridwar', 'Uttarakhand', '+911334200004', 29.8420, 78.0600)
on conflict (id) do nothing;

-- ---------------------------------------------------------------------------
-- shop_stock
-- ---------------------------------------------------------------------------
create table if not exists public.shop_stock (
  id text primary key,
  shop_id text not null references public.medical_shops(id) on delete cascade,
  name text not null,
  category text not null,
  status text not null default 'Available',
  updated_at timestamptz not null default now()
);

insert into public.shop_stock (id, shop_id, name, category, status, updated_at) values
  ('sstk-001', 'shop-001', 'Paracetamol 500mg', 'Medicine', 'Available', '2026-08-24T08:00:00+05:30'),
  ('sstk-002', 'shop-001', 'ORS Sachets', 'Medicine', 'Available', '2026-08-24T08:00:00+05:30'),
  ('sstk-003', 'shop-002', 'Amoxicillin 500mg', 'Medicine', 'LowStock', '2026-08-23T18:00:00+05:30'),
  ('sstk-004', 'shop-003', 'Chest X-ray', 'Diagnostic', 'Unavailable', '2026-08-23T18:00:00+05:30'),
  ('sstk-005', 'shop-004', 'Iron & Folic Acid tablets', 'Medicine', 'Available', '2026-08-24T08:00:00+05:30')
on conflict (id) do nothing;

-- ---------------------------------------------------------------------------
-- staff: add columns the app already writes to (qualifications) if missing,
-- and make sure ASHA workers can be represented via the existing role column.
-- ---------------------------------------------------------------------------
alter table public.staff add column if not exists qualifications jsonb not null default '[]'::jsonb;
alter table public.staff add column if not exists consultation_fee_inr numeric;
alter table public.staff add column if not exists availability text;
alter table public.staff add column if not exists rating numeric;
alter table public.staff add column if not exists rating_count int;

-- ---------------------------------------------------------------------------
-- Grants: creating tables in the SQL editor does NOT automatically give the
-- anon/authenticated roles PostgREST uses any table privileges — RLS policies
-- only take effect once a role already has a GRANT, so without this every
-- request fails with "permission denied for table X" regardless of policy.
-- ---------------------------------------------------------------------------
grant usage on schema public to anon, authenticated;

do $$
declare
  t text;
begin
  for t in select unnest(array[
    'facilities', 'specialties', 'patients', 'appointments', 'referrals',
    'health_records', 'follow_ups', 'feedback', 'stock_items',
    'medical_shops', 'shop_stock'
  ])
  loop
    execute format('grant select, insert, update, delete on public.%I to anon, authenticated', t);
  end loop;
end $$;

-- ---------------------------------------------------------------------------
-- RLS: enable + permissive anon policies (demo posture, matches existing
-- staff/otp_codes tables which are already anon-writable).
-- ---------------------------------------------------------------------------
do $$
declare
  t text;
begin
  for t in select unnest(array[
    'facilities', 'specialties', 'patients', 'appointments', 'referrals',
    'health_records', 'follow_ups', 'feedback', 'stock_items',
    'medical_shops', 'shop_stock'
  ])
  loop
    execute format('alter table public.%I enable row level security', t);
    execute format('drop policy if exists "anon_all_%1$s" on public.%1$s', t);
    execute format(
      'create policy "anon_all_%1$s" on public.%1$s for all using (true) with check (true)',
      t
    );
  end loop;
end $$;

-- ---------------------------------------------------------------------------
-- Realtime: add every table to the supabase_realtime publication so
-- postgres_changes subscriptions work from the client.
-- ---------------------------------------------------------------------------
do $$
declare
  t text;
begin
  for t in select unnest(array[
    'patients', 'appointments', 'referrals', 'health_records',
    'follow_ups', 'feedback', 'stock_items', 'shop_stock', 'staff'
  ])
  loop
    begin
      execute format('alter publication supabase_realtime add table public.%I', t);
    exception when duplicate_object then
      null;
    end;
  end loop;
end $$;
