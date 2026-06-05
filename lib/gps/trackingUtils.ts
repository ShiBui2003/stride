// GPS tracking utilities — distance, pace, and calorie calculations during a run
import type { LatLng } from '@/types/map.types';
import { haversineDistance } from '@/lib/maps/polygonUtils';

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

// MET (Metabolic Equivalent of Task) derived from actual running speed.
// Compendium of Physical Activities values:
//   walk <6 km/h → MET 3.5–5.5, jog 8 km/h → 8.3, run 10 km/h → 9.8,
//   run 12 km/h → 11.0, run 14 km/h → 12.3, run 16+ km/h → 14.5
// Linear fit for running zone: MET ≈ 0.9 × speed_kmh + 1.5
export function calculateCalories(
  distance_m: number,
  duration_s: number,
  weightKg = DEFAULT_WEIGHT_KG
): number {
  if (distance_m < 10 || duration_s < 1) return 0;
  const speed_kmh = (distance_m / 1000) / (duration_s / 3600);
  const met =
    speed_kmh < 6
      ? 3.5 + speed_kmh * 0.33          // brisk-walk zone
      : Math.min(0.9 * speed_kmh + 1.5, 18); // running zone, capped at sprint MET
  return met * weightKg * (duration_s / 3600);
}
