-- =====================================================================
-- activity_log: add invoice_id so CRM auto-invoice/follow-up flow can
-- record activity tied to a specific invoice (createActivity in
-- src/lib/crm.ts already passes opts.invoiceId).
-- Safe to re-run.
-- =====================================================================

alter table public.activity_log
  add column if not exists invoice_id uuid references public.invoices(id) on delete set null;

create index if not exists idx_activity_log_invoice_id on public.activity_log(invoice_id);
