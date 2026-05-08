import { createClient } from '@supabase/supabase-js';
import type { Database } from './types';

const EXPECTED_SUPABASE_URL = 'https://vqygaqrderxvumczpfnu.supabase.co';
const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL;
const SUPABASE_PUBLISHABLE_KEY = import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY;

function requireClientEnv(name: string, value: string | undefined): string {
  if (!value || !value.trim()) {
    throw new Error(
      `${name} is required for Bravo Mechanical Supabase features. ` +
        `Set ${name} in Vercel and local .env files; do not use placeholder credentials.`,
    );
  }
  return value.trim();
}

const supabaseUrl = requireClientEnv('VITE_SUPABASE_URL', SUPABASE_URL);
const supabasePublishableKey = requireClientEnv(
  'VITE_SUPABASE_PUBLISHABLE_KEY',
  SUPABASE_PUBLISHABLE_KEY,
);

if (supabaseUrl !== EXPECTED_SUPABASE_URL) {
  throw new Error(
    `VITE_SUPABASE_URL must point to the Bravo Mechanical Supabase project (${EXPECTED_SUPABASE_URL}).`,
  );
}

if ('SUPABASE_SERVICE_ROLE_KEY' in import.meta.env) {
  throw new Error(
    'SUPABASE_SERVICE_ROLE_KEY must never be exposed to the browser. Remove any VITE/client-side service-role configuration.',
  );
}

export const supabase = createClient<Database>(supabaseUrl, supabasePublishableKey, {
  auth: {
    storage: localStorage,
    persistSession: true,
    autoRefreshToken: true,
  },
});

export const isSupabaseConfigured = true;
