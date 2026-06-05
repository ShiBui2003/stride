// Full-screen splash loader shown once on cold start while auth initialises
'use client';

import React, { useState, useEffect, useRef } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { RiveStride } from '@/components/animations/RiveStride';

// Minimum time the loader is visible regardless of how fast auth resolves
const MIN_DISPLAY_MS = 1200;
const FADE_MS = 300;

interface AppLoaderProps {
  children: React.ReactNode;
}

export function AppLoader({ children }: AppLoaderProps): React.JSX.Element {
  const { loading } = useAuth();
  const [visible, setVisible] = useState(true);
  const [fading, setFading] = useState(false);
  const mountedAt = useRef(0);

  useEffect(() => {
    mountedAt.current = Date.now();
  }, []);

  useEffect(() => {
    if (loading) return;

    const elapsed = Date.now() - (mountedAt.current || Date.now());
    const delay = Math.max(0, MIN_DISPLAY_MS - elapsed);

    const fadeTimer = setTimeout(() => setFading(true), delay);
    const hideTimer = setTimeout(() => setVisible(false), delay + FADE_MS);

    return () => {
      clearTimeout(fadeTimer);
      clearTimeout(hideTimer);
    };
  }, [loading]);

  return (
    <>
      {children}
      {visible && (
        <div
          aria-hidden="true"
          style={{ transition: `opacity ${FADE_MS}ms ease` }}
          className={`fixed inset-0 z-50 flex flex-col items-center justify-center gap-4 bg-background pointer-events-none ${
            fading ? 'opacity-0' : 'opacity-100'
          }`}
        >
          <RiveStride className="w-36 h-36" />
          <p
            className="font-stats text-accent text-6xl leading-none"
            style={{ letterSpacing: '0.45em' }}
          >
            STRIDE
          </p>
          <p className="font-body text-textSecondary text-xs uppercase tracking-[0.25em]">
            Capture territory. Outrun rivals.
          </p>
        </div>
      )}
    </>
  );
}
