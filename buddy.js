// Buddy portal: a buddy sees the new starters they are looking after and chats with them.
(function () {
  'use strict';

  const BUDDY_ME = { name: DEMO.buddy.name, role: DEMO.buddy.role, initials: 'SO' };
  const HIRE_ID = CHAT.ME_HIRE_ID; // Sam is buddy for Alex in this demo
  const hire = HIRES.find((h) => h.id === HIRE_ID);

  const load = (k, f) => {
    try { const v = localStorage.getItem('buddy.' + k); return v === null ? f : JSON.parse(v); }
    catch (e) { return f; }
  };
  const save = (k, v) => localStorage.setItem('buddy.' + k, JSON.stringify(v));
  let signedIn = load('signedIn', false);

  const $ = (sel) => document.querySelector(sel);
  const esc = (s) => String(s).replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
  const dt = (x) => (x instanceof Date ? x : new Date(x));
  const ICON = {
    people: '<circle cx="9" cy="8" r="3.5"/><path d="M2.5 20c.6-3.4 3.3-5.5 6.5-5.5s5.9 2.1 6.5 5.5"/><path d="M16 4.6a3.5 3.5 0 0 1 0 6.8"/><path d="M18 14.6c2 .8 3.2 2.7 3.5 5.4"/>',
    chat: '<path d="M4 5h16v11H9l-5 4z"/>',
    logout: '<path d="M14 4h4a2 2 0 0 1 2 2v12a2 2 0 0 1-2 2h-4M10 8l-4 4 4 4M6 12h11"/>',
    arrow: '<path d="M5 12h14M13 6l6 6-6 6"/>',
  };
  const svg = (name) =>
    `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">${ICON[name]}</svg>`;

  function toast(msg) {
    const t = $('#toast');
    t.textContent = msg;
    t.classList.add('show');
    clearTimeout(toast._t);
    toast._t = setTimeout(() => t.classList.remove('show'), 2800);
  }

  function crumbs(items) {
    return `
      <nav class="crumbs" aria-label="Breadcrumb"><ol>
        ${items.map((it, i) => (i === items.length - 1
          ? `<li><span aria-current="page">${esc(it.label)}</span></li>`
          : `<li><a href="${it.href}">${esc(it.label)}</a></li>`)).join('')}
      </ol></nav>`;
  }

  function chrome(section) {
    document.body.classList.toggle('has-nav', signedIn);
    $('#topbar-user').innerHTML = signedIn
      ? `<span>${esc(BUDDY_ME.name.split(' ')[0])}</span><span class="avatar">${BUDDY_ME.initials}</span>`
      : '';
    if (!signedIn) { $('#sidenav').innerHTML = ''; $('#tabbar').innerHTML = ''; return; }
    const unread = CHAT.unread(HIRE_ID, 'buddy', 'buddy');
    const items = [
      ['', 'My new starter', 'people', unread],
    ];
    const nav = (cls) => items.map(([key, label, icon, count]) => {
      const active = section === key ? 'active' : '';
      const badge = count ? `<span class="nav-count">${count}</span>` : '';
      return `<a href="#/${key}" class="${active}">${svg(icon)}<span>${label}</span>${badge}</a>`;
    }).join('');
    $('#sidenav').innerHTML = nav('side') +
      `<div class="side-foot">
         <div class="muted small">Signed in as</div>
         <strong>${esc(BUDDY_ME.name)}</strong>
         <div class="small" style="margin-top:14px"><button class="linkish" id="buddy-signout">Sign out</button></div>
       </div>`;
    $('#tabbar').innerHTML = nav('tab') +
      `<button class="tab-btn" id="buddy-signout-tab">${svg('logout')}<span>Sign out</span></button>`;
  }

  function renderSignin() {
    return `
      <section class="signin">
        <div class="signin-card">
          <div class="stack">
            <p class="eyebrow">Buddy portal</p>
            <h1>Welcome, ${esc(BUDDY_ME.name.split(' ')[0])}</h1>
            <p class="muted">Thank you for being a buddy. Say hello to your new starter and answer the everyday questions.</p>
          </div>
          <div class="card stack">
            <div class="sso-account">
              <span class="avatar">${BUDDY_ME.initials}</span>
              <div class="person-meta"><strong>${esc(BUDDY_ME.name)}</strong><span>${esc(BUDDY_ME.role)}</span></div>
            </div>
            <button class="btn btn-block" id="buddy-sso">Continue with Lloyds SSO</button>
            <p class="small muted" style="text-align:center">Demo only: nothing is sent.</p>
          </div>
        </div>
      </section>`;
  }

  function renderHome() {
    const msgs = CHAT.thread(HIRE_ID, 'buddy');
    const last = msgs[msgs.length - 1];
    const unread = CHAT.unread(HIRE_ID, 'buddy', 'buddy');
    const days = Math.round((effectiveStart(HIRE_ID) - TODAY) / 86400000);
    return `
      <div class="stack" style="gap:6px">
        <p class="eyebrow">Buddy portal</p>
        <h1>Your new starter</h1>
        <p class="muted">Check in with ${esc(hire.name.split(' ')[0])} before they start. Your messages are the first friendly face they see.</p>
      </div>

      <a class="card hire-card" href="#/chat/${hire.id}" style="margin-top:16px;text-decoration:none;color:var(--ink)">
        <div class="hire-top">
          <span class="avatar lg">${esc(hire.initials)}</span>
          <div class="person-meta" style="flex:1">
            <strong>${esc(hire.name)}</strong>
            <span>${esc(hire.title)} · ${esc(hire.team)}</span>
          </div>
          ${unread ? `<span class="pill amber">${unread} new</span>` : '<span class="pill grey">Up to date</span>'}
        </div>
        <div class="hire-meta">
          <span class="pill grey">Starts ${fmtShort(effectiveStart(HIRE_ID))}</span>
          <span class="pill grey">${days} days to go</span>
        </div>
        ${last ? `<div class="next-step"><span class="eyebrow">Last message</span> ${esc(last.text)}</div>` : ''}
        <div><span class="btn btn-ghost btn-sm">Open chat ${svg('arrow')}</span></div>
      </a>`;
  }

  const QUICK = [
    'Coffee this week? I am free Thursday afternoon.',
    'Your Teams invite is on its way. Please accept it when it lands.',
    'Lunch on Day 1 is at 12:30. I will meet you at reception.',
    'The Commercial Data team channel is the best place to start. I have added you.',
  ];

  function renderChat() {
    CHAT.markRead(HIRE_ID, 'buddy', 'buddy');
    const msgs = CHAT.thread(HIRE_ID, 'buddy');
    const bubbles = msgs.map((m) => {
      const mine = m.from === 'buddy';
      const who = mine ? 'You' : (m.from === 'hr' ? (m.name || 'Onboarding team') : hire.name);
      const time = dt(m.time).toLocaleDateString('en-GB', { day: 'numeric', month: 'short' });
      return `<div class="bubble ${mine ? 'mine' : ''}">
        <div class="small muted">${esc(who)} · ${time}</div>
        <div>${esc(m.text)}</div>
      </div>`;
    }).join('');
    return `
      ${crumbs([{ label: 'Home', href: '#/' }, { label: hire.name }])}

      <div class="stack" style="gap:6px;margin-top:10px">
        <p class="eyebrow">Chat with your new starter</p>
        <h1>${esc(hire.name)}</h1>
        <p class="muted">${esc(hire.title)} · starts ${fmtLong(effectiveStart(HIRE_ID))}</p>
      </div>

      <div class="card" style="margin-top:16px">
        <div class="thread">${bubbles || '<p class="muted small">No messages yet. Say hello.</p>'}</div>
        <div class="quick">
          ${QUICK.map((q, i) => `<button type="button" class="chip" data-quick="${i}">${esc(q.split('.')[0])}</button>`).join('')}
        </div>
        <form class="reply" id="buddy-form">
          <label class="sr-only" for="buddy-text">Message ${esc(hire.name)}</label>
          <textarea id="buddy-text" name="text" rows="2" placeholder="Write a message to ${esc(hire.name.split(' ')[0])}" required></textarea>
          <button class="btn btn-sm" type="submit">Send</button>
        </form>
      </div>

      <div class="row" style="margin-top:16px">
        <a class="btn btn-ghost" href="#/">${svg('arrow')} Back to my new starter</a>
      </div>`;
  }

  function route() {
    const raw = location.hash.replace(/^#\/?/, '');
    const [section, id] = raw.split('/');
    if (!signedIn) {
      chrome('');
      $('#app').innerHTML = renderSignin();
      return;
    }
    let html;
    if (section === 'chat' && id === HIRE_ID) { html = renderChat(); chrome(''); }
    else { html = renderHome(); chrome(''); }
    // Keep the scroll position when the same page is re-drawn, and go to the top on a new page
    const samePage = route.last === raw;
    const keepY = window.scrollY;
    $('#app').innerHTML = html;
    window.scrollTo({ top: samePage ? keepY : 0, behavior: 'instant' });
    route.last = raw;
  }

  document.addEventListener('click', (ev) => {
    const el = ev.target.closest('button, a');
    if (!el) return;
    if (el.id === 'buddy-sso') {
      signedIn = true; save('signedIn', true);
      location.hash = '#/';
      return route();
    }
    if (el.id === 'buddy-signout' || el.id === 'buddy-signout-tab') {
      signedIn = false; save('signedIn', false);
      location.hash = '#/';
      return route();
    }
    if (el.dataset.quick !== undefined) {
      const box = $('#buddy-text');
      if (box) { box.value = QUICK[Number(el.dataset.quick)]; box.focus(); }
    }
  });

  document.addEventListener('submit', (ev) => {
    const form = ev.target.closest('#buddy-form');
    if (!form) return;
    ev.preventDefault();
    const text = form.elements.text.value.trim();
    if (!text) return;
    CHAT.send(HIRE_ID, 'buddy', text, BUDDY_ME.name, 'buddy');
    toast('Message sent');
    route();
  });

  window.addEventListener('storage', (ev) => {
    if (ev.key !== CHAT.KEY) return;
    if (document.activeElement && document.activeElement.tagName === 'TEXTAREA') return;
    route();
  });

  window.addEventListener('hashchange', route);
  route();
})();
