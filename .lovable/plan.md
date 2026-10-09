# Qoshul.az: şəhərlər, xəritə, AI və geniş kateqoriyalar

## 1. Azərbaycanın bütün şəhərləri
- Azərbaycanın bütün şəhərlərindən (Bakı, Gəncə, Sumqayıt, Mingəçevir, Şirvan, Naxçıvan, Lənkəran, Şəki, Yevlax, Xankəndi, Şuşa, Quba, Qəbələ, Şamaxı, İsmayıllı, Zaqatala, Qax, Balakən, Oğuz, Qusar, Xaçmaz, Siyəzən, Şabran, Xızı, Abşeron, Salyan, Neftçala, Saatlı, Sabirabad, İmişli, Beyləqan, Ağcabədi, Bərdə, Tərtər, Ağdam, Füzuli, Cəbrayıl, Zəngilan, Qubadlı, Laçın, Kəlbəcər, Xocalı, Xocavənd, Ağdərə, Goranboy, Göygöl, Daşkəsən, Gədəbəy, Tovuz, Qazax, Ağstafa, Şəmkir, Samux, Naftalan, Ağsu, Kürdəmir, Hacıqabul, Ucar, Zərdab, Göyçay, Ağdaş, Qobustan, Astara, Lerik, Yardımlı, Masallı, Cəlilabad, Biləsuvar, Ordubad, Culfa, Şərur, Babək, Kəngərli, Sədərək, Şahbuz və digərləri) və rayon mərkəzlərindən ibarət tam siyahı, hər birinin koordinatları ilə.
- Yuxarıdakı yer seçimi axtarışlı siyahı olacaq; seçilən şəhərə görə tədbirlər süzüləcək.
- Tədbir yaradanda şəhər seçimi məcburi olacaq; hər şəhər üçün bir neçə nümunə tədbir əlavə ediləcək ki, siyahılar boş qalmasın.

## 2. Kəşf et bölməsində canlı xəritə
- "Yaxınlıqda" görünüşünə real xəritə (OpenStreetMap, açar tələb etmir) inteqrasiya olunacaq.
- Hər tədbir xəritədə kateqoriya ikonu olan nişanla göstəriləcək; nişana basanda qısa kart açılır.
- "Mənim yerim" düyməsi (brauzer icazəsi ilə) və hər tədbirə real məsafə hesablanması.
- "Yol göstər" düyməsi Google Maps / Waze-də marşrutu birbaşa açır.
- Tədbir yaradanda xəritədə nöqtəni seçmək və ya ünvan yazmaq mümkün olacaq.

## 3. AI inteqrasiyası (Lovable AI ilə, real)
- **AI tədbir köməkçisi**: yaratma formunda qısa fikir yazırsan, AI başlıq, təsvir, kateqoriya və uyğun saat təklif edir (Azərbaycan dilində).
- **AI tövsiyələr**: maraqların, şəhərin və qoşulduğun tədbirlərə görə "Sənin üçün" siyahısı və hər tövsiyənin qısa izahı ("Niyə sənə uyğundur").
- **Qoshul köməkçisi (çat)**: "Bu həftə sonu Gəncədə nə var?" kimi suallara mövcud tədbirlər əsasında cavab verən söhbət, cavablar canlı axınla gəlir.
- AI xətaları (limit, kredit bitməsi) istifadəçiyə aydın Azərbaycan dilində göstəriləcək.

## 4. Geniş kateqoriyalar və sərbəst tədbir yaratma
- 12 qrup altında 60+ kateqoriya: İdman (futbol, basketbol, voleybol, padel, tennis, üzgüçülük, qaçış, velosiped, yoga, fitnes, döyüş idmanı, şahmat), Təbiət (yürüş, kemping, alpinizm, balıqçılıq, piknik), Mədəniyyət (muzey, teatr, kino, sərgi, ədəbiyyat/kitab klubu), Musiqi (konsert, cem-sessiya, karaoke, muğam), Yemək (qəhvə, şam yeməyi, kulinariya dərsi, dequstasiya), Təhsil (dil mübadiləsi, seminar, mühazirə, imtahana hazırlıq), Texnologiya (hakaton, proqramlaşdırma, AI, startap, oyun hazırlama), Biznes (networking, karyera, sahibkarlıq), Oyunlar (stolüstü oyunlar, kibersport, kviz, mafiya), İncəsənət (rəsm, foto-gəzinti, əl işləri, rəqs), Könüllülük (təmizlik aksiyası, xeyriyyə, heyvanlara yardım), Səyahət və digər (şəhər turu, səfər, ailə, sağlamlıq, mənəvi inkişaf).
- "Digər" seçəndə öz kateqoriyanı yazmaq mümkündür.
- Yaratma formu genişlənir: pulsuz/ödənişli (qiymət AZN), yaş həddi, dil, səviyyə (başlanğıc/orta/peşəkar), açıq/təsdiqli qoşulma, onlayn/oflayn, təkrarlanan tədbir, örtük şəkli, teqlər.
- Kəşf et və ana səhifədə yeni kateqoriya və şəhər süzgəcləri.

## 5. Mətn düzəlişləri
- Bütün ekranlardakı Azərbaycan dili mətnləri yoxlanılıb qrammatik və üslub səhvləri düzəldiləcək.

## Texniki detallar
- Şəhərlər və kateqoriyalar ayrıca saf modullarda (`cities.ts`, `categories.ts`) koordinat və ikonlarla; məsafə (haversine) funksiyası rules modulunda testlərlə.
- Xəritə: `leaflet` + `react-leaflet`, yalnız brauzerdə yüklənir (`ClientOnly` + lazy import) ki, SSR pozulmasın.
- AI: `createServerFn` + Lovable AI Gateway (`openai/gpt-6-astra`, Responses API, axınla), açar yalnız serverdə; strukturlaşdırılmış JSON üçün strict schema. Tədbir məlumatları hələ demo (yaddaşda) qalır — AI cavabları real, tədbir siyahısı isə nümunədir; bu, interfeysdə açıq göstəriləcək.
- Tədbir modeli yeni sahələrlə (şəhər, lat/lng, qiymət, yaş, dil, səviyyə, format) genişlənir; testlər yenilənir.
- Playwright ilə mobil və masaüstündə xəritə, AI köməkçi və yaratma axını yoxlanılacaq.
