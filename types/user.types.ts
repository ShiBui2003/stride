// User profile and auth-related data types

export interface User {
  id: string;
  username: string;
  email: string;
  avatar_url: string | null;
  city: string;
  territory_color: string;
  total_km: number;
  streak_count: number;
  rival_id: string | null;
  created_at: string;
}

export interface UserProfile extends User {
  territories_count: number;
  total_area_m2: number;
  is_following?: boolean;
}

export interface UserStats {
  total_km: number;
  streak_count: number;
  territory_area_m2: number;
  weekly_km: number;
}
