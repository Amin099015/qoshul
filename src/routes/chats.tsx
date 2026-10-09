import { createFileRoute } from '@tanstack/react-router';
import { ChatsScreen } from '@/components/qoshul/screens';
export const Route = createFileRoute('/chats')({
  head: () => ({meta:[{title:'Qrup söhbətləri — Qoshul.az'},{name:'description',content:'Qoşulduğun tədbirlərin iştirakçıları ilə söhbət et.'},{property:'og:title',content:'Qrup söhbətləri — Qoshul.az'},{property:'og:description',content:'Görüşdən əvvəl tanış olaq.'},{property:'og:type',content:'website'},{name:'twitter:card',content:'summary_large_image'}]}),
  component: ChatsScreen,
});