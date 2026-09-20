-- Re-seeds the demo doctor accounts (staff-001, staff-002) into public.staff.
--
-- Why: these rows were expected to exist after migration 0005, but are
-- missing from the live database — the demo doctor login (facility code
-- 000000) returns them from the client-side MOCK_STAFF array regardless, so
-- they show up on the doctor dashboard, but the patient booking page reads
-- public.staff directly and found nothing, so the doctor never appeared
-- there. Upserting them here makes both sides agree again.
--
-- Note: the phone numbers from migration 0005 (9876500011 / 9876500022) now
-- collide with real test registrations submitted through the staff sign-up
-- form (unrelated Pending accounts), which own staff_phone_key for those
-- numbers. The demo login (facility code 000000) matches against the
-- client-side MOCK_STAFF array only and never reads this table's phone
-- column, so using distinct placeholder numbers here is safe and avoids
-- touching those real registrations.
insert into public.staff (
  id, name, phone, email, role, specialty_id, facility_id,
  nmc_registration_no, credential_file_name, qualifications,
  verification_status, consultation_fee_inr, availability, rating, rating_count
) values
  (
    'staff-001', 'Dr. Durru Shehvar', '9800000011', 'durru.shehvar@example.in',
    'Specialist', 'spec-gynae', 'fac-dh-001',
    'TS-MCI-44210', null,
    '[
      {"id": "qual-001", "degree": "MBBS", "institution": "Osmania Medical College, Hyderabad", "year": "2010"},
      {"id": "qual-002", "degree": "MD — Gynaecology & Obstetrics", "institution": "Osmania Medical College, Hyderabad", "year": "2014", "fileName": "md_gynae_certificate.pdf"}
    ]'::jsonb,
    'Verified', 200, 'Mon–Sat, 10:00 AM – 4:00 PM', 4.7, 128
  ),
  (
    'staff-002', 'Dr. Rohit Sharma', '9800000022', 'rohit.sharma@example.in',
    'Doctor', 'spec-general', 'fac-phc-001',
    'UK-MCI-51872', null,
    '[
      {"id": "qual-003", "degree": "MBBS", "institution": "King George''s Medical University", "year": "2012", "fileName": "mbbs_degree.pdf"}
    ]'::jsonb,
    'Verified', 100, 'Mon–Sat, 9:00 AM – 2:00 PM', 4.4, 76
  )
on conflict (id) do update set
  name = excluded.name,
  phone = excluded.phone,
  email = excluded.email,
  role = excluded.role,
  specialty_id = excluded.specialty_id,
  facility_id = excluded.facility_id,
  nmc_registration_no = excluded.nmc_registration_no,
  qualifications = excluded.qualifications,
  verification_status = excluded.verification_status,
  consultation_fee_inr = excluded.consultation_fee_inr,
  availability = excluded.availability,
  rating = excluded.rating,
  rating_count = excluded.rating_count;
