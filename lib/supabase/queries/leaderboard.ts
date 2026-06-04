// Supabase queries for city, global, and friends leaderboard rankings
import { createClient } from '@/lib/supabase/client';
import type { User } from '@/types/user.types';

export interface LeaderboardEntry {
  rank: number;
  user: User;
  total_area_m2: number;
  territory_count: number;
  weekly_km: number;
}

// Flat row returned by every leaderboard RPC
interface LeaderboardRPCRow {
  rank: number;
  user_id: string;
  username: string;
  avatar_url: string | null;
  territory_color: string;
  total_km: number;
  streak_count: number;
  email: string;
  city: string;
  rival_id: string | null;
  created_at: string;
  total_area_m2: number;
  territory_count: number;
  weekly_km?: number;
}

function toEntry(row: LeaderboardRPCRow): LeaderboardEntry {
  return {
    rank: Number(row.rank),
    user: {
      id: row.user_id,
      username: row.username,
      avatar_url: row.avatar_url,
      territory_color: row.territory_color,
      total_km: Number(row.total_km),
      streak_count: row.streak_count,
      email: row.email,
      city: row.city,
      rival_id: row.rival_id,
      created_at: row.created_at,
    },
    total_area_m2: Number(row.total_area_m2),
    territory_count: Number(row.territory_count),
    weekly_km: Number(row.weekly_km ?? 0),
  };
}

export async function getLeaderboardByCity(city: string, limit = 50): Promise<LeaderboardEntry[]> {
  const supabase = createClient();
  const { data, error } = await supabase.rpc('get_leaderboard_by_city', {
    p_city: city,
    p_limit: limit,
  });
  if (error) throw error;
  return ((data ?? []) as LeaderboardRPCRow[]).map(toEntry);
}

export async function getGlobalLeaderboard(limit = 50): Promise<LeaderboardEntry[]> {
  const supabase = createClient();
  const { data, error } = await supabase.rpc('get_global_leaderboard', { p_limit: limit });
  if (error) throw error;
  return ((data ?? []) as LeaderboardRPCRow[]).map(toEntry);
}

// Requires migration 002 to be applied in Supabase
export async function getLeaderboardByCityWeeklyKm(
  city: string,
  limit = 50
): Promise<LeaderboardEntry[]> {
  const supabase = createClient();
  const { data, error } = await supabase.rpc('get_leaderboard_by_city_weekly_km', {
    p_city: city,
    p_limit: limit,
  });
  if (error) throw error;
  return ((data ?? []) as LeaderboardRPCRow[]).map(toEntry);
}

export async function getGlobalLeaderboardWeeklyKm(limit = 50): Promise<LeaderboardEntry[]> {
  const supabase = createClient();
  const { data, error } = await supabase.rpc('get_global_leaderboard_weekly_km', {
    p_limit: limit,
  });
  if (error) throw error;
  return ((data ?? []) as LeaderboardRPCRow[]).map(toEntry);
}

export async function getFriendsLeaderboard(
  userId: string,
  limit = 50
): Promise<LeaderboardEntry[]> {
  const supabase = createClient();
  const { data, error } = await supabase.rpc('get_friends_leaderboard', {
    p_user_id: userId,
    p_limit: limit,
  });
  if (error) throw error;
  return ((data ?? []) as LeaderboardRPCRow[]).map(toEntry);
}

export async function getFriendsLeaderboardWeeklyKm(
  userId: string,
  limit = 50
): Promise<LeaderboardEntry[]> {
  const supabase = createClient();
  const { data, error } = await supabase.rpc('get_friends_leaderboard_weekly_km', {
    p_user_id: userId,
    p_limit: limit,
  });
  if (error) throw error;
  return ((data ?? []) as LeaderboardRPCRow[]).map(toEntry);
}
