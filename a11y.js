// Accessibility layer for all three apps (employee, manager, buddy).
// - Dark mode and text size, remembered on this device
// - Labels for status colours, progress bars and icons, so screen readers hear the meaning
// - Live regions for chat and alerts, current page marked for screen readers
// - Page title and focus move to the new page's heading on navigation
// Loaded last, after the app scripts.
(function () {
  'use strict';

  var KEY = 'lbg.a11y';
  var SCALES = ['normal', 'large', 'xlarge'];
  var SCALE_VALUE = { normal: '100%', large: '118%', xlarge: '136%' };
  var baseTitle = document.title;

  function prefs() {
    try { return JSON.parse(localStorage.getItem(KEY) || '{}'); } catch (e) { return {}; }
  }
  function savePrefs(p) { localStorage.setItem(KEY, JSON.stringify(p)); }

  function isDark(p) {
    var t = p.theme || 'system';
    return t === 'dark' || (t === 'system' && window.matchMedia && matchMedia('(prefers-color-scheme: dark)').matches);
  }

  function applyPrefs() {
    var p = prefs();
    document.documentElement.setAttribute('data-theme', isDark(p) ? 'dark' : 'light');
    document.documentElement.style.setProperty('--fs', SCALE_VALUE[p.scale || 'normal']);
    var themeBtn = document.getElementById('a11y-theme');
    if (themeBtn) themeBtn.setAttribute('aria-pressed', isDark(p) ? 'true' : 'false');
  }

  // ---------- Controls in the top bar ----------
  // One "Accessibility" button in the top bar opens a panel with the display options
  function buildControls() {
    var top = document.querySelector('.topbar');
    if (!top || document.getElementById('a11y-open')) return;
    var wrap = document.createElement('div');
    wrap.className = 'a11y-wrap';
    wrap.innerHTML =
      '<button type="button" id="a11y-open" class="a11y-open" aria-expanded="false" aria-controls="a11y-panel">Accessibility</button>' +
      '<div class="a11y-panel" id="a11y-panel" hidden role="group" aria-label="Accessibility settings">' +
        '<p class="a11y-title">Display</p>' +
        '<div class="a11y-controls">' +
          '<button type="button" id="a11y-theme" aria-pressed="false">Dark mode</button>' +
          '<button type="button" data-scale="down" aria-label="Smaller text">A−</button>' +
          '<button type="button" data-scale="reset" aria-label="Normal text size">A</button>' +
          '<button type="button" data-scale="up" aria-label="Larger text">A+</button>' +
        '</div>' +
        '<p class="small muted">Dark mode and text size are remembered on this device.</p>' +
      '</div>';
    top.appendChild(wrap);
    applyPrefs();
  }

  function setPanel(open) {
    var btn = document.getElementById('a11y-open');
    var panel = document.getElementById('a11y-panel');
    if (!btn || !panel) return;
    panel.hidden = !open;
    btn.setAttribute('aria-expanded', open ? 'true' : 'false');
    if (open) { var first = document.getElementById('a11y-theme'); if (first) first.focus(); }
  }

  document.addEventListener('click', function (ev) {
    if (ev.target.closest('#a11y-open')) {
      var panelOpen = document.getElementById('a11y-panel') && !document.getElementById('a11y-panel').hidden;
      setPanel(!panelOpen);
      return;
    }
    var wrapEl = document.querySelector('.a11y-wrap');
    if (wrapEl && !wrapEl.contains(ev.target)) setPanel(false);
    var btn = ev.target.closest('.a11y-controls button');
    if (!btn) return;
    var p = prefs();
    if (btn.id === 'a11y-theme') {
      p.theme = isDark(p) ? 'light' : 'dark';
    } else {
      var i = SCALES.indexOf(p.scale || 'normal');
      if (btn.dataset.scale === 'up') i = Math.min(SCALES.length - 1, i + 1);
      if (btn.dataset.scale === 'down') i = Math.max(0, i - 1);
      if (btn.dataset.scale === 'reset') i = 0;
      p.scale = SCALES[i];
    }
    savePrefs(p);
    applyPrefs();
  });

  document.addEventListener('keydown', function (ev) {
    if (ev.key === 'Escape') {
      var panel = document.getElementById('a11y-panel');
      if (panel && !panel.hidden) { setPanel(false); document.getElementById('a11y-open').focus(); }
    }
  });

  // Follow the system setting when the user has not chosen one
  if (window.matchMedia) {
    matchMedia('(prefers-color-scheme: dark)').addEventListener('change', applyPrefs);
  }

  // ---------- Labels and roles for screen readers ----------
  var RAG_LABEL = { red: 'Red: needs attention', amber: 'Amber: keep an eye on it', green: 'Green: on track' };

  function tidy(root) {
    root.querySelectorAll('.rag').forEach(function (r) {
      if (r.hasAttribute('aria-label')) return;
      var tone = ['red', 'amber', 'green'].filter(function (t) { return r.classList.contains('rag-' + t); })[0];
      r.setAttribute('role', 'img');
      r.setAttribute('aria-label', RAG_LABEL[tone] || 'Status');
    });

    root.querySelectorAll('.progress').forEach(function (bar) {
      if (bar.hasAttribute('role')) return;
      var span = bar.querySelector('span');
      var pct = span ? parseInt(span.style.width, 10) || 0 : 0;
      bar.setAttribute('role', 'progressbar');
      bar.setAttribute('aria-valuemin', '0');
      bar.setAttribute('aria-valuemax', '100');
      bar.setAttribute('aria-valuenow', String(pct));
      bar.setAttribute('aria-label', 'Progress ' + pct + '%');
    });

    root.querySelectorAll('.thread').forEach(function (t) {
      if (t.getAttribute('role') === 'log') return;
      t.setAttribute('role', 'log');
      t.setAttribute('aria-live', 'polite');
      t.setAttribute('aria-relevant', 'additions');
    });

    root.querySelectorAll('.check').forEach(function (c) {
      c.setAttribute('aria-pressed', c.classList.contains('on') ? 'true' : 'false');
    });

    root.querySelectorAll('svg').forEach(function (s) {
      if (!s.hasAttribute('role') && !s.hasAttribute('aria-label')) {
        s.setAttribute('aria-hidden', 'true');
        s.setAttribute('focusable', 'false');
      }
    });

    root.querySelectorAll('.sidenav a, .tabbar a, .tabbar button').forEach(function (a) {
      if (a.classList.contains('active')) a.setAttribute('aria-current', 'page');
      else a.removeAttribute('aria-current');
    });

    root.querySelectorAll('input, textarea, select').forEach(function (el) {
      if (el.type === 'hidden' || el.hasAttribute('aria-label') || el.hasAttribute('aria-labelledby')) return;
      if (el.id && document.querySelector('label[for="' + el.id + '"]')) return;
      if (el.closest('label')) return;
      el.setAttribute('aria-label', el.placeholder || el.name || 'Field');
    });

    // Links that open another site say so
    root.querySelectorAll('a[target="_blank"]').forEach(function (a) {
      if (a.dataset.extNoted) return;
      a.dataset.extNoted = '1';
      var note = document.createElement('span');
      note.className = 'sr-only';
      note.textContent = ' (opens in a new tab)';
      a.appendChild(note);
    });
  }

  // ---------- Page titles and focus on navigation ----------
  function pageTitle() {
    var h = document.querySelector('#app h1');
    return h && h.innerText.trim() ? h.innerText.trim() + ' · ' + baseTitle : baseTitle;
  }

  var pending = false;
  function refresh() {
    if (pending) return;
    pending = true;
    requestAnimationFrame(function () {
      pending = false;
      tidy(document);
      document.title = pageTitle();
    });
  }

  // The app renders on hash change before this listener runs, so the new heading is there
  window.addEventListener('hashchange', function () {
    setTimeout(function () {
      var h = document.querySelector('#app h1');
      if (h) {
        h.setAttribute('tabindex', '-1');
        h.focus({ preventScroll: true });
      }
      refresh();
    }, 0);
  });

  function start() {
    buildControls();
    applyPrefs();
    tidy(document);
    document.title = pageTitle();
    var target = document.getElementById('app') || document.body;
    new MutationObserver(refresh).observe(target, { childList: true, subtree: true });
    var side = document.getElementById('sidenav');
    var tab = document.getElementById('tabbar');
    [side, tab].forEach(function (el) {
      if (el) new MutationObserver(refresh).observe(el, { childList: true, subtree: true });
    });
  }

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', start);
  else start();
})();
