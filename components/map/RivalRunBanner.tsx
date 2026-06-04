// In-app banner shown when the user's rival completes a new run
'use client';

import { useEffect } from 'react';
import { Lightning, X } from '@phosphor-icons/react';
import { formatDistance, formatPace } from '@/lib/utils/formatters';

const AUTO_DISMISS_MS = 5000;

interface RivalRunBannerProps {
  rivalUsername: string;
  distanceM: number;
  paceSPerKm: number;
  onDismiss: () => void;
}

export function RivalRunBanner({
  rivalUsername,
  distanceM,
  paceSPerKm,
  onDismiss,
}: RivalRunBannerProps) {
  useEffect(() => {
    const timer = setTimeout(onDismiss, AUTO_DISMISS_MS);
    return () => clearTimeout(timer);
  }, [onDismiss]);

  return (
    <div className="absolute top-0 left-4 right-4 z-50 pt-safe-top mt-3 animate-slide-up pointer-events-auto">
      <div className="bg-danger rounded-2xl px-4 py-3 flex items-center gap-3 shadow-xl">
        <Lightning size={18} weight="fill" className="text-white flex-shrink-0" />

        <div className="flex-1 min-w-0">
          <p className="text-white font-heading font-bold text-sm leading-tight truncate">
            @{rivalUsername} just ran
          </p>
          <p className="text-white/70 text-xs font-body">
            {formatDistance(distanceM)}
            {paceSPerKm > 0 && ` · ${formatPace(paceSPerKm)}/km`}
          </p>
        </div>

        <button
          onClick={onDismiss}
          className="text-white/60 hover:text-white transition-colors flex-shrink-0 active:scale-90"
          aria-label="Dismiss"
        >
          <X size={16} weight="bold" />
        </button>
      </div>
    </div>
  );
}
