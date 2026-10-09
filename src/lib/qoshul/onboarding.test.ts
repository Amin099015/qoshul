import { describe, expect, it } from 'vitest';
import { validateOnboarding, canSeeEvent, ageFrom, traitScores, personalityQuestions, type OnboardingDraft } from './onboarding';

const now = new Date('2026-10-09');
const allAnswers = Object.fromEntries(personalityQuestions.map(q => [q.id, 3]));
const valid: OnboardingDraft = {
  first_name: 'Amin', last_name: 'Nuriyev', birth_date: '2004-05-01', city: 'Bakı', status: 'student',
  languages: [{ name: 'Azərbaycan dili', level: 'Ana dili' }], interests: ['Futbol','Qəhvə','Kino','Rəsm','Hakaton'], goals: ['Yeni dostlar tapmaq'],
  personality_answers: allAnswers,
};

describe('onboarding validation', () => {
  it('accepts a complete profile', () => expect(validateOnboarding(valid, now)).toEqual([]));
  it('requires at least 5 interests', () => expect(validateOnboarding({ ...valid, interests: valid.interests.slice(0, 4) }, now)).toContain('Ən azı 5 maraq seç.'));
  it('requires at least 1 language', () => expect(validateOnboarding({ ...valid, languages: [] }, now)).toContain('Ən azı 1 dil seç.'));
  it('requires at least 1 goal', () => expect(validateOnboarding({ ...valid, goals: [] }, now)).toContain('Ən azı 1 məqsəd seç.'));
  it('rejects users younger than 16', () => expect(validateOnboarding({ ...valid, birth_date: '2011-01-01' }, now).length).toBe(1));
  it('accepts exactly 16', () => expect(validateOnboarding({ ...valid, birth_date: '2010-10-09' }, now)).toEqual([]));
  it('requires every personality answer', () => expect(validateOnboarding({ ...valid, personality_answers: {} }, now)).toContain('Şəxsiyyət testinin bütün suallarını cavablandır.'));
});

describe('age rules', () => {
  it('computes age before birthday', () => expect(ageFrom('2008-12-01', now)).toBe(17));
  it('minors cannot see 18+ events', () => expect(canSeeEvent('18+', 17)).toBe(false));
  it('minors can see all-ages events', () => expect(canSeeEvent('Hamı üçün', 17)).toBe(true));
  it('adults see 18+ events', () => expect(canSeeEvent('18+', 18)).toBe(true));
});

describe('trait scores', () => {
  it('neutral answers give 50', () => expect(traitScores(allAnswers).extraversion).toBe(50));
  it('reverse-scored items invert', () => {
    const a = { ...allAnswers, q1: 5, q2: 1, q3: 5, q4: 5 };
    expect(traitScores(a).extraversion).toBe(100);
  });
});
