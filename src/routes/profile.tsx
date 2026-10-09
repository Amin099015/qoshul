import { createFileRoute } from '@tanstack/react-router';
import { ProfileScreen } from '@/components/qoshul/screens';
export const Route = createFileRoute('/profile')({
  head: () => ({meta:[{title:'Profilim — Qoshul.az'},{name:'description',content:'Tədbirlərini, maraqlarını və Qoshul nailiyyətlərini gör.'},{property:'og:title',content:'Profilim — Qoshul.az'},{property:'og:description',content:'Yeni dostlar və yeni nailiyyətlər.'},{property:'og:type',content:'website'},{name:'twitter:card',content:'summary_large_image'}]}),
  component: ProfileScreen,
});