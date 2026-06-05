// Supabase queries for run history read and insert
import { createClient } from '@/lib/supabase/client';
import type { Run, FeedItem } from '@/types/run.types';
import type { User } from '@/types/user.types';

export async function getRunsByUserId(userId: string): Promise<Run[]> {
  const supabase = createClient();
  const { data, error } = await supabase
    .from('runs')
    .select('*')
    .eq('user_id', userId)
    .order('started_at', { ascending: false });

  if (error) throw error;
  return (data ?? []) as Run[];
}

// Returns the 20 most recent runs from the user + everyone they follow
export async function getFeedRuns(userId: string): Promise<FeedItem[]> {
  const supabase = createClient();

  const followsResult = await supabase
    .from('follows')
    .select('following_id')
    .eq('follower_id', userId);

  const followingIds: string[] = ((followsResult.data ?? []) as { following_id: string }[]).map(
    (f) => f.following_id
  );
  const feedUserIds = [userId, ...followingIds];

  const runsResult = await supabase
    .from('runs')
    .select('*')
    .in('user_id', feedUserIds)
    .order('started_at', { ascending: false })
    .limit(20);

  if (runsResult.error || !runsResult.data) return [];
  const runs = runsResult.data as Run[];

  const uniqueUserIds = Array.from(new Set(runs.map((r) => r.user_id)));
  const usersResult = await supabase.from('users').select('*').in('id', uniqueUserIds);

  if (usersResult.error || !usersResult.data) return [];
  const usersMap = new Map((usersResult.data as User[]).map((u) => [u.id, u]));

  return runs
    .filter((run) => usersMap.has(run.user_id))
    .map((run) => ({
      run,
      user: usersMap.get(run.user_id) as User,
      likes_count: 0,
    }));
}

export async function getRunById(runId: string): Promise<Run | null> {
  const supabase = createClient();
  const { data, error } = await supabase
    .from('runs')
    .select('*')
    .eq('id', runId)
    .single();

  if (error) return null;
  return data as Run;
}

export async function insertRun(run: Omit<Run, 'id'>): Promise<Run> {
  const supabase = createClient();
  const { data, error } = await supabase
    .from('runs')
    .insert(run)
    .select()
    .single();

  if (error) throw error;
  return data as Run;
}
