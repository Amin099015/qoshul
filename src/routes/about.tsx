import { createFileRoute, Link } from '@tanstack/react-router';
import { ChevronLeft, Link2 } from 'lucide-react';
import { Button } from '@/components/ui/button';

export const Route = createFileRoute('/about')({
  head: () => ({ meta: [{ title: 'Haqqımızda — Qoshul.az' }, { name: 'description', content: 'Qoshul.az — Azərbaycanda yeni insanlarla tanışlıq və birlikdə tədbir platforması.' }, { property: 'og:title', content: 'Haqqımızda — Qoshul.az' }, { property: 'og:description', content: 'Yeni insanlara, yeni planlara qoşul.' }, { property: 'og:type', content: 'website' }, { name: 'twitter:card', content: 'summary' }] }),
  component: About,
});

function About() {
  return <div className="app-shell"><main className="page-content" style={{ maxWidth: 560, margin: '0 auto' }}>
    <Button asChild variant="ghost" className="p-0 mb-3"><Link to="/"><ChevronLeft />Geri</Link></Button>
    <div className="wordmark"><Link2 className="brand-mark" strokeWidth={3} />qoshul<span>.az</span></div>
    <div className="view-heading"><h1>Haqqımızda</h1><p className="subtitle">Yeni insanlara, yeni planlara qoşul.</p></div>
    <div className="dialog-body" style={{ display: 'grid', gap: 12 }}>
      <p>Qoshul.az — Azərbaycanda yaşayan gənclərin eyni maraqlar ətrafında bir araya gəlməsi üçün yaradılmış platformadır. Məqsədimiz şəhərində sənə yaxın insanları tapmağı və birlikdə vaxt keçirməyi asanlaşdırmaqdır.</p>
      <p>Tədbirlərə qoşul, öz tədbirini yarat, XP topla və AI köməkçisi ilə sənə ən uyğun insanları kəşf et.</p>
      <p>Tərəfdaş məkanlar üçün: biznes kimi qeydiyyatdan keçin, rezervasiyaları və müştəri axınını öz panelinizdən idarə edin.</p>
      <p>Dəstək əlaqə məlumatları təsdiqləndikdən sonra burada göstəriləcək.</p>
    </div>
  </main></div>;
}
