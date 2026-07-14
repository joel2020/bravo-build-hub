-- Nightly job: flip sent invoices to 'overdue' once their due_date passes.
create extension if not exists pg_cron;

create or replace function public.mark_overdue_invoices()
returns integer language plpgsql security definer set search_path to 'public' as $$
declare n integer;
begin
  update public.invoices
     set status = 'overdue'
   where status = 'sent'
     and due_date is not null
     and due_date < current_date;
  get diagnostics n = row_count;
  return n;
end; $$;

-- Run daily at 06:10 UTC. Re-schedule idempotently.
select cron.unschedule('mark-overdue-invoices')
  where exists (select 1 from cron.job where jobname = 'mark-overdue-invoices');
select cron.schedule('mark-overdue-invoices', '10 6 * * *', $$select public.mark_overdue_invoices();$$);
