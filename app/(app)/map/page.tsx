// Map page — full-screen competitive territory map with live polygon overlays
'use client';

import React, { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import useSWR from 'swr';
import { Play, Crosshair } from '@phosphor-icons/react';
import { MapContainer } from '@/components/map/MapContainer';
import { TerritoryPolygon } from '@/components/map/TerritoryPolygon';
import { RivalRunBanner } from '@/components/map/RivalRunBanner';
import { UserLocationDot } from '@/components/map/UserLocationDot';
import { useAuth } from '@/hooks/useAuth';
import { useTerritories } from '@/hooks/useTerritories';
import { createClient } from '@/lib/supabase/client';
import { getUserById } from '@/lib/supabase/queries/users';
import { centerMapOnUser } from '@/lib/maps/mapConfig';
import type { User } from '@/types/user.types';

interface RivalRun {
  username: string;
  distance_m: number;
  pace_s_per_km: number;
}

export default function MapPage(): React.JSX.Element {
  const [map, setMap] = useState<google.maps.Map | null>(null);
  const [rivalRun, setRivalRun] = useState<RivalRun | null>(null);
  const [locating, setLocating] = useState(false);
  const [locationError, setLocationError] = useState<string | null>(null);
  const [userPosition, setUserPosition] = useState<google.maps.LatLngLiteral | null>(null);
  const { user } = useAuth();

  async function handleLocate(): Promise<void> {
    if (!map) return;
    setLocating(true);
    setLocationError(null);
    const { error, position } = await centerMapOnUser(map);
    if (error) setLocationError(error);
    if (position) setUserPosition(position);
    setLocating(false);
  }

  const { data: profile } = useSWR(
    user?.id ? `profile-${user.id}` : null,
    (): Promise<User | null> => getUserById(user!.id)
  );

  const { territories } = useTerritories(profile?.city ?? '');

  // Derive rival username from already-loaded territories (no extra query)
  const rivalUsernameRef = useRef<string>('Your rival');
  const foundRivalName = territories.find(
    (t) => t.user_id === profile?.rival_id
  )?.user.username;
  if (foundRivalName) rivalUsernameRef.current = foundRivalName;

  // Subscribe to new runs from the rival — triggers in-app banner + readies push (Phase 4)
  useEffect(() => {
    if (!profile?.rival_id) return;

    const supabase = createClient();
    const channel = supabase
      .channel(`rival-run-${profile.rival_id}`)
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'runs',
          filter: `user_id=eq.${profile.rival_id}`,
        },
        (payload) => {
          const run = payload.new as { distance_m: number; pace_s_per_km: number };
          setRivalRun({
            username: rivalUsernameRef.current,
            distance_m: run.distance_m,
            pace_s_per_km: run.pace_s_per_km,
          });
        }
      )
      .subscribe();

    return () => {
      void supabase.removeChannel(channel);
    };
  }, [profile?.rival_id]);

  return (
    <main className="relative h-screen bg-background overflow-hidden">
      <MapContainer
        onMapReady={setMap}
        onLocationResolved={setUserPosition}
        className="absolute inset-0"
      />

      {/* Neon user location dot */}
      {map && userPosition && (
        <UserLocationDot map={map} position={userPosition} />
      )}

      {/* Territory overlays — rendered imperatively onto the map instance */}
      {map &&
        territories.map((territory) => (
          <TerritoryPolygon
            key={territory.id}
            map={map}
            territory={territory}
            isOwned={territory.user_id === user?.id}
            isRival={!!profile?.rival_id && territory.user_id === profile.rival_id}
          />
        ))}

      {/* Rival run in-app notification banner */}
      {rivalRun && (
        <RivalRunBanner
          rivalUsername={rivalRun.username}
          distanceM={rivalRun.distance_m}
          paceSPerKm={rivalRun.pace_s_per_km}
          onDismiss={() => setRivalRun(null)}
        />
      )}

      {/* Locate me button */}
      <button
        onClick={() => { void handleLocate(); }}
        disabled={locating || !map}
        className="absolute bottom-36 right-4 z-40 w-12 h-12 rounded-full bg-surface/95 backdrop-blur-sm border border-white/10 flex items-center justify-center shadow-lg active:scale-95 transition-transform disabled:opacity-40"
        aria-label="Center on my location"
      >
        {locating ? (
          <div className="w-5 h-5 border-2 border-accent border-t-transparent rounded-full animate-spin" />
        ) : (
          <Crosshair size={22} className="text-accent" weight="bold" />
        )}
      </button>

      {/* Location error toast */}
      {locationError && (
        <div className="absolute bottom-52 right-4 z-40 bg-danger text-white text-xs font-body px-3 py-2 rounded-xl max-w-[220px] text-right shadow-lg">
          {locationError}
        </div>
      )}

      {/* FAB — launches the active run session, floats above the BottomNav */}
      <Link
        href="/run/active"
        className="absolute bottom-20 right-4 z-40 flex items-center gap-2 bg-accent text-background font-heading font-bold text-sm px-5 py-3.5 rounded-full shadow-lg active:scale-95 transition-transform"
      >
        <Play size={18} weight="fill" />
        Start Run
      </Link>
    </main>
  );
}
