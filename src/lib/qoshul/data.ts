import padel from '@/assets/padel.jpg';
import coffee from '@/assets/coffee.jpg';
import tech from '@/assets/tech.jpg';
import friends from '@/assets/friends-baku.jpg';
import { cities } from './cities';
export { friends, padel, coffee, tech };
export type Level = 'Hamı üçün' | 'Başlanğıc' | 'Orta' | 'Peşəkar';
export interface QoshulEvent {
 id: string; title: string; category: string; image: string; city: string; location: string; lat: number; lng: number;
 distance: number; time: string; date: string; capacity: number; participants: number; match: number; host: string; description: string;
 price?: number; ageLimit?: string; language?: string; level?: Level; format?: 'Oflayn' | 'Onlayn'; approval?: boolean; recurring?: string; tags?: string[];
}
const baku = [
  { id: 'padel', title: 'İşdən sonra padel oynayaq', category: 'Padel', image: padel, location: 'Baku Padel, Ağ Şəhər', lat: 40.3786, lng: 49.8906, time: '19:00', date: 'Bu gün', capacity: 8, participants: 6, match: 96, host: 'Rəşad Əliyev', price: 15, level: 'Başlanğıc' as Level, description: 'Günü bir az hərəkət və yeni tanışlıqlarla bitirək! Təcrübən olmasa da, bizə qoşula bilərsən. Raketləri məkan verir. Rahat idman geyimi və xoş əhval-ruhiyyə kifayətdir.' },
  { id: 'coffee', title: 'Bir fincan qəhvə, yeni dostlar', category: 'Qəhvə', image: coffee, location: 'Coffee Moffie, Nizami küçəsi', lat: 40.3777, lng: 49.8432, time: '18:30', date: 'Bu gün', capacity: 10, participants: 5, match: 92, host: 'Leyla Məmmədova', description: 'Qəhvə sevənlər üçün səmimi görüş. Hobbilərimizdən, şəhərdən və həyatın kiçik sevinclərindən danışacağıq. Hər kəsi gözləyirik!' },
  { id: 'tech', title: 'Süni intellekt və yeni ideyalar', category: 'Süni intellekt', image: tech, location: 'SABAH.HUB, Bakı', lat: 40.3725, lng: 49.8533, time: '14:00', date: 'Sabah', capacity: 16, participants: 11, match: 89, host: 'Orxan Həsənov', description: 'Süni intellekt, yeni layihələr və texnologiya haqqında rahat söhbət. Öz ideyanı gətir, yeni insanlarla tanış ol və birlikdə ilham tapaq.' },
  { id: 'walk', title: 'Bulvarda günbatımı gəzintisi', category: 'Şəhər turu', image: friends, location: 'Dənizkənarı Milli Park', lat: 40.3667, lng: 49.8458, time: '17:30', date: 'Sabah', capacity: 12, participants: 7, match: 87, host: 'Nigar Quliyeva', description: 'Bakının gözəl günbatımını birlikdə izləyək. Yüngül gəzinti, yeni dostlar və maraqlı söhbətlər bizi gözləyir.' },
];
const templates = [
  { title: (c: string) => `${c}da qəhvə və tanışlıq`, category: 'Qəhvə', image: coffee, place: 'Mərkəzi kafe', time: '18:00', date: 'Bu gün', host: 'Aysel İsmayılova', description: 'Şəhərin gənclərini bir masa ətrafında toplayırıq. Səmimi söhbət, yeni dostlar və isti qəhvə.' },
  { title: (c: string) => `${c} gəncləri ilə futbol`, category: 'Futbol', image: padel, place: 'Şəhər stadionu', time: '19:30', date: 'Sabah', host: 'Rəşad Əliyev', description: 'Mini futbol oyunu üçün komanda yığırıq. Səviyyə önəmli deyil, əsas olan hərəkət və əyləncədir.' },
  { title: (c: string) => `${c}da stolüstü oyunlar axşamı`, category: 'Stolüstü oyunlar', image: friends, place: 'Gənclər evi', time: '17:00', date: 'Şənbə', host: 'Nigar Quliyeva', description: 'Mafiya, nərd və digər oyunlarla dolu axşam. Oyunları biz gətiririk, sən isə dostlarını.' },
];
const otherCities = cities.filter(c => c.name !== 'Bakı');
export const initialEvents: QoshulEvent[] = [
  ...baku.map(e => ({ ...e, city: 'Bakı', distance: 0 })),
  ...otherCities.flatMap((c, ci) => [templates[ci % 3]!, templates[(ci + 1) % 3]!].map((t, ti) => ({
    id: `${c.name}-${ti}`, title: t.title(c.name), category: t.category, image: t.image, city: c.name, location: `${t.place}, ${c.name}`,
    lat: c.lat + (ti ? 0.004 : -0.003), lng: c.lng + (ti ? -0.004 : 0.003), distance: 0, time: t.time, date: t.date,
    capacity: 10 + ti * 4, participants: 3 + ((ci + ti) % 5), match: 80 + ((ci * 7 + ti) % 18), host: t.host, description: t.description,
  }))),
];
export const people = [
 {name:'Leyla',full:'Leyla Məmmədova',image:coffee,position:'16% 35%',interest:'Qəhvə · Səyahət',match:94},
 {name:'Rəşad',full:'Rəşad Əliyev',image:coffee,position:'47% 30%',interest:'İdman · Texnologiya',match:96},
 {name:'Nigar',full:'Nigar Quliyeva',image:friends,position:'38% 35%',interest:'Mədəniyyət · Musiqi',match:91},
 {name:'Orxan',full:'Orxan Həsənov',image:tech,position:'20% 42%',interest:'Kodlaşdırma · Şahmat',match:89},
 {name:'Aysel',full:'Aysel İsmayılova',image:friends,position:'88% 36%',interest:'Səyahət · Dizayn',match:93},
];
export const profileInterests = ['Texnologiya','İdman','Qəhvə','Səyahət','Musiqi'];
