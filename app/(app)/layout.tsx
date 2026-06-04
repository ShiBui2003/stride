// App group layout — wraps all protected pages with the persistent bottom nav
import type { ReactNode } from 'react';
import { BottomNav } from '@/components/ui/BottomNav';

export default function AppLayout({ children }: { children: ReactNode }) {
  return (
    <div className="min-h-screen bg-background">
      {children}
      <BottomNav />
    </div>
  );
}
