// /profile redirect — resolves the logged-in user's username and forwards to their profile
'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import useSWR from 'swr';
import { useAuth } from '@/hooks/useAuth';
import { getUserById } from '@/lib/supabase/queries/users';

export default function ProfileRedirectPage() {
  const router = useRouter();
  const { user, loading: authLoading } = useAuth();

  const { data: profile } = useSWR(
    user?.id ? `profile-${user.id}` : null,
    () => getUserById(user!.id)
  );

  // Side-effect only — SWR handles the fetch, this just triggers the redirect
  useEffect(() => {
    if (!profile?.username) return;
    router.replace(`/profile/${profile.username}`);
  }, [profile, router]);

  if (authLoading || !user) {
    return <main className="min-h-screen bg-background" />;
  }

  return <main className="min-h-screen bg-background" />;
}
