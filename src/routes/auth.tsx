import { createFileRoute, useNavigate } from '@tanstack/react-router';
import { useEffect, useState } from 'react';
import { Link2, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { supabase } from '@/integrations/supabase/client';
import { lovable } from '@/integrations/lovable';

export const Route = createFileRoute('/auth')({
  validateSearch: (s: Record<string, unknown>): { redirect?: string | undefined } => ({ redirect: typeof s['redirect'] === 'string' && s['redirect'].startsWith('/') && !s['redirect'].startsWith('//') ? s['redirect'] : undefined }),
  head: () => ({ meta: [{ title: 'Daxil ol — Qoshul.az' }, { name: 'description', content: 'Qoshul.az hesabına daxil ol və ya yeni hesab yarat.' }, { property: 'og:title', content: 'Daxil ol — Qoshul.az' }, { property: 'og:description', content: 'Yeni insanlara, yeni planlara qoşul.' }, { property: 'og:type', content: 'website' }, { name: 'twitter:card', content: 'summary' }] }),
  component: AuthPage,
});

function AuthPage() {
  const { redirect } = Route.useSearch();
  const navigate = useNavigate();
  const [mode, setMode] = useState<'in' | 'up' | 'forgot'>('in');
  const [email, setEmail] = useState(''); const [password, setPassword] = useState('');
  const [name, setName] = useState(''); const [repeat, setRepeat] = useState('');
  const [busy, setBusy] = useState(false); const [msg, setMsg] = useState(''); const [err, setErr] = useState('');
  async function go() {
    const { data: auth } = await supabase.auth.getUser();
    if (!auth.user) return;
    const { data: profile } = await supabase.from('profiles').select('onboarded').eq('id', auth.user.id).maybeSingle();
    if (!profile?.onboarded) { await navigate({ to: '/onboarding' }); return; }
    if (redirect) window.location.assign(redirect); else await navigate({ to: '/' });
  }
  useEffect(() => {
    void supabase.auth.getSession().then(({ data }) => { if (data.session) void go(); });
    const { data } = supabase.auth.onAuthStateChange(event => { if (event === 'SIGNED_IN') setTimeout(() => { void go(); }, 0); });
    return () => data.subscription.unsubscribe();
  }, []);

  async function submit(e: React.FormEvent) {
    e.preventDefault(); setBusy(true); setErr(''); setMsg('');
    try {
      if (mode === 'in') {
        const { error } = await supabase.auth.signInWithPassword({ email, password });
        if (error) throw new Error('E-poçt və ya şifrə yanlışdır.');
        go();
      } else if (mode === 'up') {
        if (password.length < 8) throw new Error('Şifrə ən azı 8 simvol olmalıdır.');
        if (password !== repeat) throw new Error('Şifrələr eyni deyil.');
        const [firstName, ...lastName] = name.trim().split(/\s+/);
        const { data, error } = await supabase.auth.signUp({ email, password, options: { emailRedirectTo: window.location.origin + '/auth', data: { first_name: firstName, last_name: lastName.join(' ') } } });
        if (error) throw new Error(error.message.includes('registered') ? 'Bu e-poçt artıq qeydiyyatdan keçib.' : 'Qeydiyyat alınmadı. Yenidən cəhd et.');
        if (data.session) go(); else setMsg('Təsdiq məktubu göndərildi. E-poçtundakı linkə keçib qeydiyyatı tamamla.');
      } else {
        const { error } = await supabase.auth.resetPasswordForEmail(email, { redirectTo: window.location.origin + '/reset-password' });
        if (error) throw new Error('Link göndərilmədi. Bir az sonra yenidən cəhd et.');
        setMsg('Şifrəni yeniləmək üçün link e-poçtuna göndərildi.');
      }
    } catch (x) { setErr(x instanceof Error ? x.message : 'Xəta baş verdi.'); } finally { setBusy(false); }
  }
  async function google() {
    setErr('');
    const r = await lovable.auth.signInWithOAuth('google', { redirect_uri: window.location.origin + '/auth' + (redirect ? `?redirect=${encodeURIComponent(redirect)}` : '') });
    if (r.error) { setErr('Google ilə giriş alınmadı.'); return; }
    if (!('redirected' in r && r.redirected)) go();
  }
  const title = mode === 'in' ? 'Xoş gəldin!' : mode === 'up' ? 'Hesab yarat' : 'Şifrəni unutmusan?';
  return <div className="app-shell"><main className="page-content" style={{ maxWidth: 420, margin: '0 auto' }}>
    <div className="wordmark" style={{ marginTop: 24 }}><Link2 className="brand-mark" strokeWidth={3} />qoshul<span>.az</span></div>
    <div className="view-heading"><h1>{title}</h1><p className="subtitle">{mode === 'forgot' ? 'E-poçtunu yaz, sənə yeniləmə linki göndərək.' : 'Yeni insanlara, yeni planlara qoşul.'}</p></div>
    {mode !== 'forgot' && <><Button variant="outline" className="w-full" onClick={google}>Google ilə davam et</Button><p className="form-hint" style={{ justifyContent: 'center' }}>və ya</p></>}
    <form onSubmit={submit}>
      {mode === 'up' && <label className="form-field">Ad və soyad<input className="form-input" required value={name} onChange={e => setName(e.target.value)} autoComplete="name" maxLength={100} /></label>}
      <label className="form-field">E-poçt<input className="form-input" type="email" required value={email} onChange={e => setEmail(e.target.value)} autoComplete="email" /></label>
      {mode !== 'forgot' && <label className="form-field">Şifrə<input className="form-input" type="password" required minLength={mode === 'up' ? 8 : 1} value={password} onChange={e => setPassword(e.target.value)} autoComplete={mode === 'up' ? 'new-password' : 'current-password'} /></label>}
      {mode === 'up' && <label className="form-field">Şifrəni təkrarla<input className="form-input" type="password" required minLength={8} value={repeat} onChange={e => setRepeat(e.target.value)} autoComplete="new-password" /></label>}
      {err && <p className="form-error" role="alert">{err}</p>}{msg && <p className="form-hint" role="status">{msg}</p>}
      <Button type="submit" className="w-full mt-5" disabled={busy}>{busy && <Loader2 className="animate-spin" />}{mode === 'in' ? 'Daxil ol' : mode === 'up' ? 'Qeydiyyatdan keç' : 'Link göndər'}</Button>
    </form>
    <div className="flex flex-col items-center gap-1 mt-4 text-sm">
      {mode === 'in' && <><Button variant="link" onClick={() => setMode('forgot')}>Şifrəni unutmusan?</Button><Button variant="link" onClick={() => setMode('up')}>Hesabın yoxdur? Qeydiyyatdan keç</Button></>}
      {mode !== 'in' && <Button variant="link" onClick={() => setMode('in')}>Hesabın var? Daxil ol</Button>}
    </div>
  </main></div>;
}
