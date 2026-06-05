// Public profile page — stats, run history, and follow controls for any runner
'use client';

// Required by @cloudflare/next-on-pages — dynamic routes must run on the Edge Runtime
export const runtime = 'edge';

import React, { useState } from 'react';
import { useParams } from 'next/navigation';
import useSWR from 'swr';
import { UserCircle, Play } from '@phosphor-icons/react';
import { Avatar } from '@/components/ui/Avatar';
import { Button } from '@/components/ui/Button';
import { SkeletonLoader } from '@/components/ui/SkeletonLoader';
import { ProfileHeatmapCard } from '@/components/map/ProfileHeatmapCard';
import { RunReplay } from '@/components/map/RunReplay';
import { useAuth } from '@/hooks/useAuth';
import {
  getUserByUsername,
  getUserStats,
  checkIsFollowing,
  followUser,
  unfollowUser,
} from '@/lib/supabase/queries/users';
import { getRunsByUserId } from '@/lib/supabase/queries/runs';
import {
  formatDistance,
  formatDuration,
  formatPace,
  formatArea,
  formatRelativeTime,
} from '@/lib/utils/formatters';
import type { Run } from '@/types/run.types';

export default function ProfilePage(): React.JSX.Element {
  const params = useParams<{ username: string }>();
  const username = params.username;
  const { user } = useAuth();
  const [followLoading, setFollowLoading] = useState(false);
  const [replayRun, setReplayRun] = useState<Run | null>(null);

  const { data: profile, isLoading: profileLoading } = useSWR(
    `profile-${username}`,
    () => getUserByUsername(username)
  );
  const { data: stats } = useSWR(
    profile?.id ? `stats-${profile.id}` : null,
    () => getUserStats(profile!.id),
    { revalidateOnMount: true }
  );
  const { data: runs, isLoading: runsLoading } = useSWR(
    profile?.id ? `runs-${profile.id}` : null,
    () => getRunsByUserId(profile!.id),
    { revalidateOnMount: true }
  );
  const { data: isFollowing, mutate: mutateFollowing } = useSWR(
    user?.id && profile?.id && user.id !== profile.id
      ? `following-${user.id}-${profile.id}`
      : null,
    () => checkIsFollowing(user!.id, profile!.id)
  );

  const isOwnProfile = user?.id === profile?.id;

  async function handleFollow(): Promise<void> {
    if (!user?.id || !profile?.id) return;
    setFollowLoading(true);
    try {
      if (isFollowing) {
        await unfollowUser(user.id, profile.id);
        void mutateFollowing(false, false);
      } else {
        await followUser(user.id, profile.id);
        void mutateFollowing(true, false);
      }
    } finally {
      setFollowLoading(false);
    }
  }

  if (profileLoading) {
    return (
      <main className="min-h-screen bg-background px-4 pt-14 pb-24 space-y-3">
        <SkeletonLoader className="h-16 w-full" />
        <SkeletonLoader className="h-20 w-full" />
        <SkeletonLoader className="h-14 w-full" count={4} />
      </main>
    );
  }

  if (!profile) {
    return (
      <main className="min-h-screen bg-background flex flex-col items-center justify-center gap-3 pb-24">
        <UserCircle size={48} className="text-textSecondary" />
        <p className="text-textSecondary font-body text-sm">Runner not found</p>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-background pb-24">
      {/* Header */}
      <div className="px-4 pt-14 pb-5 flex items-center gap-4 border-b border-white/5">
        <Avatar
          src={profile.avatar_url}
          username={profile.username}
          color={profile.territory_color}
          size="lg"
        />
        <div className="flex-1 min-w-0">
          <h1 className="font-heading font-bold text-textPrimary text-xl leading-tight truncate">
            @{profile.username}
          </h1>
          <p className="text-textSecondary font-body text-sm mt-0.5">{profile.city}</p>
        </div>
        {!isOwnProfile && (
          <Button
            variant={isFollowing ? 'ghost' : 'accent'}
            size="sm"
            loading={followLoading}
            onClick={() => { void handleFollow(); }}
          >
            {isFollowing ? 'Following' : 'Follow'}
          </Button>
        )}
      </div>

      {/* Stats row */}
      <div className="grid grid-cols-3 divide-x divide-white/5 border-b border-white/5">
        <StatCell value={`${(stats?.total_km ?? 0).toFixed(1)}km`} label="TOTAL" />
        <StatCell value={formatArea(stats?.territory_area_m2 ?? 0)} label="TERRITORY" />
        <StatCell value={String(stats?.streak_count ?? 0)} label="STREAK 🔥" />
      </div>

      {/* Personal heatmap — all past routes stacked at low opacity */}
      {!runsLoading && runs && <ProfileHeatmapCard runs={runs} />}

      {/* Run history */}
      <div className="px-4 pt-5">
        <h2 className="font-heading font-bold text-textPrimary text-xs uppercase tracking-widest mb-3">
          Runs
        </h2>
        {runsLoading ? (
          <SkeletonLoader className="h-14 w-full mb-2" count={4} />
        ) : !runs || runs.length === 0 ? (
          <p className="text-textSecondary font-body text-sm py-10 text-center">No runs yet</p>
        ) : (
          <div className="space-y-2">
            {runs.map((run) => (
              <RunRow key={run.id} run={run} onReplay={() => setReplayRun(run)} />
            ))}
          </div>
        )}
      </div>

      {/* Run replay overlay — animates the selected run's GPS route */}
      {replayRun && <RunReplay run={replayRun} onClose={() => setReplayRun(null)} />}
    </main>
  );
}

function StatCell({ value, label }: { value: string; label: string }): React.JSX.Element {
  return (
    <div className="flex flex-col items-center py-5 gap-1">
      <span className="font-stats text-2xl text-textPrimary leading-none">{value}</span>
      <span className="text-[9px] text-textSecondary font-body uppercase tracking-widest">{label}</span>
    </div>
  );
}

function RunRow({ run, onReplay }: { run: Run; onReplay: () => void }): React.JSX.Element {
  return (
    <button
      onClick={onReplay}
      className="w-full bg-surface rounded-xl px-4 py-3 flex items-center justify-between gap-3 text-left active:scale-[0.98] transition-transform"
    >
      <div className="min-w-0">
        <p className="font-stats text-textPrimary text-lg leading-none">
          {formatDistance(run.distance_m)}
        </p>
        <p className="text-textSecondary font-body text-xs mt-0.5">
          {formatRelativeTime(new Date(run.started_at))}
        </p>
      </div>
      <div className="text-right flex-shrink-0 flex items-center gap-2">
        <div>
          <p className="font-body text-textPrimary text-sm">{formatDuration(run.duration_s)}</p>
          <p className="text-textSecondary font-body text-xs">{formatPace(run.pace_s_per_km)} /km</p>
        </div>
        <Play size={16} weight="fill" className="text-accent flex-shrink-0" />
      </div>
    </button>
  );
}
