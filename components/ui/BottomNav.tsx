// Mobile bottom navigation — always visible in the (app) layout
'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { House, MapTrifold, Trophy, User } from '@phosphor-icons/react';

const NAV_ITEMS = [
  { href: '/home', icon: House, label: 'Home' },
  { href: '/map', icon: MapTrifold, label: 'Map' },
  { href: '/leaderboard', icon: Trophy, label: 'Ranks' },
  { href: '/profile', icon: User, label: 'Profile' },
] as const;

export function BottomNav() {
  const pathname = usePathname();

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 bg-surface/95 backdrop-blur-sm border-t border-white/5 pb-safe">
      <div className="flex items-center justify-around h-16 max-w-lg mx-auto px-2">
        {NAV_ITEMS.map(({ href, icon: Icon, label }) => {
          const active = pathname.startsWith(href);
          return (
            <Link
              key={href}
              href={href}
              className={`flex flex-col items-center gap-1 px-4 py-2 transition-colors ${
                active ? 'text-accent' : 'text-textSecondary hover:text-textPrimary'
              }`}
            >
              <Icon size={22} weight={active ? 'fill' : 'regular'} />
              <span className="text-[10px] font-body tracking-wide">{label}</span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
