(function () {
  var me = document.currentScript, root = me.getAttribute('data-root') || '', cur = me.getAttribute('data-cur') || '';
  if (window.self !== window.top) return;
  try { if (sessionStorage.getItem('kv-sw-hidden')) return; } catch (e) {}
  var css = '.kvsw{position:fixed;left:50%;bottom:18px;transform:translateX(-50%);z-index:9999;display:flex;align-items:center;gap:4px;padding:5px;border-radius:999px;background:rgba(18,18,16,.92);border:1px solid rgba(255,255,255,.16);box-shadow:0 10px 40px rgba(0,0,0,.45);backdrop-filter:blur(10px);-webkit-backdrop-filter:blur(10px);font:500 13px/1.2 system-ui,-apple-system,"Segoe UI",sans-serif;color:#eee;max-width:calc(100% - 24px)}' +
    '.kvsw a,.kvsw button{display:inline-flex;align-items:center;gap:6px;padding:9px 14px;border-radius:999px;color:#ddd;text-decoration:none;background:none;border:0;cursor:pointer;font:inherit;white-space:nowrap}' +
    '.kvsw a:hover,.kvsw button:hover{background:rgba(255,255,255,.08);color:#fff}' +
    '.kvsw a.on{background:#f1e9da;color:#141210}' +
    '.kvsw .lb{padding:0 10px 0 12px;color:#999;font-size:11px;letter-spacing:.12em;text-transform:uppercase}' +
    '.kvsw .x{padding:9px 11px;color:#888}' +
    '@media (max-width:560px){.kvsw .lb,.kvsw .long{display:none}.kvsw a{padding:9px 12px}}';
  var st = document.createElement('style'); st.textContent = css; document.head.appendChild(st);
  var bar = document.createElement('nav');
  bar.className = 'kvsw'; bar.setAttribute('aria-label', 'Переключение концепций');
  bar.innerHTML = '<span class="lb">Концепция</span>' +
    '<a href="' + root + 'index.html' + location.search + '"' + (cur === 'a' ? ' class="on" aria-current="page"' : '') + '>А<span class="long">&nbsp;· Роща</span></a>' +
    '<a href="' + root + 'v5/index.html' + location.search + '"' + (cur === 'b' ? ' class="on" aria-current="page"' : '') + '>Б<span class="long">&nbsp;· Сцена</span></a>' +
    '<a href="' + root + 'pokaz.html">Сравнить</a>' +
    '<button type="button" class="x" aria-label="Скрыть переключатель">×</button>';
  bar.querySelector('.x').onclick = function () { bar.remove(); try { sessionStorage.setItem('kv-sw-hidden', '1'); } catch (e) {} };
  document.body.appendChild(bar);
})();
