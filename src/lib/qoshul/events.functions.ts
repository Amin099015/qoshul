import { createServerFn } from '@tanstack/react-start';
import { createClient } from '@supabase/supabase-js';
import { requireSupabaseAuth } from '@/integrations/supabase/auth-middleware';
import type { Database } from '@/integrations/supabase/types';
import { eventInput } from './event-input';
import { z } from 'zod';
export const listEvents=createServerFn({method:'GET'}).handler(async()=>{
 const url=process.env['SUPABASE_URL']; const key=process.env['SUPABASE_PUBLISHABLE_KEY'];
 if(!url||!key)throw new Error('Məlumat xidməti qurulmayıb.');
 const db=createClient<Database>(url,key,{auth:{persistSession:false},global:{fetch:(input,init)=>{const h=new Headers(init?.headers);if(key.startsWith('sb_')&&h.get('Authorization')===`Bearer ${key}`)h.delete('Authorization');h.set('apikey',key);return fetch(input,{...init,headers:h});}}});
 const {data,error}=await db.from('events').select('*').order('created_at',{ascending:false}); if(error)throw error;
 const counts=await db.rpc('event_counts'); if(counts.error)throw counts.error;
 return {rows:data??[],counts:counts.data??[]};
});
export const createEvent=createServerFn({method:'POST'}).middleware([requireSupabaseAuth]).inputValidator(d=>eventInput.parse(d)).handler(async({data,context})=>{
 const {data:p}=await context.supabase.from('profiles').select('first_name,last_name').eq('id',context.userId).single();
 const {data:row,error}=await context.supabase.from('events').insert({created_by:context.userId,host_name:[p?.first_name,p?.last_name].filter(Boolean).join(' '),title:data.title,category:data.category,city:data.city,location:data.location,lat:data.lat,lng:data.lng,starts_on:data.date,start_time:data.time,capacity:data.capacity,description:data.description,price:data.price,age_limit:data.ageLimit,language:data.language,level:data.level,format:data.format,approval:data.approval,recurring:data.recurring,tags:data.tags,partner_id:data.partnerId,image:'friends'}).select('id').single();
 if(error)throw new Error(error.message);return row;
});
export const joinEvent=createServerFn({method:'POST'}).middleware([requireSupabaseAuth]).inputValidator(d=>z.object({id:z.string().uuid()}).parse(d)).handler(async({data,context})=>{
 const {error}=await context.supabase.from('event_participants').insert({event_id:data.id,user_id:context.userId});if(error&&error.code!=='23505')throw new Error(error.message);return {ok:true};
});
export const saveEvent=createServerFn({method:'POST'}).middleware([requireSupabaseAuth]).inputValidator(d=>z.object({id:z.string().uuid(),saved:z.boolean()}).parse(d)).handler(async({data,context})=>{
 const q=data.saved?context.supabase.from('saved_events').delete().eq('event_id',data.id).eq('user_id',context.userId):context.supabase.from('saved_events').insert({event_id:data.id,user_id:context.userId});const {error}=await q;if(error&&error.code!=='23505')throw new Error(error.message);return {ok:true};
});