import { createFileRoute, Link, useNavigate } from '@tanstack/react-router';
import { useEffect, useState } from 'react';
import { Bell, ChevronRight, FileText, HelpCircle, Info, Loader2, LogOut, MapPin, ShieldCheck, Store, Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { useServerFn } from '@tanstack/react-start';
import { Shell, CityPicker } from '@/components/qoshul/shell';
import { useQoshul } from '@/components/qoshul/context';
import { supabase } from '@/integrations/supabase/client';
import { deleteAccount } from '@/lib/qoshul/ai.functions';

export const Route = createFileRoute('/_authenticated/settings')({
  head: () => ({ meta: [{ title: 'Ayarlar — Qoshul.az' }, { name: 'description', content: 'Hesab, şəhər, məxfilik və tətbiq ayarları.' }, { property: 'og:title', content: 'Ayarlar — Qoshul.az' }, { property: 'og:description', content: 'Qoshul.az hesab və tətbiq ayarları.' }, { property: 'og:type', content: 'website' }, { name: 'twitter:card', content: 'summary' }] }),
  component: SettingsScreen,
});

function Row({ icon: Icon, label, hint, onClick, to }: { icon: typeof Info; label: string; hint?: string; onClick?: () => void; to?: string }) {
  const inner = <><Icon size={17} className="text-primary" /><span className="flex-1 text-left"><strong className="block text-sm">{label}</strong>{hint && <small className="text-muted-foreground">{hint}</small>}</span><ChevronRight size={15} className="text-muted-foreground" /></>;
  return to
    ? <Link to={to} className="chat-row flex items-center gap-3 w-full">{inner}</Link>
    : <Button variant="ghost" type="button" className="chat-row flex items-center gap-3 w-full" onClick={onClick}>{inner}</Button>;
}

function SettingsScreen() {
  const { city } = useQoshul();
  const navigate = useNavigate();
  const qc = useQueryClient();
  const del = useServerFn(deleteAccount);
  const [cityOpen, setCityOpen] = useState(false);
  const [notif, setNotif] = useState(true);
  useEffect(()=>setNotif(localStorage.getItem('qoshul-notif') !== 'off'),[]);
  const [error,setError]=useState('');const [name,setName]=useState('');const [password,setPassword]=useState('');const [success,setSuccess]=useState('');
  const profile=useQuery({queryKey:['my-profile'],queryFn:async()=>{const {data:u}=await supabase.auth.getUser();if(!u.user)return null;const {data,error}=await supabase.from('profiles').select('*').eq('id',u.user.id).single();if(error)throw error;return data;}});
  useEffect(()=>{if(profile.data)setName([profile.data.first_name,profile.data.last_name].filter(Boolean).join(' '));},[profile.data]);
  async function saveAccount(){setBusy(true);setError('');setSuccess('');try{const p=profile.data;if(!p)return;const [first,...last]=name.trim().split(/\s+/);const {error}=await supabase.from('profiles').update({first_name:first??'',last_name:last.join(' ')}).eq('id',p.id);if(error)throw error;if(password){if(password.length<8)throw new Error('Şifrə ən azı 8 simvol olmalıdır.');const {error}=await supabase.auth.updateUser({password});if(error)throw error;setPassword('');}await qc.invalidateQueries({queryKey:['my-profile']});await qc.invalidateQueries({queryKey:['my-events']});setSuccess('Məlumatlar yadda saxlanıldı.');}catch{setError('Məlumatlar yenilənmədi. Şifrə ən azı 8 simvol olmalıdır.');}finally{setBusy(false);}}
  async function visibility(key:'education'|'work',value:boolean){const p=profile.data;if(!p)return;const v=p.visibility as {education:boolean;work:boolean};const {error}=await supabase.from('profiles').update({visibility:{...v,[key]:value}}).eq('id',p.id);if(error)setError('Məxfilik ayarı yenilənmədi.');else await qc.invalidateQueries({queryKey:['my-profile']});}
  const [busy, setBusy] = useState(false);
  const q = useQuery({ queryKey: ['my-roles'], queryFn: async () => {
    const { data: u } = await supabase.auth.getUser();
    if(!u.user)return [];const { data } = await supabase.from('user_roles').select('role').eq('user_id', u.user.id);
    return (data ?? []).map(r => r.role as string);
  } });
  const isPartner = (q.data ?? []).includes('partner');

  function toggleNotif() { const v = !notif; setNotif(v); localStorage.setItem('qoshul-notif', v ? 'on' : 'off'); }
  async function logout() { await supabase.auth.signOut(); navigate({ to: '/auth' }); }
  async function remove() {
    if (!confirm('Hesabın və bütün məlumatların birdəfəlik silinsin? Bu əməliyyat geri qaytarılmır.')) return;
    setBusy(true);
    try { await del(); await supabase.auth.signOut(); navigate({ to: '/' }); } catch {setError('Hesab silinmədi. Yenidən cəhd et.');} finally { setBusy(false); }
  }

  return <Shell>
    <div className="view-heading"><h1>Ayarlar</h1><p className="subtitle">Hesabını və tətbiqi özünə uyğunlaşdır.</p></div>

    <h2 className="font-bold text-sm mt-2">Hesab</h2><form onSubmit={e=>{e.preventDefault();void saveAccount();}}><label className="form-field">Ad və soyad<input className="form-input" required value={name} onChange={e=>setName(e.target.value)}/></label><label className="form-field">Yeni şifrə<input className="form-input" type="password" autoComplete="new-password" minLength={8} value={password} onChange={e=>setPassword(e.target.value)}/></label><Button type="submit" disabled={busy} className="mt-3">Yadda saxla</Button></form>{error&&<p className="form-error" role="alert">{error}</p>}{success&&<p className="form-hint" role="status">{success}</p>}<h2 className="font-bold text-sm mt-5">Məxfilik</h2>{profile.data&&(['education','work'] as const).map(k=><label key={k} className="flex items-center gap-3 text-sm mt-2"><input type="checkbox" checked={Boolean((profile.data?.visibility as {education:boolean;work:boolean})[k])} onChange={e=>void visibility(k,e.target.checked)}/>{k==='education'?'Təhsil məlumatımı göstər':'İş məlumatımı göstər'}</label>)}
    <div className="chat-list">
      <Row icon={MapPin} label="Şəhər / rayon" hint={city} onClick={() => setCityOpen(true)} />
      {isPartner
        ? <Row icon={Store} label="Tərəfdaş panelim" hint="Rezervasiyalar və statistika" to="/partner" />
        : <Row icon={Store} label="Biznes kimi qeydiyyat" hint="Məkanını Qoshul-a əlavə et" to="/partner-register" />}
    </div>

    <h2 className="font-bold text-sm mt-5">Bildirişlər</h2>
    <div className="chat-list">
      <label className="chat-row flex items-center gap-3 w-full">
        <Bell size={17} className="text-primary" /><span className="flex-1 text-left"><strong className="block text-sm">Bildirişlər</strong><small className="text-muted-foreground">Yeni tədbirlər və mesajlar</small></span>
        <input type="checkbox" checked={notif} onChange={toggleNotif} aria-label="Bildirişləri göstər"/>
      </label>
    </div>

    <h2 className="font-bold text-sm mt-5">Haqqında</h2>
    <div className="chat-list">
      <Row icon={Info} label="Haqqımızda" to="/about" />
      <Row icon={ShieldCheck} label="Məxfilik siyasəti" to="/privacy" />
      <Row icon={FileText} label="İstifadə şərtləri" to="/terms" />
      <Row icon={HelpCircle} label="Kömək və dəstək" to="/about" />
    </div>

    <h2 className="font-bold text-sm mt-5">Təhlükəsizlik</h2><p className="dialog-body">İlk görüşü ictimai məkanda keçir. Şəxsi ünvanını və maliyyə məlumatlarını paylaşma. Təcili təhlükə zamanı yerli təcili xidmətlərlə əlaqə saxla.</p>
    <h2 className="font-bold text-sm mt-5">Tez-tez verilən suallar</h2><details className="chat-row block"><summary>Tədbirimi harada görə bilərəm?</summary><p>Profilində “Tədbirlərim” bölməsində.</p></details><details className="chat-row block"><summary>Məkan nə vaxt görünəcək?</summary><p>Biznes qeydiyyatı yoxlanıb təsdiqləndikdən sonra.</p></details>
    <h2 className="font-bold text-sm mt-5">Təhlükəli zona</h2>
    <div className="flex flex-wrap gap-2 mt-2">
      <Button variant="outline" size="sm" onClick={logout}><LogOut />Çıxış</Button>
      <Button variant="ghost" size="sm" className="text-destructive" onClick={remove} disabled={busy}>{busy ? <Loader2 className="animate-spin" /> : <Trash2 />}Hesabı sil</Button>
    </div>
    <p className="form-hint mt-5">Qoshul.az · versiya 1.0</p>
    <CityPicker open={cityOpen} onOpenChange={setCityOpen} />
  </Shell>;
}
