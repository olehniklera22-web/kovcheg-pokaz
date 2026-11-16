(function () {
  var KV = window.KV, S = KV.shows, root = document.documentElement;
  root.classList.add('js');

  /* ---------- helpers ---------- */
  var MG = ['января','февраля','марта','апреля','мая','июня','июля','августа','сентября','октября','ноября','декабря'];
  var MN = ['Январь','Февраль','Март','Апрель','Май','Июнь','Июль','Август','Сентябрь','Октябрь','Ноябрь','Декабрь'];
  var WD = ['воскресенье','понедельник','вторник','среда','четверг','пятница','суббота'];
  var WS = ['вс','пн','вт','ср','чт','пт','сб'];
  function pd(s) { var a = s.split('-'); return new Date(+a[0], a[1] - 1, +a[2]); }
  function iso(d) { return d.getFullYear() + '-' + String(d.getMonth() + 1).padStart(2, '0') + '-' + String(d.getDate()).padStart(2, '0'); }
  function esc(s) { return String(s).replace(/[&<>"]/g, function (c) { return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]; }); }
  function store(k, v) { try { if (v === undefined) return JSON.parse(localStorage.getItem(k)); localStorage.setItem(k, JSON.stringify(v)); } catch (e) { return null; } }
  var qs = new URLSearchParams(location.search);
  var TODAY = qs.get('today') ? pd(qs.get('today')) : new Date();
  TODAY.setHours(0, 0, 0, 0);
  var upcoming = KV.events.filter(function (e) { return pd(e.date) >= TODAY; });
  if (!upcoming.length) upcoming = KV.events.slice();
  function ageNum(a) { return parseInt(a, 10) || 0; }
  function title(s) { return s.short || s.title; }
  function photo(s, cls) {
    return s.photo
      ? '<div class="ph ' + (cls || '') + '"><img src="photos/' + s.photo + '" alt="' + esc(s.title) + '" loading="lazy"></div>'
      : '<div class="ph ph-none ' + (cls || '') + '" aria-hidden="true"><span>' + esc(title(s)) + '</span></div>';
  }
  function tags(e, s) {
    var t = [];
    if (e.prem) t.push('<span class="tag tag-prem">Премьера</span>');
    if (s.age) t.push('<span class="tag tag-age">' + s.age + '</span>');
    if (s.pk && e.status !== 'group' && e.status !== 'info') t.push('<span class="tag tag-pk">Пушкинская карта</span>');
    if (e.status === 'few') t.push('<span class="tag tag-few">Мало мест</span>');
    if (e.status === 'sold') t.push('<span class="tag tag-sold">Аншлаг</span>');
    if (e.status === 'group') t.push('<span class="tag tag-group">Только по заявке</span>');
    return t.join('');
  }
  function action(e) {
    if (e.status === 'sold') return '<button class="btn btn-sm is-off" disabled>Билетов нет</button><span class="st">Следите за возвратами</span>';
    if (e.status === 'group') return '<button class="btn btn-sm btn-line" data-buy="' + e.id + '">Оставить заявку</button><span class="st">Для школ и групп</span>';
    if (e.status === 'info') return '<a class="btn btn-sm btn-line" href="#">Программа</a><span class="st">Под открытым небом</span>';
    return '<button class="btn btn-sm btn-buy" data-buy="' + e.id + '">Купить</button>';
  }
  function evRow(e, mode) {
    var s = S[e.show], d = pd(e.date);
    var date = mode === 'day'
      ? '<div class="date"><b>' + e.time + '</b></div>'
      : '<div class="date"><b>' + d.getDate() + '</b><span>' + MG[d.getMonth()].slice(0, 3) + '<br>' + WS[d.getDay()] + '</span></div>';
    var meta = (mode === 'day' ? '' : '<span class="time">' + e.time + (e.end ? '–' + e.end : '') + '</span> · ') +
      KV.scenes[e.scene] + ' · ' + esc(s.author) + (s.dir ? ', реж. ' + esc(s.dir) : '');
    return '<article class="ev">' + date +
      '<a class="thumb" href="#" tabindex="-1" aria-hidden="true">' + photo(s) + '</a>' +
      '<div class="info"><h3 class="title"><a href="#">' + esc(s.title) + '</a></h3>' +
      '<div class="meta">' + (e.note ? esc(e.note) + ' · ' : '') + esc(s.genre) + ' · ' + meta + '</div>' +
      '<div class="tags">' + tags(e, s) + '</div></div>' +
      '<div class="act">' + action(e) + '</div></article>';
  }
  window.KVH = { pd: pd, iso: iso, esc: esc, MG: MG, MN: MN, WD: WD, WS: WS, TODAY: TODAY, upcoming: upcoming, evRow: evRow, ageNum: ageNum, title: title, photo: photo };

  /* ---------- header & footer ---------- */
  var page = document.body.dataset.page;
  var eye = '<svg viewBox="0 0 24 14" fill="none" stroke="currentColor" stroke-width="1.6" aria-hidden="true"><path d="M1 7s4-6 11-6 11 6 11 6-4 6-11 6S1 7 1 7z"/><circle cx="12" cy="7" r="3"/></svg>';
  var hdr = document.getElementById('site-header');
  if (hdr) hdr.outerHTML =
    '<a class="sr" href="#main">Перейти к содержанию</a>' +
    '<div class="util"><div class="wrap">' +
      '<a class="hide-m" href="#pk">Театр — участник программы «Пушкинская карта»</a>' +
      '<span class="push"></span>' +
      '<button class="a11y-btn" type="button" aria-expanded="false" aria-controls="a11y">' + eye + '<span>Версия для слабовидящих</span></button>' +
      '<a class="phone" href="tel:+74965457575">+7 496 545-75-75</a>' +
      '<a class="hide-m" href="https://t.me/teatralnykovcheg">Telegram</a><a class="hide-m" href="https://vk.ru/teatralnykovcheg">ВКонтакте</a>' +
    '</div></div>' +
    '<div class="a11y-panel" id="a11y"><div class="wrap">' +
      '<div class="grp" role="group" aria-label="Размер текста"><span>Шрифт</span><button data-fz="0">A</button><button data-fz="1">A+</button><button data-fz="2">A++</button></div>' +
      '<div class="grp" role="group" aria-label="Цвета"><span>Цвета</span><button data-cl="hc">Чёрный фон</button><button data-cl="light">Белый фон</button></div>' +
      '<div class="grp" role="group" aria-label="Изображения"><span>Картинки</span><button data-img="1">Показывать</button><button data-img="0">Скрыть</button></div>' +
      '<button data-off="1">Обычная версия</button>' +
    '</div></div>' +
    '<header class="hdr"><div class="wrap">' +
      '<a class="logo" href="index.html"><img src="assets/logo.png" alt="Театральный ковчег в Дубраве — на главную" width="900" height="385"></a>' +
      '<nav class="nav" id="nav" aria-label="Основное меню">' +
        '<a href="afisha.html"' + (page === 'afisha' ? ' aria-current="page"' : '') + '>Афиша</a><a href="#">Репертуар</a><a href="index.html#fest">Фестивали</a><a href="index.html#about">Театр</a><a href="#">Труппа</a><a href="index.html#who">Зрителям</a>' +
      '</nav>' +
      '<a class="btn btn-buy" href="afisha.html">Купить билет</a>' +
      '<button class="burger" type="button" aria-label="Меню" aria-expanded="false" aria-controls="nav"><span></span></button>' +
    '</div></header>';

  var ftr = document.getElementById('site-footer');
  if (ftr) ftr.outerHTML =
    '<footer class="ftr" id="contacts"><div class="wrap">' +
      '<div class="ftr-top">' +
        '<div class="help"><span class="eyebrow">Касса театра — поможем</span>' +
          '<a class="tel" href="tel:+74965457575">+7 496 545-75-75</a>' +
          '<p>Касса: ср–пт 12:00–19:00, сб–вс 13:00–18:30, пн и вт — выходные. Онлайн — круглосуточно.</p>' +
          '<p>Сергиев Посад, мкр. Семхоз, Парковая ул., 16 — культурно-просветительский центр «Дубрава».</p>' +
          '<div class="btns"><a class="btn btn-sm btn-line" href="#">Как добраться</a><a class="btn btn-sm btn-line" href="#">Покупка и возврат билетов</a></div>' +
        '</div>' +
        '<div><h4>Зрителям</h4><ul><li><a href="afisha.html">Афиша</a></li><li><a href="#">Репертуар</a></li><li><a href="#">Льготы</a></li><li><a href="#pk">Пушкинская карта</a></li><li><a href="#">Подарочный сертификат</a></li><li><a href="#">Правила посещения</a></li></ul></div>' +
        '<div><h4>Театр</h4><ul><li><a href="#">История</a></li><li><a href="#">Труппа</a></li><li><a href="#">Фестиваль «У Троицы»</a></li><li><a href="#">Новости</a></li><li><a href="#">Залы и техника сцены</a></li></ul></div>' +
        '<div><h4>Связь</h4><ul><li><a href="https://t.me/teatralnykovcheg">Telegram</a></li><li><a href="https://vk.ru/teatralnykovcheg">ВКонтакте</a></li><li><a href="#">MAX</a></li><li><a href="mailto:teatr-kovcheg@yandex.ru">teatr-kovcheg@yandex.ru</a></li></ul></div>' +
      '</div>' +
      '<div class="ftr-gov">' +
        '<a class="gov" href="#"><i></i>Сведения об организации</a><a class="gov" href="#"><i></i>Документы</a><a class="gov" href="#"><i></i>Независимая оценка качества</a><a class="gov" href="#"><i></i>Решаем вместе — Госуслуги</a><a class="gov" href="#"><i></i>PRO.Культура.РФ</a>' +
      '</div>' +
      '<div class="ftr-bot"><span>© 2004–2027 МБУК «Драматический театр „Театральный ковчег в Дубраве“»</span><a href="#">Политика конфиденциальности</a></div>' +
    '</div></footer>' +
    '<dialog id="buy" aria-labelledby="buy-t"><div class="dlg"><button class="x" type="button" aria-label="Закрыть">×</button>' +
      '<span class="eyebrow" id="buy-k">Покупка билета</span><h2 class="h-m" id="buy-t"></h2><p class="soft" id="buy-m"></p>' +
      '<div class="box">Здесь откроется виджет QuickTickets: схема зала, выбор мест и оплата — не уходя с сайта театра.</div>' +
      '<p class="small">Можно оплатить Пушкинской картой, если у спектакля есть метка. <a href="#">Правила возврата</a> — здесь же, рядом с покупкой.</p>' +
    '</div></dialog><div class="toast" role="status" aria-live="polite"></div>';

  /* ---------- menu ---------- */
  var burger = document.querySelector('.burger'), nav = document.getElementById('nav');
  if (burger) burger.addEventListener('click', function () {
    var o = nav.classList.toggle('open'); burger.setAttribute('aria-expanded', o);
  });

  /* ---------- a11y ---------- */
  var A = store('kv-a11y') || { on: false, fz: 0, cl: '', img: 1 };
  var panel = document.getElementById('a11y'), abtn = document.querySelector('.a11y-btn');
  function applyA() {
    root.classList.toggle('a11y', A.on);
    root.classList.toggle('fz1', A.on && A.fz === 1);
    root.classList.toggle('fz2', A.on && A.fz === 2);
    root.classList.toggle('hc', A.on && A.cl === 'hc');
    root.classList.toggle('light', A.on && A.cl === 'light');
    root.classList.toggle('noimg', A.on && !A.img);
    if (panel) {
      panel.classList.toggle('open', A.on);
      panel.querySelectorAll('[data-fz]').forEach(function (b) { b.setAttribute('aria-pressed', +b.dataset.fz === A.fz); });
      panel.querySelectorAll('[data-cl]').forEach(function (b) { b.setAttribute('aria-pressed', b.dataset.cl === A.cl); });
      panel.querySelectorAll('[data-img]').forEach(function (b) { b.setAttribute('aria-pressed', +b.dataset.img === +A.img); });
    }
    if (abtn) { abtn.setAttribute('aria-expanded', A.on); abtn.querySelector('span').textContent = A.on ? 'Обычная версия' : 'Версия для слабовидящих'; }
    store('kv-a11y', A);
  }
  if (abtn) abtn.addEventListener('click', function () { A.on = !A.on; if (A.on && !A.cl) A.cl = 'hc'; if (A.on && !A.fz) A.fz = 1; applyA(); });
  if (panel) panel.addEventListener('click', function (ev) {
    var b = ev.target.closest('button'); if (!b) return;
    if (b.dataset.fz) A.fz = +b.dataset.fz;
    if (b.dataset.cl) A.cl = b.dataset.cl;
    if (b.dataset.img) A.img = +b.dataset.img;
    if (b.dataset.off) A.on = false;
    applyA();
  });
  applyA();

  /* ---------- buy dialog ---------- */
  var dlg = document.getElementById('buy');
  document.addEventListener('click', function (ev) {
    var b = ev.target.closest('[data-buy]');
    if (b) {
      var e = KV.events.find(function (x) { return x.id === b.dataset.buy; }), s = S[e.show], d = pd(e.date);
      document.getElementById('buy-k').textContent = e.status === 'group' ? 'Заявка на групповой показ' : 'Покупка билета';
      document.getElementById('buy-t').textContent = s.title;
      document.getElementById('buy-m').textContent = d.getDate() + ' ' + MG[d.getMonth()] + ', ' + WD[d.getDay()] + ', ' + e.time + ' · ' + KV.scenes[e.scene] + (s.age ? ' · ' + s.age : '');
      if (dlg.showModal) dlg.showModal(); else dlg.setAttribute('open', '');
      return;
    }
    if (ev.target.closest('.dlg .x') || ev.target === dlg) dlg.close();
    var a = ev.target.closest('a[href="#"]');
    if (a) { ev.preventDefault(); toast('В концепции этот раздел не свёрстан'); }
  });
  var tt;
  function toast(m) { var t = document.querySelector('.toast'); t.textContent = m; t.classList.add('on'); clearTimeout(tt); tt = setTimeout(function () { t.classList.remove('on'); }, 2200); }

  /* ---------- reveal ---------- */
  if ('IntersectionObserver' in window) {
    var io = new IntersectionObserver(function (en) { en.forEach(function (x) { if (x.isIntersecting) { x.target.classList.add('in'); io.unobserve(x.target); } }); }, { rootMargin: '0px 0px -8% 0px' });
    document.querySelectorAll('.rv').forEach(function (el) { io.observe(el); });
  } else document.querySelectorAll('.rv').forEach(function (el) { el.classList.add('in'); });
})();
