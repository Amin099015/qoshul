import { createFileRoute } from '@tanstack/react-router';
import { handleAi } from '@/lib/qoshul/ai.server';

export const Route = createFileRoute('/api/ai')({
  server: { handlers: { POST: ({ request }) => handleAi(request) } },
});
