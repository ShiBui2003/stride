// Scrollable list of activity cards for the home feed
import { ActivityCard } from '@/components/feed/ActivityCard';
import { SkeletonLoader } from '@/components/ui/SkeletonLoader';
import type { FeedItem } from '@/types/run.types';

interface ActivityFeedProps {
  items: FeedItem[];
  loading?: boolean;
}

export function ActivityFeed({ items, loading = false }: ActivityFeedProps) {
  if (loading) {
    return (
      <div className="space-y-3">
        <SkeletonLoader className="h-52" count={3} />
      </div>
    );
  }

  if (items.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-16 gap-2">
        <p className="text-textSecondary font-body text-sm">No activity yet.</p>
        <p className="text-textSecondary font-body text-xs opacity-60">
          Start running or follow other runners.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {items.map((item) => (
        <ActivityCard
          key={item.run.id}
          run={item.run}
          user={item.user}
          likesCount={item.likes_count}
        />
      ))}
    </div>
  );
}
