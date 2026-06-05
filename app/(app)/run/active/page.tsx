// Active run page — full-screen GPS tracking with live trail, HUD stats, and territory capture
'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { mutate } from 'swr';
import { MapContainer } from '@/components/map/MapContainer';
import { RunTrail } from '@/components/map/RunTrail';
import { UserLocationDot } from '@/components/map/UserLocationDot';
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
  const [saveError, setSaveError] = useState<string | null>(null);
  const {
    isPaused,
    activeRun,
    capturedPolygon,
    gpsError,
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

  // Keep the map centered on the runner's latest GPS position
  useEffect(() => {
    if (!map || !activeRun || activeRun.coordinates.length === 0) return;
    const [lng, lat] = activeRun.coordinates[activeRun.coordinates.length - 1];
    map.panTo({ lat, lng });
    if (map.getZoom()! < 15) map.setZoom(15);
  }, [map, activeRun?.coordinates]);

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
    setSaveError(null);

    if (!user?.id || !activeRun) {
      router.push('/home');
      return;
    }

    // Require at least 2 coords for a valid LineString; pad with a duplicate if needed
    const coords = activeRun.coordinates.length >= 2
      ? activeRun.coordinates
      : activeRun.coordinates.length === 1
        ? [activeRun.coordinates[0], activeRun.coordinates[0]]
        : [[0, 0], [0, 0]] as [number, number][];

    const route: GeoJSONLineString = {
      type: 'LineString',
      coordinates: coords,
    };

    try {
      const run = await insertRun({
        user_id: user.id,
        route,
        distance_m: activeRun.distance_m,
        duration_s: Math.round(activeRun.duration_s), // DB column is INTEGER — must not send a float
        pace_s_per_km: activeRun.pace_s_per_km,
        calories: activeRun.calories,
        elevation_m: 0,
        started_at: new Date(activeRun.startTime).toISOString(),
        ended_at: new Date().toISOString(),
      });
      // Invalidate all caches that depend on the user's runs
      void mutate(`feed-${user.id}`, undefined, { revalidate: true });
      void mutate(`stats-${user.id}`, undefined, { revalidate: true });
      void mutate(`runs-${user.id}`, undefined, { revalidate: true });
      router.push(`/run/summary?runId=${run.id}`);
    } catch (err) {
      // Supabase throws PostgrestError (plain object, not Error instance) — extract message safely
      const message =
        err != null && typeof (err as Record<string, unknown>).message === 'string'
          ? (err as Record<string, unknown>).message as string
          : 'Failed to save run';
      setSaveError(message);
    }
  };

  return (
    // Flex column: HUD takes natural height at top, map fills the rest below
    <main className="flex flex-col h-screen bg-background overflow-hidden">
      {activeRun && <RunHUD run={activeRun} />}

      <div className="relative flex-1 overflow-hidden">
        <MapContainer onMapReady={setMap} className="absolute inset-0" />

        {map && activeRun && (
          <RunTrail map={map} coordinates={activeRun.coordinates} />
        )}

        {/* Neon dot at runner's current position — updates with every GPS tick */}
        {(() => {
          const last = activeRun?.coordinates[activeRun.coordinates.length - 1];
          return map && last
            ? <UserLocationDot map={map} position={{ lat: last[1], lng: last[0] }} />
            : null;
        })()}

        {/* GPS error banner */}
        {gpsError && (
          <div className="absolute top-3 left-3 right-3 z-30 bg-danger/90 text-white text-xs font-body px-4 py-2.5 rounded-xl text-center">
            {gpsError}
          </div>
        )}

        {/* Save error banner — shown when insertRun fails so the user isn't left wondering */}
        {saveError && (
          <div className="absolute top-3 left-3 right-3 z-30 bg-danger/90 text-white text-xs font-body px-4 py-2.5 rounded-xl text-center">
            Save failed: {saveError}
          </div>
        )}

        <RunControls
          isPaused={isPaused}
          onPause={isPaused ? resumeRun : pauseRun}
          onStop={() => { void handleStop(); }}
        />

        {showCapture && <CaptureFlash />}
      </div>
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
