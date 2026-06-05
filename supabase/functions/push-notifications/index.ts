// Supabase Edge Function — sends Web Push notifications for territory events
// Triggers: territory stolen, rival ran today, streak at risk, badge unlocked.
// Secrets required (set via `supabase secrets set`):
//   VAPID_PUBLIC_KEY, VAPID_PRIVATE_KEY, VAPID_SUBJECT (mailto: or https: contact)
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';
import webpush from 'https://esm.sh/web-push@3.6.7';

interface PushPayload {
  user_id: string;
  reason: 'territory-stolen' | 'rival-ran' | 'streak-at-risk' | 'badge-unlocked';
  title: string;
  body: string;
}

interface SubscriptionRow {
  endpoint: string;
  p256dh: string;
  auth: string;
}

const supabase = createClient(
  Deno.env.get('SUPABASE_URL') ?? '',
  Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
);

const JSON_HEADERS = { 'Content-Type': 'application/json' };

webpush.setVapidDetails(
  Deno.env.get('VAPID_SUBJECT') ?? 'mailto:hello@stride.app',
  Deno.env.get('VAPID_PUBLIC_KEY') ?? '',
  Deno.env.get('VAPID_PRIVATE_KEY') ?? ''
);

Deno.serve(async (req: Request) => {
  let payload: PushPayload;
  try {
    payload = await req.json();
  } catch {
    return new Response(JSON.stringify({ error: 'Invalid JSON body' }), {
      status: 400,
      headers: JSON_HEADERS,
    });
  }

  // Every device the user has registered receives the push
  const { data: subscriptions, error } = await supabase
    .from('push_subscriptions')
    .select('endpoint, p256dh, auth')
    .eq('user_id', payload.user_id);

  if (error) {
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: JSON_HEADERS,
    });
  }
  if (!subscriptions || subscriptions.length === 0) {
    return new Response(JSON.stringify({ error: 'No subscriptions found' }), {
      status: 404,
      headers: JSON_HEADERS,
    });
  }

  const notification = JSON.stringify({
    title: payload.title,
    body: payload.body,
    url: '/notifications',
  });

  const results = await Promise.allSettled(
    (subscriptions as SubscriptionRow[]).map(async (sub) => {
      try {
        await webpush.sendNotification(
          { endpoint: sub.endpoint, keys: { p256dh: sub.p256dh, auth: sub.auth } },
          notification
        );
      } catch (err) {
        // 404/410 mean the subscription is dead — prune it so we stop retrying
        const statusCode = (err as { statusCode?: number }).statusCode;
        if (statusCode === 404 || statusCode === 410) {
          await supabase.from('push_subscriptions').delete().eq('endpoint', sub.endpoint);
        }
        throw err;
      }
    })
  );

  const sent = results.filter((r) => r.status === 'fulfilled').length;
  return new Response(JSON.stringify({ ok: true, sent, total: subscriptions.length }), {
    status: 200,
    headers: JSON_HEADERS,
  });
});
