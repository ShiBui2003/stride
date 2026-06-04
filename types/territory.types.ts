// Territory polygon data types for the GPS capture system

export interface GeoJSONPolygon {
  type: 'Polygon';
  coordinates: [number, number][][];
}

export interface Territory {
  id: string;
  user_id: string;
  polygon: GeoJSONPolygon;
  area_m2: number;
  captured_at: string;
  last_defended_at: string;
}

export interface TerritoryWithUser extends Territory {
  user: {
    username: string;
    territory_color: string;
    avatar_url: string | null;
  };
}
