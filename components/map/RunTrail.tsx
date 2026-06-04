// Draws the live GPS trail polyline on the map while a run is active
'use client';

import { useEffect, useRef } from 'react';

interface RunTrailProps {
  map: google.maps.Map;
  coordinates: [number, number][];
}

export function RunTrail({ map, coordinates }: RunTrailProps): null {
  const polylineRef = useRef<google.maps.Polyline | null>(null);

  useEffect(() => {
    const path = coordinates.map(([lng, lat]) => ({ lat, lng }));

    if (!polylineRef.current) {
      polylineRef.current = new google.maps.Polyline({
        path,
        strokeColor: '#C8FF00',
        strokeOpacity: 0.9,
        strokeWeight: 4,
        map,
      });
    } else {
      // Update in place — avoids recreating the Polyline on every GPS tick
      polylineRef.current.setPath(path);
    }
  }, [map, coordinates]);

  useEffect(() => {
    return () => {
      polylineRef.current?.setMap(null);
      polylineRef.current = null;
    };
  }, []);

  return null;
}
