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
