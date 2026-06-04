// Single leaderboard row — rank, avatar, username, and sort-mode-aware primary stat
import { Avatar } from '@/components/ui/Avatar';
import { formatArea } from '@/lib/utils/formatters';
import type { LeaderboardEntry } from '@/lib/supabase/queries/leaderboard';
import type { LeaderboardSort } from '@/hooks/useLeaderboard';

interface LeaderboardCardProps {
  entry: LeaderboardEntry;
  isCurrentUser?: boolean;
  sortMode?: LeaderboardSort;
  index?: number;
}

export function LeaderboardCard({
  entry,
  isCurrentUser = false,
  sortMode = 'territory',
  index = 0,
}: LeaderboardCardProps) {
  const { rank, user, total_area_m2, territory_count, weekly_km } = entry;

  const primaryStat =
    sortMode === 'weekly_km' ? `${weekly_km.toFixed(1)}km` : formatArea(total_area_m2);
  const primaryLabel = sortMode === 'weekly_km' ? 'this week' : 'territory';
  const secondaryStat =
    sortMode === 'weekly_km' ? formatArea(total_area_m2) : `${territory_count} zones`;

  const rankColor =
    rank === 1 ? 'text-accent' : rank === 2 ? 'text-textSecondary' : rank === 3 ? 'text-danger' : 'text-textSecondary';

  return (
    <div
      className={`flex items-center gap-4 px-4 py-3 rounded-xl animate-slide-up transition-colors ${
        isCurrentUser ? 'bg-accent/10 border border-accent/20' : 'bg-surface'
      }`}
      style={{ animationDelay: `${Math.min(index * 35, 350)}ms` }}
    >
      <span className={`font-stats text-3xl w-9 text-right flex-shrink-0 ${rankColor}`}>
        {rank}
      </span>

      <Avatar src={user.avatar_url} username={user.username} color={user.territory_color} size="md" />

      <div className="flex-1 min-w-0">
        <p className="font-heading font-bold text-textPrimary text-sm truncate">{user.username}</p>
        <p className="text-[11px] text-textSecondary">{secondaryStat}</p>
      </div>

      <div className="text-right flex-shrink-0">
        <p className="font-stats text-lg text-textPrimary leading-none">{primaryStat}</p>
        <p className="text-[10px] text-textSecondary uppercase tracking-wide mt-0.5">{primaryLabel}</p>
      </div>
    </div>
  );
}
