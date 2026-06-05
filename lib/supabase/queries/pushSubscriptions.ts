// Supabase queries for storing and removing a user's Web Push subscriptions
import { createClient } from '@/lib/supabase/client';
import type { PushSubscriptionKeys } from '@/types/push.types';

// Upserts the subscription by endpoint so re-subscribing on a device refreshes its keys
export async function savePushSubscription(
  userId: string,
  keys: PushSubscriptionKeys
): Promise<void> {
  const supabase = createClient();
  const { error } = await supabase
    .from('push_subscriptions')
    .upsert(
      { user_id: userId, endpoint: keys.endpoint, p256dh: keys.p256dh, auth: keys.auth },
      { onConflict: 'endpoint' }
    );
  if (error) throw error;
}

export async function deletePushSubscription(endpoint: string): Promise<void> {
  const supabase = createClient();
  const { error } = await supabase
    .from('push_subscriptions')
    .delete()
    .eq('endpoint', endpoint);
  if (error) throw error;
}
