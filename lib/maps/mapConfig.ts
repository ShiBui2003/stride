// Google Maps loader singleton, dark theme styles, and map option factory
import { setOptions, importLibrary } from '@googlemaps/js-api-loader';
import type { MapConfig } from '@/types/map.types';

let apiInitialized = false;

function ensureInit(): void {
  if (apiInitialized) return;
  setOptions({
    key: process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY!,
    v: 'weekly',
    libraries: ['maps', 'geometry', 'places'],
  });
  apiInitialized = true;
}

// Initialises the Maps JS API on first call and resolves when the maps library is ready
export function loadMapsAPI(): Promise<google.maps.MapsLibrary> {
  ensureInit();
  return importLibrary('maps');
}

export const DEFAULT_CENTER: google.maps.LatLngLiteral = { lat: 28.6139, lng: 77.209 };

export const DEFAULT_MAP_CONFIG: MapConfig = {
  center: DEFAULT_CENTER,
  zoom: 14,
  mapId: '',
};

// Strips POIs, labels, transit and forces dark palette to match #0A0A0A theme
export const DARK_MAP_STYLES: google.maps.MapTypeStyle[] = [
  { elementType: 'geometry', stylers: [{ color: '#0a0a0a' }] },
  { elementType: 'labels.text.stroke', stylers: [{ color: '#0a0a0a' }] },
  { elementType: 'labels.text.fill', stylers: [{ color: '#3a3a3a' }] },
  { featureType: 'road', elementType: 'geometry', stylers: [{ color: '#1c1c1c' }] },
  { featureType: 'road', elementType: 'geometry.stroke', stylers: [{ color: '#111111' }] },
  { featureType: 'road.highway', elementType: 'geometry', stylers: [{ color: '#282828' }] },
  { featureType: 'water', elementType: 'geometry', stylers: [{ color: '#050505' }] },
  { featureType: 'poi', stylers: [{ visibility: 'off' }] },
  { featureType: 'transit', stylers: [{ visibility: 'off' }] },
  { featureType: 'administrative', elementType: 'labels', stylers: [{ visibility: 'off' }] },
];

// Returns complete MapOptions — all map config must live here, never scattered in components
export function createMapOptions(): google.maps.MapOptions {
  return {
    center: DEFAULT_CENTER,
    zoom: 14,
    disableDefaultUI: true,
    gestureHandling: 'greedy',
    clickableIcons: false,
    backgroundColor: '#0a0a0a',
    styles: DARK_MAP_STYLES,
  };
}

// Returns the user's GPS position, or DEFAULT_CENTER after 5s timeout
export async function getUserCenter(): Promise<google.maps.LatLngLiteral> {
  return new Promise((resolve) => {
    if (typeof navigator === 'undefined' || !navigator.geolocation) {
      resolve(DEFAULT_CENTER);
      return;
    }
    navigator.geolocation.getCurrentPosition(
      (pos) => resolve({ lat: pos.coords.latitude, lng: pos.coords.longitude }),
      () => resolve(DEFAULT_CENTER),
      { timeout: 5000 }
    );
  });
}
