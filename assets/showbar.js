/* Плашка для показа клиенту: переключает вариант (1 / 2) и страницу (главная / спектакль / труппа).
   Смена варианта оставляет на той же странице и том же спектакле. Внутри превью на странице показа скрыта. */
(function () {
  if (window.self !== window.top) return;
  var H = window.KVH || {}, V2 = !!H.V2;
  var path = location.pathname, qs = new URLSearchParams(location.search);
  var page = /spektakl\.html/.test(path) ? 'show' : /truppa\.html/.test(path) ? 'troupe' : 'home';
  var show = qs.get('id') || (V2 ? 'vishnevy' : 'zoykina');
  function url(p, v2) {
    if (p === 'home') return v2 ? 'main-2.html' : 'main-1.html';
    if (p === 'show') return 'spektakl.html?id=' + show + (v2 ? '&v=2' : '');
    return 'truppa.html' + (v2 ? '?v=2' : '');
  }
  function a(href, text, on) { return '<a href="' + href + '"' + (on ? ' class="on" aria-current="true"' : '') + '>' + text + '</a>'; }
  var bar = document.createElement('nav');
  bar.className = 'mbar';
  bar.setAttribute('aria-label', 'Варианты сайта для показа');
  bar.innerHTML = '<span>Вариант</span>' + a(url(page, false), '1 · По датам', !V2) + a(url(page, true), '2 · По спектаклям', V2) +
    '<i></i><span>Страница</span>' + a(url('home', V2), 'Главная', page === 'home') + a(url('show', V2), 'Спектакль', page === 'show') + a(url('troupe', V2), 'Труппа', page === 'troupe');
  document.body.appendChild(bar);
})();
