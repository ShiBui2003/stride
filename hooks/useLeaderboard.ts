// Fetches leaderboard entries for a given scope and sort mode
'use client';

import useSWR from 'swr';
import {
  getLeaderboardByCity,
  getLeaderboardByCityWeeklyKm,
  getGlobalLeaderboard,
  getGlobalLeaderboardWeeklyKm,
  getFriendsLeaderboard,
  getFriendsLeaderboardWeeklyKm,
} from '@/lib/supabase/queries/leaderboard';
import type { LeaderboardEntry } from '@/lib/supabase/queries/leaderboard';

export type LeaderboardScope = 'city' | 'global' | 'friends';
export type LeaderboardSort = 'territory' | 'weekly_km';

interface UseLeaderboardReturn {
  entries: LeaderboardEntry[];
  loading: boolean;
  error: Error | undefined;
}

export function useLeaderboard(
  scope: LeaderboardScope,
  sort: LeaderboardSort,
  city?: string,
  userId?: string
): UseLeaderboardReturn {
  const key = `lb-${scope}-${sort}-${city ?? ''}-${userId ?? ''}`;

  const { data, error } = useSWR<LeaderboardEntry[]>(key, async () => {
    if (scope === 'city' && city) {
      return sort === 'weekly_km'
        ? getLeaderboardByCityWeeklyKm(city)
        : getLeaderboardByCity(city);
    }
    if (scope === 'global') {
      return sort === 'weekly_km'
        ? getGlobalLeaderboardWeeklyKm()
        : getGlobalLeaderboard();
    }
    if (scope === 'friends' && userId) {
      return sort === 'weekly_km'
        ? getFriendsLeaderboardWeeklyKm(userId)
        : getFriendsLeaderboard(userId);
    }
    return [];
  });

  return { entries: data ?? [], loading: !data && !error, error };
}
