export const statuses = [
  { id: 'school', label: 'Məktəbli' },
  { id: 'student', label: 'Tələbə' },
  { id: 'working', label: 'İşləyirəm' },
  { id: 'job_seeking', label: 'İş axtarıram' },
  { id: 'entrepreneur', label: 'Sahibkaram' },
  { id: 'freelancer', label: 'Frilanserəm' },
  { id: 'other', label: 'Digər' },
] as const;
export const statusLabel = (id?: string | null) => statuses.find(s => s.id === id)?.label ?? '';

export const universities = [
  'Bakı Dövlət Universiteti','ADA Universiteti','Azərbaycan Dövlət İqtisad Universiteti (UNEC)','Azərbaycan Texniki Universiteti','Azərbaycan Dövlət Neft və Sənaye Universiteti','Bakı Ali Neft Məktəbi','Azərbaycan Tibb Universiteti','Azərbaycan Dövlət Pedaqoji Universiteti','Azərbaycan Dillər Universiteti','Azərbaycan Memarlıq və İnşaat Universiteti','Azərbaycan Dövlət Mədəniyyət və İncəsənət Universiteti','Bakı Musiqi Akademiyası','Azərbaycan Dövlət Rəssamlıq Akademiyası','Azərbaycan Dövlət Bədən Tərbiyəsi və İdman Akademiyası','Azərbaycan Respublikasının Prezidenti yanında Dövlət İdarəçilik Akademiyası','Bakı Mühəndislik Universiteti','Azərbaycan Texnologiya Universiteti','Bakı Slavyan Universiteti','Xəzər Universiteti','Qafqaz Universiteti','Bakı Biznes Universiteti','Odlar Yurdu Universiteti','Azərbaycan Universiteti','Bakı Avrasiya Universiteti','Milli Aviasiya Akademiyası','Azərbaycan Dövlət Dəniz Akademiyası','Milli Konservatoriya','Azərbaycan Turizm və Menecment Universiteti','Bakı Dövlət Universitetinin Qazax filialı','UNEC Zaqatala filialı','Gəncə Dövlət Universiteti','Azərbaycan Dövlət Aqrar Universiteti','Azərbaycan Texnologiya Universiteti (Gəncə)','Sumqayıt Dövlət Universiteti','Mingəçevir Dövlət Universiteti','Lənkəran Dövlət Universiteti','Naxçıvan Dövlət Universiteti','Naxçıvan Universiteti','Qarabağ Universiteti','Bakı Dövlət Universiteti – Moskva Dövlət Universitetinin filialı','Fransız-Azərbaycan Universiteti (UFAZ)','Digər',
];
export const degrees = ['Bakalavr','Magistr','Doktorantura','Kollec'];
export const languageOptions = ['Azərbaycan dili','İngilis dili','Rus dili','Türk dili','Alman dili','Fransız dili','Ərəb dili','Fars dili','Çin dili','İspan dili','Gürcü dili','Koreya dili','Yapon dili','İtalyan dili'];
export const languageLevels = ['Başlanğıc','Orta','Yaxşı','Ana dili'];
export const goals = ['Yeni dostlar tapmaq','İdman yoldaşı','Networking və karyera','Dil mübadiləsi','Hobbi qrupu','Birlikdə öyrənmək','Səyahət yoldaşı','Könüllülük','Şəhəri kəşf etmək','Startap komandası'];
export const availabilityOptions = ['Həftəiçi səhər','Həftəiçi gündüz','Həftəiçi axşam','Şənbə','Bazar'];
export const groupSizes = ['Təkbətək','Kiçik qrup (3–6)','Orta qrup (7–15)','Böyük qrup (15+)'];
export const budgets = ['Yalnız pulsuz','10 AZN-ə qədər','30 AZN-ə qədər','Fərq etmir'];

export type Trait = 'openness' | 'conscientiousness' | 'extraversion' | 'agreeableness' | 'stability';
export const traitLabels: Record<Trait, string> = { openness: 'Açıqlıq', conscientiousness: 'Məsuliyyətlilik', extraversion: 'Ekstroversiya', agreeableness: 'Xoş münasibət', stability: 'Emosional sabitlik' };
export const personalityQuestions: { id: string; text: string; trait: Trait; reverse?: boolean }[] = [
  { id: 'q1', text: 'Yeni insanlarla tanış olmaq mənə enerji verir.', trait: 'extraversion' },
  { id: 'q2', text: 'Böyük məclislərdə özümü yorğun hiss edirəm.', trait: 'extraversion', reverse: true },
  { id: 'q3', text: 'Söhbəti adətən mən başladıram.', trait: 'extraversion' },
  { id: 'q4', text: 'Diqqət mərkəzində olmağı sevirəm.', trait: 'extraversion' },
  { id: 'q5', text: 'Yeni və qeyri-adi şeyləri sınamağı xoşlayıram.', trait: 'openness' },
  { id: 'q6', text: 'İncəsənət, musiqi və ya ədəbiyyat məni dərindən maraqlandırır.', trait: 'openness' },
  { id: 'q7', text: 'Tanış rutini dəyişikliklərdən üstün tuturam.', trait: 'openness', reverse: true },
  { id: 'q8', text: 'Planlarımı vaxtında və dəqiq yerinə yetirirəm.', trait: 'conscientiousness' },
  { id: 'q9', text: 'Görüşlərə adətən gecikirəm.', trait: 'conscientiousness', reverse: true },
  { id: 'q10', text: 'İşlərimi əvvəlcədən planlaşdırmağı sevirəm.', trait: 'conscientiousness' },
  { id: 'q11', text: 'Başqalarının hisslərinə qarşı həssasam.', trait: 'agreeableness' },
  { id: 'q12', text: 'Mübahisədə güzəştə getməyi bacarıram.', trait: 'agreeableness' },
  { id: 'q13', text: 'İnsanlara asanlıqla etibar edirəm.', trait: 'agreeableness' },
  { id: 'q14', text: 'Başqalarını tənqid etməyə meylliyəm.', trait: 'agreeableness', reverse: true },
  { id: 'q15', text: 'Stresli vəziyyətlərdə sakit qalıram.', trait: 'stability' },
  { id: 'q16', text: 'Tez-tez narahatlıq hiss edirəm.', trait: 'stability', reverse: true },
  { id: 'q17', text: 'Əhvalım tez dəyişir.', trait: 'stability', reverse: true },
  { id: 'q18', text: 'Uğursuzluqdan sonra tez özümə gəlirəm.', trait: 'stability' },
];
export const openQuestions = [
  { id: 'weekend', text: 'Həftə sonun adətən necə keçir?' },
  { id: 'inspiration', text: 'Səni nə ruhlandırır?' },
  { id: 'ideal_meetup', text: 'Sənin üçün ideal görüş necədir?' },
];

/** Big Five scores 0–100 from 1–5 answers. */
export function traitScores(answers: Record<string, number>): Record<Trait, number> {
  const sums: Record<Trait, number[]> = { openness: [], conscientiousness: [], extraversion: [], agreeableness: [], stability: [] };
  for (const q of personalityQuestions) {
    const v = answers[q.id];
    if (!v) continue;
    sums[q.trait].push(q.reverse ? 6 - v : v);
  }
  const out = {} as Record<Trait, number>;
  for (const t of Object.keys(sums) as Trait[]) {
    const arr = sums[t];
    out[t] = arr.length ? Math.round(((arr.reduce((a, b) => a + b, 0) / arr.length - 1) / 4) * 100) : 50;
  }
  return out;
}

export function ageFrom(birthDate: string | null | undefined, now = new Date()) {
  if (!birthDate) return null;
  const b = new Date(birthDate);
  let age = now.getFullYear() - b.getFullYear();
  const m = now.getMonth() - b.getMonth();
  if (m < 0 || (m === 0 && now.getDate() < b.getDate())) age--;
  return age;
}
export const MIN_AGE = 16;
export const ADULT_ONLY = ['18+', '18–25', '25–35'];
/** Under-18 users only see events without an adult age limit. */
export function canSeeEvent(ageLimit: string | null | undefined, userAge: number | null) {
  if (userAge === null || userAge >= 18) return true;
  return !ADULT_ONLY.includes(ageLimit ?? '');
}

export interface OnboardingDraft {
  first_name: string; last_name: string; birth_date: string; city: string; status: string;
  languages: { name: string; level: string }[]; interests: string[]; goals: string[];
  personality_answers: Record<string, number>;
}
/** Returns an Azerbaijani error per failed rule, or [] when valid. */
export function validateOnboarding(d: OnboardingDraft, now = new Date()): string[] {
  const errors: string[] = [];
  if (!d.first_name.trim() || !d.last_name.trim()) errors.push('Ad və soyad tələb olunur.');
  const age = ageFrom(d.birth_date, now);
  if (age === null || age < MIN_AGE) errors.push(`Qeydiyyat üçün ən azı ${MIN_AGE} yaşın olmalıdır.`);
  if (!d.city) errors.push('Şəhər seçilməlidir.');
  if (!d.status) errors.push('Təhsil və ya iş vəziyyətini seç.');
  if (d.languages.length < 1) errors.push('Ən azı 1 dil seç.');
  if (d.interests.length < 5) errors.push('Ən azı 5 maraq seç.');
  if (d.goals.length < 1) errors.push('Ən azı 1 məqsəd seç.');
  if (personalityQuestions.some(q => !d.personality_answers[q.id])) errors.push('Şəxsiyyət testinin bütün suallarını cavablandır.');
  return errors;
}
