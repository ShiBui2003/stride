// App group layout — wraps all protected pages with the persistent bottom nav and app loader
import type { ReactNode } from 'react';
import { BottomNav } from '@/components/ui/BottomNav';
import { AppLoader } from '@/components/animations/AppLoader';

export default function AppLayout({ children }: { children: ReactNode }) {
  return (
    <div className="min-h-screen bg-background">
      <AppLoader>{children}</AppLoader>
      <BottomNav />
    </div>
  );
}
