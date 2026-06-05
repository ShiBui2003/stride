// Full-screen overlay that animates a past run's GPS route drawing onto a dark map
'use client';

import React, { useEffect, useMemo, useRef, useState } from 'react';
import { X, ArrowClockwise } from '@phosphor-icons/react';
import { loadMapsAPI, createMapOptions } from '@/lib/maps/mapConfig';
import { useRunReplay } from '@/hooks/useRunReplay';
import { formatDistance, formatDuration } from '@/lib/utils/formatters';
import type { Run } from '@/types/run.types';

interface RunReplayProps {
  run: Run;
  onClose: () => void;
}

export function RunReplay({ run, onClose }: RunReplayProps): React.JSX.Element {
  const containerRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<google.maps.Map | null>(null);
  const polylineRef = useRef<google.maps.Polyline | null>(null);
  const [ready, setReady] = useState(false);

  // GeoJSON [lng,lat] → Google Maps {lat,lng}; memoised so effects don't re-run each render
  const path = useMemo(
    () => run.route.coordinates.map(([lng, lat]) => ({ lat, lng })),
    [run]
  );
  const { drawnCount, isPlaying, play, restart } = useRunReplay(path.length);

  // Initialise the map and frame the full route before playback begins
  useEffect(() => {
    if (!containerRef.current || mapRef.current) return;
    let cancelled = false;

    loadMapsAPI().then(() => {
      if (cancelled || !containerRef.current) return;
      const map = new google.maps.Map(containerRef.current, {
        ...createMapOptions(),
        center: { lat: 20, lng: 0 },
        zoom: 2,
      });
      mapRef.current = map;

      const bounds = new google.maps.LatLngBounds();
      path.forEach((point) => bounds.extend(point));
      if (!bounds.isEmpty()) map.fitBounds(bounds, 48);

      polylineRef.current = new google.maps.Polyline({
        path: [],
        strokeColor: '#C8FF00',
        strokeOpacity: 0.95,
        strokeWeight: 4,
        map,
      });
      setReady(true);
    });

    return () => {
      cancelled = true;
      polylineRef.current?.setMap(null);
      polylineRef.current = null;
    };
  }, [path]);

  // Auto-play once the map and polyline exist
  useEffect(() => {
    if (ready) play();
  }, [ready, play]);

  // Push the revealed slice of the path to the polyline on every frame tick
  useEffect(() => {
    polylineRef.current?.setPath(path.slice(0, drawnCount));
  }, [drawnCount, path]);

  return (
    <div className="fixed inset-0 z-50 bg-background">
      <div ref={containerRef} className="w-full h-full" />

      {/* Top bar — run identity + close */}
      <div className="absolute top-0 inset-x-0 px-4 pt-12 pb-4 flex items-center justify-between bg-gradient-to-b from-background to-transparent">
        <div>
          <p className="font-stats text-textPrimary text-2xl leading-none">
            {formatDistance(run.distance_m)}
          </p>
          <p className="text-textSecondary font-body text-xs mt-1">
            {formatDuration(run.duration_s)}
          </p>
        </div>
        <button
          onClick={onClose}
          aria-label="Close replay"
          className="w-10 h-10 flex items-center justify-center rounded-full bg-surface text-textPrimary active:scale-95 transition-transform"
        >
          <X size={20} weight="bold" />
        </button>
      </div>

      {/* Replay control */}
      <button
        onClick={restart}
        disabled={isPlaying}
        className="absolute bottom-10 left-1/2 -translate-x-1/2 flex items-center gap-2 bg-accent text-background font-heading font-bold text-sm px-6 py-3 rounded-full active:scale-95 transition-transform disabled:opacity-50"
      >
        <ArrowClockwise size={18} weight="bold" />
        {isPlaying ? 'Replaying…' : 'Replay'}
      </button>
    </div>
  );
}
