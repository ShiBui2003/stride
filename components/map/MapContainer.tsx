// Full-screen Google Maps wrapper — initialises the map, applies dark theme, centers on user GPS
'use client';

import React, { useEffect, useRef } from 'react';
import { loadMapsAPI, createMapOptions, getUserCenter } from '@/lib/maps/mapConfig';

interface MapContainerProps {
  onMapReady?: (map: google.maps.Map) => void;
  className?: string;
}

export function MapContainer({ onMapReady, className = '' }: MapContainerProps): React.JSX.Element {
  const containerRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<google.maps.Map | null>(null);
  // Ref so the init effect (empty deps, runs once) always calls the latest onMapReady
  const onMapReadyRef = useRef(onMapReady);
  useEffect(() => {
    onMapReadyRef.current = onMapReady;
  }, [onMapReady]);

  useEffect(() => {
    if (!containerRef.current || mapRef.current) return;

    let cancelled = false;

    loadMapsAPI()
      .then(() => {
        if (cancelled || !containerRef.current) return;

        const map = new google.maps.Map(containerRef.current, createMapOptions());
        mapRef.current = map;

        // Pan to user's real position as soon as GPS resolves
        getUserCenter().then((center) => {
          if (!cancelled) map.setCenter(center);
        });

        onMapReadyRef.current?.(map);
      });

    return () => {
      cancelled = true;
    };
  }, []); // empty deps — map must only initialise once per mount

  return <div ref={containerRef} className={`w-full h-full bg-background ${className}`} />;
}
