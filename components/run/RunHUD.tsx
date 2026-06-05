// Top overlay HUD showing distance, pace, duration, and calories during a run
'use client';

import React from 'react';
import { formatDistance, formatPace, formatDuration } from '@/lib/utils/formatters';
import type { ActiveRun } from '@/types/run.types';

interface RunHUDProps {
  run: ActiveRun;
}

export function RunHUD({ run }: RunHUDProps): React.JSX.Element {
  return (
    <div className="flex-shrink-0 px-4 pt-12 pb-5 bg-background border-b border-white/5">
      <div className="grid grid-cols-2 gap-x-6 gap-y-3 max-w-xs mx-auto">
        <StatBlock label="DISTANCE" value={formatDistance(run.distance_m)} highlight />
        <StatBlock label="PACE /KM" value={formatPace(run.pace_s_per_km)} />
        <StatBlock label="DURATION" value={formatDuration(run.duration_s)} />
        <StatBlock label="CALORIES" value={`${Math.round(run.calories)}`} />
      </div>
    </div>
  );
}

interface StatBlockProps {
  label: string;
  value: string;
  highlight?: boolean;
}

function StatBlock({ label, value, highlight = false }: StatBlockProps): React.JSX.Element {
  return (
    <div className="text-center">
      <p className={`font-stats text-4xl leading-none ${highlight ? 'text-accent' : 'text-textPrimary'}`}>
        {value}
      </p>
      <p className="text-[10px] text-textSecondary font-body uppercase tracking-widest mt-1">{label}</p>
    </div>
  );
}
