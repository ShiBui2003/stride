// Renders a single territory polygon overlay on the Google Map instance
'use client';

import { useEffect, useRef } from 'react';
import type { TerritoryWithUser } from '@/types/territory.types';

interface TerritoryPolygonProps {
  map: google.maps.Map;
  territory: TerritoryWithUser;
  isOwned?: boolean;
  isRival?: boolean;
}

export function TerritoryPolygon({
  map,
  territory,
  isOwned = false,
  isRival = false,
}: TerritoryPolygonProps): null {
  const polygonRef = useRef<google.maps.Polygon | null>(null);

  useEffect(() => {
    // GeoJSON is [lng, lat] — Google Maps expects { lat, lng }
    const coords = territory.polygon.coordinates[0].map(([lng, lat]) => ({ lat, lng }));

    const strokeColor = isRival ? '#FF3B30' : territory.user.territory_color;
    const fillColor = isRival ? '#FF3B30' : territory.user.territory_color;

    polygonRef.current = new google.maps.Polygon({
      paths: coords,
      strokeColor,
      strokeOpacity: isOwned || isRival ? 1 : 0.7,
      strokeWeight: isOwned ? 2.5 : 1.5,
      fillColor,
      fillOpacity: isOwned ? 0.4 : isRival ? 0.25 : 0.15,
      map,
      zIndex: isOwned ? 2 : isRival ? 1 : 0,
    });

    return () => {
      polygonRef.current?.setMap(null);
      polygonRef.current = null;
    };
  }, [map, territory, isOwned, isRival]);

  return null;
}
