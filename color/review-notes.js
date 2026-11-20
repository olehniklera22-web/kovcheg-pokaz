/* Замечания заказчика: точечные заметки по правому клику (компьютер) или долгому нажатию (телефон).
   Один файл, без зависимостей. Подключение — одной строкой перед </body>:
   <script src="review-notes.js" defer></script>
   Хранение — таблица review_notes в Supabase (REST). Весь интерфейс — в Shadow DOM. Глобально только window.ReviewNotes. */
(function () {
  'use strict';

  var CONFIG = {
    ENABLED: true,                 // false — функция полностью отключена
    SUPABASE_URL: 'https://zeeofkjamsudxpcjxbog.supabase.co',
    SUPABASE_ANON_KEY: 'sb_publishable_Mku-gomIWyWwHZbSt4KhhQ_z4PzeLY2',
    SITE_ID: 'kovcheg-dubrava',    // уникальный id сайта латиницей
    POLL_INTERVAL_MS: 20000
  };

  if (!CONFIG.ENABLED || window.ReviewNotes) return;

  var COLORS = { desktop: '#E5322D', mobile: '#F5C400' };
  var LABELS = { desktop: 'Компьютер', mobile: 'Телефон' };
  var MAX = 2000, LONG_PRESS_MS = 550, MOVE_PX = 10, DEDUP_MS = 800;
  var SKIP = 'a,button,input,textarea,select,option,label,summary,[contenteditable]:not([contenteditable="false"]),[role=button],[role=link],[role=menuitem],img,picture,video,audio,iframe,canvas,[data-no-review]';
  var CONFIGURED = /^https:\/\/[^/]+/.test(CONFIG.SUPABASE_URL) && CONFIG.SUPABASE_URL.indexOf('XXXX') < 0 && CONFIG.SUPABASE_ANON_KEY && CONFIG.SUPABASE_ANON_KEY !== 'XXXX';
  /* без адреса и ключа базы функция не включается: не показываем плашку, которую нельзя сохранить */
  if (!CONFIGURED) { try { console.info('[review-notes] выключено: заполните SUPABASE_URL и SUPABASE_ANON_KEY в CONFIG'); } catch (e) {} return; }
  var PAGE = location.pathname;
  var API = CONFIG.SUPABASE_URL.replace(/\/+$/, '') + '/rest/v1/review_notes';

  var state = { notes: [], open: null, lastOpenAt: 0, host: null, root: null, layer: null, pop: null, warned: false };
  var NS = window.ReviewNotes = { version: '1.0' };

  function log() { try { console.warn.apply(console, ['[review-notes]'].concat([].slice.call(arguments))); } catch (e) {} }

  /* ---------- Supabase REST ---------- */
  function req(method, query, body, prefer) {
    if (!CONFIGURED) {
      if (!state.warned) { state.warned = true; log('База не подключена: заполните SUPABASE_URL и SUPABASE_ANON_KEY в CONFIG.'); }
      return Promise.reject(new Error('not configured'));
    }
    var h = { apikey: CONFIG.SUPABASE_ANON_KEY, 'Content-Type': 'application/json' };
    /* старый ключ anon (JWT, eyJ…) передаётся и в Authorization; новый sb_publishable_… — только в apikey */
    if (/^eyJ/.test(CONFIG.SUPABASE_ANON_KEY)) h.Authorization = 'Bearer ' + CONFIG.SUPABASE_ANON_KEY;
    if (prefer) h.Prefer = prefer;
    return fetch(API + (query || ''), { method: method, headers: h, body: body ? JSON.stringify(body) : undefined, cache: 'no-store' })
      .then(function (r) {
        if (!r.ok) return r.text().then(function (t) { throw new Error(r.status + ' ' + t); });
        return r.status === 204 ? null : r.text().then(function (t) { return t ? JSON.parse(t) : null; });
      });
  }
  var q = function (s) { return encodeURIComponent(s); };
  function loadAll() { return req('GET', '?select=*&site_id=eq.' + q(CONFIG.SITE_ID) + '&page=eq.' + q(PAGE) + '&order=created_at.asc'); }
  function loadOne(id) { return req('GET', '?select=*&id=eq.' + q(id)).then(function (a) { return a && a[0] || null; }); }
  function create(n) { return req('POST', '', n, 'return=representation').then(function (a) { return a[0]; }); }
  function patch(id, data, extra) { data.updated_at = new Date().toISOString(); return req('PATCH', '?id=eq.' + q(id) + (extra || ''), data, 'return=representation'); }
  function remove(id) { return req('DELETE', '?id=eq.' + q(id)); }

  /* ---------- стиль сайта ---------- */
  function visible(el) { if (!el.getClientRects().length) return false; var s = getComputedStyle(el); return s.visibility !== 'hidden' && s.display !== 'none' && +s.opacity !== 0; }
  function opaqueBg(el) {
    for (var e = el; e; e = e.parentElement) {
      var c = getComputedStyle(e).backgroundColor;
      if (c && c !== 'transparent' && !/rgba\([^)]*,\s*0\)$/.test(c)) return c;
    }
    return '#ffffff';
  }
  function rgb(c) { var m = String(c).match(/\d+(\.\d+)?/g); return m ? m.slice(0, 3).map(Number) : [255, 255, 255]; }
  function lum(c) { var a = rgb(c).map(function (v) { v /= 255; return v <= .03928 ? v / 12.92 : Math.pow((v + .055) / 1.055, 2.4); }); return .2126 * a[0] + .7152 * a[1] + .0722 * a[2]; }
  function siteStyle() {
    var b = getComputedStyle(document.body), minSize = Infinity, minWeight = Infinity, n = 0;
    var w = document.createTreeWalker(document.body, NodeFilter.SHOW_TEXT, null);
    while (w.nextNode() && n < 2500) {
      var t = w.currentNode, el = t.parentElement;
      if (!el || !t.nodeValue.trim() || el.closest('script,style,noscript') || (state.host && state.host.contains(el))) continue;
      if (!visible(el)) continue;
      n++;
      var s = getComputedStyle(el), fs = parseFloat(s.fontSize), fw = parseInt(s.fontWeight, 10) || 400;
      if (fs < minSize) minSize = fs;
      if (fw < minWeight) minWeight = fw;
    }
    var main = document.querySelector('main') || document.body;
    var bg = opaqueBg(main), fg = b.color;
    var btn = [].slice.call(document.querySelectorAll('button,.btn,[role=button],input[type=submit]')).filter(function (x) { return visible(x) && !(state.host && state.host.contains(x)); });
    /* скругление — у обычной кнопки с текстом (не круглой иконки и не «таблетки») */
    var radius = '0px';
    btn.some(function (x) {
      var r = x.getBoundingClientRect(), br = getComputedStyle(x).borderTopLeftRadius;
      if (!x.textContent.trim() || r.width < r.height * 1.6 || br.indexOf('%') >= 0 || parseFloat(br) >= r.height / 2 - 1) return false;
      radius = br; return true;
    });
    /* акцент — самый насыщенный цвет фона кнопок (основная кнопка сайта), иначе цвет ссылок */
    var accent = null, best = 0;
    btn.forEach(function (x) {
      var c = getComputedStyle(x).backgroundColor;
      if (!c || c === 'transparent' || /,\s*0\)$/.test(c) || Math.abs(lum(c) - lum(bg)) < .03) return;
      var v = rgb(c), chroma = Math.max.apply(null, v) - Math.min.apply(null, v);
      if (chroma > best) { best = chroma; accent = c; }
    });
    if (best < 30) accent = null;
    if (!accent) { var a = document.querySelector('a[href]'); accent = a ? getComputedStyle(a).color : fg; }
    return {
      font: b.fontFamily, size: Math.max(11, isFinite(minSize) ? minSize : 13) + 'px', weight: isFinite(minWeight) ? minWeight : 400,
      fg: fg, bg: bg, radius: radius, accent: accent, onAccent: lum(accent) > .45 ? '#111111' : '#ffffff'
    };
  }

  /* ---------- контейнер в Shadow DOM ---------- */
  function mount() {
    var host = document.createElement('div');
    host.setAttribute('data-review-notes', '');
    host.style.cssText = 'position:absolute;left:0;top:0;width:0;height:0;z-index:2147483647;margin:0;padding:0;border:0;';
    document.documentElement.appendChild(host);
    var root = host.attachShadow({ mode: 'open' });
    var st = siteStyle();
    var css = document.createElement('style');
    css.textContent =
      ':host{all:initial}' +
      '*{box-sizing:border-box}' +
      '.layer{position:absolute;left:0;top:0;width:0;height:0}' +
      '.dot{position:absolute;width:12px;height:12px;margin:-6px 0 0 -6px;padding:0;border-radius:50%;border:1.5px solid #fff;box-shadow:0 1px 4px rgba(0,0,0,.45);cursor:pointer;transition:transform .15s;-webkit-tap-highlight-color:transparent}' +
      '.dot:hover,.dot:focus-visible,.dot.on{transform:scale(1.35);outline:none}' +
      '.dot::after{content:"";position:absolute;inset:-10px}' +
      '.pop{position:absolute;width:min(280px,calc(100vw - 24px));padding:10px;background:' + st.bg + ';color:' + st.fg + ';font-family:' + st.font + ';font-size:' + st.size + ';font-weight:' + st.weight + ';line-height:1.4;border:1px solid color-mix(in srgb,' + st.fg + ' 22%,transparent);border-radius:' + st.radius + ';box-shadow:0 8px 28px rgba(0,0,0,.28);text-align:left;-webkit-user-select:text;user-select:text}' +
      '.pop p{margin:0 0 4px;white-space:pre-wrap;overflow-wrap:anywhere}' +
      '.when{opacity:.6;font-size:.92em;margin:0 0 8px}' +
      '.rep{margin:6px 0 0;padding:6px 0 0 8px;border-left:2px solid ' + st.accent + '}' +
      '.rep .who{opacity:.6;font-size:.92em;margin:0 0 2px}' +
      'textarea{display:block;width:100%;min-height:52px;max-height:40vh;margin:6px 0 0;padding:6px 8px;resize:none;overflow:auto;font:inherit;color:inherit;background:transparent;border:1px solid color-mix(in srgb,' + st.fg + ' 30%,transparent);border-radius:' + st.radius + '}' +
      'textarea:focus{outline:none;border-color:' + st.accent + '}' +
      '.dev{display:flex;gap:4px;margin:8px 0 0}' +
      '.dev button,.acts button{font:inherit;color:inherit;cursor:pointer;padding:5px 9px;border-radius:' + st.radius + ';border:1px solid color-mix(in srgb,' + st.fg + ' 30%,transparent);background:transparent}' +
      '.dev button[aria-pressed="true"]{border-color:currentColor}' +
      '.dev i{display:inline-block;width:8px;height:8px;border-radius:50%;margin-right:6px;vertical-align:middle;border:1px solid #fff}' +
      '.acts{display:flex;justify-content:space-between;gap:6px;margin:10px 0 0}' +
      '.acts .ok{background:' + st.accent + ';border-color:' + st.accent + ';color:' + st.onAccent + '}' +
      '.err{margin:6px 0 0;color:' + COLORS.desktop + '}' +
      '.err:empty{display:none}' +
      '.ring{position:fixed;left:0;top:0;width:36px;height:36px;margin:-18px 0 0 -18px;border-radius:50%;border:2px solid ' + st.accent + ';box-shadow:0 0 0 1px rgba(255,255,255,.6);pointer-events:none;opacity:0;transform:scale(.35)}' +
      '.ring.on{opacity:1;transform:scale(1);transition:transform .4s linear,opacity .1s}' +
      '.hint{position:fixed;right:12px;top:88px;display:flex;align-items:flex-start;gap:8px;max-width:min(320px,calc(100vw - 24px));padding:8px 8px 8px 12px;background:' + st.bg + ';color:' + st.fg + ';font-family:' + st.font + ';font-size:' + st.size + ';font-weight:' + st.weight + ';line-height:1.4;border:1px solid color-mix(in srgb,' + st.fg + ' 22%,transparent);border-radius:' + st.radius + ';box-shadow:0 6px 20px rgba(0,0,0,.25)}' +
      '.hint .x{flex:none;width:22px;height:22px;padding:0;border:0;background:transparent;color:inherit;font:inherit;font-size:16px;line-height:1;cursor:pointer;opacity:.7}' +
      '.hint .x:hover{opacity:1}' +
      '@media (pointer:coarse){.hint{left:12px;right:12px;top:76px;max-width:none}}' +
      '@media (prefers-reduced-motion:reduce){.ring.on{transition:none}}';
    root.appendChild(css);
    var layer = document.createElement('div'); layer.className = 'layer'; root.appendChild(layer);
    var rg = document.createElement('div'); rg.className = 'ring'; root.appendChild(rg); state.ring = rg;
    state.host = host; state.root = root; state.layer = layer;
  }

  /* ---------- привязка к месту ---------- */
  function cssPath(el) {
    if (!el || el === document.body || el === document.documentElement) return 'body';
    if (el.id && document.querySelectorAll('#' + CSS.escape(el.id)).length === 1) return '#' + CSS.escape(el.id);
    var parts = [];
    while (el && el !== document.body && el !== document.documentElement) {
      if (el.id && document.querySelectorAll('#' + CSS.escape(el.id)).length === 1) { parts.unshift('#' + CSS.escape(el.id)); return parts.join(' > '); }
      var tag = el.tagName.toLowerCase(), i = 1, s = el;
      while ((s = s.previousElementSibling)) if (s.tagName === el.tagName) i++;
      parts.unshift(tag + ':nth-of-type(' + i + ')');
      el = el.parentElement;
    }
    parts.unshift('body');
    return parts.join(' > ');
  }
  function docW() { return Math.max(document.documentElement.scrollWidth, document.documentElement.clientWidth); }
  function makeAnchor(el, cx, cy) {
    var r = el.getBoundingClientRect();
    return {
      selector: cssPath(el),
      rx: r.width ? Math.min(1, Math.max(0, (cx - r.left) / r.width)) : 0,
      ry: r.height ? Math.min(1, Math.max(0, (cy - r.top) / r.height)) : 0,
      px: (cx + scrollX) / docW(), py: cy + scrollY, vw: innerWidth
    };
  }
  function place(a) {
    var x, y, el = null;
    try { el = a.selector ? document.querySelector(a.selector) : null; } catch (e) { el = null; }
    if (el && el.getClientRects().length) {
      var r = el.getBoundingClientRect();
      if (r.width || r.height) { x = r.left + scrollX + a.rx * r.width; y = r.top + scrollY + a.ry * r.height; }
    }
    if (x === undefined) { x = (a.px || 0) * docW(); y = a.py || 0; }
    var W = docW(), H = document.documentElement.scrollHeight;
    return { x: Math.min(Math.max(x, 8), W - 8), y: Math.min(Math.max(y, 8), H - 8) };
  }

  /* ---------- точки ---------- */
  function drawDots() {
    var layer = state.layer, keep = {};
    state.notes.forEach(function (n) {
      keep[n.id] = 1;
      var d = layer.querySelector('[data-id="' + n.id + '"]');
      if (!d) {
        d = document.createElement('button'); d.type = 'button'; d.className = 'dot'; d.setAttribute('data-id', n.id);
        d.setAttribute('aria-label', 'Замечание');
        d.addEventListener('click', function (e) { e.stopPropagation(); openNote(n.id); });
        layer.appendChild(d);
      }
      var p = place(n.anchor);
      d.style.left = p.x + 'px'; d.style.top = p.y + 'px';
      d.style.background = COLORS[n.device] || COLORS.desktop;
      d.classList.toggle('on', !!(state.open && state.open.id === n.id));
    });
    [].slice.call(layer.querySelectorAll('.dot')).forEach(function (d) { if (!keep[d.getAttribute('data-id')]) d.remove(); });
    if (state.pop && state.open) positionPop(state.open.point);
  }
  /* перерисовка не чаще кадра; запасной таймер — на случай фоновой вкладки, где кадры не приходят */
  var pending = false;
  function relayout() {
    if (pending) return; pending = true;
    var run = function () { if (!pending) return; pending = false; drawDots(); };
    requestAnimationFrame(run); setTimeout(run, 150);
  }

  /* ---------- плашка ---------- */
  function el(tag, cls, text) { var e = document.createElement(tag); if (cls) e.className = cls; if (text != null) e.textContent = text; return e; }
  function fmt(iso) { try { return new Date(iso).toLocaleString('ru-RU', { day: 'numeric', month: 'long', hour: '2-digit', minute: '2-digit' }); } catch (e) { return ''; } }
  function defaultDevice() { return matchMedia('(pointer: coarse)').matches && Math.min(screen.width, innerWidth) <= 820 ? 'mobile' : 'desktop'; }
  function autogrow(t) { t.style.height = 'auto'; t.style.height = Math.min(t.scrollHeight + 2, innerHeight * .4) + 'px'; }
  function positionPop(pt) {
    var p = state.pop; if (!p) return;
    var w = p.offsetWidth, h = p.offsetHeight, gap = 14, m = 12;
    var x = pt.x + gap, y = pt.y + gap;
    if (x + w > scrollX + innerWidth - m) x = pt.x - gap - w;
    if (x < scrollX + m) x = scrollX + m;
    if (x + w > scrollX + innerWidth - m) x = scrollX + innerWidth - m - w;
    if (y + h > scrollY + innerHeight - m) y = pt.y - gap - h;
    if (y < scrollY + m) y = Math.min(scrollY + m, pt.y + gap);
    p.style.left = x + 'px'; p.style.top = y + 'px';
  }
  function deviceSwitch(cur, onChange) {
    var box = el('div', 'dev'); box.setAttribute('role', 'group'); box.setAttribute('aria-label', 'Для какого устройства');
    ['desktop', 'mobile'].forEach(function (k) {
      var b = el('button'); b.type = 'button'; b.setAttribute('aria-pressed', String(k === cur));
      var i = el('i'); i.style.background = COLORS[k]; b.appendChild(i); b.appendChild(document.createTextNode(LABELS[k]));
      b.addEventListener('click', function () { [].slice.call(box.children).forEach(function (x) { x.setAttribute('aria-pressed', String(x === b)); }); onChange(k); });
      box.appendChild(b);
    });
    return box;
  }
  function closePop() {
    if (state.pop) state.pop.remove();
    state.pop = null; state.open = null; drawDots();
  }
  function shell(pt) {
    closePop();
    var p = el('div', 'pop'); p.setAttribute('role', 'dialog'); p.setAttribute('aria-label', 'Замечание');
    state.root.appendChild(p); state.pop = p;
    p.addEventListener('keydown', function (e) {
      if (e.key === 'Escape') { e.preventDefault(); state.open && state.open.done(); }
      else if (e.key === 'Enter' && (e.ctrlKey || e.metaKey)) { e.preventDefault(); state.open && state.open.done(); }
    });
    return p;
  }

  /* новая заметка */
  function openNew(target, cx, cy) {
    var anchor = makeAnchor(target, cx, cy), pt = { x: cx + scrollX, y: cy + scrollY }, device = defaultDevice(), busy = false;
    var p = shell(pt);
    var t = el('textarea'); t.maxLength = MAX; t.placeholder = 'Замечание…'; t.setAttribute('aria-label', 'Текст замечания');
    t.addEventListener('input', function () { autogrow(t); });
    var err = el('p', 'err');
    var ok = el('button', 'ok', 'Готово'); ok.type = 'button';
    var del = el('button', '', 'Удалить'); del.type = 'button';
    var acts = el('div', 'acts'); acts.appendChild(ok); acts.appendChild(del);
    p.appendChild(t); p.appendChild(deviceSwitch(device, function (k) { device = k; })); p.appendChild(acts); p.appendChild(err);
    function done() {
      if (busy) return;
      var text = t.value.trim();
      if (!text) { closePop(); return; }
      busy = true; err.textContent = '';
      create({ site_id: CONFIG.SITE_ID, page: PAGE, device: device, text: text.slice(0, MAX), anchor: anchor })
        .then(function (n) { if (n) state.notes.push(n); closePop(); })
        .catch(function (e) { busy = false; log('Не удалось сохранить', e); err.textContent = 'Не сохранилось, попробуйте ещё раз'; positionPop(pt); });
    }
    ok.addEventListener('click', done);
    del.addEventListener('click', function () { closePop(); });
    state.open = { id: null, point: pt, done: done };
    positionPop(pt);
    setTimeout(function () { try { t.focus({ preventScroll: true }); } catch (e) { t.focus(); } }, 0);
  }

  /* открытая заметка */
  function openNote(id, msg) {
    var n = state.notes.filter(function (x) { return x.id === id; })[0]; if (!n) return;
    var pt = place(n.anchor), busy = false, keepText = '';
    if (state.open && state.open.id === id && state.pop) { var old = state.pop.querySelector('textarea'); if (old) keepText = old.value; }
    var p = shell(pt);
    p.appendChild(el('p', '', n.text));
    p.appendChild(el('p', 'when', fmt(n.created_at)));
    function rep(label, text) { var d = el('div', 'rep'); d.appendChild(el('p', 'who', label)); d.appendChild(el('p', '', text)); p.appendChild(d); }
    if (n.reply) rep('Ответ', n.reply);
    if (n.reply2) rep('Ответ на ответ', n.reply2);
    var field = !n.reply ? 'reply' : !n.reply2 ? 'reply2' : null, t = null;
    if (field) {
      t = el('textarea'); t.maxLength = MAX; t.placeholder = field === 'reply' ? 'Ответить' : 'Ответить на ответ';
      t.setAttribute('aria-label', t.placeholder); t.value = keepText;
      t.addEventListener('input', function () { autogrow(t); });
      p.appendChild(t);
    }
    var err = el('p', 'err', msg || '');
    p.appendChild(deviceSwitch(n.device, function (k) {
      var prev = n.device; n.device = k; drawDots();
      patch(n.id, { device: k }).catch(function (e) { n.device = prev; drawDots(); log('Не удалось сменить устройство', e); err.textContent = 'Не сохранилось, попробуйте ещё раз'; });
    }));
    var ok = el('button', 'ok', 'Готово'); ok.type = 'button';
    var del = el('button', '', 'Удалить'); del.type = 'button';
    var acts = el('div', 'acts'); acts.appendChild(ok); acts.appendChild(del); p.appendChild(acts); p.appendChild(err);

    function done() {
      if (busy) return;
      var text = t ? t.value.trim() : '';
      if (!field || !text) { closePop(); return; }
      busy = true; err.textContent = '';
      /* перечитать запись: не затереть ответ, который мог оставить другой человек */
      loadOne(n.id).then(function (fresh) {
        if (!fresh) { state.notes = state.notes.filter(function (x) { return x.id !== n.id; }); closePop(); return; }
        if (fresh[field]) { replaceNote(fresh); openNote(n.id, 'Пока вы писали, кто-то уже ответил — вот актуальная переписка'); return; }
        var data = {}; data[field] = text.slice(0, MAX);
        return patch(n.id, data, '&' + field + '=is.null').then(function (rows) {
          if (rows && rows[0]) { replaceNote(rows[0]); closePop(); }
          else return loadOne(n.id).then(function (f2) { if (f2) { replaceNote(f2); openNote(n.id, 'Пока вы писали, кто-то уже ответил — вот актуальная переписка'); } else closePop(); });
        });
      }).catch(function (e) { busy = false; log('Не удалось сохранить ответ', e); err.textContent = 'Не сохранилось, попробуйте ещё раз'; positionPop(pt); });
    }
    var armed = 0;
    del.addEventListener('click', function () {
      if (!armed) { del.textContent = 'Точно удалить?'; armed = setTimeout(function () { armed = 0; del.textContent = 'Удалить'; }, 3000); return; }
      clearTimeout(armed); armed = 0;
      remove(n.id).then(function () { state.notes = state.notes.filter(function (x) { return x.id !== n.id; }); closePop(); })
        .catch(function (e) { log('Не удалось удалить', e); err.textContent = 'Не сохранилось, попробуйте ещё раз'; del.textContent = 'Удалить'; });
    });
    ok.addEventListener('click', done);
    state.open = { id: n.id, point: pt, done: done };
    positionPop(pt); drawDots();
    if (t) setTimeout(function () { autogrow(t); try { t.focus({ preventScroll: true }); } catch (e) { t.focus(); } }, 0);
  }
  function replaceNote(f) { state.notes = state.notes.map(function (x) { return x.id === f.id ? f : x; }); }

  /* ---------- синхронизация ---------- */
  function sync() {
    if (!CONFIGURED) return;
    loadAll().then(function (rows) {
      state.notes = Array.isArray(rows) ? rows : [];
      if (state.open && state.open.id && !state.notes.some(function (x) { return x.id === state.open.id; })) closePop();
      drawDots();
    }).catch(function (e) { log('Не удалось загрузить замечания', e); });
  }

  /* ---------- где можно открыть плашку ---------- */
  function inWidget(e) { var path = e.composedPath ? e.composedPath() : []; return path.indexOf(state.host) >= 0; }
  function freeSpot(target) {
    if (!target || target.nodeType !== 1) target = target && target.parentElement;
    if (!target || target === state.host) return false;
    if (target.closest(SKIP)) return false;
    var sel = window.getSelection && window.getSelection();
    if (sel && String(sel).trim()) return false;
    return true;
  }

  /* где удержание и Shift+правый клик НЕ срабатывают: поля ввода (чтобы не мешать набору) и сам виджет */
  var FIELD = 'input,textarea,select,option,[contenteditable]:not([contenteditable="false"]),[data-no-review]';
  function anySpot(target) {
    if (!target || target.nodeType !== 1) target = target && target.parentElement;
    return !!target && target !== state.host && !target.closest(FIELD);
  }
  function opened(target, x, y) { state.lastOpenAt = Date.now(); hideHint(true); openNew(target, x, y); }

  /* правый клик: на свободном месте — сразу; с зажатым Shift — где угодно, кроме полей ввода */
  function onContext(e) {
    if (inWidget(e)) return;
    if (Date.now() - state.lastOpenAt < DEDUP_MS) { e.preventDefault(); return; } /* Android после долгого нажатия */
    if (e.shiftKey ? !anySpot(e.target) : !freeSpot(e.target)) return;
    e.preventDefault();
    opened(e.target, e.clientX, e.clientY);
  }

  /* после удержания гасим «клик», чтобы ссылка не открылась и кнопка не нажалась */
  function swallowNextClick() {
    state.swallow = true;
    setTimeout(function () { state.swallow = false; }, 700);
  }
  function onClickCapture(e) {
    if (!state.swallow || inWidget(e)) return;
    state.swallow = false; e.preventDefault(); e.stopPropagation();
  }

  /* удержание — левая кнопка мыши (компьютер) или палец (телефон), ~550 мс на любом блоке */
  var press = null;
  function ring(on, x, y) {
    var r = state.ring; if (!r) return;
    if (on) { r.style.left = x + 'px'; r.style.top = y + 'px'; r.classList.remove('on'); void r.offsetWidth; r.classList.add('on'); }
    else r.classList.remove('on');
  }
  function cancelPress() {
    if (!press) return;
    clearTimeout(press.timer); clearTimeout(press.ringT); ring(false);
    if (press.locked) { var h = document.documentElement.style; h.webkitUserSelect = press.us; h.webkitTouchCallout = press.tc; }
    press = null;
  }
  function startPress(target, x, y, touch) {
    cancelPress();
    var h = document.documentElement.style;
    press = { x: x, y: y, target: target, touch: touch, fired: false, locked: touch, us: h.webkitUserSelect, tc: h.webkitTouchCallout };
    /* на телефоне — только на время удержания: чтобы iOS не начал выделять текст и не показал выноску */
    if (touch) { h.webkitUserSelect = 'none'; h.webkitTouchCallout = 'none'; }
    press.ringT = setTimeout(function () { if (press) ring(true, x, y); }, 150);
    press.timer = setTimeout(function () {
      if (!press) return;
      var p = press; p.fired = true; ring(false);
      try { window.getSelection().removeAllRanges(); } catch (er) {}
      swallowNextClick();
      opened(p.target, p.x, p.y);
    }, LONG_PRESS_MS);
  }
  function moved(x, y) { return press && (Math.abs(x - press.x) > MOVE_PX || Math.abs(y - press.y) > MOVE_PX); }

  function onTouchStart(e) {
    if (e.touches.length !== 1 || inWidget(e) || !anySpot(e.target)) { cancelPress(); return; }
    var t = e.touches[0]; startPress(e.target, t.clientX, t.clientY, true);
  }
  function onTouchMove(e) { if (press && !press.fired && moved(e.touches[0].clientX, e.touches[0].clientY)) cancelPress(); }
  function onTouchEnd(e) {
    if (press && press.fired && e.cancelable) e.preventDefault(); /* не превращать удержание в обычный тап */
    cancelPress();
  }

  function onMouseDown(e) {
    if (e.pointerType !== 'mouse' || e.button !== 0 || e.shiftKey || e.ctrlKey || e.metaKey || e.altKey) return;
    if (inWidget(e) || !anySpot(e.target)) return;
    startPress(e.target, e.clientX, e.clientY, false);
  }
  function onMouseMove(e) { if (e.pointerType === 'mouse' && press && !press.touch && !press.fired && moved(e.clientX, e.clientY)) cancelPress(); }
  function onMouseUp(e) { if (e.pointerType === 'mouse' && press && !press.touch) cancelPress(); }

  /* клик вне плашки = «Готово» */
  function onOutside(e) {
    if (!state.pop || inWidget(e)) return;
    if (press && press.fired) return;
    if (Date.now() - state.lastOpenAt < 350) return;
    state.open && state.open.done();
  }

  /* подсказка при первом заходе; закрыли — больше не показываем */
  var HINT_KEY = 'review-notes-hint:' + CONFIG.SITE_ID;
  function hintSeen() { try { return localStorage.getItem(HINT_KEY) === '1'; } catch (e) { return false; } }
  function hideHint(remember) {
    if (state.hint) { state.hint.remove(); state.hint = null; }
    if (remember) { try { localStorage.setItem(HINT_KEY, '1'); } catch (e) {} }
  }
  function showHint() {
    if (hintSeen()) return;
    var touch = matchMedia('(pointer: coarse)').matches;
    var h = el('div', 'hint'); h.setAttribute('role', 'note');
    h.appendChild(el('span', '', touch
      ? 'Чтобы оставить замечание — подержите палец на нужном месте'
      : 'Чтобы оставить замечание — зажмите левую кнопку мыши на нужном месте (или Shift + правый клик)'));
    var x = el('button', 'x', '×'); x.type = 'button'; x.setAttribute('aria-label', 'Закрыть подсказку');
    x.addEventListener('click', function () { hideHint(true); });
    h.appendChild(x);
    state.root.appendChild(h); state.hint = h;
  }

  /* ---------- запуск ---------- */
  function init() {
    if (window.self !== window.top) return; /* не работаем внутри превью-iframe */
    mount();
    document.addEventListener('contextmenu', onContext);
    document.addEventListener('pointerdown', onMouseDown, true);
    document.addEventListener('pointermove', onMouseMove, true);
    document.addEventListener('pointerup', onMouseUp, true);
    document.addEventListener('pointercancel', cancelPress, true);
    document.addEventListener('dragstart', cancelPress, true);
    document.addEventListener('click', onClickCapture, true);
    document.addEventListener('touchstart', onTouchStart, { passive: true });
    document.addEventListener('touchmove', onTouchMove, { passive: true });
    document.addEventListener('touchend', onTouchEnd, { passive: false });
    document.addEventListener('touchcancel', cancelPress, { passive: true });
    addEventListener('scroll', cancelPress, { passive: true });
    document.addEventListener('pointerdown', onOutside, true);
    addEventListener('resize', relayout);
    addEventListener('orientationchange', relayout);
    addEventListener('load', relayout);
    if (document.fonts && document.fonts.ready) document.fonts.ready.then(relayout);
    document.addEventListener('load', function (e) { if (e.target && e.target.tagName === 'IMG') relayout(); }, true);
    if (window.ResizeObserver) new ResizeObserver(relayout).observe(document.body);
    document.addEventListener('visibilitychange', function () { if (document.visibilityState === 'visible') sync(); });
    addEventListener('focus', sync);
    showHint();
    sync();
    if (CONFIGURED) setInterval(sync, CONFIG.POLL_INTERVAL_MS);
    NS.refresh = sync;
  }
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init); else init();
})();
