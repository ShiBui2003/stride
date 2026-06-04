// Lottie animation wrapper for micro-interactions (streak fire, badge unlock, button feedback)
'use client';

import { Player } from '@lottiefiles/react-lottie-player';

interface LottiePlayerProps {
  src: string;
  loop?: boolean;
  autoplay?: boolean;
  className?: string;
  onComplete?: () => void;
}

export function LottiePlayer({
  src,
  loop = false,
  autoplay = true,
  className = '',
  onComplete,
}: LottiePlayerProps) {
  return (
    <Player
      src={src}
      loop={loop}
      autoplay={autoplay}
      className={className}
      onEvent={(event) => {
        if (event === 'complete') onComplete?.();
      }}
    />
  );
}
