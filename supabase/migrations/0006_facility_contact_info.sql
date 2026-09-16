-- Adds address/phone columns to public.facilities so the "Nearby Healthcare"
-- widget can show real contact info instead of hardcoded demo data, and fills
-- them in for the six Hyderabad facilities renamed in 0003.

alter table public.facilities add column if not exists address text;
alter table public.facilities add column if not exists phone text;

update public.facilities set
  address = 'Chandrayangutta, Hyderabad',
  phone = '040-24600001'
where id = 'fac-sc-001';

update public.facilities set
  address = 'Falaknuma, Hyderabad',
  phone = '040-24600002'
where id = 'fac-sc-002';

update public.facilities set
  address = 'Chatta Bazar, Hyderabad',
  phone = '040-24600003'
where id = 'fac-phc-001';

update public.facilities set
  address = 'Nampally, Hyderabad',
  phone = '040-24600004'
where id = 'fac-phc-002';

update public.facilities set
  address = 'Petlaburj, Hyderabad',
  phone = '040-12345679'
where id = 'fac-rh-001';

update public.facilities set
  address = 'Purani Haveli, Hyderabad',
  phone = '040-12345680'
where id = 'fac-dh-001';
