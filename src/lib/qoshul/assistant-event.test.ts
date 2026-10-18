import { expect, it } from 'vitest';
import { assistantEvent } from './assistant-event';
it('keeps a validated event separate from chat until explicit creation', () => {
  const parsed = assistantEvent('Təsdiq edildi.\n[TƏDBİR]'+JSON.stringify({title:'Görüş',category:'Qəhvə',date:'2026-10-25',time:'18:00',capacity:8,location:'Kafe',description:'Söhbət',partner:''}));
  expect(parsed.text).toBe('Təsdiq edildi.'); expect(parsed.event?.capacity).toBe(8);
});
it('rejects malformed event instructions', () => { expect(assistantEvent('[TƏDBİR]{"capacity":1}').event).toBeNull(); });