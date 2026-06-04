// Full-screen overlay that plays the territory capture celebration animation
'use client';

import { RiveStride } from '@/components/animations/RiveStride';

interface CaptureCelebrationProps {
  visible: boolean;
  onComplete?: () => void;
}

export function CaptureCelebration({ visible, onComplete }: CaptureCelebrationProps) {
  if (!visible) return null;

  return (
    <div
      role="dialog"
      aria-label="Territory captured"
      className="absolute inset-0 z-40 flex flex-col items-center justify-center bg-background/80 backdrop-blur-sm"
      onClick={onComplete}
    >
      <RiveStride className="w-52 h-52" />
      <p className="font-heading text-3xl font-bold text-accent mt-4">Territory Captured!</p>
      <p className="text-textSecondary text-sm mt-2">Tap anywhere to continue</p>
    </div>
  );
}
