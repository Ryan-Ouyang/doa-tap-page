import { getServerSupabase } from './supabase';
import { Tables } from './database.types'

/**
 * Check if a chip UID is authorized (exists in the database)
 */
export async function isAuthorizedChip(uid: string): Promise<boolean> {
  const supabase = getServerSupabase();
  
  const { data, error } = await supabase
    .from('chips')
    .select('id')
    .eq('uid', uid)
    .single();
  
  if (error || !data) {
    return false;
  }
  
  return true;
}

/**
 * Get or create a chip by its UID
 */
export async function getOrCreateChip(uid: string): Promise<Tables<'chips'> | null> {
  const supabase = getServerSupabase();
  
  // Update last_tap_at for existing chip
  const { data: existingChip, error: existingChipError } = await supabase
    .from('chips')
    .update({ last_tap_at: new Date().toISOString() })
    .eq('uid', uid)
    .select('*')
    .single();

  if (existingChipError) {
    console.error('Error updating existing chip:', existingChipError);
  }

  if (existingChip) {
    return existingChip;
  }

  // Create new chip if it doesn't exist
  const { data: newChip, error: newChipError } = await supabase
    .from('chips')
    .insert({ uid, last_tap_at: new Date().toISOString() })
    .select('*')
    .single();

  if (newChipError) {
    console.error('Error creating chip:', newChipError);
    return null;
  }

  return newChip;
}

/**
 * Get a chip by its UID without creating a new one
 */
export async function getChipByUid(uid: string): Promise<Tables<'chips'> | null> {
  const supabase = getServerSupabase();
  
  const { data, error } = await supabase
    .from('chips')
    .select('*')
    .eq('uid', uid)
    .single();
  
  if (error || !data) {
    return null;
  }
  
  return data;
}

/**
 * Get the current active reward period
 */
export async function getActiveRewardPeriod(): Promise<Tables<'reward_periods'> | null> {
  const supabase = getServerSupabase();
  const now = new Date().toISOString();
  
  const { data, error } = await supabase
    .from('reward_periods')
    .select('*')
    .lte('started_at', now)
    .or(`ended_at.is.null,ended_at.gt.${now}`)
    .order('started_at', { ascending: false })
    .limit(1)
    .single();

  if (error) {
    // If no active reward period is found, this will error with 'No rows found'
    // which is expected behavior
    return null;
  }

  return data;
}

/**
 * Check if a chip has claimed a reward in the current period
 */
export async function hasChipClaimedReward(chipId: number, rewardPeriodId: number): Promise<boolean> {
  const supabase = getServerSupabase();
  const { data, error } = await supabase
    .from('claims')
    .select('id')
    .eq('chip_id', chipId)
    .eq('reward_period_id', rewardPeriodId)
    .single();

  if (error) {
    // If no claim is found, this will error with 'No rows found'
    return false;
  }

  return !!data;
}

/**
 * Create a claim for a chip in the current reward period
 */
export async function createClaim(
  chipId: number, 
  rewardPeriodId: number, 
  walletAddress: string
): Promise<Tables<'claims'> | null> {
  const supabase = getServerSupabase();
  const { data, error } = await supabase
    .from('claims')
    .insert({ 
      chip_id: chipId, 
      reward_period_id: rewardPeriodId,
      wallet_address: walletAddress,
      claimed_at: new Date().toISOString()
    })
    .select('*')
    .single();

  if (error) {
    console.error('Error creating claim:', error);
    return null;
  }

  return data;
}

/**
 * Start a new reward period
 */
export async function startRewardPeriod(createdBy: string): Promise<Tables<'reward_periods'> | null> {
  const supabase = getServerSupabase();
  
  // End any currently active periods
  await supabase
    .from('reward_periods')
    .update({ ended_at: new Date().toISOString() })
    .is('ended_at', null);

  // Create a new reward period
  const startedAt = new Date().toISOString();
  
  // Calculate end time (10 minutes from now)
  const endedAt = new Date(Date.now() + 10 * 60 * 1000).toISOString();
  
  const { data, error } = await supabase
    .from('reward_periods')
    .insert({ started_at: startedAt, ended_at: endedAt, created_by: createdBy })
    .select('*')
    .single();

  if (error) {
    console.error('Error starting reward period:', error);
    return null;
  }

  return data;
}

/**
 * End the current reward period
 */
export async function endRewardPeriod(): Promise<boolean> {
  const supabase = getServerSupabase();
  const { error } = await supabase
    .from('reward_periods')
    .update({ ended_at: new Date().toISOString() })
    .is('ended_at', null);

  return !error;
}
