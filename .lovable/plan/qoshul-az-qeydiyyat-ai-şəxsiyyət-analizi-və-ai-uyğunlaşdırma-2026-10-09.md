# Qoshul.az: qeydiyyat, AI şəxsiyyət analizi və AI uyğunlaşdırma

Məqsəd: nümunə məlumatlardan real məhsula keçid. Hesablar, profillər, tədbirlər, qoşulmalar və söhbətlər Lovable Cloud-da saxlanılır.

## 1. Hesab və giriş
- E-poçt və şifrə ilə qeydiyyat, Google ilə giriş, şifrəni bərpa etmə.
- Giriş etməmiş istifadəçi yalnız tanıtım səhifəsini görür; tətbiqin qalan hissəsi giriş tələb edir.
- Qeydiyyatı bitirməyən istifadəçi avtomatik ətraflı anketə yönləndirilir.

## 2. Ətraflı qeydiyyat anketi (addım-addım, irəliləyiş zolağı ilə)
1. **Əsas məlumat**: ad, soyad, doğum tarixi (16+), cins, şəhər (bütün şəhərlər siyahısından), profil şəkli.
2. **Təhsil və iş vəziyyəti**:
   - Məktəbli: məktəbin adı/nömrəsi, sinif.
   - Tələbə: universitet (Azərbaycan universitetlərinin siyahısı + "Digər"), fakültə/ixtisas, kurs, bakalavr/magistr/doktorantura.
   - İşləyən: sahə, vəzifə, şirkət (istəyə görə), iş qrafiki.
   - İşsiz / iş axtarır, sahibkar, frilanser, digər.
3. **Dillər**: ən azı 1 dil və səviyyəsi.
4. **Maraqlar**: 89 kateqoriyadan ən azı 5.
5. **Məqsəd**: dost tapmaq, idman yoldaşı, networking, dil mübadiləsi, hobbi qrupu və s. (ən azı 1).
6. **Şəxsiyyət testi**: 15–20 sual (Big Five əsaslı, 1–5 şkala) + 3 açıq sual ("Həftə sonun necə keçir?", "Səni nə ruhlandırır?", "İdeal görüş necədir?").
7. **Üstünlüklər**: görüş üçün uyğun günlər/saatlar, qrup ölçüsü, büdcə.

## 3. AI şəxsiyyət analizi
- Anket bitəndə AI cavabları təhlil edir və profilə yazır:
  - şəxsiyyət tipi və qısa təsvir (Azərbaycan dilində),
  - 5 əsas xüsusiyyət üzrə bal (açıqlıq, məsuliyyətlilik, ekstroversiya, xoş münasibət, emosional sabitlik),
  - güclü tərəflər, ünsiyyət üslubu, uyğun tədbir növləri.
- İstifadəçi nəticəni görür, istəsə testi yenidən keçə bilər.
- Profil təhlükəsizliyi: AI açıq suallarda təhqir/uyğunsuz məzmun aşkar etsə, profil yoxlamaya düşür.

## 4. AI uyğunlaşdırma (match)
- **İnsanlar**: AI hər istifadəçi üçün ən uyğun insanları seçir və 0–100 uyğunluq balı + izah verir ("İkiniz də İnformatika tələbəsisiniz, şahmat sevirsiniz..."). Eyni universitet/məktəb, şəhər, maraqlar, dillər, şəxsiyyət uyğunluğu nəzərə alınır.
- **Tədbirlər**: "Sənin üçün" siyahısı profilə və şəxsiyyətə görə real AI balı ilə.
- Nəticələr keşlənir (gündə bir dəfə və ya profil dəyişəndə yenilənir) ki, AI xərci azalsın.
- Dostluq sorğusu göndərmə/qəbul etmə, qarşılıqlı uyğunluqda şəxsi söhbət açılır.

## 5. Real məlumatlar
- Tədbirlər, qoşulmalar, yadda saxlananlar, XP, rəylər (1–5) və qrup söhbətləri bazada saxlanılır; söhbətlər canlı yenilənir.
- Rəy yazmaq +20 XP, qoşulma +50, yaratma +100, tərəfdaş məkanda +150 (mövcud qaydalar).
- Başlanğıcda tətbiq boş görünməsin deyə nümunə tədbirlər bazaya əlavə olunur və "nümunə" kimi işarələnir.
- AI köməkçisi artıq real tədbirlər bazasından cavab verir.

## 6. Məxfilik
- Məktəbli/tələbə məlumatı yalnız şəhər və məktəb/universitet adı səviyyəsində başqalarına göstərilir; doğum tarixi, telefon göstərilmir.
- İstifadəçi hansı sahələrin görünəcəyini seçə bilir; hesabı silmək mümkündür.
- 18 yaşdan kiçiklər yalnız öz yaş qrupuna uyğun tədbirləri görür.

## Texniki detallar
- Lovable Cloud aktivləşdirilir: auth (e-poçt + Google), cədvəllər: profiles, profile_education, personality_results, events, event_participants, saved_events, friendships, messages, reviews, match_cache, user_roles. Hər cədvəldə RLS; profil oxunuşu yalnız açıq sahələr üçün.
- Qorunan səhifələr `_authenticated` layout altına keçir; anket `/onboarding` route-u; giriş `/auth`, şifrə bərpası `/reset-password`.
- AI: mövcud server route + `createServerFn` (auth middleware ilə), `openai/gpt-6-astra`, strict JSON schema ilə şəxsiyyət və uyğunluq nəticələri; nəticələr `personality_results` və `match_cache`-də saxlanılır. Xətalar (402/429) Azərbaycan dilində göstərilir.
- Uyğunluq: əvvəl SQL ilə namizədlər süzülür (şəhər, yaş qrupu, ortaq maraq), sonra ilk 20 namizəd AI ilə qiymətləndirilir.
- Context-dəki yaddaş məlumatları TanStack Query + baza sorğuları ilə əvəz olunur; qaydalar modulu və testlər saxlanılır, anket validasiyası (min 5 maraq, 1 dil, 1 məqsəd, 16+ yaş) üçün testlər əlavə olunur.
- Playwright ilə qeydiyyat → anket → AI nəticəsi → match → tədbirə qoşulma axını yoxlanılır.
