(function () {
  var V = document.body.dataset.hv;
  var SL = [
    { title: 'Зойкина<br>квартира', plain: 'Зойкина квартира', tag: 'Комедия · 16+', when: '28 ноября · Основная сцена', by: 'комедия Михаила Булгакова · режиссёр В. Смирнов', buy: 'e6',
      figs: [{ src: 'zoykina-man.png', h: 92, x: 52, z: 4 }, { src: 'zoykina-group.png', h: 50, x: 4, z: 3 }], v3: { r: 'zoykina-man.png', l: 'zoykina-group.png' } },
    { title: 'Вишнёвый<br>сад', plain: 'Вишнёвый сад', tag: 'Комедия · 12+', when: '4 декабря · Основная сцена', by: 'комедия Антона Чехова · режиссёр В. Смирнов', buy: 'e9',
      figs: [{ src: 'vishnevy-trio.png', h: 62, x: 6, z: 3 }, { src: 'vishnevy-hug.png', h: 70, x: 62, z: 4 }], v3: { r: 'vishnevy-hug.png', l: 'vishnevy-trio.png' } },
    { title: 'Волшебник<br>Изумрудного<br>города', plain: 'Волшебник Изумрудного города', tag: 'Сказка · 6+', when: '18 декабря — 5 января', by: 'новогодняя сказка по Александру Волкову', link: 'afisha.html?m=2026-12&t=kids',
      figs: [{ src: 'volshebnik-heroes.png', h: 66, x: 20, z: 4 }], v3: { r: 'volshebnik-heroes.png' } }
  ];
  function fig(f) { return '<figure class="cut" style="left:' + f.x + '%;height:' + f.h + '%;z-index:' + f.z + '"><img src="photos/stage/' + f.src + '" alt=""></figure>'; }
  function cta(s) { return s.buy ? '<button class="btn btn-buy" data-buy="' + s.buy + '">Купить билет</button>' : '<a class="btn btn-buy" href="' + s.link + '">Купить билет</a>'; }
  var cur = 0, timer, reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;

  function draw() {
    var s = SL[cur];
    if (V === '1') {
      document.getElementById('txt').innerHTML = '<div class="hv-fade"><span class="hv-tag">' + s.tag + '</span><h1 class="h-xl">' + s.title + '</h1><p class="when">' + s.when + '</p><div class="row">' + cta(s) + '</div></div>';
      document.getElementById('stage').innerHTML = '<div class="hv-fade" style="position:absolute;inset:0">' + s.figs.map(fig).join('') + '</div>';
    }
    if (V === '3') {
      document.getElementById('sheet-in').innerHTML = '<div class="hv-fade"><div class="pre">Театральный ковчег в Дубраве представляет</div><div class="rule"></div><h1>' + s.title + '</h1><p class="by">' + s.by + '</p><div class="rule"></div><p class="when">' + s.when + ' · ' + s.tag.split('· ')[1] + '</p>' + cta(s) + '</div>';
      document.getElementById('cuts').innerHTML = (s.v3.l ? '<figure class="cut l hv-fade"><img src="photos/stage/' + s.v3.l + '" alt=""></figure>' : '') + '<figure class="cut r hv-fade"><img src="photos/stage/' + s.v3.r + '" alt=""></figure>';
    }
    clearTimeout(timer);
    if (!reduce && !paused) timer = setTimeout(function () { cur = (cur + 1) % SL.length; draw(); }, 9000);
  }
  var paused = false;
  var hero = document.querySelector('[data-hero]');
  if (hero && V !== '2') {
    hero.addEventListener('mouseenter', function () { paused = true; clearTimeout(timer); });
    hero.addEventListener('mouseleave', function () { paused = false; draw(); });
    document.querySelectorAll('[data-sl]').forEach(function (b) { b.addEventListener('click', function () { cur = (cur + +b.dataset.sl + SL.length) % SL.length; draw(); }); });
    draw();
  }
  if (V === '2') {
    document.getElementById('trip').innerHTML = SL.map(function (s, i) {
      return '<article class="pan"><div class="box"><div class="pp" data-strip="' + (i + 3) + '" data-h="34"></div><div class="pp btm" data-strip="' + (i + 9) + '" data-h="34"></div><span class="hv-tag">' + s.tag + '</span>' +
        '<figure class="cut"><img src="photos/stage/' + (s.v3.r) + '" alt=""></figure></div>' +
        '<div class="cap"><h2>' + s.plain + '</h2><span class="when">' + s.when + '</span>' + cta(s) + '</div></article>';
    }).join('');
    document.querySelectorAll('#trip [data-strip]').forEach(function (el) { el.innerHTML = window.KVStrip(+el.dataset.strip * 613 + 11, 34); });
  }

  var bar = document.createElement('nav');
  bar.className = 'hvbar'; bar.setAttribute('aria-label', 'Варианты главной афиши');
  bar.innerHTML = '<span>Главная афиша</span>' + [['1', 'Плакат'], ['2', 'Склейка'], ['3', 'Программка']].map(function (v) {
    return '<a href="glavnaya-' + v[0] + '.html' + location.search + '"' + (v[0] === V ? ' class="on" aria-current="page"' : '') + '>' + v[0] + ' · ' + v[1] + '</a>';
  }).join('');
  document.body.appendChild(bar);
})();
