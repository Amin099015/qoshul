export const XP_REWARDS = { participation: 50, hosting: 100, partnerHosting: 150, review: 20 } as const;
export function rankForXp(xp: number) {
  if (xp <= 200) return 'Yeni';
  if (xp <= 600) return 'Kəşfiyyatçı';
  if (xp <= 1500) return 'Aktiv';
  if (xp <= 3500) return 'Veteran';
  if (xp <= 7000) return 'Ultras';
  return 'Legend';
}
export function canJoin(participants: number, capacity: number, joined: boolean) {
  return !joined && participants < capacity;
}
