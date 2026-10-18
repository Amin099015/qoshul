import { expect, it } from 'vitest';
import { nearbyVenues } from './venue-selection';
it('suggests the nearest category-compatible venue first', () => {
  const venues = [
    { id: 'far', name: 'Uzaq', address: 'A', city: 'Bakı', lat: 41, lng: 49, categories: ['Qəhvə'] },
    { id: 'other', name: 'İdman', address: 'B', city: 'Bakı', lat: 40, lng: 49, categories: ['İdman'] },
    { id: 'near', name: 'Yaxın', address: 'C', city: 'Bakı', lat: 40.01, lng: 49, categories: ['Qəhvə'] },
  ];
  expect(nearbyVenues(venues, 'Qəhvə', { lat: 40, lng: 49 }).map(v => v.id)).toEqual(['near', 'far']);
});