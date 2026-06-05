// Lottie animation wrapper for micro-interactions (streak fire, badge unlock, button feedback)
'use client';

import React from 'react';
import dynamic from 'next/dynamic';

// react-lottie-player touches `document` at import time, which breaks static prerender.
// Loading it client-only (ssr: false) keeps it out of the server bundle entirely.
const Player = dynamic(
  () => import('@lottiefiles/react-lottie-player').then((mod) => mod.Player),
  { ssr: false }
);

// Accepts a URL string or an imported JSON object
type LottieSource = string | Record<string, unknown>;

interface LottiePlayerProps {
  src: LottieSource;
  loop?: boolean;
  autoplay?: boolean;
  className?: string;
  style?: React.CSSProperties;
  onComplete?: () => void;
}

export function LottiePlayer({
  src,
  loop = false,
  autoplay = true,
  className = '',
  style,
  onComplete,
}: LottiePlayerProps): React.JSX.Element {
  return (
    <Player
      src={src as string}
      loop={loop}
      autoplay={autoplay}
      className={className}
      style={style}
      onEvent={(event) => {
        if (event === 'complete') onComplete?.();
      }}
    />
  );
}
