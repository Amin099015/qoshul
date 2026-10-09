import { createFileRoute } from '@tanstack/react-router';
import { AssistantScreen } from '@/components/qoshul/screens';
export const Route = createFileRoute('/assistant')({
  head: () => ({meta:[{title:'AI köməkçi — Qoshul.az'},{name:'description',content:'Azərbaycanın istənilən şəhərində tədbir tapmaq və plan qurmaq üçün AI köməkçi.'},{property:'og:title',content:'AI köməkçi — Qoshul.az'},{property:'og:description',content:'Sualını ver, sənə uyğun tədbiri birlikdə tapaq.'},{property:'og:type',content:'website'},{name:'twitter:card',content:'summary_large_image'}]}),
  component: AssistantScreen,
});
