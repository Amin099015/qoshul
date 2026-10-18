import { useEffect, useState } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { Loader2, Send } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
export function EventChat({ eventId }: { eventId: string }) {
  const qc = useQueryClient();
  const [text, setText] = useState('');
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  const queryKey = ['event-messages', eventId];
  const q = useQuery({ queryKey, queryFn: async () => {
    const { data, error } = await supabase.from('messages').select('id,user_id,sender_name,body,created_at').eq('event_id', eventId).order('created_at', { ascending: true }).limit(200);
    if (error) throw new Error('Mesajlar yüklənmədi.');
    return data;
  }, refetchInterval: 5000 });
  useEffect(() => {
    const channel = supabase.channel(`event-chat-${eventId}`).on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'messages', filter: `event_id=eq.${eventId}` }, () => { void qc.invalidateQueries({ queryKey: ['event-messages', eventId] }); }).subscribe();
    return () => { void supabase.removeChannel(channel); };
  }, [eventId, qc]);
  async function send() {
    if (!text.trim() || busy) return;
    setBusy(true); setError('');
    try {
      const { data: auth } = await supabase.auth.getUser();
      if (!auth.user) throw new Error('Mesaj göndərmək üçün daxil ol.');
      const { data: profile } = await supabase.from('profiles').select('first_name,last_name').eq('id', auth.user.id).maybeSingle();
      const { error } = await supabase.from('messages').insert({ event_id: eventId, user_id: auth.user.id, sender_name: [profile?.first_name, profile?.last_name].filter(Boolean).join(' '), body: text.trim() });
      if (error) throw new Error('Mesaj göndərilmədi. Yenidən cəhd et.');
      setText(''); await qc.invalidateQueries({ queryKey });
    } catch (e) { setError(e instanceof Error ? e.message : 'Mesaj göndərilmədi.'); } finally { setBusy(false); }
  }
  return <div className="chat-panel">
    {q.isLoading && <Loader2 className="animate-spin" />}
    {q.error && <p className="form-error" role="alert">{q.error.message}</p>}
    {!q.isLoading && !q.data?.length && <p className="form-hint">Hələ mesaj yoxdur.</p>}
    {q.data?.map(m => <div className="chat-message whitespace-pre-line break-words" key={m.id}><small>{m.sender_name || 'İştirakçı'}</small>{m.body}</div>)}
    {error && <p className="form-error" role="alert">{error}</p>}
    <form className="chat-compose" onSubmit={e => { e.preventDefault(); void send(); }}><input className="form-input" aria-label="Mesaj" placeholder="Bir mesaj yaz..." value={text} onChange={e => setText(e.target.value)} maxLength={1000} /><Button disabled={busy || !text.trim()} type="submit" size="icon" aria-label="Mesaj göndər">{busy ? <Loader2 className="animate-spin" /> : <Send />}</Button></form>
  </div>;
}