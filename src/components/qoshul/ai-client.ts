import { supabase } from '@/integrations/supabase/client';
/** Calls the app's AI route and streams text chunks to onDelta. Returns the full text. */
export async function streamAi(body: unknown, onDelta?: (full: string) => void, signal?: AbortSignal) {
  const { data } = await supabase.auth.getSession();
  const res = await fetch('/api/ai', { method: 'POST', headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${data.session?.access_token ?? ''}` }, body: JSON.stringify(body), signal: signal ?? null });
  if (!res.ok || !res.body) {
    let msg = 'AI xidməti hazırda cavab vermir.';
    try { const j = await res.json() as { error?: string }; if (j.error) msg = j.error; } catch { /* ignore */ }
    throw new Error(msg);
  }
  const reader = res.body.getReader(); const dec = new TextDecoder(); let full = '';
  for (;;) { const { done, value } = await reader.read(); if (done) break; full += dec.decode(value, { stream: true }); onDelta?.(full); }
  return full;
}
