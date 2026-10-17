import { createFileRoute, Link } from '@tanstack/react-router';
import { useState } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { useServerFn } from '@tanstack/react-start';
import { CalendarDays, Check, Loader2, Star, Store, Users, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Shell } from '@/components/qoshul/shell';
import { answerReservation, myPartner } from '@/lib/qoshul/partners.functions';

export const Route = createFileRoute('/_authenticated/partner')({
  head: () => ({ meta: [{ title: 'Tərəfdaş paneli — Qoshul.az' }, { name: 'description', content: 'Rezervasiyalar, tədbirlər və müştəri statistikası.' }, { property: 'og:title', content: 'Tərəfdaş paneli — Qoshul.az' }, { property: 'og:description', content: 'Məkanını idarə et.' }, { property: 'og:type', content: 'website' }, { name: 'twitter:card', content: 'summary' }] }),
  component: PartnerPanel,
});

const statusAz: Record<string, string> = { pending: 'Gözləyir', confirmed: 'Təsdiqləndi', declined: 'Rədd edildi' };

function PartnerPanel() {
  const fetchPanel = useServerFn(myPartner);
  const answer = useServerFn(answerReservation);
  const qc = useQueryClient();
  const [busyId, setBusyId] = useState<string | null>(null);
  const q = useQuery({ queryKey: ['partner-panel'], queryFn: () => fetchPanel(), retry: false });

  async function respond(id: string, status: 'confirmed' | 'declined') {
    setBusyId(id);
    try { await answer({ data: { id, status } }); await qc.invalidateQueries({ queryKey: ['partner-panel'] }); } finally { setBusyId(null); }
  }

  if (q.isLoading) return <Shell><div className="empty-state"><Loader2 className="animate-spin" />Panel yüklənir...</div></Shell>;
  const d = q.data;
  if (!d?.partner) return <Shell><div className="empty-state"><Store size={38} /><h2 className="font-bold text-foreground mb-2">Hələ məkanın yoxdur</h2><p>Biznes kimi qeydiyyatdan keç, müştəri axınını buradan izlə.</p><Button asChild className="mt-5"><Link to="/partner-register">Biznes kimi qeydiyyat</Link></Button></div></Shell>;

  const p = d.partner;
  const pending = d.reservations.filter(r => r.status === 'pending');
  const avg = d.reviews.length ? (d.reviews.reduce((s, r) => s + r.rating, 0) / d.reviews.length).toFixed(1) : '—';
  const totalPeople = d.reservations.filter(r => r.status !== 'declined').reduce((s, r) => s + r.people, 0);

  return <Shell>
    <div className="view-heading"><h1>{p.name}</h1><p className="subtitle">{p.city} · {p.address}{p.status === 'pending' ? ' · Təsdiq gözləyir' : p.status === 'rejected' ? ' · Rədd edildi' : ''}</p></div>
    {p.status === 'pending' && <div className="community-banner"><span className="banner-icon"><Store /></span><div><h3>Məkanın yoxlanılır</h3><p>Təsdiqləndikdən sonra tədbirlər sənin məkanında yaradıla biləcək.</p></div></div>}
    <div className="profile-stats">
      <div className="profile-stat"><strong>{d.reservations.length}</strong><span>Rezervasiya</span></div>
      <div className="profile-stat"><strong>{totalPeople}</strong><span>Qonaq</span></div>
      <div className="profile-stat"><strong>{d.events.length}</strong><span>Tədbir</span></div>
      <div className="profile-stat"><strong>{avg}</strong><span>Reytinq</span></div>
    </div>

    <div className="section-heading mt-5"><h2><CalendarDays />Rezervasiyalar</h2></div>
    {!d.reservations.length && <div className="empty-state">Hələ rezervasiya yoxdur.<br />İstifadəçilər məkanında tədbir yaratdıqca burada görünəcək.</div>}
    <div className="chat-list">{d.reservations.map(r => <div key={r.id} className="chat-row flex items-center gap-3">
      <div className="flex-1"><h2>{r.organizer_name || 'Təşkilatçı'}</h2><p>{r.starts_on} · {r.start_time} · {r.people} nəfər</p></div>
      {r.status === 'pending'
        ? <span className="flex gap-2">
            <Button size="sm" disabled={busyId === r.id} onClick={() => respond(r.id, 'confirmed')}>{busyId === r.id ? <Loader2 className="animate-spin" /> : <Check />}Təsdiqlə</Button>
            <Button size="sm" variant="outline" disabled={busyId === r.id} onClick={() => respond(r.id, 'declined')}><X /></Button>
          </span>
        : <span className={`text-sm font-semibold ${r.status === 'confirmed' ? 'text-primary' : 'text-destructive'}`}>{statusAz[r.status]}</span>}
    </div>)}</div>
    {pending.length > 0 && <p className="form-hint">{pending.length} rezervasiya cavabını gözləyir.</p>}

    <div className="section-heading mt-5"><h2><Users />Məkanındakı tədbirlər</h2></div>
    {!d.events.length && <p className="form-hint">Hələ tədbir yoxdur.</p>}
    <div className="chat-list">{d.events.map(e => <div key={e.id} className="chat-row flex items-center gap-3"><div className="flex-1"><h2>{e.title}</h2><p>{e.starts_on} · {e.start_time} · {e.capacity} yer</p></div></div>)}</div>

    {d.reviews.length > 0 && <><div className="section-heading mt-5"><h2><Star />Rəylər</h2></div>
      <div className="chat-list">{d.reviews.map((r, i) => <div key={i} className="chat-row"><div className="flex-1"><h2>{'★'.repeat(r.rating)}</h2>{r.comment && <p>{r.comment}</p>}</div></div>)}</div></>}
  </Shell>;
}
