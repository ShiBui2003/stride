// Offline fallback — shown by the service worker when there is no network
export default function OfflinePage() {
  return (
    <main className="min-h-screen bg-background flex flex-col items-center justify-center px-6 text-center">
      <h1 className="font-heading text-5xl font-black text-accent mb-4">STRIDE</h1>
      <p className="font-heading text-xl font-bold text-textPrimary mb-2">You&apos;re offline</p>
      <p className="text-textSecondary font-body text-sm max-w-xs">
        Connect to the internet to see the live territory map and your run history.
      </p>
    </main>
  );
}
