// Public profile page for any user by username (Phase 3)
interface ProfilePageProps {
  params: { username: string };
}

export default function ProfilePage({ params }: ProfilePageProps) {
  return (
    <main className="min-h-screen bg-background px-4 pt-12 pb-24">
      <p className="text-textSecondary font-body text-sm">
        Profile: {params.username} — coming in Phase 3
      </p>
    </main>
  );
}
