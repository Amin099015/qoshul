import { Link, useLocation } from '@tanstack/react-router';
import { Bell, Bot, ChevronDown, Compass, Home, Loader2, MapPin, MessageCircle, Plus, Search, ShieldCheck, User, Link2, Wand2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { useCallback, useState, type ReactNode } from 'react';
import { useQoshul } from './context';
import { coffee, friends, padel, tech, type Level } from '@/lib/qoshul/data';
import { cities, findCity } from '@/lib/qoshul/cities';
import { allCategories, categoryGroups, groupOf } from '@/lib/qoshul/categories';
import { LazyMap } from './lazy-map';
import { streamAi } from './ai-client';
const nav=[{to:'/' as const,label:'Ana səhifə',icon:Home},{to:'/explore' as const,label:'Kəşf et',icon:Compass},{to:'/chats' as const,label:'Söhbətlər',icon:MessageCircle},{to:'/profile' as const,label:'Profil',icon:User}];
const imageFor=(cat:string)=>{const g=groupOf(cat);return g==='İdman'||g==='Təbiət'?padel:g==='Texnologiya'||g==='Təhsil'||g==='Biznes və karyera'?tech:g==='Yemək və içki'?coffee:friends;};

export function CreateEventDialog({open,onOpenChange,partner=false}:{open:boolean;onOpenChange:(open:boolean)=>void;partner?:boolean}) {
 const {addEvent,profileName,city:currentCity}=useQoshul();
 const [city,setCity]=useState(partner?'Bakı':currentCity);
 const [pos,setPos]=useState<{lat:number;lng:number}|null>(null);
 const [category,setCategory]=useState('Qəhvə');const [custom,setCustom]=useState('');
 const [paid,setPaid]=useState(false);const [format,setFormat]=useState<'Oflayn'|'Onlayn'>('Oflayn');
 const [title,setTitle]=useState('');const [description,setDescription]=useState('');const [time,setTime]=useState('');const [capacity,setCapacity]=useState(8);
 const [idea,setIdea]=useState('');const [aiBusy,setAiBusy]=useState(false);const [aiError,setAiError]=useState('');
 const c=findCity(city);const point=pos??{lat:c.lat,lng:c.lng};
 const onPick=useCallback((p:{lat:number;lng:number})=>setPos(p),[]);
 async function suggest(){
  if(!idea.trim())return;setAiBusy(true);setAiError('');
  try{const text=await streamAi({mode:'suggest',city,idea});const s=JSON.parse(text) as {title:string;description:string;category:string;time:string;capacity:number};
   setTitle(s.title.slice(0,65));setDescription(s.description);if(allCategories.includes(s.category))setCategory(s.category);if(/^\d\d:\d\d$/.test(s.time))setTime(s.time);if(s.capacity>=2&&s.capacity<=500)setCapacity(Math.round(s.capacity));}
  catch(e){setAiError(e instanceof Error?e.message:'AI təklifi alınmadı.');}finally{setAiBusy(false);}
 }
 return <Dialog open={open} onOpenChange={onOpenChange}><DialogContent className="qoshul-dialog"><DialogTitle>Birlikdə yeni plan quraq</DialogTitle><DialogDescription>İstədiyin formada tədbir yarat və maraqlarını bölüşən insanlarla tanış ol.</DialogDescription>
 <div className="ai-box"><label className="form-field"><span className="flex items-center gap-2"><Wand2 size={14}/>AI köməkçisi: fikrini qısa yaz</span><input className="form-input" value={idea} onChange={e=>setIdea(e.target.value)} placeholder="Məsələn, şənbə səhəri dağa yürüş"/></label><Button type="button" variant="secondary" className="w-full mt-2" disabled={aiBusy||!idea.trim()} onClick={suggest}>{aiBusy?<><Loader2 className="animate-spin"/>Hazırlanır...</>:<><Wand2/>Tədbiri AI ilə doldur</>}</Button>{aiError&&<p className="form-error" role="alert">{aiError}</p>}</div>
  <form onSubmit={e=>{e.preventDefault();const f=new FormData(e.currentTarget);const cat=category==='Digər'&&custom.trim()?custom.trim():category;const price=Number(f.get('price')||0);
   addEvent({title,category:cat,city,location:format==='Onlayn'?'Onlayn görüş':String(f.get('location')),lat:point.lat,lng:point.lng,date:String(f.get('date')),time,capacity,description,
    price:paid?price:0,ageLimit:String(f.get('age')||'Hamı üçün'),language:String(f.get('language')),level:String(f.get('level')),format,approval:f.get('approval')==='on',recurring:String(f.get('recurring')),tags:String(f.get('tags')||'').split(',').map(t=>t.trim()).filter(Boolean),partnerId:null});onOpenChange(false);}}>
 <label className="form-field">Tədbirin adı<input required maxLength={65} className="form-input" value={title} onChange={e=>setTitle(e.target.value)} placeholder="Məsələn, şənbə günü qəhvə görüşü"/></label>
 <label className="form-field">Kateqoriya<select className="form-input" value={category} onChange={e=>setCategory(e.target.value)}>{categoryGroups.map(g=><optgroup key={g.group} label={g.group}>{g.items.map(i=><option key={i}>{i}</option>)}</optgroup>)}</select></label>
 {category==='Digər'&&<label className="form-field">Öz kateqoriyanı yaz<input className="form-input" required value={custom} onChange={e=>setCustom(e.target.value)} maxLength={40}/></label>}
 <div className="grid grid-cols-2 gap-3"><label className="form-field">Format<select className="form-input" value={format} onChange={e=>setFormat(e.target.value as 'Oflayn'|'Onlayn')}><option>Oflayn</option><option>Onlayn</option></select></label>
 <label className="form-field">Şəhər<select className="form-input" value={city} onChange={e=>{setCity(e.target.value);setPos(null);}}>{cities.map(x=><option key={x.name}>{x.name}</option>)}</select></label></div>
 {format==='Oflayn'&&<><label className="form-field">Məkan və ünvan<input name="location" required className="form-input" defaultValue={partner?'Coffee Moffie, Nizami küçəsi':''} placeholder="Məkanın adı və ünvanı"/></label>
 <p className="form-hint"><MapPin size={12}/>Xəritədə toxunaraq dəqiq nöqtəni seç</p><LazyMap events={[]} center={point} me={point} zoom={13} onPick={onPick}/></>}
 <div className="grid grid-cols-2 gap-3"><label className="form-field">Tarix<input type="date" name="date" required className="form-input"/></label><label className="form-field">Saat<input type="time" required className="form-input" value={time} onChange={e=>setTime(e.target.value)}/></label></div>
 <div className="grid grid-cols-2 gap-3"><label className="form-field">İştirakçı sayı<input type="number" min={2} max={500} required value={capacity} onChange={e=>setCapacity(Number(e.target.value))} className="form-input"/></label>
 <label className="form-field">Təkrarlanma<select name="recurring" className="form-input"><option>Bir dəfəlik</option><option>Hər həftə</option><option>İki həftədən bir</option><option>Hər ay</option></select></label></div>
 <div className="grid grid-cols-2 gap-3"><label className="form-field">İştirak haqqı<select className="form-input" value={paid?'1':'0'} onChange={e=>setPaid(e.target.value==='1')}><option value="0">Pulsuz</option><option value="1">Ödənişli</option></select></label>
 {paid?<label className="form-field">Qiymət (AZN)<input type="number" name="price" min={1} required className="form-input"/></label>:<label className="form-field">Yaş həddi<select name="age" className="form-input"><option>Hamı üçün</option><option>16+</option><option>18+</option><option>18–25</option><option>25–35</option></select></label>}</div>
 <div className="grid grid-cols-2 gap-3"><label className="form-field">Ünsiyyət dili<select name="language" className="form-input"><option>Azərbaycan dili</option><option>İngilis dili</option><option>Rus dili</option><option>Türk dili</option><option>Qarışıq</option></select></label>
 <label className="form-field">Səviyyə<select name="level" className="form-input"><option>Hamı üçün</option><option>Başlanğıc</option><option>Orta</option><option>Peşəkar</option></select></label></div>
 <label className="form-field">Teqlər (vergüllə)<input name="tags" className="form-input" placeholder="tələbələr, açıq hava, pulsuz"/></label>
 <label className="flex items-center gap-3 text-sm mt-3"><input type="checkbox" name="approval"/>Qoşulma istəklərini özüm təsdiqləyim</label>
 <label className="form-field">Tədbir haqqında<textarea required className="form-input" value={description} onChange={e=>setDescription(e.target.value)} placeholder="Birlikdə nə edəcəyik?"/></label><Button type="submit" className="mt-5 w-full">Tədbir yarat <Plus/></Button></form></DialogContent></Dialog>;
}

function CityPicker({open,onOpenChange}:{open:boolean;onOpenChange:(o:boolean)=>void}){
 const {city,setCity,setMyPos}=useQoshul();const [q,setQ]=useState('');const [geoError,setGeoError]=useState('');
 const list=cities.filter(c=>c.name.toLocaleLowerCase('az').includes(q.toLocaleLowerCase('az')));
 return <Dialog open={open} onOpenChange={onOpenChange}><DialogContent className="qoshul-dialog"><DialogTitle>Şəhərini seç</DialogTitle><DialogDescription>Azərbaycanın {cities.length} şəhər və rayon mərkəzindən birini seç.</DialogDescription>
 <Button variant="secondary" onClick={()=>{if(!navigator.geolocation){setGeoError('Brauzerin yer təyinini dəstəkləmir.');return;}navigator.geolocation.getCurrentPosition(p=>{setMyPos({lat:p.coords.latitude,lng:p.coords.longitude});onOpenChange(false);},()=>setGeoError('Yerini təyin etmək mümkün olmadı. İcazəni yoxla.'));}}><MapPin/>Mənim yerimi istifadə et</Button>{geoError&&<p className="form-error">{geoError}</p>}
 <div className="search-bar"><Search/><input aria-label="Şəhər axtar" placeholder="Şəhər axtar..." value={q} onChange={e=>setQ(e.target.value)}/></div>
 <div className="city-list">{list.map(c=><button type="button" key={c.name} className={`city-item ${c.name===city?'active':''}`} onClick={()=>{setCity(c.name);onOpenChange(false);}}><strong>{c.name}</strong><span>{c.region}</span></button>)}{!list.length&&<p className="dialog-body">Şəhər tapılmadı.</p>}</div></DialogContent></Dialog>;
}

export function Shell({children}:{children:ReactNode}) {
 const path=useLocation().pathname;const [create,setCreate]=useState(false);const [notifications,setNotifications]=useState(false);const [location,setLocation]=useState(false);const {joined,city,myPos}=useQoshul();
 return <div className="app-shell"><header className="app-header"><Link to="/" className="wordmark"><Link2 className="brand-mark" strokeWidth={3}/>qoshul<span>.az</span></Link><div className="header-tools"><Button variant="ghost" className="location-button" onClick={()=>setLocation(true)}><MapPin size={13}/>{myPos?'Mənim yerim':city}<ChevronDown size={11}/></Button><Button asChild variant="ghost" size="icon" aria-label="AI köməkçi"><Link to="/assistant"><Bot/></Link></Button><Button variant="ghost" size="icon" className="notification-button" aria-label="Bildirişlər" onClick={()=>setNotifications(true)}><Bell/><i className="notification-dot"/></Button></div></header><main className="page-content">{children}</main><nav className="bottom-nav" aria-label="Əsas naviqasiya">{nav.map((n,i)=><span key={n.to} className="contents">{i===2&&<span className="nav-create-wrap"><Button size="icon" className="create-nav" aria-label="Tədbir yarat" onClick={()=>setCreate(true)}><Plus/></Button><span>Yarat</span></span>}<Link to={n.to} className={`nav-link ${path===n.to?'active':''}`}><n.icon/><span>{n.label}</span></Link></span>)}</nav><CreateEventDialog key={city} open={create} onOpenChange={setCreate}/><Dialog open={notifications} onOpenChange={setNotifications}><DialogContent className="qoshul-dialog"><DialogTitle>Bildirişlər</DialogTitle><DialogDescription>Yeni görüşlər, yeni imkanlar.</DialogDescription><div className="community-banner"><ShieldCheck className="text-primary"/><div><h3>Qoshul.az-a xoş gəlmisən!</h3><p>Şəhərindəki insanlarla tanış olmaq üçün ilk tədbirinə qoşul.</p></div></div>{joined.length>0&&<p className="dialog-body">{joined.length} tədbirə qoşulmusan. Qrup söhbətlərində iştirakçılarla tanış ola bilərsən.</p>}</DialogContent></Dialog><CityPicker open={location} onOpenChange={setLocation}/></div>;
}
