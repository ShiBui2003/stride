// Full-screen Google Maps wrapper — initialises the map, applies dark theme, centers on user GPS
'use client';

import React, { useEffect, useRef } from 'react';
import { loadMapsAPI, createMapOptions, getUserCenter } from '@/lib/maps/mapConfig';

interface MapContainerProps {
  onMapReady?: (map: google.maps.Map) => void;
  onLocationResolved?: (position: google.maps.LatLngLiteral) => void;
  className?: string;
}

export function MapContainer({ onMapReady, onLocationResolved, className = '' }: MapContainerProps): React.JSX.Element {
  const containerRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<google.maps.Map | null>(null);
  const onMapReadyRef = useRef(onMapReady);
  const onLocationResolvedRef = useRef(onLocationResolved);
  useEffect(() => {
    onMapReadyRef.current = onMapReady;
    onLocationResolvedRef.current = onLocationResolved;
  }, [onMapReady, onLocationResolved]);

  useEffect(() => {
    if (!containerRef.current || mapRef.current) return;

    let cancelled = false;

    // Create map immediately after the API loads so the user sees it right away.
    // GPS runs in the background; if it succeeds we zoom to the real location.
    // If GPS fails we stay at a neutral world view — never fake a city.
    loadMapsAPI().then(() => {
      if (cancelled || !containerRef.current) return;
      const map = new google.maps.Map(containerRef.current, {
        ...createMapOptions(),
        center: { lat: 20, lng: 0 }, // neutral — overridden by GPS below
        zoom: 3,
      });
      mapRef.current = map;
      onMapReadyRef.current?.(map);

      getUserCenter().then((center) => {
        if (!cancelled && center) {
          map.setCenter(center);
          map.setZoom(15);
          onLocationResolvedRef.current?.(center);
        }
      });
    });

    return () => {
      cancelled = true;
    };
  }, []); // empty deps — map must only initialise once per mount

  return <div ref={containerRef} className={`w-full h-full bg-background ${className}`} />;
}
