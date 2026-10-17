import { createFileRoute, useNavigate } from '@tanstack/react-router';
import { useCallback, useState } from 'react';
import { Loader2, MapPin, Store } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useServerFn } from '@tanstack/react-start';
import { Shell } from '@/components/qoshul/shell';
import { LazyMap } from '@/components/qoshul/lazy-map';
import { cities, findCity } from '@/lib/qoshul/cities';
import { categoryGroups } from '@/lib/qoshul/categories';
import { registerPartner } from '@/lib/qoshul/partners.functions';

export const Route = createFileRoute('/_authenticated/partner-register')({
  head: () => ({ meta: [{ title: 'Biznes kimi qeydiyyat — Qoshul.az' }, { name: 'description', content: 'Məkanını Qoshul.az-a əlavə et, yeni müştərilər qazan.' }, { property: 'og:title', content: 'Biznes kimi qeydiyyat — Qoshul.az' }, { property: 'og:description', content: 'Tərəfdaş məkan ol, rezervasiyaları idarə et.' }, { property: 'og:type', content: 'website' }, { name: 'twitter:card', content: 'summary' }] }),
  component: PartnerRegister,
});

function PartnerRegister() {
  const navigate = useNavigate();
  const reg = useServerFn(registerPartner);
  const [city, setCity] = useState('Bakı');
  const [pos, setPos] = useState<{ lat: number; lng: number } | null>(null);
  const [cats, setCats] = useState<string[]>([]);
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState('');
  const c = findCity(city);
  const point = pos ?? { lat: c.lat, lng: c.lng };
  const onPick = useCallback((p: { lat: number; lng: number }) => setPos(p), []);

  function toggleCat(x: string) { setCats(prev => prev.includes(x) ? prev.filter(i => i !== x) : prev.length < 5 ? [...prev, x] : prev); }

  async function submit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault(); setErr('');
    const f = new FormData(e.currentTarget);
    const voen = String(f.get('voen')).trim();
    if (!/^\d{10}$/.test(voen)) { setErr('VÖEN 10 rəqəmdən ibarət olmalıdır.'); return; }
    if (!cats.length) { setErr('Ən azı bir kateqoriya seç.'); return; }
    setBusy(true);
    try {
      await reg({ data: { name: String(f.get('name')).trim(), voen, categories: cats, city, address: String(f.get('address')).trim(), lat: point.lat, lng: point.lng, phone: String(f.get('phone') ?? '').trim(), hours: String(f.get('hours') ?? '').trim(), deal: String(f.get('deal') ?? '').trim(), description: String(f.get('description') ?? '').trim() } });
      navigate({ to: '/partner' });
    } catch (x) { setErr(x instanceof Error ? x.message : 'Qeydiyyat alınmadı.'); } finally { setBusy(false); }
  }

  return <Shell>
    <div className="view-heading"><h1 className="flex items-center gap-2"><Store className="text-primary" />Biznes kimi qeydiyyat</h1><p className="subtitle">Məkanını əlavə et, Qoshul istifadəçilərini özünə cəlb et. Qeydiyyat təsdiqdən sonra aktivləşir.</p></div>
    <form onSubmit={submit}>
      <label className="form-field">Məkanın adı<input name="name" required maxLength={80} className="form-input" placeholder="Məsələn, Coffee Moffie" /></label>
      <label className="form-field">VÖEN<input name="voen" required inputMode="numeric" pattern="\d{10}" maxLength={10} className="form-input" placeholder="10 rəqəmli VÖEN" /></label>
      <div className="form-field"><span>Kateqoriyalar (ən çox 5)</span>
        <div className="interest-tags">{categoryGroups.flatMap(g => g.items).map(x => <button type="button" key={x} className={cats.includes(x) ? 'active' : ''} onClick={() => toggleCat(x)}>{x}</button>)}</div>
      </div>
      <div className="grid grid-cols-2 gap-3">
        <label className="form-field">Şəhər<select className="form-input" value={city} onChange={e => { setCity(e.target.value); setPos(null); }}>{cities.map(x => <option key={x.name}>{x.name}</option>)}</select></label>
        <label className="form-field">Telefon<input name="phone" className="form-input" placeholder="+994 ..." /></label>
      </div>
      <label className="form-field">Ünvan<input name="address" required maxLength={300} className="form-input" placeholder="Küçə, bina" /></label>
      <p className="form-hint"><MapPin size={12} />Xəritədə toxunaraq məkanın dəqiq nöqtəsini seç</p>
      <LazyMap events={[]} center={point} me={point} zoom={13} onPick={onPick} />
      <div className="grid grid-cols-2 gap-3 mt-3">
        <label className="form-field">İş saatları<input name="hours" className="form-input" placeholder="09:00–23:00" /></label>
        <label className="form-field">Təklif / endirim<input name="deal" className="form-input" placeholder="Məsələn, 20% endirim" /></label>
      </div>
      <label className="form-field">Məkan haqqında<textarea name="description" className="form-input" placeholder="Qısa təsvir" /></label>
      {err && <p className="form-error" role="alert">{err}</p>}
      <Button type="submit" className="w-full mt-4" disabled={busy}>{busy && <Loader2 className="animate-spin" />}Qeydiyyatı göndər</Button>
      <p className="form-hint mt-2">Komandamız məlumatları yoxlayıb məkanı təsdiqləyəcək.</p>
    </form>
  </Shell>;
}
