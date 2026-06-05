// Supabase queries for user profile read, create, update, follow, and stats
import { createClient } from '@/lib/supabase/client';
import type { User, UserProfile, UserStats } from '@/types/user.types';

export async function getUserByUsername(username: string): Promise<UserProfile | null> {
  const supabase = createClient();
  const { data, error } = await supabase
    .from('users')
    .select('*')
    .eq('username', username)
    .single();

  if (error) return null;
  return data as UserProfile;
}

export async function getUserById(id: string): Promise<User | null> {
  const supabase = createClient();
  const { data, error } = await supabase
    .from('users')
    .select('*')
    .eq('id', id)
    .single();

  if (error) return null;
  return data as User;
}

// Upsert instead of insert so re-submitted onboarding forms don't 409 when a
// previous attempt wrote the row but failed before setting onboarding_complete metadata.
export async function createUser(
  id: string,
  profile: Omit<User, 'id' | 'created_at' | 'total_km' | 'streak_count' | 'rival_id'>
): Promise<User> {
  const supabase = createClient();
  const { data, error } = await supabase
    .from('users')
    .upsert({ id, ...profile }, { onConflict: 'id' })
    .select()
    .single();

  if (error) throw error;
  return data as User;
}

export async function updateUser(id: string, updates: Partial<Omit<User, 'id' | 'created_at'>>): Promise<User> {
  const supabase = createClient();
  const { data, error } = await supabase
    .from('users')
    .update(updates)
    .eq('id', id)
    .select()
    .single();

  if (error) throw error;
  return data as User;
}

// Aggregates territory area, streak count, total km, and weekly km for the stats bar.
// total_km is computed directly from the runs table — the users.total_km column is never
// written after onboarding, so reading it would always show 0.
export async function getUserStats(userId: string): Promise<UserStats> {
  const supabase = createClient();
  const weekAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString();

  const [profileRes, territoriesRes, allRunsRes, weeklyRunsRes] = await Promise.all([
    supabase.from('users').select('streak_count').eq('id', userId).single(),
    supabase.from('territories').select('area_m2').eq('user_id', userId),
    supabase.from('runs').select('distance_m').eq('user_id', userId),
    supabase.from('runs').select('distance_m').eq('user_id', userId).gte('started_at', weekAgo),
  ]);

  const profile = profileRes.data as { streak_count: number } | null;
  const territory_area_m2 = ((territoriesRes.data ?? []) as { area_m2: number }[]).reduce(
    (sum, t) => sum + t.area_m2,
    0
  );
  const total_km = ((allRunsRes.data ?? []) as { distance_m: number }[]).reduce(
    (sum, r) => sum + r.distance_m / 1000,
    0
  );
  const weekly_km = ((weeklyRunsRes.data ?? []) as { distance_m: number }[]).reduce(
    (sum, r) => sum + r.distance_m / 1000,
    0
  );

  return {
    total_km,
    streak_count: profile?.streak_count ?? 0,
    territory_area_m2,
    weekly_km,
  };
}

// Returns followed users who have completed a run in the last 24 hours
export async function getRecentlyActiveFollowing(userId: string): Promise<User[]> {
  const supabase = createClient();
  const dayAgo = new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString();

  const followsRes = await supabase
    .from('follows')
    .select('following_id')
    .eq('follower_id', userId);

  if (!followsRes.data || followsRes.data.length === 0) return [];
  const followingIds = (followsRes.data as { following_id: string }[]).map((f) => f.following_id);

  const recentRunsRes = await supabase
    .from('runs')
    .select('user_id')
    .in('user_id', followingIds)
    .gte('started_at', dayAgo);

  if (!recentRunsRes.data || recentRunsRes.data.length === 0) return [];
  const activeIds = Array.from(new Set((recentRunsRes.data as { user_id: string }[]).map((r) => r.user_id)));

  const usersRes = await supabase.from('users').select('*').in('id', activeIds);
  if (usersRes.error || !usersRes.data) return [];
  return usersRes.data as User[];
}

// Returns true if follower currently follows followingId — uses maybeSingle to avoid 406 on no-row
export async function checkIsFollowing(followerId: string, followingId: string): Promise<boolean> {
  const supabase = createClient();
  const { data } = await supabase
    .from('follows')
    .select('follower_id')
    .eq('follower_id', followerId)
    .eq('following_id', followingId)
    .maybeSingle();
  return data !== null;
}

export async function followUser(followerId: string, followingId: string): Promise<void> {
  const supabase = createClient();
  const { error } = await supabase
    .from('follows')
    .insert({ follower_id: followerId, following_id: followingId });
  if (error) throw error;
}

export async function unfollowUser(followerId: string, followingId: string): Promise<void> {
  const supabase = createClient();
  const { error } = await supabase
    .from('follows')
    .delete()
    .eq('follower_id', followerId)
    .eq('following_id', followingId);
  if (error) throw error;
}
