// Post-run summary card — large route SVG, Bebas Neue stat grid, territory badge
import React from 'react';
import { Card } from '@/components/ui/Card';
import { formatDistance, formatDuration, formatPace, formatArea } from '@/lib/utils/formatters';
import type { Run, GeoJSONLineString } from '@/types/run.types';

interface RunSummaryCardProps {
  run: Run;
  capturedAreaM2?: number;
}

export function RunSummaryCard({ run, capturedAreaM2 }: RunSummaryCardProps): React.JSX.Element {
  const date = new Date(run.started_at);
  const dateStr = date.toLocaleDateString('en-US', {
    weekday: 'long',
    month: 'short',
    day: 'numeric',
  });

  return (
    <div className="space-y-4">
      <div>
        <h1 className="font-stats text-accent text-5xl tracking-widest leading-none">
          RUN COMPLETE
        </h1>
        <p className="font-body text-textSecondary text-sm mt-1">{dateStr}</p>
      </div>

      {/* Large route SVG */}
      <Card className="p-0 overflow-hidden">
        <RouteSVG route={run.route} />
      </Card>

      {/* Stats grid — 2×2 with Bebas Neue */}
      <Card>
        <div className="grid grid-cols-2 gap-5">
          <Stat label="Distance" value={formatDistance(run.distance_m)} />
          <Stat label="Duration" value={formatDuration(run.duration_s)} />
          <Stat label="Avg Pace" value={`${formatPace(run.pace_s_per_km)}/km`} />
          <Stat label="Calories" value={`${Math.round(run.calories)} cal`} />
        </div>
      </Card>

      {/* Territory captured — only shown when a loop was closed this run */}
      {capturedAreaM2 !== undefined && capturedAreaM2 > 0 && (
        <div className="bg-accent/10 border border-accent/30 rounded-2xl p-4">
          <p className="font-stats text-accent text-4xl tracking-widest leading-none">
            {formatArea(capturedAreaM2)}
          </p>
          <p className="text-[10px] text-accent/70 uppercase tracking-widest mt-1 font-body">
            Territory captured
          </p>
        </div>
      )}
    </div>
  );
}

interface StatProps {
  label: string;
  value: string;
}

function Stat({ label, value }: StatProps): React.JSX.Element {
  return (
    <div>
      <p className="font-stats text-textPrimary text-4xl leading-none">{value}</p>
      <p className="text-[10px] text-textSecondary uppercase tracking-widest mt-1 font-body">
        {label}
      </p>
    </div>
  );
}

function RouteSVG({ route }: { route: GeoJSONLineString }): React.JSX.Element {
  const coords = route?.coordinates ?? [];

  if (coords.length < 2) {
    return (
      <div className="h-52 bg-background flex items-center justify-center">
        <span className="text-textSecondary text-xs font-body">No route data</span>
      </div>
    );
  }

  const W = 400;
  const H = 208;
  const PAD = 24;

  const lngs = coords.map((c) => c[0]);
  const lats = coords.map((c) => c[1]);
  const minLng = Math.min(...lngs);
  const maxLng = Math.max(...lngs);
  const minLat = Math.min(...lats);
  const maxLat = Math.max(...lats);

  const lngSpan = maxLng - minLng || 0.0001;
  const latSpan = maxLat - minLat || 0.0001;
  const scale = Math.min((W - PAD * 2) / lngSpan, (H - PAD * 2) / latSpan);
  const offsetX = (W - lngSpan * scale) / 2;
  const offsetY = (H - latSpan * scale) / 2;

  const toXY = ([lng, lat]: [number, number]): [number, number] => [
    offsetX + (lng - minLng) * scale,
    H - offsetY - (lat - minLat) * scale, // flip Y: lat increases up, SVG y down
  ];

  const points = coords.map((c) => toXY(c).map((n) => n.toFixed(1)).join(',')).join(' ');
  const [sx, sy] = toXY(coords[0]);
  const [ex, ey] = toXY(coords[coords.length - 1]);

  return (
    <div className="h-52 bg-background">
      <svg viewBox={`0 0 ${W} ${H}`} className="w-full h-full" aria-hidden="true">
        <polyline
          points={points}
          className="fill-none stroke-accent"
          strokeWidth="2.5"
          strokeLinecap="round"
          strokeLinejoin="round"
          opacity={0.9}
        />
        <circle cx={sx} cy={sy} r="6" className="fill-accent" />
        <circle cx={ex} cy={ey} r="5" className="fill-accent" opacity={0.45} />
      </svg>
    </div>
  );
}
