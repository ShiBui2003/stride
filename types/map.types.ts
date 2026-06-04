// Google Maps configuration and geospatial coordinate types

export interface MapConfig {
  center: { lat: number; lng: number };
  zoom: number;
  mapId: string;
}

export interface MapBounds {
  north: number;
  south: number;
  east: number;
  west: number;
}

export interface LatLng {
  lat: number;
  lng: number;
}
