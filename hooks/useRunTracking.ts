// Real-time GPS run tracking — manages live coordinates, stats, pause/resume, and loop detection
'use client';

import { useState, useRef, useCallback } from 'react';
import { calculateTotalDistance, calculatePace, calculateCalories } from '@/lib/gps/trackingUtils';
import { isLoopClosed, coordinatesToPolygon } from '@/lib/maps/polygonUtils';
import type { ActiveRun } from '@/types/run.types';
import type { GeoJSONPolygon } from '@/types/territory.types';

interface UseRunTrackingReturn {
  isRunning: boolean;
  isPaused: boolean;
  activeRun: ActiveRun | null;
  capturedPolygon: GeoJSONPolygon | null;
  startRun: () => void;
  pauseRun: () => void;
  resumeRun: () => void;
  stopRun: () => void;
  clearCapturedPolygon: () => void;
}

export function useRunTracking(): UseRunTrackingReturn {
  const [isRunning, setIsRunning] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [activeRun, setActiveRun] = useState<ActiveRun | null>(null);
  const [capturedPolygon, setCapturedPolygon] = useState<GeoJSONPolygon | null>(null);

  const watchId = useRef<number | null>(null);
  const startTimeRef = useRef<number>(0);
  const pausedDurationRef = useRef<number>(0); // accumulated paused milliseconds
  const pausedAtRef = useRef<number | null>(null);
  // Ref mirrors coords so the GPS callback reads latest without stale closure
  const coordsRef = useRef<[number, number][]>([]);

  // Extracted so both startRun and resumeRun share identical GPS callback logic
  const startWatching = useCallback(() => {
    watchId.current = navigator.geolocation.watchPosition(
      (position) => {
        const coord: [number, number] = [position.coords.longitude, position.coords.latitude];
        const coords = [...coordsRef.current, coord];
        coordsRef.current = coords;

        const distance_m = calculateTotalDistance(coords);
        const duration_s = (Date.now() - startTimeRef.current - pausedDurationRef.current) / 1000;

        setActiveRun((prev) =>
          prev
            ? {
                ...prev,
                coordinates: coords,
                distance_m,
                duration_s,
                pace_s_per_km: calculatePace(distance_m, duration_s),
                calories: calculateCalories(distance_m, duration_s),
              }
            : null
        );

        // Loop check outside the state updater to avoid setState side effects
        if (isLoopClosed(coords)) {
          setCapturedPolygon((prev) => prev ?? coordinatesToPolygon(coords));
        }
      },
      undefined,
      { enableHighAccuracy: true, maximumAge: 1000 }
    );
  }, []);

  const startRun = useCallback(() => {
    startTimeRef.current = Date.now();
    pausedDurationRef.current = 0;
    pausedAtRef.current = null;
    coordsRef.current = [];

    setActiveRun({
      startTime: startTimeRef.current,
      coordinates: [],
      distance_m: 0,
      duration_s: 0,
      pace_s_per_km: 0,
      calories: 0,
    });
    setIsRunning(true);
    setIsPaused(false);
    setCapturedPolygon(null);
    startWatching();
  }, [startWatching]);

  const pauseRun = useCallback(() => {
    if (watchId.current !== null) {
      navigator.geolocation.clearWatch(watchId.current);
      watchId.current = null;
    }
    pausedAtRef.current = Date.now();
    setIsRunning(false);
    setIsPaused(true);
  }, []);

  const resumeRun = useCallback(() => {
    // Accumulate paused time so duration_s stays accurate
    if (pausedAtRef.current !== null) {
      pausedDurationRef.current += Date.now() - pausedAtRef.current;
      pausedAtRef.current = null;
    }
    startWatching();
    setIsRunning(true);
    setIsPaused(false);
  }, [startWatching]);

  const stopRun = useCallback(() => {
    if (watchId.current !== null) {
      navigator.geolocation.clearWatch(watchId.current);
      watchId.current = null;
    }
    setIsRunning(false);
    setIsPaused(false);
  }, []);

  const clearCapturedPolygon = useCallback(() => {
    setCapturedPolygon(null);
  }, []);

  return {
    isRunning,
    isPaused,
    activeRun,
    capturedPolygon,
    startRun,
    pauseRun,
    resumeRun,
    stopRun,
    clearCapturedPolygon,
  };
}
