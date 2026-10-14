import { useState } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { useServerFn } from '@tanstack/react-start';
import { useNavigate, Link } from '@tanstack/react-router';
import { Check, Loader2, LogOut, Plus, RefreshCw, Sparkles, Trash2, UserRound } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { supabase } from '@/integrations/supabase/client';
import { getMatches, deleteAccount, type PersonalityResult } from '@/lib/qoshul/ai.functions';
import { statusLabel } from '@/lib/qoshul/onboarding';
import { TraitBars } from '@/routes/_authenticated/onboarding';

async function myId() { const { data } = await supabase.auth.getUser(); return data.user!.id; }

export function AiPeople() {
  const fetchMatches = useServerFn(getMatches);
  const qc = useQueryClient();
  const [refreshing, setRefreshing] = useState(false);
  const q = useQuery({ queryKey: ['matches'], queryFn: async () => {
    const r = await fetchMatches({ data: {} });
    const ids = r.people.map(p => p.id);
    const { data: cards } = ids.length ? await supabase.rpc('public_profile_cards', { _ids: ids }) : { data: [] };
    const { data: fr } = await supabase.from('friendships').select('*');
    return { ...r, cards: cards ?? [], friendships: fr ?? [], me: await myId() };
  }, retry: false });
  async function refresh() { setRefreshing(true); try { await fetchMatches({ data: { refresh: true } }); await qc.invalidateQueries({ queryKey: ['matches'] }); } finally { setRefreshing(false); } }
  async function request(id: string) { const me = await myId(); await supabase.from('friendships').insert({ requester: me, addressee: id }); qc.invalidateQueries({ queryKey: ['matches'] }); }
  async function accept(fid: string) { await supabase.from('friendships').update({ status: 'accepted' }).eq('id', fid); qc.invalidateQueries({ queryKey: ['matches'] }); }

  if (q.isLoading) return <div className="empty-state"><Loader2 className="animate-spin" />AI sənə uyğun insanları qiymətləndirir...</div>;
  if (q.error) return <div className="empty-state"><p className="form-error">{q.error instanceof Error ? q.error.message : 'Uyğunluqlar alınmadı.'}</p><Button className="mt-3" onClick={() => q.refetch()}>Yenidən cəhd et</Button></div>;
  const d = q.data!;
  return <>
    <div className="ai-box flex items-center justify-between gap-3"><p className="text-sm">AI profilinə, maraqlarına və şəxsiyyətinə görə qiymətləndirdi{d.cached ? ' (son 24 saat)' : ''}.</p><Button size="sm" onClick={refresh} disabled={refreshing}>{refreshing ? <Loader2 className="animate-spin" /> : <RefreshCw />}Yenilə</Button></div>
    {!d.people.length && <div className="empty-state"><UserRound />Hələ sənə uyğun profil tapılmadı.<br />Şəhərində yeni istifadəçilər qoşulduqca burada görünəcək.</div>}
    <div className="people-grid">{d.people.map(m => {
      const c = d.cards.find(x => x.id === m.id); if (!c) return null;
      const f = d.friendships.find(x => (x.requester === d.me && x.addressee === m.id) || (x.addressee === d.me && x.requester === m.id));
      return <article className="event-card person-card" key={m.id} data-testid="match-card">
        {c.avatar_url ? <img src={c.avatar_url} alt={c.first_name} /> : <span className="profile-avatar flex items-center justify-center" style={{ background: 'var(--secondary)', margin: '0 auto' }}><UserRound /></span>}
        <h2>{c.first_name} {c.last_name}</h2>
        <p>{c.city} · {statusLabel(c.status)}{c.university ? ` · ${c.university}` : c.school_name ? ` · ${c.school_name}` : c.work_field ? ` · ${c.work_field}` : ''}</p>
        {c.personality_type && <p className="text-xs">{c.personality_type}</p>}
        <span className="event-category justify-center"><Sparkles size={11} />{m.score}% AI uyğunluq</span>
        <p className="ai-reason">{m.reason}</p>
        {!f ? <Button className="mt-4 w-full text-xs" onClick={() => request(m.id)}><Plus />Dostluq sorğusu</Button>
          : f.status === 'accepted' ? <Button asChild variant="secondary" className="mt-4 w-full text-xs"><Link to="/chats">Dostsunuz — söhbət et</Link></Button>
          : f.addressee === d.me && f.status === 'pending' ? <Button className="mt-4 w-full text-xs" onClick={() => accept(f.id)}><Check />Sorğunu qəbul et</Button>
          : <Button variant="secondary" disabled className="mt-4 w-full text-xs"><Check />{f.status === 'declined' ? 'Rədd edildi' : 'Sorğu göndərildi'}</Button>}
      </article>;
    })}</div>
  </>;
}

export function MyProfilePanel() {
  const navigate = useNavigate();
  const del = useServerFn(deleteAccount);
  const qc = useQueryClient();
  const q = useQuery({ queryKey: ['my-profile'], queryFn: async () => (await supabase.from('profiles').select('*').eq('id', await myId()).single()).data });
  const p = q.data;
  if (!p) return null;
  const vis = p.visibility as { education: boolean; work: boolean };
  const pers = p.personality as PersonalityResult | null;
  async function toggle(k: 'education' | 'work') { await supabase.from('profiles').update({ visibility: { ...vis, [k]: !vis[k] } }).eq('id', p!.id); qc.invalidateQueries({ queryKey: ['my-profile'] }); }
  async function logout() { await supabase.auth.signOut(); navigate({ to: '/auth' }); }
  async function remove() { if (!confirm('Hesabın və bütün məlumatların birdəfəlik silinsin?')) return; await del(); await supabase.auth.signOut(); navigate({ to: '/' }); }
  return <section className="mt-4">
    <div className="profile-top"><h1>{p.first_name} {p.last_name}</h1><p className="subtitle">{p.city} · {statusLabel(p.status)}{p.university ? ` · ${p.university}` : p.school_name ? ` · ${p.school_name}` : p.work_field ? ` · ${p.work_field}` : ''}</p></div>
    <h2 className="font-bold text-sm">Maraqlarım</h2><div className="interest-tags">{p.interests.map(i => <span key={i}>{i}</span>)}</div>
    {pers && <div className="community-banner mt-4" style={{ display: 'block' }}><h3 className="flex items-center gap-2"><Sparkles size={15} />{pers.type}</h3><p>{pers.summary}</p><TraitBars traits={pers.traits} /></div>}
    <div className="flex flex-wrap gap-2 mt-4"><Button asChild variant="outline" size="sm"><Link to="/onboarding">Anketi və testi yenilə</Link></Button></div>
    <h2 className="font-bold text-sm mt-5">Məxfilik</h2>
    <label className="flex items-center gap-3 text-sm mt-2"><input type="checkbox" checked={vis.education} onChange={() => toggle('education')} />Təhsil məlumatımı göstər</label>
    <label className="flex items-center gap-3 text-sm mt-2"><input type="checkbox" checked={vis.work} onChange={() => toggle('work')} />İş məlumatımı göstər</label>
    <p className="form-hint">Doğum tarixin heç vaxt başqalarına göstərilmir.</p>
    <div className="flex flex-wrap gap-2 mt-4 mb-4"><Button variant="outline" size="sm" onClick={logout}><LogOut />Çıxış</Button><Button variant="ghost" size="sm" className="text-destructive" onClick={remove}><Trash2 />Hesabı sil</Button></div>
  </section>;
}
