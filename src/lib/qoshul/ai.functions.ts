import { createServerFn } from '@tanstack/react-start';
import { requireSupabaseAuth } from '@/integrations/supabase/auth-middleware';
import { aiJson } from './ai.server';
import { personalityQuestions, openQuestions, traitScores, statusLabel, traitLabels, type Trait } from './onboarding';

const AZ = 'Həmişə qrammatik cəhətdən düzgün, təbii Azərbaycan dilində yaz. Emoji istifadə etmə.';

export interface PersonalityResult {
  type: string; summary: string; strengths: string[]; communication: string; suggested: string[];
  traits: Record<Trait, number>; flagged: boolean;
}

export const analyzePersonality = createServerFn({ method: 'POST' })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    const { supabase, userId } = context;
    const { data: p, error } = await supabase.from('profiles').select('*').eq('id', userId).single();
    if (error || !p) throw new Error('Profil tapılmadı.');
    const answers = (p.personality_answers ?? {}) as Record<string, number>;
    const open = (p.open_answers ?? {}) as Record<string, string>;
    const traits = traitScores(answers);
    const input = [
      `Status: ${statusLabel(p.status)}; ${p.university ?? p.school_name ?? p.work_field ?? ''} ${p.faculty ?? ''}`,
      `Şəhər: ${p.city}`, `Maraqlar: ${p.interests.join(', ')}`, `Məqsədlər: ${p.goals.join(', ')}`,
      `Big Five balları (0-100): ${(Object.keys(traits) as Trait[]).map(t => `${traitLabels[t]} ${traits[t]}`).join(', ')}`,
      `Test cavabları: ${personalityQuestions.map(q => `${q.text} = ${answers[q.id] ?? '-'}`).join('; ')}`,
      ...openQuestions.map(q => `${q.text}: ${(open[q.id] ?? '').slice(0, 600)}`),
    ].join('\n');
    const r = await aiJson<Omit<PersonalityResult, 'traits'>>(
      `Sən gənclər üçün sosial tətbiqdə işləyən diqqətli psixoloji profil analitikisən. Verilən test və açıq cavablara əsasən istifadəçinin şəxsiyyətini müsbət, hörmətli tonda təsvir et. ${AZ}
type: 2-3 sözlük yaradıcı şəxsiyyət tipi adı (məs. "Enerjili kəşfiyyatçı"). summary: 3-4 cümlə. strengths: 3-4 qısa güclü tərəf. communication: ünsiyyət üslubu haqqında 1-2 cümlə. suggested: ona uyğun 4 tədbir növü. flagged: açıq cavablarda təhqir, nifrət, zorakılıq, cinsi və ya təhlükəli məzmun varsa true, əks halda false. Tibbi diaqnoz qoyma.`,
      input, 'personality',
      { type: 'object', additionalProperties: false, required: ['type','summary','strengths','communication','suggested','flagged'],
        properties: { type: { type: 'string' }, summary: { type: 'string' }, strengths: { type: 'array', items: { type: 'string' } }, communication: { type: 'string' }, suggested: { type: 'array', items: { type: 'string' } }, flagged: { type: 'boolean' } } },
    );
    const result: PersonalityResult = { ...r, strengths: r.strengths.slice(0, 5), suggested: r.suggested.slice(0, 6), traits };
    const { error: upErr } = await supabase.from('profiles').update({ personality: result as never, moderation: r.flagged ? 'review' : p.moderation, onboarded: true }).eq('id', userId);
    if (upErr) throw new Error('Nəticə yadda saxlanmadı.');
    await supabase.from('match_cache').delete().eq('user_id', userId);
    return result;
  });

export interface PersonMatch { id: string; score: number; reason: string; }

export const getMatches = createServerFn({ method: 'POST' })
  .middleware([requireSupabaseAuth])
  .inputValidator((d: { refresh?: boolean }) => ({ refresh: !!d?.refresh }))
  .handler(async ({ context, data }) => {
    const { supabase, userId } = context;
    if (!data.refresh) {
      const { data: cache } = await supabase.from('match_cache').select('*').eq('user_id', userId).maybeSingle();
      if (cache && Date.now() - new Date(cache.updated_at).getTime() < 24 * 3600 * 1000) return { people: cache.people as unknown as PersonMatch[], cached: true };
    }
    const { data: me } = await supabase.from('profiles').select('*').eq('id', userId).single();
    if (!me) throw new Error('Profil tapılmadı.');
    const { data: ids } = await supabase.rpc('match_candidates');
    const candidateIds = (ids ?? []) as unknown as string[];
    let people: PersonMatch[] = [];
    if (candidateIds.length) {
      const { data: cards } = await supabase.rpc('public_profile_cards', { _ids: candidateIds });
      const list = (cards ?? []).map(c => `${c.id} | ${c.first_name} | ${c.city} | ${statusLabel(c.status)} ${c.university ?? c.school_name ?? c.work_field ?? ''} ${c.faculty ?? ''} | maraqlar: ${(c.interests ?? []).join(', ')} | məqsəd: ${(c.goals ?? []).join(', ')} | dillər: ${JSON.stringify(c.languages)} | tip: ${c.personality_type ?? '-'} ${c.personality_summary ?? ''}`).join('\n');
      const pers = me.personality as { type?: string; summary?: string } | null;
      const meText = `${me.city} | ${statusLabel(me.status)} ${me.university ?? me.school_name ?? me.work_field ?? ''} ${me.faculty ?? ''} | maraqlar: ${me.interests.join(', ')} | məqsəd: ${me.goals.join(', ')} | dillər: ${JSON.stringify(me.languages)} | tip: ${pers?.type ?? '-'} ${pers?.summary ?? ''}`;
      const r = await aiJson<{ items: PersonMatch[] }>(
        `Sən sosial tanışlıq tətbiqi üçün uyğunluq mütəxəssisisən. İstifadəçini hər namizədlə müqayisə et və 0-100 uyğunluq balı ver. Eyni universitet/məktəb, şəhər, ortaq maraqlar, ortaq dil, oxşar məqsədlər və şəxsiyyət uyğunluğunu nəzərə al. reason: istifadəçiyə müraciətlə 1-2 cümlə konkret izah (məs. "İkiniz də ... tələbəsisiniz və ... sevirsiniz"). ${AZ} Yalnız verilən id-lərdən istifadə et.`,
        `MƏN: ${meText}\nNAMİZƏDLƏR:\n${list}`, 'matches',
        { type: 'object', additionalProperties: false, required: ['items'], properties: { items: { type: 'array', items: { type: 'object', additionalProperties: false, required: ['id','score','reason'], properties: { id: { type: 'string' }, score: { type: 'number' }, reason: { type: 'string' } } } } } },
      );
      people = r.items.filter(i => candidateIds.includes(i.id)).map(i => ({ ...i, score: Math.max(0, Math.min(100, Math.round(i.score))) })).sort((a, b) => b.score - a.score);
    }
    await supabase.from('match_cache').upsert({ user_id: userId, people: people as never, updated_at: new Date().toISOString() });
    return { people, cached: false };
  });

export const deleteAccount = createServerFn({ method: 'POST' })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    const { supabaseAdmin } = await import('@/integrations/supabase/client.server');
    const { error } = await supabaseAdmin.auth.admin.deleteUser(context.userId);
    if (error) throw new Error('Hesab silinmədi.');
    return { ok: true };
  });
