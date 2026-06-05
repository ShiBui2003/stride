// Notifications page — rival activity and streak risk derived from live run data
'use client';

import React from 'react';
import useSWR from 'swr';
import { Lightning, Flame, CheckCircle } from '@phosphor-icons/react';
import { SkeletonLoader } from '@/components/ui/SkeletonLoader';
import { PushOptIn } from '@/components/ui/PushOptIn';
import { useAuth } from '@/hooks/useAuth';
import { getUserById } from '@/lib/supabase/queries/users';
import { getRunsByUserId } from '@/lib/supabase/queries/runs';
import type { User } from '@/types/user.types';
import type { Run } from '@/types/run.types';

const DAY_MS = 24 * 60 * 60 * 1000;

interface NotifData {
  rival: User | null;
  rivalLastRun: Run | null;
  ownLastRun: Run | null;
  streakCount: number;
}

// Fetches all data needed to derive notifications — orchestrates existing query functions
async function fetchNotifData(userId: string): Promise<NotifData> {
  const user = await getUserById(userId);
  if (!user) return { rival: null, rivalLastRun: null, ownLastRun: null, streakCount: 0 };

  const [ownRuns, rivalRuns, rival] = await Promise.all([
    getRunsByUserId(userId),
    user.rival_id ? getRunsByUserId(user.rival_id) : Promise.resolve([]),
    user.rival_id ? getUserById(user.rival_id) : Promise.resolve(null),
  ]);

  return {
    rival,
    rivalLastRun: rivalRuns[0] ?? null,
    ownLastRun: ownRuns[0] ?? null,
    streakCount: user.streak_count,
  };
}

interface Notification {
  id: string;
  icon: React.ReactNode;
  title: string;
  body: string;
  danger?: boolean;
}

function buildNotifications(data: NotifData): Notification[] {
  const now = Date.now();
  const notifs: Notification[] = [];

  if (data.rival && data.rivalLastRun) {
    const msSince = now - new Date(data.rivalLastRun.started_at).getTime();
    if (msSince < DAY_MS) {
      notifs.push({
        id: 'rival-ran',
        icon: <Lightning size={18} weight="fill" className="text-danger" />,
        title: `${data.rival.username} ran today`,
        body: "Your rival is active — don't let them pull ahead.",
        danger: true,
      });
    }
  }

  if (data.ownLastRun && data.streakCount > 0) {
    const hoursSince = (now - new Date(data.ownLastRun.started_at).getTime()) / (60 * 60 * 1000);
    if (hoursSince > 20) {
      notifs.push({
        id: 'streak-risk',
        icon: <Flame size={18} weight="fill" className="text-danger" />,
        title: `${data.streakCount}-day streak at risk`,
        body: 'Run today to keep your streak alive.',
        danger: true,
      });
    }
  }

  return notifs;
}

export default function NotificationsPage(): React.JSX.Element {
  const { user: authUser, loading: authLoading } = useAuth();

  const { data, isLoading } = useSWR(
    authUser?.id ? `notifs-${authUser.id}` : null,
    () => fetchNotifData(authUser!.id),
    { revalidateOnMount: true }
  );

  const notifications = data ? buildNotifications(data) : [];

  if (authLoading || isLoading) {
    return (
      <main className="min-h-screen bg-background px-4 pt-12 pb-24 space-y-4">
        <SkeletonLoader className="h-8 w-40" />
        <SkeletonLoader className="h-16" count={3} />
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-background px-4 pt-12 pb-24">
      <h1 className="font-heading font-bold text-textPrimary text-2xl mb-6">Notifications</h1>

      <PushOptIn userId={authUser?.id} />

      {notifications.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20 gap-3">
          <CheckCircle size={40} className="text-textSecondary opacity-40" />
          <p className="text-textSecondary font-body text-sm">You&apos;re all caught up</p>
        </div>
      ) : (
        <div className="space-y-3">
          {notifications.map((n) => (
            <NotifCard key={n.id} notif={n} />
          ))}
        </div>
      )}
    </main>
  );
}

function NotifCard({ notif }: { notif: Notification }): React.JSX.Element {
  return (
    <div className={`bg-surface rounded-2xl px-4 py-3.5 flex items-start gap-3 ${
      notif.danger ? 'border border-danger/20' : ''
    }`}>
      <div className="mt-0.5 flex-shrink-0">{notif.icon}</div>
      <div className="min-w-0">
        <p className="font-heading font-bold text-textPrimary text-sm">{notif.title}</p>
        <p className="text-textSecondary font-body text-xs mt-0.5">{notif.body}</p>
      </div>
    </div>
  );
}
