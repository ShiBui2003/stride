// Web Push subscription and notification payload types

export interface PushSubscriptionRecord {
  id: string;
  user_id: string;
  endpoint: string;
  p256dh: string;
  auth: string;
  created_at: string;
}

// The keys extracted from a browser PushSubscription, ready to persist
export interface PushSubscriptionKeys {
  endpoint: string;
  p256dh: string;
  auth: string;
}

// Reasons the app sends a push — drives title/body on the Edge Function side
export type PushReason = 'territory-stolen' | 'rival-ran' | 'streak-at-risk' | 'badge-unlocked';

export interface PushPayload {
  user_id: string;
  reason: PushReason;
  title: string;
  body: string;
}
