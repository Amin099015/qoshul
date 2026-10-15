import { allCategories } from './categories';

const GATEWAY = 'https://ai.gateway.lovable.dev/v1/chat/completions';
export const AI_MODEL = 'google/gemini-3-flash-preview';

type Msg = { role: 'user' | 'assistant'; content: string };
type Body =
  | { mode: 'chat'; city: string; events: string; partners?: string; me?: string; messages: Msg[] }
  | { mode: 'suggest'; city: string; idea: string }
  | { mode: 'recommend'; city: string; interests: string[]; events: { id: string; title: string; category: string }[] };

const AZ = 'Həmişə qrammatik cəhətdən düzgün, təbii Azərbaycan dilində cavab ver. Emoji istifadə etmə.';

function errorText(status: number, message: string) {
  if (status === 402) return 'AI kreditləri bitib. İş sahəsinin hesabına kredit əlavə edilməlidir.';
  if (status === 429) return 'Çox sayda sorğu göndərildi. Bir az sonra yenidən cəhd et.';
  if (status === 403) return message || 'AI xidmətinə giriş məhdudlaşdırılıb.';
  return message || 'AI xidməti hazırda cavab vermir.';
}

type ChatReq = { messages: { role: 'system' | 'user' | 'assistant'; content: string }[]; response_format?: unknown };
const schemaFormat = (name: string, schema: Record<string, unknown>) => ({ type: 'json_schema', json_schema: { name, strict: true, schema } });

function buildRequest(body: Body): ChatReq {
  if (body.mode === 'chat') {
    const system = `Sən Qoshul.az tətbiqinin AI köməkçisisən — həm də gənclərlə işləyən mehriban, empatik psixoloq kimi davranırsan. ${AZ}
Məqsədin: istifadəçini tanımaq (əhvalı, maraqları, nədən çəkindiyi), ona uyğun insanlar və tədbirlər tövsiyə etmək, lazım olsa onun üçün tədbir yaratmaq.
Qaydalar:
- Qısa, isti və konkret ol. Lazım olanda bir açıq sual ver ki, onu daha yaxşı tanıyasan. Tibbi diaqnoz qoyma; ciddi çətinlik hiss etsən mütəxəssisə müraciəti tövsiyə et.
- Markdown işarələri (**, #) istifadə etmə; siyahını hər bəndi yeni sətirdə "• " ilə yaz.
- Yalnız aşağıdakı siyahıdakı tədbirləri və tərəfdaş məkanları tövsiyə et, uydurma ad vermə.
- Tədbir yaratmaq istəsə: əvvəl ad, kateqoriya, tarix (YYYY-MM-DD), saat (HH:MM), iştirakçı sayı və məkanı dəqiqləşdir, hər şeyin ideal olduğundan əmin ol və təsdiq istə. İstifadəçi açıq şəkildə təsdiq etdikdən SONRA cavabın sonunda ayrıca sətirdə bu formatda yaz:
[TƏDBİR]{"title":"...","category":"...","date":"YYYY-MM-DD","time":"HH:MM","capacity":8,"location":"...","description":"...","partner":"tərəfdaş məkanın adı və ya boş"}
Kateqoriya bu siyahıdan olmalıdır: ${allCategories.join(', ')}.
İstifadəçinin şəhəri: ${body.city}. Bu gün: ${new Date().toISOString().slice(0, 10)}.
İstifadəçi haqqında: ${(body.me ?? 'məlum deyil').slice(0, 2000)}
Tərəfdaş məkanlar:\n${(body.partners ?? '').slice(0, 4000)}
Mövcud tədbirlər:\n${body.events.slice(0, 10000)}`;
    return { messages: [{ role: 'system', content: system }, ...body.messages.slice(-14).map(m => ({ role: m.role, content: m.content.slice(0, 2000) }))] };
  }
  if (body.mode === 'suggest') {
    return {
      messages: [
        { role: 'system', content: `Sən tədbir planlaşdırma köməkçisisən. İstifadəçinin qısa fikrinə əsasən ${body.city} şəhərində gənclər üçün tədbir təklif et. ${AZ} Başlıq 60 simvoldan qısa, təsvir 2-3 cümlə olsun. Kateqoriya mütləq bu siyahıdan biri olsun: ${allCategories.join(', ')}. Saat HH:MM formatında olsun.` },
        { role: 'user', content: body.idea.slice(0, 1000) },
      ],
      response_format: schemaFormat('event_suggestion', { type: 'object', additionalProperties: false, required: ['title', 'description', 'category', 'time', 'capacity'], properties: { title: { type: 'string' }, description: { type: 'string' }, category: { type: 'string' }, time: { type: 'string' }, capacity: { type: 'number' } } }),
    };
  }
  return {
    messages: [
      { role: 'system', content: `İstifadəçinin maraqlarına görə ${body.city} şəhərindəki tədbirlərdən ən uyğun 3-ünü seç və hər biri üçün bir cümləlik "niyə uyğundur" izahı yaz. ${AZ} Yalnız verilən id-lərdən istifadə et.` },
      { role: 'user', content: `Maraqlarım: ${body.interests.join(', ')}\nTədbirlər:\n${body.events.slice(0, 60).map(e => `${e.id} | ${e.title} | ${e.category}`).join('\n')}` },
    ],
    response_format: schemaFormat('recommendations', { type: 'object', additionalProperties: false, required: ['items'], properties: { items: { type: 'array', items: { type: 'object', additionalProperties: false, required: ['id', 'reason'], properties: { id: { type: 'string' }, reason: { type: 'string' } } } } } }),
  };
}

async function callGateway(apiKey: string, req: ChatReq, signal?: AbortSignal) {
  return fetch(GATEWAY, {
    method: 'POST', signal: signal ?? null,
    headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${apiKey}`, 'X-Lovable-AIG-SDK': 'fetch' },
    body: JSON.stringify({ model: AI_MODEL, stream: true, ...req }),
  });
}

async function readError(res: Response) {
  let message = '';
  try { const j = await res.json() as { error?: { message?: string } | string; message?: string }; message = typeof j.error === 'string' ? j.error : j.error?.message ?? j.message ?? ''; } catch { /* ignore */ }
  return errorText(res.status, message);
}

/** Parses an SSE chunk buffer from chat completions; returns leftover buffer. */
function parseFrames(buffer: string, onText: (t: string) => void, onFail: () => void) {
  const frames = buffer.split('\n\n'); const rest = frames.pop() ?? '';
  for (const frame of frames) {
    const data = frame.split('\n').filter(l => l.startsWith('data:')).map(l => l.slice(5).trim()).join('');
    if (!data || data === '[DONE]') continue;
    try {
      const ev = JSON.parse(data) as { choices?: { delta?: { content?: string } }[]; error?: unknown };
      if (ev.error) onFail();
      const t = ev.choices?.[0]?.delta?.content; if (t) onText(t);
    } catch { /* partial */ }
  }
  return rest;
}

/** Streams plain-text deltas from the gateway. */
export async function handleAi(request: Request) {
  const apiKey = process.env['LOVABLE_API_KEY'];
  if (!apiKey) return Response.json({ error: 'AI xidməti qurulmayıb.' }, { status: 500 });
  const token = request.headers.get('authorization')?.replace(/^Bearer\s+/i, '');
  if (!token || !(await verifyUser(token))) return Response.json({ error: 'Davam etmək üçün daxil ol.' }, { status: 401 });
  let body: Body;
  try { body = await request.json(); } catch { return Response.json({ error: 'Yanlış sorğu.' }, { status: 400 }); }
  if (!body || !['chat', 'suggest', 'recommend'].includes((body as Body).mode)) return Response.json({ error: 'Yanlış sorğu.' }, { status: 400 });

  let upstream: Response;
  try { upstream = await callGateway(apiKey, buildRequest(body), request.signal); }
  catch (e) { if (request.signal.aborted) return new Response(null, { status: 499 }); throw e; }
  if (!upstream.ok || !upstream.body) return Response.json({ error: await readError(upstream) }, { status: upstream.status });

  const decoder = new TextDecoder(); const encoder = new TextEncoder(); let buffer = '';
  const out = upstream.body.pipeThrough(new TransformStream<Uint8Array, Uint8Array>({
    transform(chunk, controller) {
      buffer += decoder.decode(chunk, { stream: true });
      buffer = parseFrames(buffer, t => controller.enqueue(encoder.encode(t)), () => controller.enqueue(encoder.encode('\n[AI xətası baş verdi]')));
    },
  }));
  return new Response(out, { headers: { 'Content-Type': 'text/plain; charset=utf-8', 'Cache-Control': 'no-cache, no-transform' } });
}

async function verifyUser(token: string) {
  const url = process.env['SUPABASE_URL']; const key = process.env['SUPABASE_PUBLISHABLE_KEY'];
  if (!url || !key) return false;
  const r = await fetch(`${url}/auth/v1/user`, { headers: { apikey: key, Authorization: `Bearer ${token}` } });
  return r.ok;
}

/** Streams a call with a strict JSON schema and returns the parsed object. */
export async function aiJson<T>(instructions: string, input: string, name: string, schema: Record<string, unknown>): Promise<T> {
  const apiKey = process.env['LOVABLE_API_KEY'];
  if (!apiKey) throw new Error('AI xidməti qurulmayıb.');
  const res = await callGateway(apiKey, { messages: [{ role: 'system', content: instructions }, { role: 'user', content: input }], response_format: schemaFormat(name, schema) });
  if (!res.ok || !res.body) throw new Error(await readError(res));
  const reader = res.body.getReader(); const dec = new TextDecoder(); let buf = ''; let text = ''; let failed = false;
  for (;;) {
    const { done, value } = await reader.read(); if (done) break;
    buf += dec.decode(value, { stream: true });
    buf = parseFrames(buf, t => { text += t; }, () => { failed = true; });
  }
  if (failed || !text) throw new Error('AI cavabı alınmadı.');
  return JSON.parse(text.replace(/^```json\s*|```$/g, '').trim()) as T;
}
