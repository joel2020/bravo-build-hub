
CREATE POLICY "Public forms can create leads" ON public.leads
FOR INSERT TO anon
WITH CHECK (
  status = 'new'
  AND (length(name) >= 1 AND length(name) <= 200)
  AND (source IN ('contact_form', 'rebate_estimator'))
);
