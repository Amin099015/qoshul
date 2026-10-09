import { describe, expect, it } from 'vitest';
import { XP_REWARDS, rankForXp, canJoin } from './rules';
describe('Qoshul XP rewards', () => {
  it('awards 50 XP for participation', () => expect(XP_REWARDS.participation).toBe(50));
  it('awards 100 XP for hosting', () => expect(XP_REWARDS.hosting).toBe(100));
  it('awards 150 XP for partner hosting', () => expect(XP_REWARDS.partnerHosting).toBe(150));
  it('awards 20 XP for reviews', () => expect(XP_REWARDS.review).toBe(20));
});
describe('rank thresholds', () => {
  it.each([[0,'Yeni'],[200,'Yeni'],[201,'Kəşfiyyatçı'],[600,'Kəşfiyyatçı'],[601,'Aktiv'],[1500,'Aktiv'],[1501,'Veteran'],[3500,'Veteran'],[3501,'Ultras'],[7000,'Ultras'],[7001,'Legend']])('%i maps to %s', (xp,rank) => expect(rankForXp(Number(xp))).toBe(rank));
});
it('does not let participants join a full event', () => expect(canJoin(8,8,false)).toBe(false));
it('prevents duplicate joins', () => expect(canJoin(3,8,true)).toBe(false));
it('allows joining when places remain', () => expect(canJoin(3,8,false)).toBe(true));
import { distanceKm } from './rules';
import { cities } from './cities';
import { allCategories } from './categories';
describe('distanceKm', () => {
  it('is 0 for same point', () => expect(distanceKm({ lat: 40.4, lng: 49.8 }, { lat: 40.4, lng: 49.8 })).toBe(0));
  it('Bakı–Gəncə is about 300 km', () => { const d = distanceKm({ lat: 40.4093, lng: 49.8671 }, { lat: 40.6828, lng: 46.3606 }); expect(d).toBeGreaterThan(290); expect(d).toBeLessThan(305); });
});
describe('catalogs', () => {
  it('lists all major Azerbaijani cities', () => { for (const n of ['Bakı','Gəncə','Sumqayıt','Naxçıvan','Şuşa','Xankəndi','Lənkəran','Şəki']) expect(cities.some(c => c.name === n)).toBe(true); });
  it('has 60+ categories', () => expect(allCategories.length).toBeGreaterThanOrEqual(60));
});
