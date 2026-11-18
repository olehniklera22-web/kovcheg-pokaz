window.KV = (function () {
  var shows = {
    otets: { title: 'Отец Арсений', author: 'В. Малягин', dir: 'М. Недугова', genre: 'Драма', age: '14+', type: 'drama', photo: 'otets-arseniy.jpg', pk: true, desc: 'Когда у человека отнимают свободу, что остаётся у него?' },
    magiya: { title: 'Магия новогодней ночи', author: 'В. Ольшанская', dir: 'М. Недугова', genre: 'Комедия', age: '16+', type: 'drama', photo: 'magiya.jpg', pk: true, desc: 'Новогодняя комедия для взрослых.' },
    zoykina: { title: 'Зойкина квартира', author: 'М. Булгаков', dir: 'В. Смирнов', genre: 'Комедия', age: '16+', type: 'drama', photo: 'zoykina.jpg', pk: true, desc: 'Булгаковская Москва двадцатых: ателье, которое шьёт не только платья.' },
    garnir: { title: 'Играем в дружную семью, или Гарнир по-французски', short: 'Гарнир по-французски', author: 'М. Камолетти', dir: 'Ю. Попов', genre: 'Комедия', age: '18+', type: 'drama', photo: 'garnir.jpg', pk: true, desc: 'Первая в репертуаре «Театрального ковчега» комедия положений.' },
    iskusstvo: { title: 'Искусство любить', author: 'по Э. Фромму', dir: 'А. Локтионов', genre: 'Вечернее шоу', age: '16+', type: 'drama', photo: 'iskusstvo-lyubit.jpg', pk: true, desc: 'Вечер о любви как умении, которому можно научиться.' },
    vishnevy: { title: 'Вишнёвый сад', author: 'А. Чехов', dir: 'В. Смирнов', genre: 'Комедия', age: '12+', type: 'drama', photo: 'vishnevyy-sad.jpg', pk: true, desc: 'Последняя пьеса Чехова — комедия о доме, который нельзя удержать.' },
    dury: { title: 'Дуры мы, дуры…', author: 'Д. Салимзянов', dir: 'М. Недугова', genre: 'Комедия', age: '18+', type: 'drama', photo: 'dury.jpg', pk: true, desc: 'Удивительным образом переплелись судьбы трёх женщин из небольшого городка вроде нашего.' },
    teplaya: { title: 'Тёплая память', author: 'М. Готье, С. Валиков', dir: 'С. Валиков', genre: 'Фантастический трагифарс', age: '18+', type: 'drama', photo: 'teplaya-pamyat.jpg', pk: true, desc: 'Фантастический трагифарс в одном действии.' },
    jazz2: { title: 'Русские корни джаза. Часть 2', author: 'Трио Александра Миронова', genre: 'Концерт', age: '12+', type: 'concert', photo: 'filarmoniya.jpg', pk: true, desc: 'Джазовые стандарты и русская мелодия в одной программе.' },
    volsh: { title: 'Волшебник Изумрудного города', author: 'А. Волков', dir: 'Е. Зимин', genre: 'Новогодняя сказка', age: '6+', type: 'kids', photo: 'volshebnik.jpg', pk: false, desc: 'Дорога из жёлтого кирпича ведёт навстречу настоящим приключениям!' },
    rozhd: { title: 'Рождественская история', author: 'В. Ольшанская', genre: 'Новогодний спектакль', age: '16+', type: 'drama', photo: '', pk: true, desc: 'Вечерний новогодний спектакль для взрослых.' },
    kupol: { title: 'Под куполом волшебства', author: 'Уличный театральный фестиваль', genre: 'Фестиваль', age: '', type: 'fest', photo: '', pk: false, desc: 'Уличные представления на Советской площади в новогодние каникулы.' },
    syuita: { title: 'Рождество с Александром Мироновым. «Сюита Ро»', short: 'Сюита Ро', author: 'Александр Миронов', genre: 'Концерт', age: '12+', type: 'concert', photo: 'filarmoniya.jpg', pk: true, desc: 'Рождественский концерт в Малом зале.' },
    beloe: { title: 'Белое Рождество', author: 'Диана Владимирова и трио А. Миронова', genre: 'Концерт', age: '12+', type: 'concert', photo: 'filarmoniya.jpg', pk: true, desc: 'Зимние джазовые стандарты.' },
    chetv: { title: 'Четверговые посиделки', author: 'Дмитрий Четвергов', genre: 'Концерт-мастер-класс', age: '12+', type: 'concert', photo: 'chetvergovye.jpg', pk: true, desc: 'Творческая встреча с заслуженным артистом России, гитаристом Дмитрием Четверговым.' },
    pokrovsk: { title: 'Покровские ворота', author: 'Л. Зорин', dir: 'Е. Зимин', genre: 'Музыкальная комедия', age: '16+', type: 'drama', photo: 'pokrovskie-vorota.jpg', pk: true, desc: 'Коммуналка у Покровских ворот и самая обаятельная московская история.' },
    volki: { title: 'Волки и овцы', author: 'А. Островский', dir: 'Е. Зимин', genre: 'Комедия', age: '12+', type: 'drama', photo: '', pk: true, desc: 'Островский о тех, кто съедает, и тех, кого съедают.' },
    boris: { title: 'Борис Годунов', author: 'А. Пушкин', dir: 'В. Смирнов', genre: 'Трагедия', age: '12+', type: 'drama', photo: 'boris-godunov.jpg', pk: true, desc: 'Трагедия в двух действиях. Картины Смутных времён.' },
    promamu: { title: 'Про мою маму и про меня', author: 'Е. Исаева', dir: 'М. Недугова', genre: 'Школьные сочинения', age: '12+', type: 'drama', photo: 'pro-mamu.jpg', pk: true, desc: 'Спектакль о взрослении, который смотрят вместе — подростки и родители.' }
  };

  var scenes = { main: 'Основная сцена', small: 'Малый зал', square: 'Советская площадь' };

  var raw = [
    ['2026-11-19', '19:00', 'otets', 'main', { prem: 1 }],
    ['2026-11-20', '19:00', 'otets', 'main', { prem: 1 }],
    ['2026-11-21', '17:00', 'otets', 'main', { prem: 1, status: 'few' }],
    ['2026-11-22', '17:00', 'otets', 'main', { prem: 1, status: 'sold' }],
    ['2026-11-26', '19:00', 'magiya', 'main'],
    ['2026-11-27', '19:00', 'magiya', 'main'],
    ['2026-11-28', '17:00', 'zoykina', 'main'],
    ['2026-11-29', '17:00', 'garnir', 'main'],
    ['2026-12-03', '19:00', 'iskusstvo', 'main'],
    ['2026-12-04', '19:00', 'vishnevy', 'main'],
    ['2026-12-05', '17:00', 'dury', 'main'],
    ['2026-12-06', '17:00', 'dury', 'main'],
    ['2026-12-11', '19:00', 'teplaya', 'small', { prem: 1 }],
    ['2026-12-12', '17:00', 'teplaya', 'small', { prem: 1 }],
    ['2026-12-13', '17:00', 'teplaya', 'small', { prem: 1 }],
    ['2026-12-16', '19:00', 'jazz2', 'small'],
    ['2026-12-18', '14:00', 'volsh', 'main'], ['2026-12-18', '19:00', 'rozhd', 'main'],
    ['2026-12-19', '11:00', 'volsh', 'main'], ['2026-12-19', '19:00', 'rozhd', 'main'],
    ['2026-12-20', '11:00', 'volsh', 'main'], ['2026-12-20', '17:00', 'rozhd', 'main'],
    ['2026-12-21', '14:00', 'volsh', 'main', { status: 'group' }], ['2026-12-21', '19:00', 'rozhd', 'main'],
    ['2026-12-22', '14:00', 'volsh', 'main', { status: 'group' }], ['2026-12-22', '19:00', 'rozhd', 'main'],
    ['2026-12-23', '14:00', 'volsh', 'main'], ['2026-12-23', '19:00', 'rozhd', 'main'],
    ['2026-12-24', '14:00', 'volsh', 'main'], ['2026-12-24', '19:00', 'rozhd', 'main'],
    ['2026-12-25', '11:00', 'volsh', 'main'], ['2026-12-25', '17:00', 'rozhd', 'main'],
    ['2026-12-26', '11:00', 'volsh', 'main'], ['2026-12-26', '19:00', 'rozhd', 'main'],
    ['2026-12-27', '11:00', 'volsh', 'main', { status: 'sold' }], ['2026-12-27', '17:00', 'rozhd', 'main'],
    ['2026-12-28', '11:00', 'volsh', 'main'], ['2026-12-28', '19:00', 'rozhd', 'main'],
    ['2026-12-29', '11:00', 'volsh', 'main'], ['2026-12-29', '19:00', 'rozhd', 'main'],
    ['2026-12-30', '11:00', 'volsh', 'main', { status: 'few' }], ['2026-12-30', '17:00', 'rozhd', 'main'],
    ['2027-01-02', '17:00', 'kupol', 'square', { status: 'info', end: '19:00', note: 'Открытие фестиваля' }],
    ['2027-01-02', '17:00', 'rozhd', 'main'],
    ['2027-01-03', '11:00', 'volsh', 'main'], ['2027-01-03', '19:00', 'rozhd', 'main'],
    ['2027-01-04', '11:00', 'volsh', 'main'], ['2027-01-04', '17:00', 'rozhd', 'main'],
    ['2027-01-05', '11:00', 'volsh', 'main'], ['2027-01-05', '19:00', 'rozhd', 'main'],
    ['2027-01-07', '17:00', 'kupol', 'square', { status: 'info', end: '19:00' }],
    ['2027-01-07', '17:00', 'syuita', 'small'],
    ['2027-01-08', '17:00', 'dury', 'main'],
    ['2027-01-09', '17:00', 'dury', 'main'],
    ['2027-01-10', '17:00', 'magiya', 'main'],
    ['2027-01-16', '17:00', 'beloe', 'small'],
    ['2027-01-20', '18:00', 'chetv', 'small'],
    ['2027-01-23', '17:00', 'pokrovsk', 'main'],
    ['2027-01-24', '17:00', 'pokrovsk', 'main'],
    ['2027-01-28', '19:00', 'volki', 'main'],
    ['2027-01-29', '19:00', 'volki', 'main'],
    ['2027-01-30', '17:00', 'boris', 'main'],
    ['2027-01-31', '17:00', 'promamu', 'main']
  ];

  var events = raw.map(function (r, i) {
    var o = r[4] || {};
    return { id: 'e' + i, date: r[0], time: r[1], show: r[2], scene: r[3], prem: !!o.prem, status: o.status || 'sale', end: o.end || '', note: o.note || '' };
  });

  return { shows: shows, scenes: scenes, events: events };
})();
