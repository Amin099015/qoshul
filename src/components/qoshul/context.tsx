import { createContext, useContext, useEffect, useMemo, useState, type ReactNode } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { useServerFn } from '@tanstack/react-start';
import { coffee, friends, padel, tech, type Level, type QoshulEvent } from '@/lib/qoshul/data';
import { canJoin, distanceKm } from '@/lib/qoshul/rules';
import { findCity } from '@/lib/qoshul/cities';
import { supabase } from '@/integrations/supabase/client';
import { createEvent, joinEvent, listEvents, saveEvent } from '@/lib/qoshul/events.functions';
import type { z } from 'zod';
import type { eventInput } from '@/lib/qoshul/event-input';
export type NewEvent=z.input<typeof eventInput>;
interface AppState {
 events: QoshulEvent[]; cityEvents: QoshulEvent[]; joined: string[]; saved: string[]; xp: number;
 join: (id:string)=>Promise<void>; toggleSave:(id:string)=>Promise<void>; addEvent:(event:NewEvent)=>Promise<void>; signedIn:boolean;
 profileName: string; setProfileName:(name:string)=>void;
 city: string; setCity:(c:string)=>void; myPos: {lat:number;lng:number}|null; setMyPos:(p:{lat:number;lng:number}|null)=>void;
}
const Context = createContext<AppState | undefined>(undefined);
const imgs:Record<string,string>={padel,coffee,tech,friends};
const fmtDate=(d:string)=>{const t=new Date().toISOString().slice(0,10);return d===t?'Bu gün':d;};
export function QoshulProvider({children}:{children:ReactNode}) {
 const qc=useQueryClient();const list=useServerFn(listEvents),create=useServerFn(createEvent),joinFn=useServerFn(joinEvent),saveFn=useServerFn(saveEvent);
 const [uid,setUid]=useState<string|null>(null);
 useEffect(()=>{supabase.auth.getUser().then(r=>setUid(r.data.user?.id??null));const {data}=supabase.auth.onAuthStateChange((_e,s)=>setUid(s?.user.id??null));return()=>data.subscription.unsubscribe();},[]);
 const ev=useQuery({queryKey:['events'],queryFn:()=>list()});
 const mine=useQuery({queryKey:['my-events',uid],enabled:!!uid,queryFn:async()=>{if(!uid)return {joined:[],saved:[],profile:null};const [j,s,p]=await Promise.all([supabase.from('event_participants').select('event_id').eq('user_id',uid),supabase.from('saved_events').select('event_id').eq('user_id',uid),supabase.from('profiles').select('first_name,last_name,xp,city').eq('id',uid).maybeSingle()]);return {joined:(j.data??[]).map(x=>x.event_id),saved:(s.data??[]).map(x=>x.event_id),profile:p.data};}});
 const joined=mine.data?.joined??[];const saved=mine.data?.saved??[];const xp=mine.data?.profile?.xp??0;
 const [nameOverride,setProfileName]=useState('');const profileName=nameOverride||[mine.data?.profile?.first_name,mine.data?.profile?.last_name].filter(Boolean).join(' ')||'Qonaq';
 const [city,setCityState]=useState('Bakı');
 useEffect(()=>{const s=localStorage.getItem('qoshul-city');if(s)setCityState(s);else if(mine.data?.profile?.city)setCityState(mine.data.profile.city);},[mine.data?.profile?.city]);
 const [myPos,setMyPos]=useState<{lat:number;lng:number}|null>(null);
 const origin=myPos ?? findCity(city);
 const rawEvents=useMemo<QoshulEvent[]>(()=>{const c=new Map((ev.data?.counts??[]).map(x=>[x.event_id,Number(x.joined)]));return (ev.data?.rows??[]).map(r=>({id:r.id,title:r.title,category:r.category,image:imgs[r.image]??friends,city:r.city,location:r.location,lat:r.lat,lng:r.lng,distance:0,date:fmtDate(r.starts_on),time:r.start_time,capacity:r.capacity,participants:r.base_participants+(c.get(r.id)??0),match:85,host:r.host_name||'Qoshul',description:r.description,price:Number(r.price),ageLimit:r.age_limit,language:r.language,level:r.level as Level,format:r.format as 'Oflayn'|'Onlayn',approval:r.approval,recurring:r.recurring,tags:r.tags}));},[ev.data]);
 const events=useMemo(()=>rawEvents.map(e=>({...e,distance:distanceKm(origin,e)})),[rawEvents,origin.lat,origin.lng]);
 const cityEvents=useMemo(()=>events.filter(e=>e.city===city),[events,city]);
 function setCity(c:string){setCityState(c);localStorage.setItem('qoshul-city',c);setMyPos(null);}
 const refresh=()=>Promise.all([qc.invalidateQueries({queryKey:['events']}),qc.invalidateQueries({queryKey:['my-events']})]);
 function need(){if(!uid){window.location.href='/auth?redirect='+encodeURIComponent(location.pathname);return false;}return true;}
 async function join(id:string) {
  const event=rawEvents.find(e=>e.id===id);
  if (!need()||!event || !canJoin(event.participants,event.capacity,joined.includes(id))) return;
  try{await joinFn({data:{id}});}catch{alert('Tədbirə qoşulmaq alınmadı. Yer qalmamış ola bilər.');}await refresh();
 }
 async function addEvent(event:NewEvent){if(!need())return;await create({data:event});await refresh();}
 async function toggleSave(id:string){if(!need())return;await saveFn({data:{id,saved:saved.includes(id)}});await refresh();}
 return <Context.Provider value={{events,cityEvents,joined,saved,xp,join,toggleSave,addEvent,signedIn:!!uid,profileName,setProfileName,city,setCity,myPos,setMyPos}}>{children}</Context.Provider>;
}
export function useQoshul(){ const value=useContext(Context);if(!value)throw new Error('QoshulProvider is required');return value; }
