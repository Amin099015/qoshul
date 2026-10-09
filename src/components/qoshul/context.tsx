import { createContext, useContext, useMemo, useState, type ReactNode } from 'react';
import { initialEvents, type QoshulEvent } from '@/lib/qoshul/data';
import { canJoin, distanceKm, XP_REWARDS } from '@/lib/qoshul/rules';
import { findCity } from '@/lib/qoshul/cities';
interface AppState {
 events: QoshulEvent[]; cityEvents: QoshulEvent[]; joined: string[]; saved: string[]; xp: number;
 join: (id:string)=>void; toggleSave:(id:string)=>void; addEvent:(event:QoshulEvent,partner?:boolean)=>void;
 profileName: string; setProfileName:(name:string)=>void;
 city: string; setCity:(c:string)=>void; myPos: {lat:number;lng:number}|null; setMyPos:(p:{lat:number;lng:number}|null)=>void;
}
const Context = createContext<AppState | undefined>(undefined);
export function QoshulProvider({children}:{children:ReactNode}) {
 const [rawEvents,setEvents]=useState(initialEvents);
 const [joined,setJoined]=useState<string[]>([]);
 const [saved,setSaved]=useState<string[]>([]);
 const [xp,setXp]=useState(420);
 const [profileName,setProfileName]=useState('Amin Nuriyev');
 const [city,setCityState]=useState('Bakı');
 const [myPos,setMyPos]=useState<{lat:number;lng:number}|null>(null);
 const origin=myPos ?? findCity(city);
 const events=useMemo(()=>rawEvents.map(e=>({...e,distance:distanceKm(origin,e)})),[rawEvents,origin.lat,origin.lng]);
 const cityEvents=useMemo(()=>events.filter(e=>e.city===city),[events,city]);
 function setCity(c:string){setCityState(c);setMyPos(null);}
 function join(id:string) {
  const event=rawEvents.find(e=>e.id===id);
  if (!event || !canJoin(event.participants,event.capacity,joined.includes(id))) return;
  setJoined(prev=>[...prev,id]);
  setEvents(prev=>prev.map(e=>e.id===id?{...e,participants:e.participants+1}:e));
  setXp(prev=>prev+XP_REWARDS.participation);
 }
 function addEvent(event:QoshulEvent,partner=false) {
  setEvents(prev=>[event,...prev]);setJoined(prev=>[...prev,event.id]);
  setXp(prev=>prev+(partner?XP_REWARDS.partnerHosting:XP_REWARDS.hosting));
 }
 return <Context.Provider value={{events,cityEvents,joined,saved,xp,join,toggleSave:(id)=>setSaved(prev=>prev.includes(id)?prev.filter(x=>x!==id):[...prev,id]),addEvent,profileName,setProfileName,city,setCity,myPos,setMyPos}}>{children}</Context.Provider>;
}
export function useQoshul(){ const value=useContext(Context);if(!value)throw new Error('QoshulProvider is required');return value; }
