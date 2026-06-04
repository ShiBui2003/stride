// Leaderboard page — city/global/friends rankings with territory and weekly km sorts
'use client';

import React from 'react';
import useSWR from 'swr';
import { Trophy } from '@phosphor-icons/react';
import { LeaderboardList } from '@/components/leaderboard/LeaderboardList';
import { SkeletonLoader } from '@/components/ui/SkeletonLoader';
import { useAuth } from '@/hooks/useAuth';
import { getUserById } from '@/lib/supabase/queries/users';

export default function LeaderboardPage(): React.JSX.Element {
  const { user: authUser, loading: authLoading } = useAuth();

  const { data: profile } = useSWR(
    authUser?.id ? `profile-${authUser.id}` : null,
    () => getUserById(authUser!.id)
  );

  if (authLoading || !profile) {
    return (
      <main className="min-h-screen bg-background px-4 pt-12 pb-24 space-y-6">
        <SkeletonLoader className="h-8 w-40" />
        <SkeletonLoader className="h-12" />
        <SkeletonLoader className="h-16" count={10} />
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-background px-4 pt-12 pb-24 space-y-6">

      {/* Header */}
      <div className="flex items-center gap-3">
        <Trophy size={22} weight="fill" className="text-accent flex-shrink-0" />
        <div>
          <h1 className="text-textPrimary font-heading font-bold text-2xl leading-tight">
            Leaderboard
          </h1>
          <p className="text-textSecondary text-xs font-body">{profile.city}</p>
        </div>
      </div>

      <LeaderboardList city={profile.city} currentUserId={profile.id} />

    </main>
  );
}
