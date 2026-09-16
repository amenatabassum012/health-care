-- Seeds the demo staff accounts from src/mocks/staff.ts into the real
-- public.staff table.
--
-- Why: the demo/test doctor login (facility code 000000, see loginStaff in
-- src/lib/api/doctor.ts) matches these staff IDs against the client-side
-- MOCK_STAFF array only, so a doctor signed in that way never actually
-- existed as a row in public.staff. The patient booking page queries
-- public.staff directly (getStaff in src/lib/api/shared.ts), filtered by
-- facility_id + verification_status = 'Verified', so those demo doctors
-- were invisible to patients even though they appeared in their own
-- dashboard. Inserting the same rows here makes both sides agree.
insert into public.staff (
  id, name, phone, email, role, specialty_id, facility_id,
  nmc_registration_no, credential_file_name, qualifications,
  verification_status, consultation_fee_inr, availability, rating, rating_count
) values
  (
    'staff-001', 'Dr. Durru Shehvar', '9876500011', 'durru.shehvar@example.in',
    'Specialist', 'spec-gynae', 'fac-dh-001',
    'TS-MCI-44210', null,
    '[
      {"id": "qual-001", "degree": "MBBS", "institution": "Osmania Medical College, Hyderabad", "year": "2010"},
      {"id": "qual-002", "degree": "MD — Gynaecology & Obstetrics", "institution": "Osmania Medical College, Hyderabad", "year": "2014", "fileName": "md_gynae_certificate.pdf"}
    ]'::jsonb,
    'Verified', 200, 'Mon–Sat, 10:00 AM – 4:00 PM', 4.7, 128
  ),
  (
    'staff-002', 'Dr. Rohit Sharma', '9876500022', 'rohit.sharma@example.in',
    'Doctor', 'spec-general', 'fac-phc-001',
    'UK-MCI-51872', null,
    '[
      {"id": "qual-003", "degree": "MBBS", "institution": "King George''s Medical University", "year": "2012", "fileName": "mbbs_degree.pdf"}
    ]'::jsonb,
    'Verified', 100, 'Mon–Sat, 9:00 AM – 2:00 PM', 4.4, 76
  ),
  (
    'staff-003', 'Priya Nautiyal', '9876500033', 'priya.nautiyal@example.in',
    'CHO', null, 'fac-sc-001',
    'UK-CHO-1092', null, '[]'::jsonb,
    'Pending', null, null, null, null
  ),
  (
    'staff-004', 'Dr. Karan Bisht', '9876500044', 'karan.bisht@example.in',
    'Specialist', 'spec-cardio', 'fac-dh-001',
    'UK-MCI-30044', null, '[]'::jsonb,
    'Pending', null, null, null, null
  ),
  (
    'staff-005', 'Meena Rawat', '9876500055', 'meena.rawat@example.in',
    'FacilityAdmin', null, 'fac-phc-001',
    'N/A', null, '[]'::jsonb,
    'Verified', null, null, null, null
  ),
  (
    'staff-006', 'Dr. Neha Joshi', '9876500066', 'neha.joshi@example.in',
    'Doctor', 'spec-general', 'fac-phc-001',
    'UK-MCI-60219', null, '[]'::jsonb,
    'Pending', null, null, null, null
  ),
  (
    'asha-001', 'Anitha', '9876543210', 'anitha@swasthyasetu.org',
    'ASHA', null, 'fac-phc-001',
    'N/A', null, '[]'::jsonb,
    'Verified', null, null, null, null
  )
on conflict do nothing;
