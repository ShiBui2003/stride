// Active run page — full-screen GPS tracking with live trail, HUD stats, and territory capture
'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { MapContainer } from '@/components/map/MapContainer';
import { RunTrail } from '@/components/map/RunTrail';
import { RunHUD } from '@/components/run/RunHUD';
import { RunControls } from '@/components/run/RunControls';
import { useAuth } from '@/hooks/useAuth';
import { useRunTracking } from '@/hooks/useRunTracking';
import { insertRun } from '@/lib/supabase/queries/runs';
import { insertTerritory } from '@/lib/supabase/queries/territories';
import type { GeoJSONLineString } from '@/types/run.types';

export default function RunActivePage(): React.JSX.Element {
  const router = useRouter();
  const { user } = useAuth();
  const [map, setMap] = useState<google.maps.Map | null>(null);
  const [showCapture, setShowCapture] = useState(false);
  const {
    isPaused,
    activeRun,
    capturedPolygon,
    startRun,
    pauseRun,
    resumeRun,
    stopRun,
    clearCapturedPolygon,
  } = useRunTracking();

  // Start GPS tracking on mount, stop on unmount (e.g. user navigates back)
  useEffect(() => {
    startRun();
    return () => { stopRun(); };
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  // Trigger capture_territory() RPC as soon as a loop closes
  useEffect(() => {
    if (!capturedPolygon || !user?.id || !map) return;

    // geometry library is guaranteed loaded since map is non-null
    const path = capturedPolygon.coordinates[0].map(
      ([lng, lat]) => new google.maps.LatLng(lat, lng)
    );
    const area_m2 = google.maps.geometry.spherical.computeArea(path);

    insertTerritory(user.id, JSON.stringify(capturedPolygon), area_m2)
      .then(() => {
        setShowCapture(true);
        clearCapturedPolygon();
        setTimeout(() => setShowCapture(false), 2500);
      })
      .catch(() => clearCapturedPolygon());
  }, [capturedPolygon, user?.id, map, clearCapturedPolygon]);

  const handleStop = async (): Promise<void> => {
    stopRun();
    if (!user?.id || !activeRun || activeRun.distance_m < 10) {
      router.push('/home');
      return;
    }
    const route: GeoJSONLineString = {
      type: 'LineString',
      coordinates: activeRun.coordinates,
    };
    try {
      const run = await insertRun({
        user_id: user.id,
        route,
        distance_m: activeRun.distance_m,
        duration_s: activeRun.duration_s,
        pace_s_per_km: activeRun.pace_s_per_km,
        calories: activeRun.calories,
        elevation_m: 0,
        started_at: new Date(activeRun.startTime).toISOString(),
        ended_at: new Date().toISOString(),
      });
      router.push(`/run/summary?runId=${run.id}`);
    } catch {
      router.push('/run/summary');
    }
  };

  return (
    <main className="relative h-screen bg-background overflow-hidden">
      <MapContainer onMapReady={setMap} className="absolute inset-0" />

      {map && activeRun && (
        <RunTrail map={map} coordinates={activeRun.coordinates} />
      )}

      {activeRun && <RunHUD run={activeRun} />}

      <RunControls
        isPaused={isPaused}
        onPause={isPaused ? resumeRun : pauseRun}
        onStop={() => { void handleStop(); }}
      />

      {showCapture && <CaptureFlash />}
    </main>
  );
}

// Placeholder shown on territory capture — Rive animation replaces this in Phase 4
function CaptureFlash(): React.JSX.Element {
  return (
    <div className="absolute inset-0 z-50 flex items-center justify-center pointer-events-none">
      <div className="absolute inset-0 bg-accent/10 animate-pulse" />
      <div className="relative z-10 text-center px-8">
        <p className="font-stats text-accent text-6xl tracking-widest leading-tight">CAPTURED</p>
        <p className="font-body text-textSecondary text-sm mt-2 tracking-widest uppercase">
          Territory is yours
        </p>
      </div>
    </div>
  );
}
