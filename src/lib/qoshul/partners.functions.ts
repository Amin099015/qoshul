import { createServerFn } from '@tanstack/react-start';
import { z } from 'zod';
import { requireSupabaseAuth } from '@/integrations/supabase/auth-middleware';

export const partnerInput = z.object({
  name: z.string().trim().min(2).max(80),
  voen: z.string().regex(/^\d{10}$/, 'VÖEN 10 rəqəmdən ibarət olmalıdır.'),
  categories: z.array(z.string().max(80)).min(1).max(10),
  city: z.string().min(1),
  address: z.string().trim().min(3).max(300),
  lat: z.number().min(-90).max(90),
  lng: z.number().min(-180).max(180),
  phone: z.string().trim().max(30).default(''),
  hours: z.string().trim().max(120).default(''),
  deal: z.string().trim().max(200).default(''),
  description: z.string().trim().max(2000).default(''),
});

export const registerPartner = createServerFn({ method: 'POST' })
  .middleware([requireSupabaseAuth])
  .inputValidator(d => partnerInput.parse(d))
  .handler(async ({ data, context }) => {
    const { data: existing } = await context.supabase.from('partners').select('id').eq('owner_id', context.userId).maybeSingle();
    if (existing) throw new Error('Sənin artıq qeydiyyatdan keçmiş məkanın var.');
    const { error } = await context.supabase.from('partners').insert({
      owner_id: context.userId, name: data.name, voen: data.voen, categories: data.categories,
      city: data.city, address: data.address, lat: data.lat, lng: data.lng,
      phone: data.phone, hours: data.hours, deal: data.deal, description: data.description,
    });
    if (error) throw new Error(error.message);
    return { ok: true };
  });

export const myPartner = createServerFn({ method: 'GET' })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    const { data: partner } = await context.supabase.from('partners').select('*').eq('owner_id', context.userId).maybeSingle();
    if (!partner) return { partner: null, reservations: [], events: [], reviews: [] };
    const [r, e, v] = await Promise.all([
      context.supabase.from('reservations').select('*').eq('partner_id', partner.id).order('created_at', { ascending: false }),
      context.supabase.from('events').select('id,title,starts_on,start_time,capacity,created_at').eq('partner_id', partner.id).order('created_at', { ascending: false }),
      context.supabase.from('reviews').select('rating,comment,created_at,event_id').in('event_id',
        (await context.supabase.from('events').select('id').eq('partner_id', partner.id)).data?.map(x => x.id) ?? ['00000000-0000-0000-0000-000000000000']),
    ]);
    return { partner, reservations: r.data ?? [], events: e.data ?? [], reviews: v.data ?? [] };
  });

export const answerReservation = createServerFn({ method: 'POST' })
  .middleware([requireSupabaseAuth])
  .inputValidator(d => z.object({ id: z.string().uuid(), status: z.enum(['confirmed', 'declined']) }).parse(d))
  .handler(async ({ data, context }) => {
    const { error } = await context.supabase.from('reservations').update({ status: data.status }).eq('id', data.id);
    if (error) throw new Error(error.message);
    return { ok: true };
  });

export const listPartners = createServerFn({ method: 'GET' }).handler(async () => {
  const { createClient } = await import('@supabase/supabase-js');
  const url = process.env['SUPABASE_URL']; const key = process.env['SUPABASE_PUBLISHABLE_KEY'];
  if (!url || !key) throw new Error('Məlumat xidməti qurulmayıb.');
  const db = createClient(url, key, { auth: { persistSession: false }, global: { fetch: (input, init) => { const h = new Headers(init?.headers); if (key.startsWith('sb_') && h.get('Authorization') === `Bearer ${key}`) h.delete('Authorization'); h.set('apikey', key); return fetch(input, { ...init, headers: h }); } } });
  const { data, error } = await db.from('partners').select('id,name,categories,city,address,lat,lng,phone,hours,deal,description,image').eq('status', 'approved');
  if (error) throw error;
  return data ?? [];
});
