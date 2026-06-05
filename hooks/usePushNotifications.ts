// Manages the user's push notification opt-in: permission state, subscribe, and unsubscribe
'use client';

import { useState, useEffect, useCallback } from 'react';
import {
  isPushSupported,
  subscribeToPush,
  unsubscribeFromPush,
} from '@/lib/push/subscribe';
import {
  savePushSubscription,
  deletePushSubscription,
} from '@/lib/supabase/queries/pushSubscriptions';

interface UsePushNotificationsReturn {
  supported: boolean;
  enabled: boolean;
  loading: boolean;
  error: string | null;
  enable: () => Promise<void>;
  disable: () => Promise<void>;
}

const VAPID_PUBLIC_KEY = process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY ?? '';

export function usePushNotifications(userId: string | undefined): UsePushNotificationsReturn {
  const [supported, setSupported] = useState(false);
  const [enabled, setEnabled] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Reflect the browser's current subscription state on mount
  useEffect(() => {
    if (!isPushSupported()) return;
    setSupported(true);
    void navigator.serviceWorker.getRegistration().then(async (registration) => {
      const subscription = await registration?.pushManager.getSubscription();
      setEnabled(Boolean(subscription));
    });
  }, []);

  const enable = useCallback(async (): Promise<void> => {
    if (!userId) return;
    if (!VAPID_PUBLIC_KEY) {
      setError('Push is not configured.');
      return;
    }
    setLoading(true);
    setError(null);
    try {
      const keys = await subscribeToPush(VAPID_PUBLIC_KEY);
      if (!keys) {
        setError('Notification permission was denied.');
        return;
      }
      await savePushSubscription(userId, keys);
      setEnabled(true);
    } catch {
      setError('Could not enable notifications. Try again.');
    } finally {
      setLoading(false);
    }
  }, [userId]);

  const disable = useCallback(async (): Promise<void> => {
    setLoading(true);
    setError(null);
    try {
      const endpoint = await unsubscribeFromPush();
      if (endpoint) await deletePushSubscription(endpoint);
      setEnabled(false);
    } catch {
      setError('Could not disable notifications. Try again.');
    } finally {
      setLoading(false);
    }
  }, []);

  return { supported, enabled, loading, error, enable, disable };
}
