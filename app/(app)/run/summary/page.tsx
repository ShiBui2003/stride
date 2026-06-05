// Run summary page — shows post-run stats fetched by runId, with skeleton loading state
'use client';

import React, { Suspense } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import useSWR from 'swr';
import { MapTrifold, House } from '@phosphor-icons/react';
import { RunSummaryCard } from '@/components/run/RunSummaryCard';
import { SkeletonLoader } from '@/components/ui/SkeletonLoader';
import { getRunById } from '@/lib/supabase/queries/runs';

function fetcher([, id]: [string, string]): ReturnType<typeof getRunById> {
  return getRunById(id);
}

function RunSummaryContent(): React.JSX.Element {
  const router = useRouter();
  const params = useSearchParams();
  const runId = params.get('runId') ?? '';
  const capturedAreaM2 = Number(params.get('area') ?? 0);

  const { data: run, isLoading, error } = useSWR(
    runId ? ['run-summary', runId] : null,
    fetcher,
    { revalidateOnFocus: false }
  );

  return (
    <main className="min-h-screen bg-background px-4 pt-10 pb-28">
      <div className="max-w-lg mx-auto space-y-5">

        {isLoading && (
          <>
            <SkeletonLoader className="h-12 w-56" />
            <SkeletonLoader className="h-52 w-full" />
            <SkeletonLoader className="h-36 w-full" />
          </>
        )}

        {error && (
          <p className="text-danger text-sm font-body text-center pt-20">
            Could not load run data.
          </p>
        )}

        {!isLoading && !error && !run && runId && (
          <p className="text-textSecondary text-sm font-body text-center pt-20">
            Run not found.
          </p>
        )}

        {!isLoading && !runId && (
          <p className="text-textSecondary text-sm font-body text-center pt-20">
            No run ID provided.
          </p>
        )}

        {run && (
          <RunSummaryCard run={run} capturedAreaM2={capturedAreaM2} />
        )}

        {/* Navigation buttons — always visible so the user can exit */}
        {!isLoading && (
          <div className="flex gap-3 pt-2">
            <button
              onClick={() => router.push('/map')}
              className="flex-1 flex items-center justify-center gap-2 bg-surface text-textPrimary font-heading font-bold text-sm py-3.5 rounded-xl active:scale-95 transition-transform"
            >
              <MapTrifold size={18} />
              View Map
            </button>
            <button
              onClick={() => router.push('/home')}
              className="flex-1 flex items-center justify-center gap-2 bg-accent text-background font-heading font-bold text-sm py-3.5 rounded-xl active:scale-95 transition-transform"
            >
              <House size={18} />
              Done
            </button>
          </div>
        )}

      </div>
    </main>
  );
}

// useSearchParams requires a Suspense boundary for static prerendering (Next.js 14)
export default function RunSummaryPage(): React.JSX.Element {
  return (
    <Suspense
      fallback={
        <main className="min-h-screen bg-background px-4 pt-10 pb-28">
          <div className="max-w-lg mx-auto space-y-5">
            <SkeletonLoader className="h-12 w-56" />
            <SkeletonLoader className="h-52 w-full" />
            <SkeletonLoader className="h-36 w-full" />
          </div>
        </main>
      }
    >
      <RunSummaryContent />
    </Suspense>
  );
}
