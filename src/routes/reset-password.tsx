import { createFileRoute, Link, useNavigate } from '@tanstack/react-router';
import { useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import { supabase } from '@/integrations/supabase/client';

export const Route = createFileRoute('/reset-password')({
  head: () => ({ meta: [{ title: 'Şifrəni yenilə — Qoshul.az' }, { name: 'description', content: 'Qoshul.az hesabın üçün yeni şifrə təyin et.' }, { property: 'og:title', content: 'Şifrəni yenilə — Qoshul.az' }, { property: 'og:description', content: 'Yeni şifrə təyin et.' }, { property: 'og:type', content: 'website' }, { name: 'twitter:card', content: 'summary' }] }),
  component: ResetPage,
});

function ResetPage() {
  const navigate = useNavigate();
  const [pw, setPw] = useState(''); const [pw2, setPw2] = useState(''); const [err, setErr] = useState(''); const [busy, setBusy] = useState(false);
  const [ready, setReady] = useState(false);
  useEffect(() => { void supabase.auth.getSession().then(({ data }) => setReady(!!data.session)); const { data } = supabase.auth.onAuthStateChange((_event, session) => setReady(!!session)); return () => data.subscription.unsubscribe(); }, []);
  async function submit(e: React.FormEvent) {
    e.preventDefault(); setErr('');
    if (pw.length < 8) return setErr('Şifrə ən azı 8 simvol olmalıdır.');
    if (pw !== pw2) return setErr('Şifrələr eyni deyil.');
    setBusy(true);
    const { error } = await supabase.auth.updateUser({ password: pw });
    setBusy(false);
    if (error) return setErr('Link etibarsızdır və ya vaxtı keçib. Yeni link istə.');
    const { data: auth } = await supabase.auth.getUser();
    if (!auth.user) return setErr('Sessiya bitib. Yeni yeniləmə linki istə.');
    const { data: profile } = await supabase.from('profiles').select('onboarded').eq('id', auth.user.id).maybeSingle();
    navigate({ to: profile?.onboarded ? '/profile' : '/onboarding' });
  }
  return <div className="app-shell"><main className="page-content" style={{ maxWidth: 420, margin: '0 auto' }}>
    <div className="view-heading"><h1>Yeni şifrə</h1><p className="subtitle">Hesabın üçün yeni şifrə təyin et.</p></div>
    <form onSubmit={submit}>
      <label className="form-field">Yeni şifrə<input className="form-input" type="password" value={pw} onChange={e => setPw(e.target.value)} autoComplete="new-password" required /></label>
      <label className="form-field">Şifrəni təkrarla<input className="form-input" type="password" value={pw2} onChange={e => setPw2(e.target.value)} autoComplete="new-password" required /></label>
      {err && <p className="form-error" role="alert">{err}</p>}
      <Button type="submit" className="w-full mt-5" disabled={busy || !ready}>Şifrəni yenilə</Button>
      {!ready && <p className="form-error">Etibarlı yeniləmə linki ilə bu səhifəni aç.</p>}
      <Button asChild variant="link" className="mt-3"><Link to="/auth">Yeni link istə</Link></Button>
    </form>
  </main></div>;
}
