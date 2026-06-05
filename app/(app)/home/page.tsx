// Home page — personal stats, stories row, and activity feed
'use client';

import React from 'react';
import useSWR from 'swr';
import { MapTrifold, Flame, Lightning } from '@phosphor-icons/react';
import { StoriesRow } from '@/components/feed/StoriesRow';
import { ActivityFeed } from '@/components/feed/ActivityFeed';
import { SkeletonLoader } from '@/components/ui/SkeletonLoader';
import { useAuth } from '@/hooks/useAuth';
import { getFeedRuns } from '@/lib/supabase/queries/runs';
import { getUserById, getUserStats, getRecentlyActiveFollowing } from '@/lib/supabase/queries/users';
import { formatArea } from '@/lib/utils/formatters';

export default function HomePage(): React.JSX.Element {
  const { user: authUser, loading: authLoading } = useAuth();

  const { data: profile } = useSWR(
    authUser?.id ? `profile-${authUser.id}` : null,
    () => getUserById(authUser!.id)
  );

  const { data: stats } = useSWR(
    authUser?.id ? `stats-${authUser.id}` : null,
    () => getUserStats(authUser!.id)
  );

  const { data: recentlyActive = [] } = useSWR(
    authUser?.id ? `stories-${authUser.id}` : null,
    () => getRecentlyActiveFollowing(authUser!.id)
  );

  // revalidateOnMount: true ensures a fresh fetch every time the home page mounts,
  // bypassing the SWR dedup window — so a run completed seconds ago always shows up.
  const { data: feedItems = [], isLoading: feedLoading } = useSWR(
    authUser?.id ? `feed-${authUser.id}` : null,
    () => getFeedRuns(authUser!.id),
    { revalidateOnMount: true }
  );

  if (authLoading || !profile) {
    return (
      <main className="min-h-screen bg-background px-4 pt-12 pb-24 space-y-6">
        <SkeletonLoader className="h-10 w-40" />
        <SkeletonLoader className="h-20" />
        <SkeletonLoader className="h-16" />
        <SkeletonLoader className="h-52" count={3} />
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-background px-4 pt-12 pb-24 space-y-6">

      {/* Greeting */}
      <div>
        <p className="text-textSecondary text-[10px] font-body uppercase tracking-widest mb-0.5">
          {profile.city}
        </p>
        <h1 className="text-textPrimary font-heading font-bold text-2xl leading-tight">
          {profile.username}
        </h1>
      </div>

      {/* Stats bar */}
      <div className="grid grid-cols-3 gap-2">
        <div className="bg-surface rounded-2xl p-3 space-y-1">
          <div className="flex items-center gap-1.5">
            <MapTrifold size={12} className="text-accent flex-shrink-0" />
            <span className="text-[9px] text-textSecondary uppercase tracking-wider font-body leading-none">
              Territory
            </span>
          </div>
          <p className="text-textPrimary font-stats text-lg leading-none">
            {stats ? formatArea(stats.territory_area_m2) : '—'}
          </p>
        </div>

        <div className="bg-surface rounded-2xl p-3 space-y-1">
          <div className="flex items-center gap-1.5">
            <Flame size={12} className="text-danger flex-shrink-0" />
            <span className="text-[9px] text-textSecondary uppercase tracking-wider font-body leading-none">
              Streak
            </span>
          </div>
          <p className="text-textPrimary font-stats text-lg leading-none">
            {stats ? `${stats.streak_count}d` : '—'}
          </p>
        </div>

        <div className="bg-surface rounded-2xl p-3 space-y-1">
          <div className="flex items-center gap-1.5">
            <Lightning size={12} className="text-accent flex-shrink-0" />
            <span className="text-[9px] text-textSecondary uppercase tracking-wider font-body leading-none">
              This week
            </span>
          </div>
          <p className="text-textPrimary font-stats text-lg leading-none">
            {stats ? `${stats.weekly_km.toFixed(1)}km` : '—'}
          </p>
        </div>
      </div>

      {/* Stories row */}
      <div>
        <p className="text-[10px] text-textSecondary uppercase tracking-widest font-body mb-3">
          Active today
        </p>
        <StoriesRow users={recentlyActive} currentUser={profile} />
      </div>

      {/* Activity feed */}
      <div>
        <p className="text-[10px] text-textSecondary uppercase tracking-widest font-body mb-3">
          Activity
        </p>
        <ActivityFeed items={feedItems} loading={feedLoading} />
      </div>

    </main>
  );
}
