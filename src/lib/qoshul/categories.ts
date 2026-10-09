export interface CategoryGroup { group: string; items: string[]; }
export const categoryGroups: CategoryGroup[] = [
 { group: 'İdman', items: ['Futbol','Basketbol','Voleybol','Padel','Tennis','Stolüstü tennis','Üzgüçülük','Qaçış','Velosiped','Yoga','Fitnes','Döyüş idmanı','Güləş','Şahmat','Boulinq'] },
 { group: 'Təbiət', items: ['Yürüş','Kemping','Alpinizm','Balıqçılıq','Piknik','At sürmə','Quş müşahidəsi'] },
 { group: 'Mədəniyyət', items: ['Muzey','Teatr','Kino','Sərgi','Kitab klubu','Poeziya gecəsi','Tarix turu'] },
 { group: 'Musiqi', items: ['Konsert','Cem-sessiya','Karaoke','Muğam','Caz','DJ gecəsi','Musiqi aləti dərsi'] },
 { group: 'Yemək və içki', items: ['Qəhvə','Çay söhbəti','Şam yeməyi','Səhər yeməyi','Kulinariya dərsi','Dequstasiya','Küçə yeməkləri'] },
 { group: 'Təhsil', items: ['Dil mübadiləsi','Seminar','Mühazirə','İmtahana hazırlıq','Birlikdə dərs','Elm söhbəti'] },
 { group: 'Texnologiya', items: ['Hakaton','Proqramlaşdırma','Süni intellekt','Startap','Oyun hazırlama','Dizayn','Robototexnika'] },
 { group: 'Biznes və karyera', items: ['Networking','Karyera','Sahibkarlıq','Marketinq','Maliyyə savadlılığı','Müsahibəyə hazırlıq'] },
 { group: 'Oyunlar', items: ['Stolüstü oyunlar','Kibersport','Kviz','Mafiya','Nərd','Video oyunlar','Escape room'] },
 { group: 'İncəsənət', items: ['Rəsm','Foto-gəzinti','Əl işləri','Rəqs','Xalçaçılıq','Keramika','Yazı emalatxanası'] },
 { group: 'Könüllülük', items: ['Təmizlik aksiyası','Xeyriyyə','Heyvanlara yardım','Ağac əkmə','Qan donorluğu'] },
 { group: 'Səyahət və digər', items: ['Şəhər turu','Səfər','Ailə','Sağlamlıq','Mənəvi inkişaf','Valideynlər','Tələbələr','Digər'] },
];
export const allCategories = categoryGroups.flatMap(g => g.items);
export const groupOf = (category: string) => categoryGroups.find(g => g.items.includes(category))?.group ?? 'Səyahət və digər';
