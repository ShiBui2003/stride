// Supabase Edge Function — shrinks undefended territories and resets stale streaks
// Schedule every 24 h via Supabase Dashboard or pg_cron (see migration 003)
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const supabase = createClient(
  Deno.env.get('SUPABASE_URL') ?? '',
  Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
);

const JSON_HEADERS = { 'Content-Type': 'application/json' };

Deno.serve(async () => {
  const results: Record<string, string> = {};

  // 1. Shrink territories not defended in the last 48 h by 10 %
  const { error: decayError } = await supabase.rpc('apply_territory_decay');
  if (decayError) {
    console.error('territory decay failed:', decayError.message);
    return new Response(
      JSON.stringify({ error: 'decay failed', detail: decayError.message }),
      { status: 500, headers: JSON_HEADERS }
    );
  }
  results.decay = 'ok';

  // 2. Zero out streaks for users who haven't run in 36 h
  const { error: streakError } = await supabase.rpc('reset_stale_streaks');
  if (streakError) {
    console.error('streak reset failed:', streakError.message);
    return new Response(
      JSON.stringify({ error: 'streak reset failed', detail: streakError.message }),
      { status: 500, headers: JSON_HEADERS }
    );
  }
  results.streak_reset = 'ok';

  return new Response(JSON.stringify({ ok: true, results }), {
    status: 200,
    headers: JSON_HEADERS,
  });
});
