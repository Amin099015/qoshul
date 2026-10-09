import { createContext, useContext, useState, type ReactNode } from 'react';
import { initialEvents, type QoshulEvent } from '@/lib/qoshul/data';
import { canJoin, XP_REWARDS } from '@/lib/qoshul/rules';
interface AppState {
 events: QoshulEvent[]; joined: string[]; saved: string[]; xp: number;
 join: (id:string)=>void; toggleSave:(id:string)=>void; addEvent:(event:QoshulEvent,partner?:boolean)=>void;
 profileName: string; setProfileName:(name:string)=>void;
}
const Context = createContext<AppState | undefined>(undefined);
export function QoshulProvider({children}:{children:ReactNode}) {
 const [events,setEvents]=useState(initialEvents);
 const [joined,setJoined]=useState<string[]>([]);
 const [saved,setSaved]=useState<string[]>([]);
 const [xp,setXp]=useState(420);
 const [profileName,setProfileName]=useState('Amin Nuriyev');
 function join(id:string) {
  const event=events.find(e=>e.id===id);
  if (!event || !canJoin(event.participants,event.capacity,joined.includes(id))) return;
  setJoined(prev=>[...prev,id]);
  setEvents(prev=>prev.map(e=>e.id===id?{...e,participants:e.participants+1}:e));
  setXp(prev=>prev+XP_REWARDS.participation);
 }
 function addEvent(event:QoshulEvent,partner=false) {
  setEvents(prev=>[event,...prev]);setJoined(prev=>[...prev,event.id]);
  setXp(prev=>prev+(partner?XP_REWARDS.partnerHosting:XP_REWARDS.hosting));
 }
 return <Context.Provider value={{events,joined,saved,xp,join,toggleSave:(id)=>setSaved(prev=>prev.includes(id)?prev.filter(x=>x!==id):[...prev,id]),addEvent,profileName,setProfileName}}>{children}</Context.Provider>;
}
export function useQoshul(){ const value=useContext(Context);if(!value)throw new Error('QoshulProvider is required');return value; }
