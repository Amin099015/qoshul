import { createFileRoute, Link, useNavigate } from '@tanstack/react-router';
import { useState } from 'react';
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
    : <button type="button" className="chat-row flex items-center gap-3 w-full" onClick={onClick}>{inner}</button>;
}

function SettingsScreen() {
  const { city } = useQoshul();
  const navigate = useNavigate();
  const qc = useQueryClient();
  const del = useServerFn(deleteAccount);
  const [cityOpen, setCityOpen] = useState(false);
  const [notif, setNotif] = useState(() => localStorage.getItem('qoshul-notif') !== 'off');
  const [busy, setBusy] = useState(false);
  const q = useQuery({ queryKey: ['my-roles'], queryFn: async () => {
    const { data: u } = await supabase.auth.getUser();
    const { data } = await supabase.from('user_roles').select('role').eq('user_id', u.user!.id);
    return (data ?? []).map(r => r.role as string);
  } });
  const isPartner = (q.data ?? []).includes('partner');

  function toggleNotif() { const v = !notif; setNotif(v); localStorage.setItem('qoshul-notif', v ? 'on' : 'off'); }
  async function logout() { await supabase.auth.signOut(); navigate({ to: '/auth' }); }
  async function remove() {
    if (!confirm('Hesabın və bütün məlumatların birdəfəlik silinsin? Bu əməliyyat geri qaytarılmır.')) return;
    setBusy(true);
    try { await del(); await supabase.auth.signOut(); navigate({ to: '/' }); } finally { setBusy(false); }
  }

  return <Shell>
    <div className="view-heading"><h1>Ayarlar</h1><p className="subtitle">Hesabını və tətbiqi özünə uyğunlaşdır.</p></div>

    <h2 className="font-bold text-sm mt-2">Hesab</h2>
    <div className="chat-list">
      <Row icon={MapPin} label="Şəhər / rayon" hint={city} onClick={() => setCityOpen(true)} />
      {isPartner
        ? <Row icon={Store} label="Tərəfdaş panelim" hint="Rezervasiyalar və statistika" to="/partner" />
        : <Row icon={Store} label="Biznes kimi qeydiyyat" hint="Məkanını Qoshul-a əlavə et" to="/partner-register" />}
    </div>

    <h2 className="font-bold text-sm mt-5">Bildirişlər</h2>
    <div className="chat-list">
      <button type="button" className="chat-row flex items-center gap-3 w-full" onClick={toggleNotif}>
        <Bell size={17} className="text-primary" /><span className="flex-1 text-left"><strong className="block text-sm">Bildirişlər</strong><small className="text-muted-foreground">Yeni tədbirlər və mesajlar</small></span>
        <span className="text-sm font-semibold text-primary">{notif ? 'Açıq' : 'Bağlı'}</span>
      </button>
    </div>

    <h2 className="font-bold text-sm mt-5">Haqqında</h2>
    <div className="chat-list">
      <Row icon={Info} label="Haqqımızda" to="/about" />
      <Row icon={ShieldCheck} label="Məxfilik siyasəti" to="/privacy" />
      <Row icon={FileText} label="İstifadə şərtləri" to="/terms" />
      <Row icon={HelpCircle} label="Kömək və dəstək" hint="destek@qoshul.az" to="/about" />
    </div>

    <h2 className="font-bold text-sm mt-5">Təhlükəli zona</h2>
    <div className="flex flex-wrap gap-2 mt-2">
      <Button variant="outline" size="sm" onClick={logout}><LogOut />Çıxış</Button>
      <Button variant="ghost" size="sm" className="text-destructive" onClick={remove} disabled={busy}>{busy ? <Loader2 className="animate-spin" /> : <Trash2 />}Hesabı sil</Button>
    </div>
    <p className="form-hint mt-5">Qoshul.az · versiya 1.0</p>
    <CityPicker open={cityOpen} onOpenChange={setCityOpen} />
  </Shell>;
}
