import { ArrowUpRight, Bookmark, CalendarDays, Check, Coffee, MapPin, Sparkles, Trophy, Users } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { useState } from 'react';
import { Link } from '@tanstack/react-router';
import { useQoshul } from './context';
import { people, type QoshulEvent } from '@/lib/qoshul/data';
export function AvatarStack(){return <div className="avatar-stack">{people.slice(0,3).map(p=><img key={p.name} src={p.image} alt={p.name} loading="lazy" width={25} height={25}/>)}</div>}
export function EventCard({event,recommended=false}:{event:QoshulEvent;recommended?:boolean}) {
 const {joined,saved,toggleSave,join}=useQoshul();const [open,setOpen]=useState(false);
 const isJoined=joined.includes(event.id);const isFull=event.participants>=event.capacity;
 return <><article className="event-card">
  <div className="event-image"><img src={event.image} alt={event.title} loading="lazy" width={1024} height={768}/>
   {recommended&&<span className="match-badge"><Sparkles size={12}/>{event.match}% uyğunluq</span>}
   <Button variant="ghost" size="icon" className={`save-button ${saved.includes(event.id)?'saved':''}`} aria-label={saved.includes(event.id)?'Yaddaşdan sil':'Yadda saxla'} title="Yadda saxla" onClick={()=>toggleSave(event.id)}><Bookmark fill={saved.includes(event.id)?'currentColor':'none'}/></Button>
   <span className="distance-badge"><MapPin size={12}/>{event.distance} km yaxınlıqda</span>
  </div>
  <div className="event-info"><span className={`event-category ${event.category==='Qəhvə'?'food':''}`}>{event.category==='Qəhvə'?<Coffee size={11}/>:event.category==='İdman'?<Trophy size={11}/>:<Users size={11}/>} {event.category}</span>
   <Button variant="ghost" className="event-title" onClick={()=>setOpen(true)}>{event.title}</Button>
   <div className="event-meta"><MapPin/>{event.location}</div><div className="event-meta"><CalendarDays/>{event.date}, {event.time}</div>
   <div className="event-footer"><div><AvatarStack/><p className="spots">{event.participants} nəfər qoşulub · {event.capacity-event.participants} yer qalıb</p></div><Button className="join-button" variant={isJoined?'secondary':'default'} disabled={isFull&&!isJoined} onClick={()=>isJoined?setOpen(true):join(event.id)}>{isJoined?<><Check/>Qoşuldun</>:isFull?'Yer yoxdur':<>Qoşul<ArrowUpRight/></>}</Button></div>
   {recommended&&<p className="match-explanation"><Sparkles size={10}/>Maraqlarına əsaslanan nümunə tövsiyə</p>}
  </div>
 </article><Dialog open={open} onOpenChange={setOpen}><DialogContent className="qoshul-dialog"><img className="dialog-photo" src={event.image} alt={event.title}/><DialogTitle>{event.title}</DialogTitle><DialogDescription>{event.host} tərəfindən təşkil olunur</DialogDescription><p className="dialog-body">{event.description}</p><div className="detail-facts"><div className="event-meta"><CalendarDays/>{event.date}, {event.time}</div><div className="event-meta"><Users/>{event.capacity-event.participants} boş yer</div><div className="event-meta"><MapPin/>{event.location}</div><div className="event-meta"><Trophy/>+50 XP</div></div>{isJoined?<Button asChild><Link to="/chats">Qrup söhbətinə keç <ArrowUpRight/></Link></Button>:<Button disabled={isFull} onClick={()=>join(event.id)}>{isFull?'Yer yoxdur':'Tədbirə qoşul'}</Button>}</DialogContent></Dialog></>;
}
