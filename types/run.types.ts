// Run session and GPS route data types
import type { User } from './user.types';

export interface GeoJSONLineString {
  type: 'LineString';
  coordinates: [number, number][];
}

export interface Run {
  id: string;
  user_id: string;
  route: GeoJSONLineString;
  distance_m: number;
  duration_s: number;
  pace_s_per_km: number;
  calories: number;
  elevation_m: number;
  started_at: string;
  ended_at: string;
}

// Feed item combining a run with its author and social metadata
export interface FeedItem {
  run: Run;
  user: User;
  likes_count: number;
}

// In-memory state for a run currently in progress
export interface ActiveRun {
  startTime: number;
  coordinates: [number, number][];
  distance_m: number;
  duration_s: number;
  pace_s_per_km: number;
  calories: number;
}
