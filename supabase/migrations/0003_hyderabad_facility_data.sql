-- Renames the demo facility rows in place to real Hyderabad, Telangana hospitals
-- so doctor-dashboard demo data (which doctor works where) reads as realistic
-- local data instead of the original Haridwar/Uttarakhand placeholders.
--
-- No schema change and no rows added/removed — every id, tier and foreign-key
-- relationship (patients/appointments/staff -> facility_id) is unchanged, only
-- name/district/state/distance/coordinates are updated on the existing rows.

update public.facilities set
  name = 'Urban PHC, Chandrayangutta',
  district = 'Hyderabad',
  state = 'Telangana',
  distance_km = 1.4,
  latitude = 17.3284,
  longitude = 78.4832
where id = 'fac-sc-001';

update public.facilities set
  name = 'Urban PHC, Falaknuma',
  district = 'Hyderabad',
  state = 'Telangana',
  distance_km = 2.6,
  latitude = 17.3389,
  longitude = 78.4778
where id = 'fac-sc-002';

update public.facilities set
  name = 'Urban PHC, Chatta Bazar',
  district = 'Hyderabad',
  state = 'Telangana',
  distance_km = 1.1,
  latitude = 17.3606,
  longitude = 78.4747
where id = 'fac-phc-001';

update public.facilities set
  name = 'Urban PHC, Nampally',
  district = 'Hyderabad',
  state = 'Telangana',
  distance_km = 3.8,
  latitude = 17.3937,
  longitude = 78.4667
where id = 'fac-phc-002';

update public.facilities set
  name = 'Government Maternity Hospital, Petlaburj',
  district = 'Hyderabad',
  state = 'Telangana',
  distance_km = 2.3,
  latitude = 17.3833,
  longitude = 78.4747
where id = 'fac-rh-001';

update public.facilities set
  name = 'Princess Durru Shehvar Hospital, Purani Haveli',
  district = 'Hyderabad',
  state = 'Telangana',
  distance_km = 1.8,
  latitude = 17.3565,
  longitude = 78.4741
where id = 'fac-dh-001';
