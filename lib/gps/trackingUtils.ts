// GPS tracking utilities — distance, pace, and calorie calculations during a run
import type { LatLng } from '@/types/map.types';
import { haversineDistance } from '@/lib/maps/polygonUtils';

const MET_RUNNING = 9.8;
const DEFAULT_WEIGHT_KG = 70;

export function calculateTotalDistance(coordinates: [number, number][]): number {
  if (coordinates.length < 2) return 0;
  let total = 0;
  for (let i = 1; i < coordinates.length; i++) {
    const prev: LatLng = { lat: coordinates[i - 1][1], lng: coordinates[i - 1][0] };
    const curr: LatLng = { lat: coordinates[i][1], lng: coordinates[i][0] };
    total += haversineDistance(prev, curr);
  }
  return total;
}

// Returns pace in seconds per km
export function calculatePace(distance_m: number, duration_s: number): number {
  if (distance_m === 0) return 0;
  return (duration_s / distance_m) * 1000;
}

export function calculateCalories(
  distance_m: number,
  duration_s: number,
  weightKg = DEFAULT_WEIGHT_KG
): number {
  const hours = duration_s / 3600;
  return MET_RUNNING * weightKg * hours * (distance_m / 1000);
}
