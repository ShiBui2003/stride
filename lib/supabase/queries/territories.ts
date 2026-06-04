// Supabase queries for territory read, insert, and ownership transfer
import { createClient } from '@/lib/supabase/client';
import type { Territory, TerritoryWithUser } from '@/types/territory.types';

export async function getTerritoriesByCity(city: string): Promise<TerritoryWithUser[]> {
  const supabase = createClient();
  const { data, error } = await supabase
    .from('territories')
    .select('*, user:users(username, territory_color, avatar_url)')
    .eq('users.city', city);

  if (error) throw error;
  return (data ?? []) as TerritoryWithUser[];
}

export async function getTerritoryByUserId(userId: string): Promise<Territory[]> {
  const supabase = createClient();
  const { data, error } = await supabase
    .from('territories')
    .select('*')
    .eq('user_id', userId);

  if (error) throw error;
  return (data ?? []) as Territory[];
}

export async function insertTerritory(
  userId: string,
  polygonGeoJSON: string,
  area_m2: number
): Promise<Territory> {
  const supabase = createClient();
  const { data, error } = await supabase
    .rpc('capture_territory', {
      p_user_id: userId,
      p_polygon: polygonGeoJSON,
      p_area_m2: area_m2,
    })
    .single();

  if (error) throw error;
  return data as Territory;
}
