import { createClient } from '@supabase/supabase-js';

// Type definitions for our database tables
export type Chip = {
  id: number;
  uid: string;
  created_at: string;
  last_tap_at: string | null;
};

export type RewardPeriod = {
  id: number;
  started_at: string;
  ended_at: string | null;
  created_by: string | null;
  created_at: string;
};

export type Claim = {
  id: number;
  chip_id: number;
  reward_period_id: number;
  claimed_at: string;
  wallet_address: string | null; // TODO: this should not be nullable
};

export type Admin = {
  id: number;
  username: string;
  password_hash: string;
  created_at: string;
};

// Server-side Supabase client - only use in Server Components or API routes
// This uses the service role key which has full admin access
export const createServerSupabaseClient = () => {
  const supabaseUrl = process.env.SUPABASE_URL;
  const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  
  if (!supabaseUrl || !supabaseKey) {
    throw new Error('Missing Supabase environment variables');
  }
  
  return createClient(supabaseUrl, supabaseKey, {
    auth: {
      persistSession: false,
    }
  });
};

// Use this function in server components or API routes
export const getServerSupabase = () => {
  return createServerSupabaseClient();
};
