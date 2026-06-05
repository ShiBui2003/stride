// Single activity card — user header, route thumbnail, stats, and like action
'use client';

import React, { useState } from 'react';
import { Heart } from '@phosphor-icons/react';
import { Card } from '@/components/ui/Card';
import { Avatar } from '@/components/ui/Avatar';
import { formatDistance, formatDuration, formatPace, formatRelativeTime } from '@/lib/utils/formatters';
import type { Run, GeoJSONLineString } from '@/types/run.types';
import type { User } from '@/types/user.types';

interface ActivityCardProps {
  run: Run;
  user: User;
  likesCount: number;
  onLike?: () => void;
}

export function ActivityCard({ run, user, likesCount, onLike }: ActivityCardProps) {
  const [liked, setLiked] = useState(false);
  const [count, setCount] = useState(likesCount);

  function handleLike() {
    if (liked) {
      setCount((c) => c - 1);
      setLiked(false);
    } else {
      setCount((c) => c + 1);
      setLiked(true);
      onLike?.();
    }
  }

  const timeAgo = formatRelativeTime(new Date(run.started_at));

  return (
    <Card className="space-y-3">
      {/* User header */}
      <div className="flex items-center gap-3">
        <Avatar src={user.avatar_url} username={user.username} color={user.territory_color} />
        <div className="flex-1 min-w-0">
          <p className="font-heading font-bold text-textPrimary text-sm truncate">{user.username}</p>
          <p className="text-xs text-textSecondary">{timeAgo}</p>
        </div>
        <span className="text-xs text-textSecondary font-body">{user.city}</span>
      </div>

      {/* Route thumbnail — SVG rendered from stored GeoJSON coordinates */}
      <RouteThumbnail route={run.route} />

      {/* Stats row */}
      <div className="flex gap-4">
        <div>
          <p className="text-[10px] text-textSecondary uppercase tracking-wider font-body">Distance</p>
          <p className="text-textPrimary font-stats text-lg leading-tight">{formatDistance(run.distance_m)}</p>
        </div>
        <div>
          <p className="text-[10px] text-textSecondary uppercase tracking-wider font-body">Time</p>
          <p className="text-textPrimary font-stats text-lg leading-tight">{formatDuration(run.duration_s)}</p>
        </div>
        <div>
          <p className="text-[10px] text-textSecondary uppercase tracking-wider font-body">Pace</p>
          <p className="text-textPrimary font-stats text-lg leading-tight">{formatPace(run.pace_s_per_km)}/km</p>
        </div>
      </div>

      {/* Actions */}
      <div className="flex items-center gap-1 pt-1 border-t border-white/5">
        <button
          onClick={handleLike}
          className="flex items-center gap-1.5 transition-transform active:scale-95"
        >
          <Heart
            size={16}
            weight={liked ? 'fill' : 'regular'}
            className={liked ? 'text-danger' : 'text-textSecondary'}
          />
          <span className={`text-sm ${liked ? 'text-danger' : 'text-textSecondary'}`}>{count}</span>
        </button>
      </div>
    </Card>
  );
}

// Renders the run route as a scaled SVG polyline from the stored GeoJSON LineString
function RouteThumbnail({ route }: { route: GeoJSONLineString }): React.JSX.Element {
  const coords = route?.coordinates ?? [];

  if (coords.length < 2) {
    return (
      <div className="h-36 bg-background rounded-xl border border-white/5 flex items-center justify-center">
        <span className="text-textSecondary text-xs">No route data</span>
      </div>
    );
  }

  const W = 400;
  const H = 144;
  const PAD = 18;

  const lngs = coords.map((c) => c[0]);
  const lats = coords.map((c) => c[1]);
  const minLng = Math.min(...lngs);
  const maxLng = Math.max(...lngs);
  const minLat = Math.min(...lats);
  const maxLat = Math.max(...lats);

  // Scale uniformly so the route isn't distorted, centered within the viewport
  const lngSpan = maxLng - minLng || 0.0001;
  const latSpan = maxLat - minLat || 0.0001;
  const scale = Math.min((W - PAD * 2) / lngSpan, (H - PAD * 2) / latSpan);
  const offsetX = (W - lngSpan * scale) / 2;
  const offsetY = (H - latSpan * scale) / 2;

  const toXY = ([lng, lat]: [number, number]): [number, number] => [
    offsetX + (lng - minLng) * scale,
    H - offsetY - (lat - minLat) * scale, // flip Y: lat increases up, SVG y increases down
  ];

  const points = coords.map((c) => toXY(c).map((n) => n.toFixed(1)).join(',')).join(' ');
  const [sx, sy] = toXY(coords[0]);
  const [ex, ey] = toXY(coords[coords.length - 1]);

  return (
    <div className="h-36 bg-background rounded-xl overflow-hidden border border-white/5">
      <svg viewBox={`0 0 ${W} ${H}`} className="w-full h-full" aria-hidden="true">
        <polyline
          points={points}
          className="fill-none stroke-accent"
          strokeWidth="2.5"
          strokeLinecap="round"
          strokeLinejoin="round"
          opacity={0.9}
        />
        {/* Start marker */}
        <circle cx={sx} cy={sy} r="5" className="fill-accent" />
        {/* End marker — slightly dimmed */}
        <circle cx={ex} cy={ey} r="4" className="fill-accent" opacity={0.45} />
      </svg>
    </div>
  );
}
