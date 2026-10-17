import { createFileRoute, Link } from '@tanstack/react-router';
import { ChevronLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';

export const Route = createFileRoute('/privacy')({
  head: () => ({ meta: [{ title: 'Məxfilik siyasəti — Qoshul.az' }, { name: 'description', content: 'Qoshul.az-da şəxsi məlumatlarınızın qorunması qaydaları.' }, { property: 'og:title', content: 'Məxfilik siyasəti — Qoshul.az' }, { property: 'og:description', content: 'Məlumatlarınız necə qorunur.' }, { property: 'og:type', content: 'website' }, { name: 'twitter:card', content: 'summary' }] }),
  component: Privacy,
});

function Privacy() {
  return <div className="app-shell"><main className="page-content" style={{ maxWidth: 560, margin: '0 auto' }}>
    <Button asChild variant="ghost" className="p-0 mb-3"><Link to="/"><ChevronLeft />Geri</Link></Button>
    <div className="view-heading"><h1>Məxfilik siyasəti</h1><p className="subtitle">Məlumatların bizim üçün vacibdir.</p></div>
    <div className="dialog-body" style={{ display: 'grid', gap: 12 }}>
      <p><strong>Toplanan məlumatlar.</strong> Qeydiyyat zamanı ad, e-poçt, doğum tarixi, şəhər, təhsil və iş məlumatları, maraqlar və şəxsiyyət testi cavabları toplanır.</p>
      <p><strong>İstifadə.</strong> Məlumatlar yalnız sənə uyğun insanlar və tədbirlər tapmaq, AI qiymətləndirməsi aparmaq üçün istifadə olunur.</p>
      <p><strong>Görünürlük.</strong> Doğum tarixin heç vaxt başqalarına göstərilmir. Təhsil və iş məlumatlarını profil ayarlarından gizlədə bilərsən. Soyadının yalnız ilk hərfi göstərilir.</p>
      <p><strong>Paylaşım.</strong> Məlumatların üçüncü tərəflərlə satılmır və paylaşılmır.</p>
      <p><strong>Silinmə.</strong> Hesabını istənilən vaxt Ayarlar bölməsindən birdəfəlik silə bilərsən; bütün məlumatların silinir.</p>
    </div>
  </main></div>;
}
