// Fetches territories for a city and subscribes to real-time capture events
'use client';

import { useEffect } from 'react';
import useSWR from 'swr';
import { createClient } from '@/lib/supabase/client';
import { getTerritoriesByCity } from '@/lib/supabase/queries/territories';
import type { TerritoryWithUser } from '@/types/territory.types';

export function useTerritories(city: string): {
  territories: TerritoryWithUser[];
  loading: boolean;
  error: Error | undefined;
} {
  const { data, error, mutate } = useSWR(
    city ? `territories-${city}` : null,
    () => getTerritoriesByCity(city)
  );

  useEffect(() => {
    if (!city) return;
    const supabase = createClient();
    const channel = supabase
      .channel(`territories-${city}`)
      .on('postgres_changes', { event: '*', schema: 'public', table: 'territories' }, () => {
        void mutate();
      })
      .subscribe();

    return () => {
      void supabase.removeChannel(channel);
    };
  }, [city, mutate]);

  return { territories: data ?? [], loading: !data && !error, error };
}
