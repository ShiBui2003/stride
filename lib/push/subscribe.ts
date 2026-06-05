// Browser-side Web Push helpers — service worker registration, subscribe, and key extraction
import type { PushSubscriptionKeys } from '@/types/push.types';

// True only where the Push API and service workers are actually available
export function isPushSupported(): boolean {
  return (
    typeof window !== 'undefined' &&
    'serviceWorker' in navigator &&
    'PushManager' in window &&
    'Notification' in window
  );
}

// VAPID public key must be base64url → ArrayBuffer for PushManager.subscribe
function urlBase64ToBuffer(base64String: string): ArrayBuffer {
  const padding = '='.repeat((4 - (base64String.length % 4)) % 4);
  const base64 = (base64String + padding).replace(/-/g, '+').replace(/_/g, '/');
  const raw = window.atob(base64);
  const output = new Uint8Array(raw.length);
  for (let i = 0; i < raw.length; i++) output[i] = raw.charCodeAt(i);
  return output.buffer;
}

// Pulls the endpoint + encryption keys out of a browser PushSubscription
function extractKeys(subscription: PushSubscription): PushSubscriptionKeys {
  const json = subscription.toJSON();
  const keys = json.keys ?? {};
  return {
    endpoint: subscription.endpoint,
    p256dh: keys.p256dh ?? '',
    auth: keys.auth ?? '',
  };
}

// next-pwa registers /sw.js; wait for it so PushManager has a ready registration
async function getRegistration(): Promise<ServiceWorkerRegistration> {
  const existing = await navigator.serviceWorker.getRegistration();
  if (existing) return existing;
  return navigator.serviceWorker.register('/sw.js');
}

// Prompts for permission, subscribes via the VAPID key, returns keys to persist (or null if declined)
export async function subscribeToPush(vapidPublicKey: string): Promise<PushSubscriptionKeys | null> {
  if (!isPushSupported()) return null;

  const permission = await Notification.requestPermission();
  if (permission !== 'granted') return null;

  const registration = await getRegistration();
  const existing = await registration.pushManager.getSubscription();
  if (existing) return extractKeys(existing);

  const subscription = await registration.pushManager.subscribe({
    userVisibleOnly: true,
    applicationServerKey: urlBase64ToBuffer(vapidPublicKey),
  });
  return extractKeys(subscription);
}

// Unsubscribes the active push subscription; returns the endpoint removed (or null if none)
export async function unsubscribeFromPush(): Promise<string | null> {
  if (!isPushSupported()) return null;
  const registration = await navigator.serviceWorker.getRegistration();
  const subscription = await registration?.pushManager.getSubscription();
  if (!subscription) return null;

  const endpoint = subscription.endpoint;
  await subscription.unsubscribe();
  return endpoint;
}
