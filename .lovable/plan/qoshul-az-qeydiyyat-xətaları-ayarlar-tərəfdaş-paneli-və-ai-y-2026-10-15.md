# Qoshul.az — qeydiyyat xətaları, ayarlar, tərəfdaş paneli və AI yeniləməsi

## 1. Qeydiyyat və giriş xətalarının düzəldilməsi
- "Hesab yarat" seçiləndə forma həqiqətən qeydiyyat rejiminə keçəcək (ad, e-poçt, şifrə, şifrə təkrarı); "Daxil ol" ayrıca rejim olacaq. Düymə mətni və başlıq rejimə görə dəyişəcək.
- Google ilə davam et: geri qayıtdıqdan sonra sessiya yoxlanılacaq və istifadəçi əvvəlki səhifəyə yox, düzgün yerə (anket tamamlanmayıbsa anketə, tamamlanıbsa ana səhifəyə) yönləndiriləcək.
- Şifrə yeniləmə: yeni şifrə təyin edildikdən sonra "qeydiyyatdan keçin" səhifəsi açılmayacaq — istifadəçi daxil olmuş vəziyyətdə profilinə/anketə keçəcək.
- E-poçt təsdiqi lazım olanda aydın mesaj göstəriləcək ("E-poçtunu yoxla").
- Hər addım real hesabla sınaqdan keçiriləcək.

## 2. Ayarlar səhifəsi (profilin yuxarısındakı düymə)
Yeni "Ayarlar" səhifəsi:
- Hesab: adı dəyiş, şifrəni dəyiş, çıxış, hesabı sil
- Şəhər/rayon seçimi (ana səhifənin başlığından bura köçürülür) və "Mənim yerim"
- Məxfilik: təhsil/iş görünürlüyü
- Bildirişlər
- Haqqımızda, Məxfilik siyasəti, İstifadə şərtləri, Təhlükəsizlik qaydaları, Əlaqə/Dəstək, Tez-tez verilən suallar
- Tətbiq versiyası

## 3. Ana səhifə başlığı
- Rayon seçimi başlıqdan çıxarılır, yerinə "Tərəfdaşlar" düyməsi qoyulur (gəlir mənbəyi önə çəkilir).
- Kəşf et xəritəsi əvvəlki kimi mövcud tədbirləri göstərir.

## 4. Tədbir yaratma xəritəsi — avtomatik tərəfdaş təklifi
- Seçilmiş kateqoriyaya uyğun ən yaxın tərəfdaş məkanlar xəritədə xüsusi işarə ilə görünəcək və "Bu məkanda keçir" ilə ünvan avtomatik dolacaq. Tərəfdaş məkanda keçirilən tədbir rezervasiya kimi həmin məkanın panelinə düşəcək (+150 XP qaydası qalır).

## 5. Tərəfdaş məkan qeydiyyatı və admin paneli ("ikinci tətbiq")
- Ayrıca "Biznes kimi qeydiyyat" axını: məkan adı, VÖEN (10 rəqəm yoxlanışı), kateqoriyalar, ünvan və xəritə nöqtəsi, əlaqə, iş saatları, endirim təklifi.
- Yeni məkan "yoxlamada" statusunda olur; təsdiqdən sonra tətbiqdə görünür.
- Tərəfdaş paneli (/partner): rezervasiyalar (təsdiq/rədd), gələn müştəri axını, tədbir sayı, iştirakçı sayı, qiymətləndirmələr, gəlir göstəriciləri qrafiklərlə, məkan məlumatlarının redaktəsi.
- Rollar ayrıca cədvəldə saxlanılır (istifadəçi / tərəfdaş / admin), icazələr server tərəfində yoxlanılır.

## 6. AI dəyişikliyi
- Model Gemini 3 Flash-a keçirilir (daha ucuz və sürətli). Qeyd: tam pulsuz deyil, iş sahəsinin aylıq AI limitindən istifadə edir, amma əvvəlkindən xeyli az xərcləyir.
- Köməkçi psixoloq kimi davranacaq: istifadəçinin şəxsiyyət nəticəsini və maraqlarını nəzərə alıb onu tanıyacaq, uyğun insanlar və tədbirlər təklif edəcək, söhbətdə birbaşa tədbir yarada biləcək və yaratmazdan əvvəl detalları yoxlayıb təsdiq istəyəcək.

## 7. Real tədbir məlumatları
- Tədbir yaratma, qoşulma, yadda saxlama və qrup söhbətləri real verilənlər bazasına bağlanır (indi nümunə məlumatla işləyir).

## 8. Firebase barədə qərar
Lovable Cloud artıq giriş, verilənlər bazası, fayl yaddaşı və təhlükəsizliyi təmin edir. Firebase əlavə etmək ikinci, paralel sistem yaradar və təhlükəsizlik riskini artırar. Ona görə Firebase əlavə edilməyəcək; təhlükəsizlik Lovable Cloud daxilində gücləndiriləcək:
- hər cədvəldə ciddi giriş qaydaları, rollar ayrıca cədvəldə
- təhlükəsizlik skanı və aşkar olunan problemlərin həlli
- server tərəfində giriş yoxlanışı və sorğu limiti

## 9. Yoxlama
- Qeydiyyat, Google, şifrə yeniləmə, tərəfdaş qeydiyyatı, rezervasiya → panel axını Playwright ilə yoxlanılacaq; qaydalar üçün testlər.

## Texniki detallar
- Yeni cədvəllər: `user_roles` (app_role enum + has_role), `partners` (owner_id, name, voen, categories text[], lat/lng, city, status pending/approved), `reservations` (partner_id, event_id, user_id, status). GRANT + RLS hər cədvəldə.
- events-ə `partner_id` sütunu; tərəfdaş məkanda yaradılan tədbir avtomatik reservation yaradır (trigger).
- Yeni route-lar: `/_authenticated/settings`, `/_authenticated/partner` (+ register), `/about`, `/privacy`, `/terms`.
- `ai.server.ts`: MODEL → `google/gemini-3-flash-preview`; chat rejiminə tool-çağırışı ilə "create_event" təklifi.
- context.tsx in-memory event qatını Cloud sorğuları ilə əvəz edir.
