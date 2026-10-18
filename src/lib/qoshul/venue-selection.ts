import { groupOf } from './categories';
import { distanceKm } from './rules';
export type Venue = { id: string; name: string; address: string; city: string; lat: number; lng: number; categories: string[] };
export function nearbyVenues(venues: Venue[], category: string, origin: { lat: number; lng: number }) {
  return venues.filter(v => v.categories.some(c => c === category || c === groupOf(category) || groupOf(c) === groupOf(category)))
    .sort((a, b) => distanceKm(origin, a) - distanceKm(origin, b)).slice(0, 8);
}