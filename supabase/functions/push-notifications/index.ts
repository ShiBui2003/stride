// Supabase Edge Function — sends Web Push notifications for territory events
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

interface PushPayload {
  user_id: string;
  title: string;
  body: string;
}

const supabase = createClient(
  Deno.env.get('SUPABASE_URL') ?? '',
  Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
);

Deno.serve(async (req: Request) => {
  const payload: PushPayload = await req.json();

  const { data: subscription, error } = await supabase
    .from('push_subscriptions')
    .select('*')
    .eq('user_id', payload.user_id)
    .single();

  if (error || !subscription) {
    return new Response(JSON.stringify({ error: 'No subscription found' }), { status: 404 });
  }

  // Push delivery logic added in Phase 4
  return new Response(JSON.stringify({ ok: true, subscription }), { status: 200 });
});
