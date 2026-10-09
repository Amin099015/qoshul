import { allCategories } from './categories';

const GATEWAY = 'https://ai.gateway.lovable.dev/v1/responses';
const MODEL = 'openai/gpt-6-astra';

type Msg = { role: 'user' | 'assistant'; content: string };
type Body =
  | { mode: 'chat'; city: string; events: string; messages: Msg[] }
  | { mode: 'suggest'; city: string; idea: string }
  | { mode: 'recommend'; city: string; interests: string[]; events: { id: string; title: string; category: string }[] };

const AZ = 'Həmişə qrammatik cəhətdən düzgün, təbii Azərbaycan dilində cavab ver. Emoji istifadə etmə.';

function errorText(status: number, message: string) {
  if (status === 402) return 'AI kreditləri bitib. İş sahəsinin hesabına kredit əlavə edilməlidir.';
  if (status === 429) return 'Çox sayda sorğu göndərildi. Bir az sonra yenidən cəhd et.';
  if (status === 403) return message || 'AI xidmətinə giriş məhdudlaşdırılıb.';
  return message || 'AI xidməti hazırda cavab vermir.';
}

function buildRequest(body: Body) {
  if (body.mode === 'chat') {
    return {
      instructions: `Sən Qoshul.az tətbiqinin köməkçisisən. İstifadəçilərə Azərbaycanda tədbir tapmağa və yaratmağa kömək edirsən. ${AZ} Qısa və konkret ol. Markdown işarələri (**, #) istifadə etmə; siyahını hər bəndi yeni sətirdə "• " ilə yaz. Yalnız aşağıdakı siyahıdakı tədbirləri tövsiyə et, uydurma tədbir adı vermə. İstifadəçinin seçdiyi şəhər: ${body.city}.\nMövcud tədbirlər:\n${body.events.slice(0, 12000)}`,
      input: body.messages.slice(-12).map(m => ({ role: m.role, content: m.content.slice(0, 2000) })),
    };
  }
  if (body.mode === 'suggest') {
    return {
      instructions: `Sən tədbir planlaşdırma köməkçisisən. İstifadəçinin qısa fikrinə əsasən ${body.city} şəhərində gənclər üçün tədbir təklif et. ${AZ} Başlıq 60 simvoldan qısa, təsvir 2-3 cümlə olsun. Kateqoriya mütləq bu siyahıdan biri olsun: ${allCategories.join(', ')}. Saat HH:MM formatında olsun.`,
      input: [{ role: 'user', content: body.idea.slice(0, 1000) }],
      text: { format: { type: 'json_schema', name: 'event_suggestion', strict: true, schema: {
        type: 'object', additionalProperties: false, required: ['title', 'description', 'category', 'time', 'capacity'],
        properties: { title: { type: 'string' }, description: { type: 'string' }, category: { type: 'string' }, time: { type: 'string' }, capacity: { type: 'number' } },
      } } },
    };
  }
  return {
    instructions: `İstifadəçinin maraqlarına görə ${body.city} şəhərindəki tədbirlərdən ən uyğun 3-ünü seç və hər biri üçün bir cümləlik "niyə uyğundur" izahı yaz. ${AZ} Yalnız verilən id-lərdən istifadə et.`,
    input: [{ role: 'user', content: `Maraqlarım: ${body.interests.join(', ')}\nTədbirlər:\n${body.events.slice(0, 60).map(e => `${e.id} | ${e.title} | ${e.category}`).join('\n')}` }],
    text: { format: { type: 'json_schema', name: 'recommendations', strict: true, schema: {
      type: 'object', additionalProperties: false, required: ['items'],
      properties: { items: { type: 'array', items: { type: 'object', additionalProperties: false, required: ['id', 'reason'], properties: { id: { type: 'string' }, reason: { type: 'string' } } } } },
    } } },
  };
}

/** Streams plain-text deltas from the gateway's Responses SSE stream. */
export async function handleAi(request: Request) {
  const apiKey = process.env['LOVABLE_API_KEY'];
  if (!apiKey) return Response.json({ error: 'AI xidməti qurulmayıb.' }, { status: 500 });
  let body: Body;
  try { body = await request.json(); } catch { return Response.json({ error: 'Yanlış sorğu.' }, { status: 400 }); }
  if (!body || !['chat', 'suggest', 'recommend'].includes((body as Body).mode)) return Response.json({ error: 'Yanlış sorğu.' }, { status: 400 });

  let upstream: Response;
  try {
    upstream = await fetch(GATEWAY, {
      method: 'POST', signal: request.signal,
      headers: { 'Content-Type': 'application/json', 'Lovable-API-Key': apiKey, 'X-Lovable-AIG-SDK': 'fetch' },
      body: JSON.stringify({ model: MODEL, stream: true, store: false, reasoning: { effort: 'low' }, ...buildRequest(body) }),
    });
  } catch (e) {
    if (request.signal.aborted) return new Response(null, { status: 499 });
    throw e;
  }
  if (!upstream.ok || !upstream.body) {
    let message = '';
    try { const j = await upstream.json() as { error?: { message?: string } | string; message?: string }; message = typeof j.error === 'string' ? j.error : j.error?.message ?? j.message ?? ''; } catch { /* ignore */ }
    return Response.json({ error: errorText(upstream.status, message) }, { status: upstream.status });
  }

  const decoder = new TextDecoder(); const encoder = new TextEncoder(); let buffer = '';
  const out = upstream.body.pipeThrough(new TransformStream<Uint8Array, Uint8Array>({
    transform(chunk, controller) {
      buffer += decoder.decode(chunk, { stream: true });
      const frames = buffer.split('\n\n'); buffer = frames.pop() ?? '';
      for (const frame of frames) {
        const data = frame.split('\n').filter(l => l.startsWith('data:')).map(l => l.slice(5).trim()).join('');
        if (!data || data === '[DONE]') continue;
        try {
          const ev = JSON.parse(data) as { type?: string; delta?: string; response?: { error?: { message?: string } } };
          if (ev.type === 'response.output_text.delta' && ev.delta) controller.enqueue(encoder.encode(ev.delta));
          if (ev.type === 'response.failed' || ev.type === 'error') controller.enqueue(encoder.encode('\n[AI xətası baş verdi]'));
        } catch { /* partial */ }
      }
    },
  }));
  return new Response(out, { headers: { 'Content-Type': 'text/plain; charset=utf-8', 'Cache-Control': 'no-cache, no-transform' } });
}
