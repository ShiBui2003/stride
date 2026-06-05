// Overlays every past run route as stacked low-opacity accent polylines to form a personal heatmap
'use client';

import { useEffect, useRef } from 'react';
import type { Run } from '@/types/run.types';

interface RouteHeatmapProps {
  map: google.maps.Map;
  runs: Run[];
}

// Each route draws at low opacity; frequently-run paths overlap and read brighter
const ROUTE_STROKE_COLOR = '#C8FF00';
const ROUTE_STROKE_OPACITY = 0.35;
const ROUTE_STROKE_WEIGHT = 3;

export function RouteHeatmap({ map, runs }: RouteHeatmapProps): null {
  const polylinesRef = useRef<google.maps.Polyline[]>([]);

  useEffect(() => {
    const bounds = new google.maps.LatLngBounds();
    const polylines: google.maps.Polyline[] = [];

    for (const run of runs) {
      // GeoJSON LineString is [lng, lat] — Google Maps expects { lat, lng }
      const path = run.route.coordinates.map(([lng, lat]) => {
        const point = { lat, lng };
        bounds.extend(point);
        return point;
      });
      if (path.length < 2) continue;

      polylines.push(
        new google.maps.Polyline({
          path,
          strokeColor: ROUTE_STROKE_COLOR,
          strokeOpacity: ROUTE_STROKE_OPACITY,
          strokeWeight: ROUTE_STROKE_WEIGHT,
          map,
        })
      );
    }

    polylinesRef.current = polylines;
    if (!bounds.isEmpty()) map.fitBounds(bounds, 24);

    return () => {
      polylines.forEach((line) => line.setMap(null));
      polylinesRef.current = [];
    };
  }, [map, runs]);

  return null;
}
