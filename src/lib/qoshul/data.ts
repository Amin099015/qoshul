import padel from '@/assets/padel.jpg';
import coffee from '@/assets/coffee.jpg';
import tech from '@/assets/tech.jpg';
import friends from '@/assets/friends-baku.jpg';
export { friends, padel, coffee, tech };
export interface QoshulEvent { id: string; title: string; category: string; image: string; location: string; distance: number; time: string; date: string; capacity: number; participants: number; match: number; host: string; description: string; }
export const initialEvents: QoshulEvent[] = [
  { id: 'padel', title: 'İşdən sonra padel oynayaq', category: 'İdman', image: padel, location: 'Baku Padel, Ağ Şəhər', distance: 1.2, time: '19:00', date: 'Bu gün', capacity: 8, participants: 6, match: 96, host: 'Rəşad Əliyev', description: 'Günü bir az hərəkət və yeni tanışlıqlarla bitirək! Təcrübən olmasa da, bizə qoşula bilərsən. Raketlər məkanda verilir. Rahat idman geyimi və xoş əhval-ruhiyyə kifayətdir.' },
  { id: 'coffee', title: 'Bir fincan qəhvə, yeni dostlar', category: 'Qəhvə', image: coffee, location: 'Coffee Moffie, Nizami', distance: .8, time: '18:30', date: 'Bu gün', capacity: 10, participants: 5, match: 92, host: 'Leyla Məmmədova', description: 'Qəhvə sevənlər üçün səmimi bir görüş. Hobbilərimizdən, şəhərdən və həyatın kiçik sevinclərindən danışacağıq. Hər kəs xoş gəlib!' },
  { id: 'tech', title: 'Texnologiya və yeni ideyalar', category: 'Texnologiya', image: tech, location: 'SABAH.HUB, Bakı', distance: 2.4, time: '14:00', date: 'Sabah', capacity: 16, participants: 11, match: 89, host: 'Orxan Həsənov', description: 'Süni intellekt, yeni layihələr və texnologiya haqqında rahat söhbət. Öz ideyanı gətir, yeni insanlarla tanış ol və birlikdə ilham tapaq.' },
  { id: 'walk', title: 'Bulvarda günbatımı gəzintisi', category: 'Mədəniyyət', image: friends, location: 'Dənizkənarı Milli Park', distance: 1.5, time: '17:30', date: 'Sabah', capacity: 12, participants: 7, match: 87, host: 'Nigar Quliyeva', description: 'Bakının gözəl günbatımını birlikdə izləyək. Yüngül gəzinti, yeni dostlar və maraqlı söhbətlər bizi gözləyir.' },
];
export const people = [
 {name:'Leyla',full:'Leyla Məmmədova',image:coffee,position:'16% 35%',interest:'Qəhvə · Səyahət',match:94},
 {name:'Rəşad',full:'Rəşad Əliyev',image:coffee,position:'47% 30%',interest:'İdman · Texnologiya',match:96},
 {name:'Nigar',full:'Nigar Quliyeva',image:friends,position:'38% 35%',interest:'Mədəniyyət · Musiqi',match:91},
 {name:'Orxan',full:'Orxan Həsənov',image:tech,position:'20% 42%',interest:'Kodlaşdırma · Şahmat',match:89},
 {name:'Aysel',full:'Aysel İsmayılova',image:friends,position:'88% 36%',interest:'Səyahət · Dizayn',match:93},
];
