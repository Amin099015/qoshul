import { z } from 'zod';
const proposal = z.object({ title: z.string().min(1).max(65), category: z.string().min(1).max(80), date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/), time: z.string().regex(/^([01]\d|2[0-3]):[0-5]\d$/), capacity: z.number().int().min(2).max(500), location: z.string().min(1), description: z.string().min(1), partner: z.string().default('') });
export function assistantEvent(text: string) {
  const index = text.indexOf('[TƏDBİR]');
  if (index < 0) return { text, event: null };
  try { const parsed = proposal.safeParse(JSON.parse(text.slice(index + 8).trim())); return { text: text.slice(0, index).trim(), event: parsed.success ? parsed.data : null }; }
  catch { return { text: text.slice(0, index).trim(), event: null }; }
}