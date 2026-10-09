import { createFileRoute } from '@tanstack/react-router';
import { ExploreScreen } from '@/components/qoshul/screens';
export const Route = createFileRoute('/explore')({
  validateSearch: (search: Record<string, unknown>): { view?: string } => ({ view: typeof search['view'] === 'string' ? search['view'] : 'nearby' }),
  head: () => ({meta:[{title:'Kəşf et — Qoshul.az'},{name:'description',content:'Yaxınlıqdakı görüşləri və ortaq maraqları olan insanları kəşf et.'},{property:'og:title',content:'Kəşf et — Qoshul.az'},{property:'og:description',content:'Yeni planlar, yeni tanışlıqlar.'},{property:'og:type',content:'website'},{name:'twitter:card',content:'summary_large_image'}]}),
  component: Explore,
});
function Explore(){const {view}=Route.useSearch();return <ExploreScreen key={view} initialView={view}/>;}