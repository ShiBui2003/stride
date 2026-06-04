// GPS polygon utilities — loop closure detection and coordinate conversion
import type { GeoJSONPolygon } from '@/types/territory.types';
import type { LatLng } from '@/types/map.types';

const CLOSURE_THRESHOLD_METERS = 20;
const MIN_LOOP_POINTS = 10;

export function haversineDistance(a: LatLng, b: LatLng): number {
  const R = 6371000;
  const dLat = ((b.lat - a.lat) * Math.PI) / 180;
  const dLng = ((b.lng - a.lng) * Math.PI) / 180;
  const h =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos((a.lat * Math.PI) / 180) *
      Math.cos((b.lat * Math.PI) / 180) *
      Math.sin(dLng / 2) *
      Math.sin(dLng / 2);
  return 2 * R * Math.asin(Math.sqrt(h));
}

// Returns true when the runner has looped back within 20m of their start point
export function isLoopClosed(coordinates: [number, number][]): boolean {
  if (coordinates.length < MIN_LOOP_POINTS) return false;
  const start: LatLng = { lat: coordinates[0][1], lng: coordinates[0][0] };
  const end: LatLng = {
    lat: coordinates[coordinates.length - 1][1],
    lng: coordinates[coordinates.length - 1][0],
  };
  return haversineDistance(start, end) <= CLOSURE_THRESHOLD_METERS;
}

export function coordinatesToPolygon(coords: [number, number][]): GeoJSONPolygon {
  const ring = [...coords];
  // GeoJSON requires the first and last point to be identical to close the ring
  if (ring[0][0] !== ring[ring.length - 1][0] || ring[0][1] !== ring[ring.length - 1][1]) {
    ring.push(ring[0]);
  }
  return { type: 'Polygon', coordinates: [ring] };
}
