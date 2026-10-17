import { createFileRoute, Link } from '@tanstack/react-router';
import { ChevronLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';

export const Route = createFileRoute('/terms')({
  head: () => ({ meta: [{ title: 'İstifadə şərtləri — Qoshul.az' }, { name: 'description', content: 'Qoshul.az platformasının istifadə qaydaları.' }, { property: 'og:title', content: 'İstifadə şərtləri — Qoshul.az' }, { property: 'og:description', content: 'Platformanın istifadə qaydaları.' }, { property: 'og:type', content: 'website' }, { name: 'twitter:card', content: 'summary' }] }),
  component: Terms,
});

function Terms() {
  return <div className="app-shell"><main className="page-content" style={{ maxWidth: 560, margin: '0 auto' }}>
    <Button asChild variant="ghost" className="p-0 mb-3"><Link to="/"><ChevronLeft />Geri</Link></Button>
    <div className="view-heading"><h1>İstifadə şərtləri</h1><p className="subtitle">Birlikdə daha güvənli mühit üçün qaydalar.</p></div>
    <div className="dialog-body" style={{ display: 'grid', gap: 12 }}>
      <p><strong>Yaş həddi.</strong> Platformadan 16 yaşından böyük istifadəçilər istifadə edə bilər. 18 yaşından kiçik istifadəçilər yalnız yaş həddi olmayan tədbirləri görür.</p>
      <p><strong>Davranış.</strong> Digər istifadəçilərə hörmətlə yanaş. Təhqir, təcavüzkar davranış və saxta məlumat hesabın silinməsi ilə nəticələnə bilər.</p>
      <p><strong>Tədbirlər.</strong> Tədbir təşkilatçısı öz tədbirinin məzmununa görə məsuliyyət daşıyır. Qanunsuz fəaliyyət qadağandır.</p>
      <p><strong>Tərəfdaşlar.</strong> Biznes hesabları düzgün VÖEN və real məkan məlumatı təqdim etməlidir; saxta məlumat təsdiqdən keçmir.</p>
      <p><strong>Məsuliyyət.</strong> Qoshul.az istifadəçilər arasında baş verən görüşlərin məzmununa görə məsuliyyət daşımır; öz təhlükəsizliyini öncədən düşün.</p>
    </div>
  </main></div>;
}
