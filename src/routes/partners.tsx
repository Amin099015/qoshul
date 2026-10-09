import { createFileRoute } from '@tanstack/react-router';
import { PartnersScreen } from '@/components/qoshul/screens';
export const Route = createFileRoute('/partners')({
  head: () => ({meta:[{title:'Tərəfdaş məkanlar — Qoshul.az'},{name:'description',content:'Bakıda görüşlər üçün tərəfdaş məkanlar və xüsusi fürsətlər.'},{property:'og:title',content:'Tərəfdaş məkanlar — Qoshul.az'},{property:'og:description',content:'Sevdiyin məkanlarda birlikdə görüş.'},{property:'og:type',content:'website'},{name:'twitter:card',content:'summary_large_image'}]}),
  component: PartnersScreen,
});