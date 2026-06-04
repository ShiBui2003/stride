// Single activity card — user header, route thumbnail, stats, and like action
'use client';

import { useState } from 'react';
import { Heart } from '@phosphor-icons/react';
import { Card } from '@/components/ui/Card';
import { Avatar } from '@/components/ui/Avatar';
import { formatDistance, formatDuration, formatPace, formatRelativeTime } from '@/lib/utils/formatters';
import type { Run } from '@/types/run.types';
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

      {/* Route map thumbnail — replaced with canvas snapshot in Phase 4 */}
      <div className="h-36 bg-background rounded-xl flex items-center justify-center border border-white/5">
        <span className="text-textSecondary text-xs">Route map</span>
      </div>

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
