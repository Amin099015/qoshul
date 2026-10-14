import { createFileRoute, useNavigate } from '@tanstack/react-router';
import { useEffect, useState } from 'react';
import { useServerFn } from '@tanstack/react-start';
import { Check, ChevronLeft, ChevronRight, Loader2, Sparkles } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { supabase } from '@/integrations/supabase/client';
import { cities } from '@/lib/qoshul/cities';
import { categoryGroups } from '@/lib/qoshul/categories';
import { analyzePersonality, type PersonalityResult } from '@/lib/qoshul/ai.functions';
import { statuses, universities, degrees, languageOptions, languageLevels, goals as goalOptions, availabilityOptions, groupSizes, budgets, personalityQuestions, openQuestions, validateOnboarding, traitLabels, type Trait } from '@/lib/qoshul/onboarding';

export const Route = createFileRoute('/_authenticated/onboarding')({
  head: () => ({ meta: [{ title: 'Qeydiyyat anketi — Qoshul.az' }, { name: 'description', content: 'Profilini tamamla, AI şəxsiyyət analizini al və sənə uyğun insanlarla tanış ol.' }, { property: 'og:title', content: 'Qeydiyyat anketi — Qoshul.az' }, { property: 'og:description', content: 'Sənə uyğun insanları tapaq.' }, { property: 'og:type', content: 'website' }, { name: 'twitter:card', content: 'summary' }] }),
  component: Onboarding,
});

type Form = { first_name: string; last_name: string; birth_date: string; gender: string; city: string; status: string; [k: string]: string };
const STEPS = ['Əsas məlumat', 'Təhsil və iş', 'Dillər', 'Maraqlar', 'Məqsədlər', 'Şəxsiyyət testi', 'Açıq suallar', 'Üstünlüklər'];

function Chips({ options, value, onToggle }: { options: string[]; value: string[]; onToggle: (v: string) => void }) {
  return <div className="interest-tags">{options.map(o => <button type="button" key={o} aria-pressed={value.includes(o)} onClick={() => onToggle(o)} style={value.includes(o) ? { background: 'var(--primary)', color: 'var(--primary-foreground)' } : undefined}>{o}</button>)}</div>;
}

function Onboarding() {
  const navigate = useNavigate();
  const analyze = useServerFn(analyzePersonality);
  const [step, setStep] = useState(0);
  const [f, setF] = useState<Form>({ first_name: '', last_name: '', birth_date: '', gender: '', city: 'Bakı', status: '' });
  const [langs, setLangs] = useState<{ name: string; level: string }[]>([{ name: 'Azərbaycan dili', level: 'Ana dili' }]);
  const [interests, setInterests] = useState<string[]>([]);
  const [goals, setGoals] = useState<string[]>([]);
  const [answers, setAnswers] = useState<Record<string, number>>({});
  const [open, setOpen] = useState<Record<string, string>>({});
  const [avail, setAvail] = useState<string[]>([]);
  const [err, setErr] = useState<string[]>([]); const [busy, setBusy] = useState(false);
  const [result, setResult] = useState<PersonalityResult | null>(null);
  const set = (k: string, v: string) => setF(p => ({ ...p, [k]: v }));
  const tog = (setter: React.Dispatch<React.SetStateAction<string[]>>) => (v: string) => setter(p => p.includes(v) ? p.filter(x => x !== v) : [...p, v]);

  useEffect(() => { (async () => {
    const { data: u } = await supabase.auth.getUser(); if (!u.user) return;
    const { data: p } = await supabase.from('profiles').select('*').eq('id', u.user.id).maybeSingle(); if (!p) return;
    setF(prev => ({ ...prev, ...Object.fromEntries(Object.entries(p).filter(([, v]) => typeof v === 'string')) as Form }));
    if ((p.languages as unknown[]).length) setLangs(p.languages as never); setInterests(p.interests); setGoals(p.goals);
    setAnswers(p.personality_answers as never); setOpen(p.open_answers as never); setAvail(p.availability);
  })(); }, []);

  async function finish() {
    const errors = validateOnboarding({ first_name: f.first_name ?? '', last_name: f.last_name ?? '', birth_date: f.birth_date ?? '', city: f.city ?? '', status: f.status ?? '', languages: langs, interests, goals, personality_answers: answers });
    setErr(errors); if (errors.length) return;
    setBusy(true);
    try {
      const { data: u } = await supabase.auth.getUser();
      const pick = (k: string) => f[k] || null;
      const { error } = await supabase.from('profiles').update({
        first_name: f.first_name!.trim(), last_name: f.last_name!.trim(), birth_date: f.birth_date!, gender: pick('gender'), city: f.city!, status: f.status!,
        school_name: pick('school_name'), school_grade: pick('school_grade'), university: pick('university'), faculty: pick('faculty'), course: pick('course'), degree: pick('degree'),
        work_field: pick('work_field'), work_position: pick('work_position'), company: pick('company'), work_schedule: pick('work_schedule'),
        languages: langs as never, interests, goals, personality_answers: answers as never, open_answers: open as never, availability: avail, group_size: pick('group_size'), budget: pick('budget'),
      }).eq('id', u.user!.id);
      if (error) throw new Error('Məlumatlar yadda saxlanmadı.');
      setResult(await analyze());
    } catch (x) { setErr([x instanceof Error ? x.message : 'AI analizi alınmadı. Yenidən cəhd et.']); } finally { setBusy(false); }
  }

  if (result) return <div className="app-shell"><main className="page-content" style={{ maxWidth: 560, margin: '0 auto' }}>
    <div className="view-heading"><h1 className="flex items-center gap-2"><Sparkles className="text-primary" />{result.type}</h1><p className="subtitle">AI şəxsiyyət analizin hazırdır.</p></div>
    <p className="text-sm">{result.summary}</p>
    <TraitBars traits={result.traits} />
    <h2 className="font-bold text-sm mt-4">Güclü tərəflərin</h2><div className="interest-tags">{result.strengths.map(s => <span key={s}>{s}</span>)}</div>
    <h2 className="font-bold text-sm mt-4">Ünsiyyət üslubun</h2><p className="text-sm">{result.communication}</p>
    <h2 className="font-bold text-sm mt-4">Sənə uyğun tədbirlər</h2><div className="interest-tags">{result.suggested.map(s => <span key={s}>{s}</span>)}</div>
    {result.flagged && <p className="form-error">Profilin moderator yoxlamasına göndərildi.</p>}
    <Button className="w-full mt-6" onClick={() => navigate({ to: '/explore', search: { view: 'people' } })}>Uyğun insanları gör <ChevronRight /></Button>
  </main></div>;

  const field = (k: string, label: string, props: React.InputHTMLAttributes<HTMLInputElement> = {}) => <label className="form-field">{label}<input className="form-input" value={f[k] ?? ''} onChange={e => set(k, e.target.value)} {...props} /></label>;
  const select = (k: string, label: string, opts: string[] | readonly { id: string; label: string }[]) => <label className="form-field">{label}<select className="form-input" value={f[k] ?? ''} onChange={e => set(k, e.target.value)}><option value="">Seç</option>{opts.map(o => typeof o === 'string' ? <option key={o}>{o}</option> : <option key={o.id} value={o.id}>{o.label}</option>)}</select></label>;

  return <div className="app-shell"><main className="page-content" style={{ maxWidth: 560, margin: '0 auto' }}>
    <p className="form-hint">Addım {step + 1} / {STEPS.length}</p>
    <div className="xp-track"><div className="xp-fill" style={{ width: `${((step + 1) / STEPS.length) * 100}%` }} /></div>
    <div className="view-heading"><h1>{STEPS[step]}</h1></div>
    {step === 0 && <>{field('first_name', 'Ad', { maxLength: 50 })}{field('last_name', 'Soyad', { maxLength: 50 })}{field('birth_date', 'Doğum tarixi (16+)', { type: 'date' })}{select('gender', 'Cins', ['Kişi', 'Qadın', 'Demək istəmirəm'])}{select('city', 'Şəhər', cities.map(c => c.name))}</>}
    {step === 1 && <>{select('status', 'Vəziyyətin', statuses)}
      {f.status === 'school' && <>{field('school_name', 'Məktəbin adı və ya nömrəsi')}{select('school_grade', 'Sinif', ['8', '9', '10', '11'])}</>}
      {f.status === 'student' && <>{select('university', 'Universitet', universities)}{field('faculty', 'Fakültə / ixtisas')}{select('course', 'Kurs', ['1', '2', '3', '4', '5', '6'])}{select('degree', 'Dərəcə', degrees)}</>}
      {['working', 'entrepreneur', 'freelancer'].includes(f.status ?? '') && <>{field('work_field', 'Sahə')}{field('work_position', 'Vəzifə')}{field('company', 'Şirkət (istəyə görə)')}{select('work_schedule', 'İş qrafiki', ['Tam ştat', 'Yarım ştat', 'Sərbəst qrafik', 'Növbəli'])}</>}
      {f.status === 'job_seeking' && field('work_field', 'Hansı sahədə iş axtarırsan?')}</>}
    {step === 2 && <>{langs.map((l, i) => <div key={i} className="flex gap-2 items-end">
      <label className="form-field flex-1">Dil<select className="form-input" value={l.name} onChange={e => setLangs(p => p.map((x, j) => j === i ? { ...x, name: e.target.value } : x))}>{languageOptions.map(o => <option key={o}>{o}</option>)}</select></label>
      <label className="form-field flex-1">Səviyyə<select className="form-input" value={l.level} onChange={e => setLangs(p => p.map((x, j) => j === i ? { ...x, level: e.target.value } : x))}>{languageLevels.map(o => <option key={o}>{o}</option>)}</select></label>
      <Button variant="ghost" onClick={() => setLangs(p => p.filter((_, j) => j !== i))}>Sil</Button></div>)}
      <Button variant="outline" className="mt-4" onClick={() => setLangs(p => [...p, { name: 'İngilis dili', level: 'Orta' }])}>Dil əlavə et</Button></>}
    {step === 3 && <><p className="form-hint">Ən azı 5 maraq seç ({interests.length} seçilib).</p>{categoryGroups.map(g => <div key={g.group}><h2 className="font-bold text-sm mt-4">{g.group}</h2><Chips options={g.items} value={interests} onToggle={tog(setInterests)} /></div>)}</>}
    {step === 4 && <Chips options={goalOptions} value={goals} onToggle={tog(setGoals)} />}
    {step === 5 && <><p className="form-hint">1 — qətiyyən razı deyiləm, 5 — tamamilə razıyam.</p>{personalityQuestions.map(q => <div key={q.id} className="mt-4"><p className="text-sm font-medium">{q.text}</p><div className="flex gap-2 mt-2">{[1, 2, 3, 4, 5].map(v => <Button key={v} size="sm" variant={answers[q.id] === v ? 'default' : 'outline'} aria-label={`${q.id}-${v}`} onClick={() => setAnswers(p => ({ ...p, [q.id]: v }))}>{v}</Button>)}</div></div>)}</>}
    {step === 6 && openQuestions.map(q => <label key={q.id} className="form-field">{q.text}<textarea className="form-input" rows={3} maxLength={600} value={open[q.id] ?? ''} onChange={e => setOpen(p => ({ ...p, [q.id]: e.target.value }))} /></label>)}
    {step === 7 && <><h2 className="font-bold text-sm mt-2">Uyğun vaxtlar</h2><Chips options={availabilityOptions} value={avail} onToggle={tog(setAvail)} />{select('group_size', 'Qrup ölçüsü', groupSizes)}{select('budget', 'Büdcə', budgets)}</>}
    {err.length > 0 && <div role="alert">{err.map(e => <p key={e} className="form-error">{e}</p>)}</div>}
    <div className="flex gap-3 mt-6 mb-10">
      {step > 0 && <Button variant="outline" onClick={() => setStep(s => s - 1)}><ChevronLeft />Geri</Button>}
      {step < STEPS.length - 1 ? <Button className="flex-1" onClick={() => setStep(s => s + 1)}>Davam et <ChevronRight /></Button>
        : <Button className="flex-1" disabled={busy} onClick={finish}>{busy ? <><Loader2 className="animate-spin" />AI analiz edir...</> : <><Check />Tamamla və analiz et</>}</Button>}
    </div>
  </main></div>;
}

export function TraitBars({ traits }: { traits: Record<Trait, number> }) {
  return <div className="mt-4">{(Object.keys(traitLabels) as Trait[]).map(t => <div key={t} className="mt-2"><div className="xp-line"><span>{traitLabels[t]}</span><strong>{traits[t]}</strong></div><div className="xp-track"><div className="xp-fill" style={{ width: `${traits[t]}%` }} /></div></div>)}</div>;
}
