CREATE TABLE public.rebate_estimates (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  email TEXT NOT NULL,
  phone TEXT,
  zip TEXT NOT NULL,
  system_type TEXT NOT NULL,
  home_type TEXT NOT NULL,
  current_heating TEXT,
  estimated_total INTEGER NOT NULL DEFAULT 0,
  programs JSONB NOT NULL DEFAULT '[]'::jsonb,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

ALTER TABLE public.rebate_estimates ENABLE ROW LEVEL SECURITY;

-- Anyone can submit a new rebate estimate request (public form)
CREATE POLICY "Anyone can submit rebate estimates"
ON public.rebate_estimates
FOR INSERT
WITH CHECK (
  length(name) BETWEEN 1 AND 100
  AND length(email) BETWEEN 3 AND 255
  AND email ~* '^[^@\s]+@[^@\s]+\.[^@\s]+$'
  AND length(zip) BETWEEN 5 AND 10
  AND length(system_type) BETWEEN 1 AND 50
  AND length(home_type) BETWEEN 1 AND 50
);

-- No public SELECT/UPDATE/DELETE policies — leads are private