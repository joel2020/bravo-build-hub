
ALTER TABLE invoices
  ADD COLUMN IF NOT EXISTS line_items jsonb NOT NULL DEFAULT '[]',
  ADD COLUMN IF NOT EXISTS tax_rate numeric(5,3) NOT NULL DEFAULT 0,
  ADD COLUMN IF NOT EXISTS payment_method text;
