/* Система афиши для главной: фильтры «месяц» + «тип» и два способа показа —
   по датам (data-mode="date") и по спектаклям (data-mode="show"). */
(function () {
  var host = document.getElementById('afs');
  if (!host) return;
  var H = window.KVH, S = KV.shows, SC = KV.scenes, MODE = host.dataset.mode;
  var PRICE = { drama: 600, kids: 500, concert: 300 };
  var TYPES = [['all', 'Всё'], ['drama', 'Спектакли'], ['kids', 'Детям'], ['concert', 'Концерты']];
  var months = []; H.upcoming.forEach(function (e) { var m = e.date.slice(0, 7); if (months.indexOf(m) < 0) months.push(m); });
  var st = { m: 'all', t: 'all', n: MODE === 'date' ? 10 : 6, open: {} };

  host.innerHTML =
    '<div class="afs-f"><div class="afs-row" role="group" aria-label="Месяц" id="afs-m"></div>' +
    '<div class="afs-row" role="group" aria-label="Что" id="afs-t"></div></div>' +
    '<div class="afs-sum" id="afs-sum" aria-live="polite"></div><div id="afs-out"></div><div class="afs-more" id="afs-more"></div>';

  function plural(n, a, b, c) { var x = n % 10, y = n % 100; return x === 1 && y !== 11 ? a : x >= 2 && x <= 4 && (y < 10 || y >= 20) ? b : c; }
  function ok(e) { var s = S[e.show]; if (s.type === 'fest') return false; if (st.m !== 'all' && e.date.slice(0, 7) !== st.m) return false; if (st.t !== 'all' && s.type !== st.t) return false; return true; }
  function act(e, small) {
    if (e.status === 'sold') return '<span class="afs-no">Аншлаг</span>';
    if (e.status === 'group') return '<button class="afs-btn ghost" type="button" data-buy="' + e.id + '">Заявка</button>';
    return '<button class="afs-btn" type="button" data-buy="' + e.id + '">' + (small ? 'Купить' : 'Купить билет') + '</button>';
  }
  function chipsRow(arr, cur, key) {
    return arr.map(function (o) { return '<button type="button" class="afs-chip" data-' + key + '="' + o[0] + '" aria-pressed="' + (o[0] === cur) + '">' + o[1] + '</button>'; }).join('');
  }

  function byDate(list) {
    var h = '', cd = '', cm = '';
    list.slice(0, st.n).forEach(function (e) {
      var s = S[e.show], d = H.pd(e.date), m = e.date.slice(0, 7), first = e.date !== cd, we = d.getDay() === 0 || d.getDay() === 6;
      if (m !== cm && st.m === 'all') { h += '<div class="afs-mh">' + H.MN[d.getMonth()] + '</div>'; }
      cm = m; cd = e.date;
      h += '<div class="afs-ev' + (first ? ' first' : '') + '" data-show="' + e.show + '">' +
        '<span class="afs-d' + (we ? ' we' : '') + '">' + (first ? '<b>' + d.getDate() + '</b> ' + H.MG[d.getMonth()].slice(0, 3) + '<small>' + H.WD[d.getDay()] + '</small>' : '') + '</span>' +
        '<span class="afs-tm">' + e.time + '</span>' +
        '<span class="afs-th">' + (s.photo ? '<img src="photos/' + s.photo + '" alt="" loading="lazy">' : '') + '</span>' +
        '<span class="afs-ti"><a href="#">' + H.esc(s.title) + '</a>' + (e.prem ? '<em>премьера</em>' : '') +
        '<small>' + H.esc(s.genre) + (s.age ? ' · ' + s.age : '') + ' · ' + SC[e.scene] + (s.pk ? ' · Пушкинская карта' : '') + '</small></span>' +
        '<span class="afs-pr">' + (PRICE[s.type] ? 'от ' + PRICE[s.type] + ' ₽' : '') + (e.status === 'few' ? '<small>мало мест</small>' : '') + '</span>' +
        '<span class="afs-ac">' + act(e) + '</span></div>';
    });
    return h;
  }

  function byShow(list) {
    var g = [], map = {}; list.forEach(function (e) { if (!map[e.show]) { map[e.show] = []; g.push(e.show); } map[e.show].push(e); });
    return { total: g.length, html: '<div class="afs-grid">' + g.slice(0, st.n).map(function (k) {
      var s = S[k], ev = map[k], lim = st.open[k] ? 99 : 4, prem = ev.some(function (e) { return e.prem; });
      return '<article class="afs-card"><a class="afs-ph" href="#">' + (s.photo ? '<img src="photos/' + s.photo + '" alt="" loading="lazy">' : '<span>' + H.esc(s.short || s.title) + '</span>') + (prem ? '<em>премьера</em>' : '') + '</a>' +
        '<div class="afs-cb"><h3><a href="#">' + H.esc(s.title) + '</a></h3><p>' + H.esc(s.genre) + (s.age ? ' · ' + s.age : '') + (PRICE[s.type] ? ' · от ' + PRICE[s.type] + ' ₽' : '') + '</p>' +
        '<div class="afs-dates">' + ev.slice(0, lim).map(function (e) {
          var d = H.pd(e.date), l = '<b>' + d.getDate() + ' ' + H.MG[d.getMonth()].slice(0, 3) + '</b><span>' + H.WS[d.getDay()] + ', ' + e.time + '</span>';
          return e.status === 'sold' ? '<span class="afs-dt sold" title="Аншлаг">' + l + '</span>' : '<button type="button" class="afs-dt' + (e.status === 'few' ? ' few' : '') + '" data-buy="' + e.id + '">' + l + '</button>';
        }).join('') + (ev.length > lim ? '<button type="button" class="afs-dt more" data-open="' + k + '"><b>ещё ' + (ev.length - lim) + '</b><span>' + plural(ev.length - lim, 'дата', 'даты', 'дат') + '</span></button>' : '') + '</div></div></article>';
    }).join('') + '</div>' };
  }

  function render() {
    document.getElementById('afs-m').innerHTML = chipsRow([['all', 'Все даты']].concat(months.map(function (m) { return [m, H.MN[+m.split('-')[1] - 1]]; })), st.m, 'm');
    document.getElementById('afs-t').innerHTML = chipsRow(TYPES, st.t, 't');
    var list = H.upcoming.filter(ok), out = document.getElementById('afs-out'), more = document.getElementById('afs-more');
    var shows = {}; list.forEach(function (e) { shows[e.show] = 1; });
    var ns = Object.keys(shows).length;
    document.getElementById('afs-sum').textContent = list.length + ' ' + plural(list.length, 'показ', 'показа', 'показов') + ' · ' + ns + ' ' + plural(ns, 'спектакль', 'спектакля', 'спектаклей');
    if (!list.length) { out.innerHTML = '<p class="afs-empty">В этом месяце таких событий нет.</p>'; more.innerHTML = ''; return; }
    if (MODE === 'date') {
      out.innerHTML = byDate(list);
      var rest = list.length - st.n;
      more.innerHTML = rest > 0 ? '<button type="button" class="afs-btn ghost" data-more>Показать ещё ' + Math.min(rest, 10) + ' из ' + rest + '</button>' : '';
    } else {
      var r = byShow(list); out.innerHTML = r.html;
      more.innerHTML = r.total > st.n ? '<button type="button" class="afs-btn ghost" data-more>Показать все спектакли — ' + r.total + '</button>' : '';
    }
  }
  host.addEventListener('click', function (ev) {
    var t = ev.target, b;
    if ((b = t.closest('[data-m]'))) { st.m = b.dataset.m; st.n = MODE === 'date' ? 10 : 6; render(); return; }
    if ((b = t.closest('[data-t]'))) { st.t = b.dataset.t; st.n = MODE === 'date' ? 10 : 6; render(); return; }
    if (t.closest('[data-more]')) { st.n += MODE === 'date' ? 10 : 99; render(); return; }
    if ((b = t.closest('[data-open]'))) { st.open[b.dataset.open] = true; render(); }
  });

  /* всплывающая афиша при наведении на строку (вариант «по датам», только мышь) */
  if (MODE === 'date' && host.hasAttribute('data-hover') && matchMedia('(hover: hover) and (pointer: fine)').matches) {
    var pop = document.createElement('div'); pop.className = 'afs-pop'; pop.setAttribute('aria-hidden', 'true'); document.body.appendChild(pop);
    var curShow = '', tx = 0, ty = 0, x = 0, y = 0, raf = 0;
    function fill(k) {
      var s = S[k], i = 0, seed = 0; for (; i < k.length; i++) seed += k.charCodeAt(i);
      var edge = window.KVStrip ? window.KVStrip(seed * 37, 30) : '';
      if (!s.photo) { pop.innerHTML = ''; return; }
      pop.style.setProperty('--rot', ((seed % 7) - 3) * .8 + 'deg');
      pop.innerHTML = '<div class="card"><span class="tape"></span><img src="photos/' + s.photo + '" alt=""><div class="edge">' + edge + '</div></div>' +
        '<span class="tag">' + H.esc(s.genre) + (s.age ? ' · ' + s.age : '') + '</span>';
    }
    function loop() { x += (tx - x) * .22; y += (ty - y) * .22; pop.style.transform = 'translate(' + x + 'px,' + y + 'px)'; raf = (Math.abs(tx - x) + Math.abs(ty - y) > .5) ? requestAnimationFrame(loop) : 0; }
    host.addEventListener('mousemove', function (e) {
      var row = e.target.closest('.afs-ev');
      if (!row || e.target.closest('.afs-btn')) { pop.classList.remove('on'); curShow = ''; return; }
      var k = row.dataset.show;
      if (k !== curShow) { curShow = k; fill(k); }
      var w = pop.offsetWidth || 300, h = pop.offsetHeight || 260;
      var r = row.getBoundingClientRect(); tx = Math.min(Math.max(e.clientX + 40, r.left + r.width * .5), innerWidth - w - 16); ty = Math.max(16, Math.min(e.clientY - h / 2, innerHeight - h - 16));
      if (!pop.classList.contains('on')) { x = tx; y = ty; pop.classList.add('on'); }
      if (!raf) raf = requestAnimationFrame(loop);
    });
    host.addEventListener('mouseleave', function () { pop.classList.remove('on'); curShow = ''; });
    addEventListener('scroll', function () { pop.classList.remove('on'); curShow = ''; }, { passive: true });
  }
  render();
})();
