// Drives a requestAnimationFrame loop that progressively reveals a run's GPS coordinates for replay
'use client';

import { useState, useRef, useCallback, useEffect } from 'react';

interface UseRunReplayReturn {
  // Number of coordinates to draw so far (0 → totalPoints)
  drawnCount: number;
  isPlaying: boolean;
  isComplete: boolean;
  play: () => void;
  restart: () => void;
}

const REPLAY_DURATION_MS = 4000;

// totalPoints is the full coordinate count of the run being replayed
export function useRunReplay(totalPoints: number): UseRunReplayReturn {
  const [drawnCount, setDrawnCount] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);

  const frameRef = useRef<number | null>(null);
  const startTimeRef = useRef<number>(0);

  const stopLoop = useCallback(() => {
    if (frameRef.current !== null) {
      cancelAnimationFrame(frameRef.current);
      frameRef.current = null;
    }
  }, []);

  const play = useCallback(() => {
    if (totalPoints < 2) return;
    stopLoop();
    setIsPlaying(true);
    setDrawnCount(0);
    startTimeRef.current = 0;

    const step = (timestamp: number): void => {
      if (startTimeRef.current === 0) startTimeRef.current = timestamp;
      const elapsed = timestamp - startTimeRef.current;
      const ratio = Math.min(elapsed / REPLAY_DURATION_MS, 1);
      // At least 2 points so a polyline is always visible once playback starts
      setDrawnCount(Math.max(2, Math.round(ratio * totalPoints)));

      if (ratio < 1) {
        frameRef.current = requestAnimationFrame(step);
      } else {
        frameRef.current = null;
        setIsPlaying(false);
      }
    };

    frameRef.current = requestAnimationFrame(step);
  }, [totalPoints, stopLoop]);

  const restart = useCallback(() => {
    play();
  }, [play]);

  // Cancel any in-flight frame when the consumer unmounts or the run changes
  useEffect(() => stopLoop, [stopLoop]);

  return {
    drawnCount,
    isPlaying,
    isComplete: !isPlaying && drawnCount >= totalPoints && totalPoints > 0,
    play,
    restart,
  };
}
