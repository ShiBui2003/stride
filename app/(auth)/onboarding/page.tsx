// Onboarding — collects username, avatar, city, and territory colour for new users
'use client';

import { useState, useEffect, useRef, type FormEvent } from 'react';
import { useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';
import { createUser, getUserById } from '@/lib/supabase/queries/users';
import { useAuth } from '@/hooks/useAuth';
import { Button } from '@/components/ui/Button';
import { Avatar } from '@/components/ui/Avatar';
import { ColorPicker } from '@/components/ui/ColorPicker';

export default function OnboardingPage() {
  const { user, loading: authLoading } = useAuth();
  const [username, setUsername] = useState('');
  const [city, setCity] = useState('');
  const [color, setColor] = useState('#C8FF00');
  const [avatarUrl, setAvatarUrl] = useState<string | null>(null);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const router = useRouter();

  // If the user already has a profile row, mark metadata complete and skip to home.
  // This heals accounts created before the onboarding_complete metadata was introduced.
  useEffect(() => {
    if (authLoading || !user) return;
    const supabase = createClient();
    getUserById(user.id).then(async (profile) => {
      if (!profile?.username) return;
      // Ensure metadata flag is set so middleware lets them through next time
      await supabase.auth.updateUser({ data: { onboarding_complete: true } });
      router.replace('/home');
    });
  }, [user, authLoading, router]);

  async function handleAvatarChange(file: File) {
    if (!user) return;
    setUploading(true);
    const supabase = createClient();
    const path = `${user.id}/avatar`;
    const { error: uploadError } = await supabase.storage
      .from('avatars')
      .upload(path, file, { upsert: true, contentType: file.type });

    if (!uploadError) {
      const { data } = supabase.storage.from('avatars').getPublicUrl(path);
      setAvatarUrl(data.publicUrl);
    }
    setUploading(false);
  }

  async function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (!user) return;
    setError(null);
    setLoading(true);
    try {
      const supabase = createClient();
      await createUser(user.id, {
        username: username.trim().toLowerCase(),
        email: user.email ?? '',
        avatar_url: avatarUrl,
        city: city.trim(),
        territory_color: color,
      });
      // Mark onboarding complete in auth metadata so middleware gates work
      await supabase.auth.updateUser({ data: { onboarding_complete: true } });
      router.push('/home');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to create profile');
    } finally {
      setLoading(false);
    }
  }

  if (authLoading || !user) {
    return <main className="min-h-screen bg-background" />;
  }

  return (
    <main className="min-h-screen bg-background flex flex-col px-6 pt-14 pb-10">
      <div className="mb-8">
        <h1 className="font-heading text-4xl font-black text-textPrimary leading-none">Set up your<br />profile</h1>
        <p className="text-textSecondary text-sm mt-2 font-body">This is how rivals will see you.</p>
      </div>

      <form onSubmit={handleSubmit} className="flex-1 flex flex-col gap-6 max-w-sm">
        {/* Avatar */}
        <div className="flex items-center gap-4">
          <button type="button" onClick={() => fileInputRef.current?.click()} className="relative flex-shrink-0">
            <Avatar src={avatarUrl} username={username || 'ST'} color={color} size="lg" />
            <span className="absolute -bottom-1 -right-1 bg-accent text-background text-[10px] font-heading font-bold rounded-full w-5 h-5 flex items-center justify-center">+</span>
          </button>
          <div className="min-w-0">
            <p className="text-textPrimary text-sm font-body font-medium">{uploading ? 'Uploading…' : 'Add a photo'}</p>
            <p className="text-textSecondary text-xs font-body">Optional — tap to upload</p>
          </div>
          <input ref={fileInputRef} type="file" accept="image/*" className="hidden"
            onChange={(e) => { const f = e.target.files?.[0]; if (f) handleAvatarChange(f); }} />
        </div>

        {/* Username */}
        <div className="space-y-1.5">
          <label className="text-[10px] font-body text-textSecondary uppercase tracking-widest">Username</label>
          <input type="text" placeholder="yourname" value={username}
            onChange={(e) => setUsername(e.target.value)}
            required minLength={3} maxLength={20} pattern="[a-zA-Z0-9_]+"
            className="w-full bg-surface border border-white/10 rounded-xl px-4 py-3 text-textPrimary font-body placeholder:text-textSecondary focus:outline-none focus:border-accent transition-colors" />
        </div>

        {/* City */}
        <div className="space-y-1.5">
          <label className="text-[10px] font-body text-textSecondary uppercase tracking-widest">City</label>
          <input type="text" placeholder="e.g. New Delhi" value={city}
            onChange={(e) => setCity(e.target.value)} required
            className="w-full bg-surface border border-white/10 rounded-xl px-4 py-3 text-textPrimary font-body placeholder:text-textSecondary focus:outline-none focus:border-accent transition-colors" />
        </div>

        {/* Territory colour */}
        <div className="space-y-2">
          <label className="text-[10px] font-body text-textSecondary uppercase tracking-widest">Territory Colour</label>
          <ColorPicker value={color} onChange={setColor} />
          <p className="text-xs text-textSecondary font-body">This colour fills your territory on the map.</p>
        </div>

        {error && <p className="text-danger text-sm font-body">{error}</p>}

        <Button type="submit" variant="accent" size="lg" loading={loading} className="w-full mt-auto">
          Start Running →
        </Button>
      </form>
    </main>
  );
}
