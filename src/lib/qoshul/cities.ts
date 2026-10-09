export interface City { name: string; region: string; lat: number; lng: number; }
const raw: [string, string, number, number][] = [
 ['Bakı','Abşeron-Xızı',40.4093,49.8671],['Sumqayıt','Abşeron-Xızı',40.5897,49.6686],['Xırdalan','Abşeron-Xızı',40.4481,49.7553],['Xızı','Abşeron-Xızı',40.9108,49.0747],
 ['Gəncə','Gəncə-Daşkəsən',40.6828,46.3606],['Göygöl','Gəncə-Daşkəsən',40.5856,46.3189],['Daşkəsən','Gəncə-Daşkəsən',40.5203,46.0778],['Goranboy','Gəncə-Daşkəsən',40.6103,46.7897],['Samux','Gəncə-Daşkəsən',40.7647,46.4086],
 ['Mingəçevir','Mərkəzi Aran',40.7703,47.0489],['Yevlax','Mərkəzi Aran',40.6172,47.15],['Ağdaş','Mərkəzi Aran',40.6503,47.4761],['Göyçay','Mərkəzi Aran',40.6531,47.7406],['Ucar','Mərkəzi Aran',40.5186,47.6542],['Zərdab','Mərkəzi Aran',40.2183,47.7083],['Kürdəmir','Mərkəzi Aran',40.3456,48.1608],
 ['Şirvan','Şirvan-Salyan',39.9319,48.9203],['Salyan','Şirvan-Salyan',39.5961,48.9847],['Neftçala','Şirvan-Salyan',39.3586,49.2469],['Hacıqabul','Şirvan-Salyan',40.0386,48.9403],
 ['Şəki','Şəki-Zaqatala',41.1919,47.1706],['Zaqatala','Şəki-Zaqatala',41.6336,46.6433],['Qax','Şəki-Zaqatala',41.4228,46.9242],['Balakən','Şəki-Zaqatala',41.7261,46.4083],['Oğuz','Şəki-Zaqatala',41.0728,47.4653],['Qəbələ','Şəki-Zaqatala',40.9814,47.8458],
 ['Quba','Quba-Xaçmaz',41.3611,48.5133],['Qusar','Quba-Xaçmaz',41.4275,48.4303],['Xaçmaz','Quba-Xaçmaz',41.4636,48.8061],['Siyəzən','Quba-Xaçmaz',41.0781,49.1119],['Şabran','Quba-Xaçmaz',41.2158,48.9867],
 ['Şamaxı','Dağlıq Şirvan',40.6303,48.6414],['İsmayıllı','Dağlıq Şirvan',40.7872,48.1519],['Ağsu','Dağlıq Şirvan',40.5703,48.3994],['Qobustan','Dağlıq Şirvan',40.5325,48.9264],
 ['Lənkəran','Lənkəran-Astara',38.7529,48.8475],['Astara','Lənkəran-Astara',38.4561,48.875],['Lerik','Lənkəran-Astara',38.7739,48.4153],['Yardımlı','Lənkəran-Astara',38.9058,48.2403],['Masallı','Lənkəran-Astara',39.0342,48.6658],['Cəlilabad','Lənkəran-Astara',39.2089,48.4986],
 ['Sabirabad','Mil-Muğan',40.0128,48.4789],['Saatlı','Mil-Muğan',39.9322,48.3689],['İmişli','Mil-Muğan',39.8697,48.06],['Beyləqan','Mil-Muğan',39.7756,47.6186],['Biləsuvar','Mil-Muğan',39.4583,48.545],
 ['Bərdə','Qarabağ',40.3747,47.1264],['Ağcabədi','Qarabağ',40.0528,47.4597],['Tərtər','Qarabağ',40.3419,46.9325],['Ağdam','Qarabağ',39.9911,46.9278],['Füzuli','Qarabağ',39.6008,47.1431],['Xankəndi','Qarabağ',39.8153,46.7519],['Şuşa','Qarabağ',39.7608,46.7517],['Xocalı','Qarabağ',39.9131,46.7903],['Xocavənd','Qarabağ',39.795,47.1128],['Ağdərə','Qarabağ',40.2117,46.8156],
 ['Laçın','Şərqi Zəngəzur',39.6408,46.5469],['Kəlbəcər','Şərqi Zəngəzur',40.1036,46.0367],['Qubadlı','Şərqi Zəngəzur',39.3439,46.5797],['Zəngilan','Şərqi Zəngəzur',39.0858,46.6525],['Cəbrayıl','Şərqi Zəngəzur',39.3992,47.0264],
 ['Qazax','Qazax-Tovuz',41.0933,45.3661],['Ağstafa','Qazax-Tovuz',41.1189,45.4539],['Tovuz','Qazax-Tovuz',40.9922,45.6289],['Şəmkir','Qazax-Tovuz',40.8297,46.0189],['Gədəbəy','Qazax-Tovuz',40.57,45.8106],['Naftalan','Gəncə-Daşkəsən',40.5067,46.825],
 ['Naxçıvan','Naxçıvan',39.2089,45.4122],['Ordubad','Naxçıvan',38.9086,46.0228],['Culfa','Naxçıvan',38.9558,45.6308],['Şərur','Naxçıvan',39.5536,44.9847],['Babək','Naxçıvan',39.15,45.4486],['Kəngərli','Naxçıvan',39.3881,45.1639],['Sədərək','Naxçıvan',39.7172,44.8836],['Şahbuz','Naxçıvan',39.4072,45.5739],
];
export const cities: City[] = raw.map(([name, region, lat, lng]) => ({ name, region, lat, lng }));
export const findCity = (name: string) => cities.find(c => c.name === name) ?? cities[0]!;
