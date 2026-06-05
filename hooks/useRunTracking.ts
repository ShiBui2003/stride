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
  gpsError: string | null;
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
  const [gpsError, setGpsError] = useState<string | null>(null);

  const watchId = useRef<number | null>(null);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const startTimeRef = useRef<number>(0);
  const pausedDurationRef = useRef<number>(0); // accumulated paused milliseconds
  const pausedAtRef = useRef<number | null>(null);
  // Ref mirrors coords so the GPS callback reads latest without stale closure
  const coordsRef = useRef<[number, number][]>([]);
  // Mirrors distance_m so the 1-second timer can read it without stale closure
  const distanceRef = useRef<number>(0);

  // Ticks every second: keeps duration_s and calories live between GPS fixes
  const startTimer = useCallback(() => {
    if (timerRef.current !== null) clearInterval(timerRef.current);
    timerRef.current = setInterval(() => {
      const duration_s = (Date.now() - startTimeRef.current - pausedDurationRef.current) / 1000;
      setActiveRun((prev) =>
        prev
          ? {
              ...prev,
              duration_s,
              calories: calculateCalories(distanceRef.current, duration_s),
            }
          : null
      );
    }, 1000);
  }, []);

  const stopTimer = useCallback(() => {
    if (timerRef.current !== null) {
      clearInterval(timerRef.current);
      timerRef.current = null;
    }
  }, []);

  // Extracted so both startRun and resumeRun share identical GPS callback logic
  const startWatching = useCallback(() => {
    setGpsError(null);
    watchId.current = navigator.geolocation.watchPosition(
      (position) => {
        setGpsError(null);
        const coord: [number, number] = [position.coords.longitude, position.coords.latitude];
        const coords = [...coordsRef.current, coord];
        coordsRef.current = coords;

        const distance_m = calculateTotalDistance(coords);
        distanceRef.current = distance_m; // keep ref in sync for the timer
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
      (err) => {
        if (err.code === 1) setGpsError('Location access denied — allow it in browser settings to track your run.');
        else if (err.code === 2) setGpsError('GPS signal unavailable. Move to an open area.');
        else setGpsError('GPS timed out. Retrying…');
      },
      { enableHighAccuracy: true, maximumAge: 1000 }
    );
  }, []);

  const startRun = useCallback(() => {
    startTimeRef.current = Date.now();
    pausedDurationRef.current = 0;
    pausedAtRef.current = null;
    coordsRef.current = [];
    distanceRef.current = 0;

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
    startTimer();
  }, [startWatching, startTimer]);

  const pauseRun = useCallback(() => {
    if (watchId.current !== null) {
      navigator.geolocation.clearWatch(watchId.current);
      watchId.current = null;
    }
    stopTimer();
    pausedAtRef.current = Date.now();
    setIsRunning(false);
    setIsPaused(true);
  }, [stopTimer]);

  const resumeRun = useCallback(() => {
    // Accumulate paused time so duration_s stays accurate
    if (pausedAtRef.current !== null) {
      pausedDurationRef.current += Date.now() - pausedAtRef.current;
      pausedAtRef.current = null;
    }
    startWatching();
    startTimer();
    setIsRunning(true);
    setIsPaused(false);
  }, [startWatching, startTimer]);

  const stopRun = useCallback(() => {
    if (watchId.current !== null) {
      navigator.geolocation.clearWatch(watchId.current);
      watchId.current = null;
    }
    stopTimer();
    setIsRunning(false);
    setIsPaused(false);
  }, [stopTimer]);

  const clearCapturedPolygon = useCallback(() => {
    setCapturedPolygon(null);
  }, []);

  return {
    isRunning,
    isPaused,
    activeRun,
    capturedPolygon,
    gpsError,
    startRun,
    pauseRun,
    resumeRun,
    stopRun,
    clearCapturedPolygon,
  };
}
