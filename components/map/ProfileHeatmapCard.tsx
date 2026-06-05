// Small dark map card on the profile page showing all of a runner's routes as a heatmap
'use client';

import React, { useEffect, useRef, useState } from 'react';
import { loadMapsAPI, createMapOptions } from '@/lib/maps/mapConfig';
import { RouteHeatmap } from '@/components/map/RouteHeatmap';
import type { Run } from '@/types/run.types';

interface ProfileHeatmapCardProps {
  runs: Run[];
}

export function ProfileHeatmapCard({ runs }: ProfileHeatmapCardProps): React.JSX.Element | null {
  const containerRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<google.maps.Map | null>(null);
  const [map, setMap] = useState<google.maps.Map | null>(null);

  useEffect(() => {
    if (!containerRef.current || mapRef.current) return;
    let cancelled = false;

    // Heatmap owns the viewport via fitBounds, so start zoomed out and let it frame the routes
    loadMapsAPI().then(() => {
      if (cancelled || !containerRef.current) return;
      const instance = new google.maps.Map(containerRef.current, {
        ...createMapOptions(),
        center: { lat: 20, lng: 0 },
        zoom: 2,
      });
      mapRef.current = instance;
      setMap(instance);
    });

    return () => {
      cancelled = true;
    };
  }, []); // map initialises once per mount

  // Nothing to draw — skip the card entirely rather than show an empty map
  if (runs.length === 0) return null;

  return (
    <div className="px-4 pt-5">
      <h2 className="font-heading font-bold text-textPrimary text-xs uppercase tracking-widest mb-3">
        Heatmap
      </h2>
      <div className="relative w-full h-48 rounded-xl overflow-hidden bg-surface">
        <div ref={containerRef} className="w-full h-full" />
        {map && <RouteHeatmap map={map} runs={runs} />}
      </div>
    </div>
  );
}
