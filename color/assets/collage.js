(function () {
  var me = document.currentScript, root = me.getAttribute('data-root') || '';

  /* ---------- люди театра (фото с диска театра, подписи — из названий файлов) ---------- */
  var PEOPLE = [
    ['00', 'Александр Кравченко', 'актёр', 'stage'],
    ['03', 'Арина Половинкина', 'актриса', 'stage'],
    ['04', 'Валерия Кокшарова', 'актриса', 'stage'],
    ['05', 'Владимир Шелехин', 'актёр', 'stage'],
    ['07', 'Геннадий Хасанов', 'заслуженный артист Московской области', 'stage'],
    ['08', 'Дарья Блинова', 'актриса', 'stage'],
    ['09', 'Иван Хромов', 'актёр', 'stage'],
    ['10', 'Игорь Курылев', 'актёр', 'stage'],
    ['11', 'Игорь Сидоркин', 'актёр', 'stage'],
    ['12', 'Ирина Дегтяренко', 'актриса', 'stage'],
    ['13', 'Кирилл Тисленков', 'актёр', 'stage'],
    ['14', 'Константин Житинев', 'актёр', 'stage'],
    ['15', 'Ксения Катина', 'актриса', 'stage'],
    ['16', 'Максим Беляев', 'актёр', 'stage'],
    ['17', 'Максим Каранкевич', 'актёр', 'stage'],
    ['19', 'Марина Петухова', 'актриса', 'stage'],
    ['20', 'Марина Фудина', 'актриса', 'stage'],
    ['22', 'Павел Зверев', 'актёр, заведующий постановочной частью', 'stage'],
    ['23', 'Павел Копылов', 'актёр, помощник режиссёра', 'stage'],
    ['24', 'Полина Бугакова', 'актриса', 'stage'],
    ['25', 'Роман Иконников', 'актёр', 'stage'],
    ['26', 'Сергей Недугов', 'актёр', 'stage'],
    ['27', 'Юлия Медведева', 'актриса', 'stage'],
    ['06', 'Вячеслав Смирнов', 'художественный руководитель', 'team'],
    ['18', 'Марина Игнатова', 'директор театра', 'team'],
    ['21', 'Мария Недугова', 'режиссёр', 'team'],
    ['01', 'Александр Локтионов', 'режиссёр', 'team'],
    ['02', 'Александр Миронов', 'руководитель Филармонии', 'team']
  ];
  window.KV_PEOPLE = PEOPLE;
  var byId = {}; PEOPLE.forEach(function (p) { byId[p[0]] = p; });
  function src(id) { return root + 'photos/artists/' + id + '.png'; }
  function esc(s) { return String(s).replace(/[&<>"]/g, function (c) { return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]; }); }

  /* ---------- рваная бумага ---------- */
  function rnd(seed) { var s = seed % 2147483647; if (s <= 0) s += 2147483646; return function () { s = s * 16807 % 2147483647; return (s - 1) / 2147483646; }; }
  function edge(r, y0, amp, dir) {
    var pts = [], x = 0;
    while (x < 1000) { pts.push([x, y0 + (r() * amp) * dir]); x += 4 + r() * 12; }
    pts.push([1000, y0 + (r() * amp) * dir]);
    return pts;
  }
  function strip(seed, h) {
    var r = rnd(seed), top = edge(r, 10, 9, 1), bot = edge(r, h - 10, 9, -1).reverse();
    var p = 'M' + top.map(function (q) { return q[0].toFixed(1) + ' ' + q[1].toFixed(1); }).join('L') + 'L' + bot.map(function (q) { return q[0].toFixed(1) + ' ' + q[1].toFixed(1); }).join('L') + 'Z';
    var r2 = rnd(seed + 7), top2 = edge(r2, 7, 7, 1), bot2 = edge(r2, h - 7, 7, -1).reverse();
    var p2 = 'M' + top2.map(function (q) { return q[0].toFixed(1) + ' ' + q[1].toFixed(1); }).join('L') + 'L' + bot2.map(function (q) { return q[0].toFixed(1) + ' ' + q[1].toFixed(1); }).join('L') + 'Z';
    return '<svg viewBox="0 0 1000 ' + h + '" preserveAspectRatio="none" aria-hidden="true"><path class="fib" d="' + p2 + '"/><path class="pap" d="' + p + '"/></svg>';
  }
  /* полоса бумаги между блоками: <div class="rip" data-seed="3"></div> */
  document.querySelectorAll('.rip').forEach(function (el, i) {
    el.innerHTML = strip(+(el.dataset.seed || i + 3) * 977, +(el.dataset.h || 46));
  });
  /* произвольный клочок бумаги: <div data-strip="5" data-h="80"></div> */
  window.KVStrip = strip;
  document.querySelectorAll('[data-strip]').forEach(function (el) {
    el.innerHTML = strip(+el.dataset.strip * 613 + 11, +(el.dataset.h || 60));
  });

  /* ---------- блок «Лица театра» ---------- */
  var host = document.getElementById('faces');
  if (!host) return;
  var hero = ['14', '03', '17', '10', '12', '07', '24', '16', '19'];
  var pos = [
    [-1, 96, 2], [9, 86, 4], [20, 100, 3], [31, 82, 5], [41, 98, 2], [53, 88, 4], [64, 94, 3], [75, 84, 5], [85, 97, 2]
  ];
  var collage = '<div class="lc-col" aria-label="Коллаж: артисты театра">' +
    '<div class="lc-strip s1">' + strip(4111, 70) + '</div><div class="lc-strip s2">' + strip(9227, 60) + '</div>' +
    hero.map(function (id, i) {
      var p = byId[id], q = pos[i];
      return '<a class="lc-fig f' + i + '" href="' + (window.KVH ? KVH.artistUrl(id) : 'artist.html?id=' + id) + '" style="left:' + q[0] + '%;height:' + q[1] + '%;z-index:' + q[2] + '"><img src="' + src(id) + '" alt="' + esc(p[1]) + '" loading="lazy"><figcaption>' + esc(p[1]) + '</figcaption></a>';
    }).join('') + '</div>';
  /* data-compact: на главной — только коллаж и ссылка на всю труппу */
  if (host.hasAttribute('data-compact')) {
    host.innerHTML = collage + '<div class="lc-bar lc-bar-c"><span>' + PEOPLE.length + ' человек: актёры, режиссёры и руководство</span><a class="link-arrow" href="' + (host.dataset.href || '#') + '">Вся труппа</a></div>';
    return;
  }
  var stage = PEOPLE.filter(function (p) { return p[3] === 'stage'; }), team = PEOPLE.filter(function (p) { return p[3] === 'team'; });
  host.innerHTML = collage +
    '<div class="lc-bar"><div class="lc-tabs" role="tablist" aria-label="Кого показать">' +
    '<button type="button" role="tab" aria-selected="true" data-g="stage">Актёры <i>' + stage.length + '</i></button>' +
    '<button type="button" role="tab" aria-selected="false" data-g="team">Руководство и режиссёры <i>' + team.length + '</i></button></div></div>' +
    '<div class="lc-grid" id="lc-grid"></div><div class="lc-more" id="lc-more"></div>';
  var g = 'stage', all = false, LIM = 12;
  function draw() {
    var list = PEOPLE.filter(function (p) { return p[3] === g; }), shown = all ? list : list.slice(0, LIM);
    document.getElementById('lc-grid').innerHTML = shown.map(function (p, i) {
      return '<a class="lc-card" href="' + (window.KVH ? KVH.artistUrl(p[0]) : 'artist.html?id=' + p[0]) + '"><span class="lc-ph">' + strip(300 + i * 31, 40).replace('<svg', '<svg class="lc-edge"') + '<img src="' + src(p[0]) + '" alt="" loading="lazy"></span><b>' + esc(p[1]) + '</b><small>' + esc(p[2]) + '</small></a>';
    }).join('');
    document.getElementById('lc-more').innerHTML = !all && list.length > LIM ? '<button type="button" data-lc-all>Показать всех — ' + list.length + '</button>' : '';
    host.querySelectorAll('[data-g]').forEach(function (b) { b.setAttribute('aria-selected', b.dataset.g === g); });
  }
  host.addEventListener('click', function (e) {
    var b = e.target.closest('[data-g]'); if (b) { g = b.dataset.g; all = false; draw(); return; }
    if (e.target.closest('[data-lc-all]')) { all = true; draw(); }
  });
  draw();
})();
