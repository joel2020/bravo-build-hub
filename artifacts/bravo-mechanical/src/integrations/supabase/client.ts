import { createClient } from '@supabase/supabase-js';
import type { Database } from './types';

const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL as string | undefined;
const SUPABASE_PUBLISHABLE_KEY = import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY as string | undefined;

// Supabase is only required for /admin routes (CRM).
// If env vars are missing the public marketing site still loads normally.
export const isSupabaseConfigured =
  !!SUPABASE_URL?.trim() && !!SUPABASE_PUBLISHABLE_KEY?.trim();

const FALLBACK_URL = 'https://tzczkcvavudoyuuetwcr.supabase.co';
const FALLBACK_KEY = 'placeholder-key-set-vite-supabase-publishable-key';

export const supabase = createClient<Database>(
  SUPABASE_URL?.trim() || FALLBACK_URL,
  SUPABASE_PUBLISHABLE_KEY?.trim() || FALLBACK_KEY,
  {
    auth: {
      storage: typeof window !== 'undefined' ? window.localStorage : undefined,
      persistSession: true,
      autoRefreshToken: true,
    },
  },
);
