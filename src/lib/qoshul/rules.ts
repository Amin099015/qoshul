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
/** Great-circle distance in km, rounded to 0.1 km. */
export function distanceKm(a: { lat: number; lng: number }, b: { lat: number; lng: number }) {
  const r = (d: number) => (d * Math.PI) / 180;
  const dLat = r(b.lat - a.lat), dLng = r(b.lng - a.lng);
  const h = Math.sin(dLat / 2) ** 2 + Math.cos(r(a.lat)) * Math.cos(r(b.lat)) * Math.sin(dLng / 2) ** 2;
  return Math.round(6371 * 2 * Math.asin(Math.sqrt(h)) * 10) / 10;
}
export function directionsUrl(lat: number, lng: number) {
  return `https://www.google.com/maps/dir/?api=1&destination=${lat},${lng}`;
}
