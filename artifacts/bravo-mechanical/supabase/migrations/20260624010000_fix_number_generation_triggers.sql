-- Make the auto-number triggers crash-proof. The previous versions ran
-- MAX(CAST(SUBSTRING(number FROM 4) AS INTEGER)) over ALL rows, which throws
-- 22P02 if any existing value isn't strictly PREFIX + digits (e.g. the
-- 'INV-260619-35998' rows broke every new invoice insert). We now (a) respect
-- an explicitly supplied number and (b) only consider well-formed values.

create or replace function public.generate_invoice_number()
returns trigger language plpgsql set search_path to 'public' as $$
declare next_num integer;
begin
  if new.invoice_number is not null and new.invoice_number <> '' then
    return new;
  end if;
  select coalesce(max(cast(substring(invoice_number from 4) as integer)), 0) + 1
    into next_num from invoices where invoice_number ~ '^INV[0-9]+$';
  new.invoice_number := 'INV' || lpad(next_num::text, 5, '0');
  return new;
end; $$;

create or replace function public.generate_job_number()
returns trigger language plpgsql set search_path to 'public' as $$
declare next_num integer;
begin
  if new.job_number is not null and new.job_number <> '' then
    return new;
  end if;
  select coalesce(max(cast(substring(job_number from 4) as integer)), 0) + 1
    into next_num from jobs where job_number ~ '^JOB[0-9]+$';
  new.job_number := 'JOB' || lpad(next_num::text, 5, '0');
  return new;
end; $$;

create or replace function public.generate_estimate_number()
returns trigger language plpgsql set search_path to 'public' as $$
declare next_num integer;
begin
  if new.estimate_number is not null and new.estimate_number <> '' then
    return new;
  end if;
  select coalesce(max(cast(substring(estimate_number from 4) as integer)), 0) + 1
    into next_num from estimates where estimate_number ~ '^EST[0-9]+$';
  new.estimate_number := 'EST' || lpad(next_num::text, 5, '0');
  return new;
end; $$;
