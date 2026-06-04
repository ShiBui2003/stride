// Full leaderboard with scope + sort toggles, staggered cards, and pinned self row
'use client';

import { useState } from 'react';
import { LeaderboardCard } from '@/components/leaderboard/LeaderboardCard';
import { SkeletonLoader } from '@/components/ui/SkeletonLoader';
import { useLeaderboard } from '@/hooks/useLeaderboard';
import type { LeaderboardScope, LeaderboardSort } from '@/hooks/useLeaderboard';
import type { LeaderboardEntry } from '@/lib/supabase/queries/leaderboard';

interface LeaderboardListProps {
  city?: string;
  currentUserId?: string;
}

const SCOPES: LeaderboardScope[] = ['city', 'global', 'friends'];
const SORTS: { value: LeaderboardSort; label: string }[] = [
  { value: 'territory', label: 'Territory' },
  { value: 'weekly_km', label: 'Weekly km' },
];

export function LeaderboardList({ city, currentUserId }: LeaderboardListProps) {
  const [scope, setScope] = useState<LeaderboardScope>('city');
  const [sort, setSort] = useState<LeaderboardSort>('territory');

  const { entries, loading } = useLeaderboard(scope, sort, city, currentUserId);

  const top10 = entries.slice(0, 10);
  const userInTop10 = top10.some((e) => e.user.id === currentUserId);
  const userEntry: LeaderboardEntry | undefined = entries.find(
    (e) => e.user.id === currentUserId
  );
  const showPinnedSelf = !userInTop10 && currentUserId !== undefined;

  return (
    <div className="space-y-4">
      {/* Scope toggle */}
      <div className="flex gap-1 bg-surface rounded-xl p-1">
        {SCOPES.map((s) => (
          <button
            key={s}
            onClick={() => setScope(s)}
            className={`flex-1 py-2 rounded-lg text-xs font-heading font-bold capitalize transition-all ${
              scope === s ? 'bg-accent text-background' : 'text-textSecondary'
            }`}
          >
            {s}
          </button>
        ))}
      </div>

      {/* Sort toggle */}
      <div className="flex gap-2">
        {SORTS.map(({ value, label }) => (
          <button
            key={value}
            onClick={() => setSort(value)}
            className={`px-3 py-1 rounded-full text-xs font-body transition-all border ${
              sort === value
                ? 'border-accent text-accent bg-accent/10'
                : 'border-white/10 text-textSecondary'
            }`}
          >
            {label}
          </button>
        ))}
      </div>

      {/* List */}
      {loading ? (
        <div className="space-y-2">
          <SkeletonLoader className="h-16" count={10} />
        </div>
      ) : top10.length === 0 ? (
        <p className="text-textSecondary font-body text-sm text-center py-12">
          No runners here yet.
        </p>
      ) : (
        <div className="space-y-2">
          {top10.map((entry, i) => (
            <LeaderboardCard
              key={entry.user.id}
              entry={entry}
              isCurrentUser={entry.user.id === currentUserId}
              sortMode={sort}
              index={i}
            />
          ))}
        </div>
      )}

      {/* Pinned self — shown when user is outside the top 10 */}
      {showPinnedSelf && (
        <div className="pt-1">
          <div className="flex items-center gap-2 mb-2">
            <div className="flex-1 h-px bg-white/10" />
            <span className="text-[10px] text-textSecondary uppercase tracking-widest font-body">
              Your position
            </span>
            <div className="flex-1 h-px bg-white/10" />
          </div>
          {userEntry ? (
            <LeaderboardCard
              entry={userEntry}
              isCurrentUser
              sortMode={sort}
              index={0}
            />
          ) : (
            <div className="flex items-center gap-4 px-4 py-3 rounded-xl bg-accent/10 border border-accent/20">
              <span className="font-stats text-3xl text-textSecondary w-9 text-right flex-shrink-0">
                —
              </span>
              <p className="text-textPrimary font-heading font-bold text-sm">You</p>
              <p className="text-textSecondary text-xs font-body ml-auto">No territory yet</p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
