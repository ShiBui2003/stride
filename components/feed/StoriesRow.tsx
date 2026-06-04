// Horizontal stories-style row of recently active runners
'use client';

import Link from 'next/link';
import type { User } from '@/types/user.types';

type StoryUser = Pick<User, 'id' | 'username' | 'avatar_url' | 'territory_color'>;

interface StoriesRowProps {
  users: StoryUser[];
  currentUser: StoryUser;
}

function StoryBubble({ user, label, href }: { user: StoryUser; label: string; href: string }) {
  return (
    <Link
      href={href}
      className="flex flex-col items-center gap-1.5 flex-shrink-0 active:opacity-70 transition-opacity"
    >
      <div
        className="w-14 h-14 rounded-full border-2 overflow-hidden bg-background"
        style={{ borderColor: user.territory_color }}
      >
        {user.avatar_url ? (
          <img src={user.avatar_url} alt={user.username} className="w-full h-full object-cover" />
        ) : (
          <div
            className="w-full h-full flex items-center justify-center font-heading font-bold text-background text-sm"
            style={{ backgroundColor: user.territory_color }}
          >
            {user.username.slice(0, 2).toUpperCase()}
          </div>
        )}
      </div>
      <span className="text-[10px] font-body text-textSecondary w-14 text-center truncate">
        {label}
      </span>
    </Link>
  );
}

export function StoriesRow({ users, currentUser }: StoriesRowProps) {
  return (
    <div className="overflow-x-auto scrollbar-none -mx-4 px-4">
      <div className="flex gap-4 pb-2 min-w-0">
        <StoryBubble user={currentUser} label="You" href="/map" />
        {users.map((user) => (
          <StoryBubble
            key={user.id}
            user={user}
            label={user.username}
            href={`/profile/${user.username}`}
          />
        ))}
        {users.length === 0 && (
          <p className="text-textSecondary text-xs font-body self-center whitespace-nowrap opacity-60">
            Follow runners to see their activity here
          </p>
        )}
      </div>
    </div>
  );
}
