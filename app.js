// New starter journey: single-page demo (hash routing, no build step).
(function () {
  'use strict';

  // ---------- Persisted demo state ----------
  const load = (k, fallback) => {
    try { const v = localStorage.getItem('lbg.' + k); return v === null ? fallback : JSON.parse(v); }
    catch (e) { return fallback; }
  };
  const save = (k, v) => localStorage.setItem('lbg.' + k, JSON.stringify(v));

  const state = {
    signedIn: load('signedIn', false),
    setupDone: load('setupDone', false),
    doneTodos: load('doneTodos', DEMO.todos.filter((t) => t.done).map((t) => t.id)),
    callbackRequested: load('callbackRequested', false),
    setupTicks: load('setupTicks', []),
  };

  const $ = (sel) => document.querySelector(sel);
  const esc = (s) => String(s).replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
  const initials = (name) => name.split(' ').map((p) => p[0]).slice(0, 2).join('');
  const { person, manager, buddy } = DEMO;
  const daysToStart = daysBetween(TODAY, person.startDate);

  // ---------- Icons (inline SVG, outline style) ----------
  const ICON = {
    home: '<path d="M3 11l9-7 9 7v9a1 1 0 0 1-1 1h-5v-6H9v6H4a1 1 0 0 1-1-1z"/>',
    shield: '<path d="M12 3l8 3v6c0 4.5-3.4 8.3-8 9-4.6-.7-8-4.5-8-9V6z"/><path d="M9 12l2 2 4-4"/>',
    check: '<path d="M4 12l5 5 11-11"/>',
    people: '<circle cx="9" cy="8" r="3.5"/><path d="M2.5 20c.6-3.4 3.3-5.5 6.5-5.5s5.9 2.1 6.5 5.5"/><path d="M16 4.6a3.5 3.5 0 0 1 0 6.8"/><path d="M18 14.6c2 .8 3.2 2.7 3.5 5.4"/>',
    list: '<path d="M9 6h11M9 12h11M9 18h11"/><circle cx="4.5" cy="6" r="1"/><circle cx="4.5" cy="12" r="1"/><circle cx="4.5" cy="18" r="1"/>',
    phone: '<path d="M5 4h4l2 5-2.5 1.5a11 11 0 0 0 5 5L15 13l5 2v4a2 2 0 0 1-2 2A16 16 0 0 1 3 6a2 2 0 0 1 2-2z"/>',
    mail: '<rect x="3" y="5" width="18" height="14" rx="2"/><path d="M3 7l9 6 9-6"/>',
    arrow: '<path d="M5 12h14M13 6l6 6-6 6"/>',
    logout: '<path d="M14 4h4a2 2 0 0 1 2 2v12a2 2 0 0 1-2 2h-4M10 8l-4 4 4 4M6 12h11"/>',
    user: '<circle cx="12" cy="8" r="4"/><path d="M4 21c.8-4 4-6 8-6s7.2 2 8 6"/>',
    chat: '<path d="M4 5h16v11H9l-5 4z"/>',
    play: '<path d="M7 5l12 7-12 7z"/>',
    help: '<circle cx="12" cy="12" r="9"/><path d="M9.5 9a2.5 2.5 0 0 1 5 0c0 2-2.5 2-2.5 4"/><path d="M12 17h.01"/>',
    book: '<path d="M4 5a2 2 0 0 1 2-2h13v16H6a2 2 0 0 0-2 2z"/><path d="M4 5v16"/>',
    calendar: '<rect x="3" y="5" width="18" height="16" rx="2"/><path d="M3 10h18M8 3v4M16 3v4"/>',
  };
  const svg = (name, cls = '') =>
    `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" class="${cls}" aria-hidden="true">${ICON[name]}</svg>`;

  // ---------- Office artwork (placeholder: swap for real site photography) ----------
  const OFFICE_ART = {
    london: `
      <svg viewBox="0 0 800 320" preserveAspectRatio="xMidYMid slice" role="img" aria-label="Canary Wharf skyline illustration">
        <defs>
          <linearGradient id="sky" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0" stop-color="#0c4a38"/><stop offset="1" stop-color="#3f9a7c"/>
          </linearGradient>
        </defs>
        <rect width="800" height="320" fill="url(#sky)"/>
        <circle cx="640" cy="70" r="34" fill="#e9f5ef" opacity=".85"/>
        <g fill="#002a1e" opacity=".55">
          <rect x="30" y="200" width="60" height="120"/><rect x="100" y="170" width="46" height="150"/>
          <rect x="160" y="210" width="70" height="110"/><rect x="520" y="190" width="58" height="130"/>
          <rect x="590" y="160" width="50" height="160"/><rect x="650" y="205" width="90" height="115"/>
        </g>
        <g fill="#00402e">
          <rect x="300" y="60" width="90" height="260"/><rect x="396" y="110" width="70" height="210"/>
          <polygon points="330,60 345,20 360,60"/><rect x="418" y="90" width="26" height="20"/>
        </g>
        <g fill="#c9e3d8" opacity=".5">
          <rect x="312" y="80" width="6" height="6"/><rect x="330" y="80" width="6" height="6"/><rect x="348" y="80" width="6" height="6"/>
          <rect x="312" y="110" width="6" height="6"/><rect x="330" y="110" width="6" height="6"/><rect x="348" y="110" width="6" height="6"/>
          <rect x="312" y="140" width="6" height="6"/><rect x="348" y="140" width="6" height="6"/>
          <rect x="408" y="130" width="6" height="6"/><rect x="426" y="130" width="6" height="6"/><rect x="444" y="130" width="6" height="6"/>
        </g>
      </svg>`,
    default: `
      <svg viewBox="0 0 800 320" preserveAspectRatio="xMidYMid slice" role="img" aria-label="Office illustration">
        <rect width="800" height="320" fill="#0c4a38"/>
        <rect y="240" width="800" height="80" fill="#00402e"/>
        <g fill="#3f9a7c"><rect x="120" y="110" width="140" height="130"/><rect x="300" y="80" width="200" height="160"/><rect x="540" y="130" width="130" height="110"/></g>
      </svg>`,
  };
  const officeArt = (key) => OFFICE_ART[key] || OFFICE_ART.default;

  // ---------- Vetting helpers ----------
  // The checks as the hire should see them: if vetting has been cleared (by HR or the manager's override), all are complete
  function vettingChecksNow() {
    const all = vettingIsDone();
    return DEMO.vettingChecks.map((c) => (all && c.status !== 'complete'
      ? Object.assign({}, c, { status: 'complete', completedOn: TODAY })
      : c));
  }
  const slipped = () => vettingChecksNow().filter((c) => c.status !== 'complete' && c.eta && c.eta > c.needBy);
  const completedChecks = () => vettingChecksNow().filter((c) => c.status === 'complete').length;
  const STATUS_LABEL = {
    complete: ['Complete', 'green'],
    in_progress: ['In progress', 'amber'],
    waiting: ['Waiting on referee', 'amber'],
    queued: ['Queued', 'grey'],
  };
  const checkRag = (c) => {
    if (c.status === 'complete') return 'green';
    if (c.eta && c.eta > c.needBy) return 'red';
    if (c.status === 'waiting') return 'amber';
    return 'green';
  };
  const ragLabel = { red: 'Behind', amber: 'Watch', green: 'On track' };

  // ---------- Shared pieces ----------
  function toast(msg) {
    const t = $('#toast');
    t.textContent = msg;
    t.classList.add('show');
    clearTimeout(toast._t);
    toast._t = setTimeout(() => t.classList.remove('show'), 2800);
  }

  function renderChrome(route) {
    const show = state.signedIn && state.setupDone && route !== 'setup';
    document.body.classList.toggle('has-nav', show);
    $('#topbar-user').innerHTML = state.signedIn
      ? `<a class="name-badge" href="#/me" aria-label="My details for ${esc(person.name)}"><span>${esc(person.firstName)}</span><span class="avatar">${initials(person.name)}</span></a>`
      : '';
    if (!show) { $('#sidenav').innerHTML = ''; $('#tabbar').innerHTML = ''; return; }

    const items = [
      ['home', 'Home', 'home'],
      ['vetting', 'Vetting', 'shield'],
      ['todo', 'To do', 'list'],
      ['first30', 'First 30 days', 'calendar'],
      ['team', 'My team', 'people'],
      ['me', 'My details', 'user'],
    ].filter((it) => !(combinedMode() && it[0] === 'first30')); // once combined, To do holds the plan too
    const current = route === 'home' ? 'home' : (combinedMode() && route === 'first30' ? 'todo' : route);
    $('#sidenav').innerHTML =
      items.map(([r, label, icon]) =>
        `<a href="#/${r}" class="${current === r ? 'active' : ''}">${svg(icon)}${label}</a>`).join('') +
      `<div class="side-foot">
         <div class="muted small">Start date</div>
         <strong>${fmtShort(person.startDate)} 2027</strong>
         <div class="small" style="margin-top:14px"><a href="#/reset">Reset demo</a></div>
       </div>`;
    $('#tabbar').innerHTML = items.map(([r, label, icon]) =>
      `<a href="#/${r}" class="${current === r ? 'active' : ''}">${svg(icon)}<span>${label}</span></a>`).join('');
  }

  // ---------- Screens ----------
  function renderSignin() {
    return `
      <section class="signin">
        <div class="signin-card">
          <div class="stack">
            <p class="eyebrow">Welcome to Lloyds Banking Group</p>
            <h1>Welcome, ${esc(person.firstName)}. Your offer is accepted.</h1>
            <p class="muted">Sign in with the work account you already have. There is no new password to create.</p>
          </div>

          <div class="card email-card">
            <div class="from">From: Recruitment Team · 14 Oct 2026</div>
            <div class="subject">Welcome to the team, ${esc(person.firstName)}. Here is what happens next</div>
            <p class="small muted">Hi ${esc(person.firstName)}, we are delighted you have accepted. Start the journey in the app to see your checks, to-dos and who you will meet before Day 1.</p>
          </div>

          <div class="card stack">
            <div class="sso-account">
              <span class="avatar">${initials(person.name)}</span>
              <div class="person-meta"><strong>${esc(person.name)}</strong><span>${esc(person.email)}</span></div>
            </div>
            <button class="btn btn-block" id="sso-btn">Continue with Lloyds SSO</button>
            <p class="small muted" style="text-align:center">Single sign-on through your Lloyds Banking Group account. Demo only: nothing is sent.</p>
          </div>
        </div>
      </section>`;
  }

  function renderSetup() {
    const ticks = state.setupTicks;
    const totalMins = DEMO.setupQuestions.reduce((a, q) => a + q.mins, 0);
    return `
      <div class="stack" style="gap:18px">
        <div class="setup-hero">
          <p class="eyebrow" style="color:#bfe3d3">Before you start · step 1 of 2</p>
          <h1 style="margin-top:6px">Here is what happens next, ${esc(person.firstName)}</h1>
          <p>Over the next few weeks you will answer a handful of questions and complete a few tasks. About ${totalMins} minutes in total, spread out. Nothing is due all at once.</p>
        </div>

        <div class="grid two">
          <div class="card">
            <h2>Your route to Day 1</h2>
            <div class="stack" style="margin-top:14px">
              <div class="phase"><strong>Now to mid-Dec · Checks</strong><span class="small muted">Vetting runs in the background. We will keep you posted with honest dates.</span></div>
              <div class="phase"><strong>Mid-Dec to Jan · Pre-boarding</strong><span class="small muted">Learning, equipment choice and your first meet-ups with Jordan and Sam.</span></div>
              <div class="phase"><strong>Mon 1 Feb 2027 · Day 1</strong><span class="small muted">${esc(person.startPlace)}. Arrive for ${esc(person.startTime)}.</span></div>
            </div>
          </div>

          <div class="card">
            <div class="spread"><h2>The questions you will be asked</h2><span class="pill">${ticks.length} / ${DEMO.setupQuestions.length}</span></div>
            <p class="small muted" style="margin-top:4px">Tick each one off as you go. You can come back to them at any time.</p>
            <ul class="q-list" style="margin-top:10px">
              ${DEMO.setupQuestions.map((q, i) => `
                <li>
                  <span class="q-num">${i + 1}</span>
                  <div>
                    <div style="font-weight:600">${esc(q.q)}</div>
                    <div class="small muted">${esc(q.when)} · about ${q.mins} min</div>
                  </div>
                  <button class="check ${ticks.includes(i) ? 'on' : ''}" data-tick="${i}" aria-label="Mark question ${i + 1} as done">
                    ${ticks.includes(i) ? svg('check') : ''}
                  </button>
                </li>`).join('')}
            </ul>
          </div>
        </div>

        <div class="row" style="justify-content:flex-end">
          <button class="btn btn-ghost" id="setup-later">I will do this later</button>
          <button class="btn" id="setup-finish">Finish setup ${svg('arrow')}</button>
        </div>
      </div>`;
  }

  function renderHome() {
    const d = state.doneTodos;
    const openTodos = DEMO.todos.filter((t) => !d.includes(t.id));
    const nextEvents = DEMO.events.filter((e) => e.when >= TODAY).slice(0, 3);
    const stages = journeyStages();
    const doneStages = stages.filter((s) => s.status === 'done').length;
    const prog = journeyProgress();
    const progressPct = prog.pct;
    const atEnd = journeyIndex() >= DEMO.stages.length - 1;

    return `
      ${cancelBanner()}
      ${updatesBanner()}
      ${weeklyBanner()}
      ${phaseBanner()}
      <div class="hero">
        <div class="stack">
          <div class="hero-title">
            <p class="eyebrow">Home</p>
            <h1>Good morning, ${esc(person.firstName)}</h1>
            <p class="muted">You are joining as a ${esc(person.title)} in ${esc(person.team)}. Here is where things stand.</p>
          </div>
          <div class="card" data-tour="journey">
            <div class="countdown">
              <div class="tile"><strong>${daysBetween(TODAY, person.startDate)}</strong><span>days to Day 1</span></div>
              <div class="tile" style="background:var(--card);border:1px solid var(--line)"><strong style="font-size:1.1rem">${fmtLong(person.startDate)}</strong><span>${esc(person.startTime)} · ${esc(person.startPlace)}</span></div>
            </div>
            <div style="margin-top:18px" class="stack">
              <div class="spread small"><span><strong>Your journey</strong> · ${prog.done} of ${prog.total} steps done</span><span>${progressPct}%</span></div>
              <div class="progress"><span style="width:${progressPct}%"></span></div>
              <ul class="stages" style="margin-top:6px">
                ${stages.map((s) => {
                  const cancelled = isCancelled() && s.status === 'upcoming';
                  return `<li class="${cancelled ? 'cancelled' : s.status}"><div class="dot">${s.status === 'done' ? '✓' : ''}</div>${esc(s.label)}${cancelled ? '<span class="stage-state">Cancelled</span>' : ''}</li>`;
                }).join('')}
              </ul>
              <div class="row" style="gap:8px">
                <button class="btn btn-ghost btn-sm" data-journey-next="1" ${atEnd || isCancelled() ? 'disabled' : ''}>Demo: next stage</button>
                <button class="linkish small" data-journey-reset="1">Reset journey</button>
              </div>
            </div>
          </div>
        </div>

        <div class="card" style="padding:0;overflow:hidden;display:flex;flex-direction:column">
          <div class="office" style="border-radius:0">
            ${officeArt(person.officeKey)}
            <a class="office-label" href="#/place">${esc(person.location)} · Travel and amenities ${svg('arrow')}</a>
          </div>
          <div style="padding:16px 18px 18px" class="stack">
            <div>
              <div class="eyebrow">Your role</div>
              <h2 style="margin-top:4px">${esc(person.title)}</h2>
              <div class="muted small">${esc(person.team)}</div>
            </div>
            <div class="row small">
              <span class="pill grey">Start ${fmtShort(person.startDate)}</span>
              <span class="pill grey">${esc(person.location.split(',')[0])}</span>
            </div>
            <div class="salary-line">
              <span class="muted small">Agreed salary</span>
              <strong>${money(person.salary)} <span class="small muted">${esc(person.salaryBasis)}</span></strong>
            </div>
            <div class="salary-line" style="border-top:0;padding-top:0;margin-top:0">
              <span class="muted small">Pay day</span>
              <strong style="font-size:1rem">20th of each month</strong>
            </div>
            <a class="btn btn-ghost btn-sm" href="#/place" style="align-self:flex-start">Travel and local area ${svg('arrow')}</a>
          </div>
        </div>
      </div>

      ${notifyCard(true)}
      ${startMovedBanner()}
      ${unlockPanel()}
      <div class="section-head"><h2>Your to-dos</h2><a href="#/todo">See all ${openTodos.length} open</a></div>
      <div class="card" data-tour="todos">
        ${renderTodoList(openTodos.slice(0, 4))}
      </div>

      <div class="grid two" style="margin-top:16px">
        <div class="card">
          <div class="spread"><h2>Vetting</h2><span class="pill ${slipped().length ? 'amber' : 'green'}">${completedChecks()} of ${DEMO.vettingChecks.length} complete</span></div>
          <div class="muted small" style="margin-top:6px">Expected complete by</div>
          <div class="eta-big">${fmtLong(DEMO.vettingFinalEta)}</div>
          <p class="small muted" style="margin-top:8px">We need this back by ${fmtShort(D2(vettingChecksNow()))} to hold your start date.</p>
          <div style="margin-top:14px"><a class="btn btn-ghost btn-sm" href="#/vetting">Live progress ${svg('arrow')}</a></div>
        </div>

        <div class="card">
          <div class="spread"><h2>Coming up</h2><a href="#/team" class="small">Meet the team</a></div>
          <div style="margin-top:10px">
            ${nextEvents.map(eventRow).join('')}
          </div>
        </div>
      </div>

      <div class="grid two" style="margin-top:16px">
        <div class="card" data-tour="people">
          <h2>Your manager</h2>
          <div class="person" style="margin-top:14px">
            <span class="avatar lg">${initials(manager.name)}</span>
            <div class="person-meta"><strong>${esc(manager.name)}</strong><span>${esc(manager.role)}</span></div>
          </div>
          <div class="row" style="margin-top:14px">
            <a class="btn btn-ghost btn-sm" href="tel:${esc(manager.phone.replace(/\s/g, ''))}">${svg('phone')} Call</a>
            <a class="btn btn-ghost btn-sm" href="mailto:${esc(manager.email)}">${svg('mail')} Email</a>
            <a class="btn btn-ghost btn-sm" href="#/chat">${svg('chat')} Message${chatBadge()}</a>
          </div>
        </div>
        <div class="card">
          <h2>Your buddy</h2>
          <div class="person" style="margin-top:14px">
            <span class="avatar lg">${initials(buddy.name)}</span>
            <div class="person-meta"><strong>${esc(buddy.name)}</strong><span>${esc(buddy.role)}</span></div>
          </div>
          ${buddyProfile()}
          <p class="small muted" style="margin-top:12px">Your buddy answers the small questions no handbook covers: where to get a coffee, how the Teams calls work, what to wear.</p>
          <a class="btn btn-ghost btn-sm" style="margin-top:12px" href="#/buddy">${svg('chat')} Message ${esc(buddy.name.split(' ')[0])}${chatBadge('buddy')}</a>
        </div>
      </div>

      <p class="small muted" style="margin-top:24px;text-align:center">
        <button class="linkish" data-tour-start="1">Take the tour</button> · <a href="manager.html">Manager portal (demo)</a> · <a href="buddy.html">Buddy portal (demo)</a> · <a href="#/reset">Reset demo</a>
      </p>`;
  }

  // Earliest "needed by" date across checks that are still open (drives the headline deadline)
  function D2(checks) {
    const open = checks.filter((c) => c.status !== 'complete');
    if (!open.length) return checks[checks.length - 1].needBy;
    return open.reduce((min, c) => (c.needBy < min ? c.needBy : min), open[0].needBy);
  }

  function eventRow(e) {
    return `
      <div class="event">
        <div class="date">${e.when.toLocaleDateString('en-GB', { month: 'short' })}<strong>${e.when.getDate()}</strong></div>
        <div>
          <div style="font-weight:600">${esc(e.title)}</div>
          <div class="small muted">${esc(e.time)} · ${esc(e.where)}</div>
        </div>
      </div>`;
  }

  // To-do items that open a real page in this demo
  const TODO_LINKS = { t4: '#/device', t7: '#/workspace', t8: '#/workspace' };

  function renderTodoList(list) {
    const d = state.doneTodos;
    if (!list.length) return '<p class="muted">Nothing outstanding. Nice work.</p>';
    return list.map((t) => {
      const done = d.includes(t.id);
      const rag = done ? 'green' : t.rag;
      return `
        <div class="todo ${done ? 'is-done' : ''}">
          <span class="rag rag-${rag}" title="${done ? 'Done' : ragLabel[rag]}"></span>
          <div class="todo-body">
            <strong>${esc(t.title)}</strong>
            <div class="detail">${esc(t.detail)}</div>
            <div class="row small" style="margin-top:8px">
              <span class="pill ${rag === 'red' ? 'red' : rag === 'amber' ? 'amber' : 'green'}">${done ? 'Done' : rag === 'red' ? 'Action needed' : rag === 'amber' ? 'Due ' + fmtShort(t.due) : 'On track'}</span>
              ${t.cta && !done && TODO_LINKS[t.id]
                ? `<a class="btn btn-ghost btn-sm" href="${TODO_LINKS[t.id]}">${esc(t.cta)}</a>`
                : t.cta && !done ? `<button class="btn btn-ghost btn-sm" data-todo="${t.id}">${esc(t.cta)}</button>` : ''}
            </div>
          </div>
          <button class="check ${done ? 'on' : ''}" data-check="${t.id}" aria-label="Mark ${esc(t.title)} as ${done ? 'not done' : 'done'}">
            ${done ? svg('check') : ''}
          </button>
        </div>`;
    }).join('');
  }

  function renderTodo() {
    if (combinedMode()) return renderFirst30(); // one combined list after onboarding and Day 1
    const d = state.doneTodos;
    const action = DEMO.todos.filter((t) => !d.includes(t.id) && t.rag === 'red');
    const soon = DEMO.todos.filter((t) => !d.includes(t.id) && t.rag === 'amber');
    const ontrack = DEMO.todos.filter((t) => !d.includes(t.id) && t.rag === 'green');
    const done = DEMO.todos.filter((t) => d.includes(t.id));
    return `
      <div class="stack" style="gap:6px">
        <p class="eyebrow">To do</p>
        <h1>Your to-do list</h1>
        <p class="muted">Ordered by urgency. Tick things off as you go, and we will update your progress.</p>
      </div>

      <div class="card" style="margin-top:16px">
        <div class="legend">
          <span><i class="rag rag-red"></i>Action needed now</span>
          <span><i class="rag rag-amber"></i>Due in the next 3 weeks</span>
          <span><i class="rag rag-green"></i>On track or done</span>
        </div>
      </div>

      <div class="section-head"><h2>Action needed</h2><span class="pill red">${action.length}</span></div>
      <div class="card">${action.length ? renderTodoList(action) : '<p class="muted">Nothing needs action right now.</p>'}</div>

      <div class="section-head"><h2>Due soon</h2><span class="pill amber">${soon.length}</span></div>
      <div class="card">${soon.length ? renderTodoList(soon) : '<p class="muted">Nothing due soon.</p>'}</div>

      <div class="section-head"><h2>On track</h2><span class="pill green">${ontrack.length}</span></div>
      <div class="card">${ontrack.length ? renderTodoList(ontrack) : '<p class="muted">Nothing here.</p>'}</div>

      ${done.length ? `
        <div class="section-head"><h2>Done</h2><span class="pill green">${done.length}</span></div>
        <div class="card">${renderTodoList(done)}</div>` : ''}`;
  }

  function renderVetting() {
    const slip = slipped();
    const requested = state.callbackRequested || slip.length > 0;
    const upd = DEMO.vettingUpdate;
    const checks = vettingChecksNow();
    return `
      <div class="stack" style="gap:6px">
        <p class="eyebrow">Vetting</p>
        <h1>Live progress</h1>
        <p class="muted">These are the checks the bank must complete before you start. Here is where each one stands today.</p>
      </div>

      <div class="grid two" style="margin-top:16px">
        <div class="card stack">
          <div class="spread"><span class="eyebrow">Expected complete by</span><span class="pill ${slip.length ? 'amber' : 'green'}">${slip.length ? 'Some checks slipping' : 'On track'}</span></div>
          <div class="eta-big" style="font-size:1.9rem">${fmtLong(DEMO.vettingFinalEta)}</div>
          <div class="small muted">Needed back by <strong style="color:var(--ink)">${fmtShort(D2(checks))}</strong> to keep your ${fmtShort(person.startDate)} start.</div>
          <div class="progress" style="margin-top:6px"><span style="width:${Math.round((completedChecks() / checks.length) * 100)}%"></span></div>
          <div class="small muted">${completedChecks()} of ${checks.length} checks complete</div>
        </div>

        <div class="card stack">
          <div class="spread"><span class="eyebrow">Latest update</span><span class="small muted">${fmtShort(upd.postedOn)} · ${esc(upd.time)}</span></div>
          <p style="font-size:0.95rem">${esc(upd.message)}</p>
          <div class="small muted">Next update: ${fmtShort(upd.nextUpdate)}</div>
        </div>
      </div>

      ${slip.length ? `
        <div class="banner alert" style="margin-top:16px">
          ${svg('phone')}
          <div>
            <strong>${slip.length === 1 ? 'One check has' : slip.length + ' checks have'} slipped past the date we need it.</strong>
            <ul class="small" style="margin:6px 0 0;padding-left:18px">
              ${slip.map((c) => `<li>${esc(c.name)}: expected ${fmtShort(c.eta)}, needed by ${fmtShort(c.needBy)}</li>`).join('')}
            </ul>
          </div>
        </div>` : ''}

      <div class="card" style="margin-top:16px">
        <div class="spread" style="margin-bottom:6px">
          <h2>Your checks</h2>
          <div class="legend"><span><i class="rag rag-green"></i>On track</span><span><i class="rag rag-amber"></i>Watch</span><span><i class="rag rag-red"></i>Behind</span></div>
        </div>
        ${checks.map(renderCheck).join('')}
        ${contractCheckRow()}
      </div>

      <div class="card" style="margin-top:16px">
        <div class="grid two" style="gap:18px;align-items:center">
          <div class="stack" style="gap:6px">
            <h2>Manager call back</h2>
            <p class="small muted">If a check is going to take longer than planned, we ask your manager to call you so you are not left guessing. You can also ask for a call at any time.</p>
          </div>
          <div class="stack" style="gap:10px">
            ${requested
              ? `<div class="banner info">${svg('check')}<div><strong>${esc(manager.name)} has been asked to call you</strong><div class="small">${slip.length ? 'Requested automatically on ' + fmtShort(upd.postedOn) + ' because a check slipped.' : 'Requested by you.'} They will aim to call this week.</div></div></div>`
              : ''}
            <button class="btn ${requested ? 'btn-ghost is-done' : ''} btn-block" id="callback-btn" ${requested ? 'disabled' : ''}>
              ${requested ? 'Call back requested' : 'Ask ' + esc(manager.name.split(' ')[0]) + ' to call me'}
            </button>
          </div>
        </div>
      </div>`;
  }

  // The contract is one of the checks. It can be signed at any time, on the Home workspace page.
  function contractCheckRow() {
    const sh = SHARED.get(CHAT.ME_HIRE_ID);
    const signed = !!sh.contractSigned;
    const open = contractWindowOpen(sh);
    const opensOn = new Date(person.startDate.getTime() - CONTRACT_LEAD_DAYS * 86400000);
    const [label, tone] = signed
      ? [`Signed ${fmtShort(new Date(sh.contractSigned))}`, 'green']
      : open ? ['To sign', 'amber'] : [`Opens ${fmtShort(opensOn)}`, 'grey'];
    return `
      <div class="check-row">
        <div class="check-top">
          <div class="name"><span class="rag rag-${signed ? 'green' : 'amber'}"></span>Employment contract</div>
          <span class="pill ${tone}">${esc(label)}</span>
        </div>
        <div class="small muted" style="padding-left:22px">Read and sign your contract. Signing unlocks your home equipment order.</div>
        <div style="padding-left:22px"><a class="btn btn-ghost btn-sm" href="#/workspace">${signed ? 'View contract' : 'Open contract'}</a></div>
      </div>`;
  }

  function renderCheck(c) {
    const [label, tone] = STATUS_LABEL[c.status];
    const rag = checkRag(c);
    const late = c.eta && c.eta > c.needBy;
    return `
      <div class="check-row">
        <div class="check-top">
          <div class="name"><span class="rag rag-${rag}"></span>${esc(c.name)}</div>
          <span class="pill ${tone}">${label}</span>
        </div>
        <div class="small muted" style="padding-left:22px">${esc(c.desc)}</div>
        <div class="check-meta" style="padding-left:22px">
          ${c.status === 'complete'
            ? `<span>Completed ${fmtShort(c.completedOn)}</span>`
            : `<span>Expected <strong style="color:var(--ink)">${fmtShort(c.eta)}</strong></span>
               <span class="${late ? 'late' : ''}">Needed by ${fmtShort(c.needBy)}${late ? ' · running late' : ''}</span>`}
        </div>
      </div>`;
  }

  const money = (n) => '£' + n.toLocaleString('en-GB');

  // Buddy bio, years of service and skills, shown on the Home and My team buddy cards
  function buddyProfile() {
    return `
      <div class="row small" style="margin-top:12px;gap:8px">
        <span class="pill">${buddy.yearsService} years at the bank</span>
      </div>
      <p class="small" style="margin-top:10px">${esc(buddy.bio)}</p>
      <div class="small muted" style="margin-top:10px">Good to ask about</div>
      <div class="row" style="margin-top:6px;gap:6px">
        ${buddy.skills.map((s) => `<span class="pill grey">${esc(s)}</span>`).join('')}
      </div>`;
  }

  // Small unread count shown on the Message button
  function chatBadge(channel) {
    const n = CHAT.unread(CHAT.ME_HIRE_ID, 'hire', channel);
    return n ? ` <span class="badge-count">${n}</span>` : '';
  }

  function infoRows(rows) {
    return rows.map(([k, v]) => `
      <div class="info-row"><span class="muted small">${esc(k)}</span><span>${v}</span></div>`).join('');
  }

  function renderMe() {
    const p = person;
    return `
      ${breadcrumbs([
        { label: 'Home', href: '#/home' },
        { label: 'My details' },
      ])}

      <div class="stack" style="gap:6px;margin-top:10px">
        <p class="eyebrow">My details</p>
        <h1>${esc(p.name)}</h1>
        <p class="muted">Your personal, job and pay information. Contact HR if anything is wrong.</p>
      </div>

      <div class="grid two" style="margin-top:16px">
        <div class="card">
          <div class="spread"><h2>Personal details</h2><span class="pill grey">Demo data</span></div>
          <div class="info-list">
            ${infoRows([
              ['Full name', esc(p.name)],
              ['Date of birth', fmtLong(p.dob)],
              ['Address', p.address.map(esc).join('<br>')],
              ['Mobile', esc(p.phone)],
              ['Email', esc(p.email)],
            ])}
          </div>
        </div>

        <div class="card">
          <h2>Job details</h2>
          <div class="info-list">
            ${infoRows([
              ['Job title', esc(p.title)],
              ['Team', esc(p.team)],
              ['Work location', esc(p.location)],
              ['Start date', fmtLong(p.startDate)],
              ['Line manager', esc(DEMO.manager.name)],
            ])}
          </div>
        </div>
      </div>

      <div class="card" style="margin-top:16px">
        <div class="spread"><h2>Salary and pay</h2><span class="pill green">Agreed ${fmtShort(p.salaryAgreedOn)}</span></div>
        <div class="info-list">
          ${infoRows([
            ['Base salary', `<strong>${money(p.salary)}</strong> ${esc(p.salaryBasis)}`],
            ['Pay frequency', esc(p.payFrequency)],
            ['First pay date', fmtLong(p.firstPayDate)],
            ['Bonus', esc(p.bonusEligible)],
          ])}
        </div>
        <p class="small muted" style="margin-top:12px">Figures shown are illustrative for the demo. Final figures come from your offer letter and payroll.</p>
        ${notifyCard(false)}
        <div class="card" style="margin-top:16px">
          <div class="spread"><h2>How you fit in</h2></div>
          <p class="small muted" style="margin-top:6px">What the bank needs, from the top down to your part, and why it matters.</p>
          <a class="btn btn-ghost btn-sm" style="margin-top:12px" href="#/purpose">Read how you fit in ${svg('arrow')}</a>
        </div>
        <p class="small" style="margin-top:14px"><a href="#/withdraw">Withdraw from this role</a></p>
      </div>`;
  }

  function breadcrumbs(items) {
    // items: [{label, href?}] — last item is the current page
    return `
      <nav class="crumbs" aria-label="Breadcrumb">
        <ol>
          ${items.map((it, i) => {
            const last = i === items.length - 1;
            return `<li>${last
              ? `<span aria-current="page">${esc(it.label)}</span>`
              : `<a href="${it.href}">${esc(it.label)}</a>`}</li>`;
          }).join('')}
        </ol>
      </nav>`;
  }

  function renderPlace() {
    const p = DEMO.place;
    const groups = [...new Set(p.amenities.map((a) => a.category))];
    return `
      ${breadcrumbs([
        { label: 'Home', href: '#/home' },
        { label: p.name },
      ])}

      <div class="hero" style="margin-top:10px">
        <div class="stack">
          <div class="hero-title">
            <p class="eyebrow">Your location</p>
            <h1>Getting to ${esc(p.name.split(',')[0])}</h1>
            <p class="muted">${esc(p.intro)}</p>
          </div>
          <div class="row small">
            <span class="pill grey">${esc(p.address)}</span>
            <span class="pill grey">Starts ${fmtShort(person.startDate)}</span>
          </div>
        </div>
        <div class="office">
          ${officeArt(p.key)}
          <span class="office-label">${esc(p.name)}</span>
        </div>
      </div>

      <div class="section-head"><h2>Travel options</h2><span class="small muted">Times are walking estimates</span></div>
      <div class="grid two">
        ${p.travel.map((t) => `
          <div class="card travel">
            <span class="mode mode-${t.mode.toLowerCase()}">${esc(t.mode)}</span>
            <div class="stack" style="gap:4px">
              <strong>${esc(t.name)}</strong>
              <span class="small muted">${esc(t.detail)}</span>
              <span class="small" style="color:var(--green-deep);font-weight:600">${esc(t.time)}</span>
            </div>
          </div>`).join('')}
      </div>

      <div class="section-head"><h2>Local amenities</h2></div>
      ${groups.map((g) => `
        <div class="eyebrow" style="margin:14px 0 8px">${esc(g)}</div>
        <div class="grid two">
          ${p.amenities.filter((a) => a.category === g).map((a) => `
            <div class="card amenity">
              <div class="spread"><strong>${esc(a.name)}</strong><span class="pill grey">${esc(a.distance)}</span></div>
              <span class="small muted">${esc(a.detail)}</span>
            </div>`).join('')}
        </div>`).join('')}

      <div class="section-head"><h2>Good to know</h2></div>
      <div class="card">
        <ul class="tips">
          ${p.tips.map((t) => `<li>${esc(t)}</li>`).join('')}
        </ul>
      </div>

      <div style="margin-top:20px" class="row">
        <a class="btn btn-ghost" href="#/home">${svg('arrow')} Back to home</a>
      </div>`;
  }

  // Vetting is done when every check is cleared (or the demo override is set from this page)
  function vettingIsDone() {
    return DEMO.vettingChecks.every((c) => c.status === 'complete') || !!SHARED.get(CHAT.ME_HIRE_ID).vettingDone;
  }

  function renderDevice() {
    const me = CHAT.ME_HIRE_ID;
    const sh = SHARED.get(me);
    const d = sh.device || null;
    const fam = JOB_FAMILIES.find((f) => f.id === sh.family);
    let body;

    if (!vettingIsDone()) {
      body = `
        <div class="card stack">
          <div class="spread"><h2>Locked until vetting is complete</h2><span class="pill grey">Not yet</span></div>
          <p class="muted">Your laptop depends on your job family, so we choose it once your background checks are cleared. You will be able to pick here as soon as they are.</p>
          <div class="banner info">${svg('shield')}<div class="small">Demo only: this button clears vetting for this demo so you can see the device choice.</div></div>
          <button class="btn btn-ghost" data-demo-vetting="1">Demo: complete vetting</button>
        </div>`;
    } else if (!fam) {
      body = `
        <div class="banner warn">
          <div><strong>Your manager is confirming your job family</strong>
          <div class="small" style="margin-top:4px">Device options depend on it. You will see them here once it is set.</div></div>
        </div>`;
    } else {
      const statusNote = {
        chosen: ['green', 'Standard build chosen. It will be ordered during onboarding and delivered to your desk on Day 1.'],
        requested: ['amber', 'Developer build requested. Waiting for Jordan to approve.'],
        approved: ['green', 'Developer build approved. It will be set up before Day 1.'],
        declined: ['amber', 'Your developer build request was declined. A standard build will be issued instead.'],
      }[d ? d.status : ''];

      body = `
        ${statusNote ? `<div class="banner ${statusNote[0] === 'green' ? 'info' : 'warn'}">${svg('check')}<div>${esc(statusNote[1])}</div></div>` : ''}

        <div class="section-head"><h2>Choose your operating system</h2><span class="small muted">Options for ${esc(fam.name)}</span></div>
        <div class="grid two">
          ${fam.os.map((os) => {
            const cat = DEVICES[os];
            const chosen = d && d.os === os && !d.dev;
            return `
              <div class="card stack device-card ${chosen ? 'selected' : ''}">
                <div class="spread"><strong>${esc(cat.name)}</strong>${chosen ? '<span class="pill green">Your choice</span>' : ''}</div>
                <span class="small muted">${esc(cat.spec)}</span>
                <button class="btn btn-block" data-choose-os="${os}" ${chosen ? 'disabled' : ''}>${chosen ? 'Chosen' : 'Choose standard build'}</button>
              </div>`;
          }).join('')}
        </div>

        ${fam.devEligible ? `
          <div class="section-head"><h2>Developer spec build</h2><span class="pill grey">Needs approval</span></div>
          <div class="grid two">
            ${fam.os.map((os) => {
              const cat = DEVICES[os];
              const pending = d && d.os === os && d.dev && (d.status === 'requested' || d.status === 'approved');
              return `
                <div class="card stack device-card ${pending ? 'selected' : ''}">
                  <strong>${esc(cat.dev.name)}</strong>
                  <span class="small muted">${esc(cat.dev.spec)}</span>
                  <button class="btn btn-ghost btn-block" data-request-os="${os}" ${pending ? 'disabled' : ''}>
                    ${pending ? (d.status === 'approved' ? 'Approved' : 'Requested') : 'Request developer build'}
                  </button>
                </div>`;
            }).join('')}
          </div>
          <p class="small muted" style="margin-top:10px">For engineers and developers. Your manager approves the request, and the developer build comes with extra tooling and admin rights for that job.</p>` : ''}`;
    }

    return `
      ${breadcrumbs([
        { label: 'Home', href: '#/home' },
        { label: 'Your device' },
      ])}

      <div class="stack" style="gap:6px;margin-top:10px">
        <p class="eyebrow">Your device</p>
        <h1>Choose your laptop</h1>
        <p class="muted">Your device is set up from your job family and ready for Day 1.</p>
      </div>

      <div style="margin-top:16px" class="stack">${body}</div>`;
  }

  // Contract opens CONTRACT_LEAD_DAYS before the start date (or from the demo button)
  function contractWindowOpen(sh) {
    const opensOn = new Date(person.startDate.getTime() - CONTRACT_LEAD_DAYS * 86400000);
    return true; // the contract can be signed as soon as it is available
  }

  function renderWorkspace() {
    const me = CHAT.ME_HIRE_ID;
    const sh = SHARED.get(me);
    const opensOn = new Date(person.startDate.getTime() - CONTRACT_LEAD_DAYS * 86400000);
    const signed = !!sh.contractSigned;
    const open = contractWindowOpen(sh);
    const draft = sh.kitDraft || { items: {}, delivery: 'day-before' };
    const order = sh.homeOrder || null;

    // Contract
    let contractCard;
    if (signed) {
      contractCard = `
        <div class="card stack">
          <div class="spread"><h2>Employment contract</h2><span class="pill green">Signed ${fmtShort(new Date(sh.contractSigned))}</span></div>
          <p class="muted small">Thank you. Your contract is on file with HR.</p>
        </div>`;
    } else if (!open) {
      contractCard = `
        <div class="card stack">
          <div class="spread"><h2>Employment contract</h2><span class="pill grey">Opens ${fmtShort(opensOn)}</span></div>
          <p class="muted">The contract link arrives one week before you start, along with your home equipment order.</p>
          <div class="banner info">${svg('shield')}<div class="small">Demo only: this button opens the contract window now.</div></div>
          <button class="btn btn-ghost" data-demo-window="1">Demo: open contract window</button>
        </div>`;
    } else {
      contractCard = `
        <div class="card stack">
          <div class="spread"><h2>Employment contract</h2><span class="pill amber">To sign</span></div>
          <p class="muted">Please read and sign your contract. This unlocks your home equipment order.</p>
          <button class="btn" data-sign-contract="1">Sign contract</button>
        </div>`;
    }

    // Home equipment
    let kitBody;
    if (!signed) {
      kitBody = `<p class="muted small">Available once your contract is signed.</p>`;
    } else if (order) {
      const delivery = HOME_DELIVERY.find((d) => d.id === order.delivery);
      const lines = Object.entries(order.items).map(([id, q]) => {
        const k = HOME_KIT.find((x) => x.id === id);
        return `<div class="info-row"><span>${q} × ${esc(k.name)}</span><span>${money(k.price * q)}</span></div>`;
      }).join('');
      kitBody = `
        <div class="info-list">${lines}
          <div class="info-row"><strong>Total</strong><strong>${money(order.total)}</strong></div>
          <div class="info-row"><span class="muted small">Delivery</span><span>${esc(delivery.label)}, ${esc(deliveryNote(delivery))}</span></div>
          <div class="info-row"><span class="muted small">Deliver to</span><span>${person.address.map(esc).join(', ')}</span></div>
        </div>
        ${order.denied
          ? `<div class="banner alert" style="margin-top:12px">${svg('shield')}<div><strong>${esc(manager.name)} did not approve this order</strong><div class="small" style="margin-top:4px">It is ${money(order.overBy)} over your ${money(HOME_KIT_ALLOWANCE)} allowance. Nothing has been ordered. Change your order to bring it within the allowance.</div></div></div>`
          : order.overBy > 0 && !order.approved
          ? `<div class="banner warn" style="margin-top:12px">${svg('check')}<div>${money(order.overBy)} is over your ${money(HOME_KIT_ALLOWANCE)} allowance. Jordan needs to approve it before we order.</div></div>`
          : `<div class="banner info" style="margin-top:12px">${svg('check')}<div>Order placed. Delivery is booked for ${esc(deliveryNote(delivery))}.</div></div>`}
        <button class="btn btn-ghost btn-sm" style="margin-top:12px" data-edit-kit="1">Change order</button>`;
    } else {
      const total = HOME_KIT.reduce((a, k) => a + k.price * (draft.items[k.id] || 0), 0);
      const over = total - HOME_KIT_ALLOWANCE;
      const pct = Math.min(100, Math.round((total / HOME_KIT_ALLOWANCE) * 100));
      const count = Object.values(draft.items).reduce((a, q) => a + q, 0);
      kitBody = `
        <div class="spread small"><span><strong>${money(total)}</strong> of ${money(HOME_KIT_ALLOWANCE)} allowance</span><span class="muted">${count} item${count === 1 ? '' : 's'}</span></div>
        <div class="progress" style="margin:8px 0 4px"><span style="width:${pct}%;${over > 0 ? 'background:var(--amber)' : ''}"></span></div>
        ${over > 0 ? `<div class="small" style="color:#8a5a00">${money(over)} over the allowance. Your manager will need to approve the difference.</div>` : ''}
        <div class="kit-list">
          ${HOME_KIT.map((k) => {
            const q = draft.items[k.id] || 0;
            return `
              <div class="kit-row">
                <div class="kit-body"><strong>${esc(k.name)}</strong><span class="small muted">${esc(k.desc)} · ${money(k.price)}</span></div>
                <div class="stepper" role="group" aria-label="Quantity of ${esc(k.name)}">
                  <button data-kit-id="${k.id}" data-kit-step="-1" ${q ? '' : 'disabled'} aria-label="Remove one">−</button>
                  <span aria-live="polite">${q}</span>
                  <button data-kit-id="${k.id}" data-kit-step="1" aria-label="Add one">+</button>
                </div>
              </div>`;
          }).join('')}
        </div>

        <h3 style="margin-top:16px">When should it arrive?</h3>
        <div class="delivery-options">
          ${HOME_DELIVERY.map((d) => `
            <label class="delivery ${draft.delivery === d.id ? 'on' : ''}">
              <input type="radio" name="delivery" value="${d.id}" ${draft.delivery === d.id ? 'checked' : ''} />
              <span><strong>${esc(d.label)}</strong><span class="small muted">${esc(deliveryNote(d))}</span></span>
            </label>`).join('')}
        </div>

        <div class="small muted" style="margin-top:12px">Delivering to ${person.address.map(esc).join(', ')}. <a href="#/me">Change address in My details</a>.</div>
        <button class="btn btn-block" style="margin-top:14px" data-place-order="1" ${count ? '' : 'disabled'}>Place order${count ? ' · ' + money(total) : ''}</button>`;
    }

    return `
      ${breadcrumbs([
        { label: 'Home', href: '#/home' },
        { label: 'Home workspace' },
      ])}

      <div class="stack" style="gap:6px;margin-top:10px">
        <p class="eyebrow">Before you start</p>
        <h1>Set up your home workspace</h1>
        <p class="muted">Sign your contract, then order the equipment you need at home. We deliver it the day before you start or on Day 1.</p>
      </div>

      <div class="grid two" style="margin-top:16px">
        <div class="stack">${contractCard}</div>
        <div class="card stack">
          <div class="spread"><h2>Home equipment</h2>${signed ? (order ? (order.denied ? '<span class="pill red">Not approved</span>' : '<span class="pill green">Ordered</span>') : '<span class="pill grey">Not ordered</span>') : '<span class="pill grey">Locked</span>'}</div>
          ${kitBody}
        </div>
      </div>`;
  }

  // channel: 'manager' (Jordan, HR) or 'buddy' (Sam)
  // Journey progress = every step the hire has to take (stages, vetting checks, actions, Day 1 plan)
  // counted against what is actually done. Matches what the rest of the app shows.
  function journeyProgress() {
    const sh = SHARED.get(CHAT.ME_HIRE_ID);
    const vetAll = vettingIsDone();
    const actions = [
      ...DEMO.vettingChecks.map((c) => vetAll || c.status === 'complete'),
      !!sh.contractSigned,
      !!sh.family,
      !!sh.device && sh.device.status !== 'requested' && sh.device.status !== 'cancelled',
      !!(sh.homeOrder && sh.homeOrder.approved && !sh.homeOrder.cancelled),
      ...FIRST30_PLAN.map((item) => first30Done(sh, item)),
    ];
    const stagesDone = journeyStages().filter((s) => s.status === 'done').length;
    const total = actions.length + DEMO.stages.length;
    const done = actions.filter(Boolean).length + stagesDone;
    return { done: done, total: total, pct: Math.round((done / total) * 100) };
  }

  // Where the hire is on their journey. Set by the demo button, otherwise the Vetting stage.
  function journeyIndex() {
    const v = SHARED.get(CHAT.ME_HIRE_ID).stageIndex;
    return typeof v === 'number' ? v : DEMO.stages.findIndex((s) => s.status === 'current');
  }

  function journeyStages() {
    const idx = journeyIndex();
    return DEMO.stages.map((s, i) => Object.assign({}, s, {
      status: i < idx ? 'done' : i === idx ? 'current' : 'upcoming',
    }));
  }

  // True once the role is fully cancelled and actions reversed
  function isCancelled() {
    const c = SHARED.get(CHAT.ME_HIRE_ID).cancel;
    return !!c && c.status === 'reversed';
  }

  // Withdrawal, and the cancellation the bank starts. Both change the hire's status for the manager.
  function renderWithdraw() {
    const me = CHAT.ME_HIRE_ID;
    const c = SHARED.get(me).cancel;
    const crumb = breadcrumbs([{ label: 'Home', href: '#/home' }, { label: 'Withdraw from role' }]);
    if (c && c.status === 'reversed') {
      return `${crumb}
        <div class="stack" style="gap:6px;margin-top:10px"><p class="eyebrow">Your role</p><h1>Role cancelled</h1></div>
        <div class="card" style="margin-top:16px"><p>Your role has been cancelled and anything set up for you has been reversed. HR will be in touch about next steps.</p></div>`;
    }
    if (c && c.status === 'open') {
      return `${crumb}
        <div class="stack" style="gap:6px;margin-top:10px"><p class="eyebrow">Your role</p><h1>Withdrawal received</h1></div>
        <div class="card" style="margin-top:16px"><p>${c.by === 'hire'
          ? esc(manager.name) + ' has been told you have withdrawn. They will confirm the next steps with you.'
          : esc(manager.name) + ' is reviewing your role. They will be in touch.'}</p></div>`;
    }
    return `${crumb}
      <div class="stack" style="gap:6px;margin-top:10px">
        <p class="eyebrow">Your role</p>
        <h1>Withdraw from this role</h1>
        <p class="muted">If you no longer want the role, tell us here. ${esc(manager.name)} will be notified and will book a call with you.</p>
      </div>
      <div class="card" style="margin-top:16px">
        <div class="banner warn">${svg('shield')}<div class="small">Anything already set up for you will be reversed: your laptop order, home equipment order, and any accounts or access created for you.</div></div>
        <form id="withdraw-form" class="stack" style="margin-top:16px">
          <label class="field-label" for="withdraw-reason">Reason (optional)</label>
          <textarea class="field" id="withdraw-reason" name="reason" rows="3" placeholder="Anything you would like us to know"></textarea>
          <label class="row small" style="gap:10px;align-items:flex-start">
            <input type="checkbox" name="confirm" required style="margin-top:3px" />
            <span>I understand this withdraws me from the role and reverses my set-up.</span>
          </label>
          <button class="btn btn-block btn-danger" type="submit">Withdraw from role</button>
        </form>
      </div>`;
  }

  // Shown on the home screen when the role is withdrawn or cancelled, or a call has been booked
  function cancelBanner() {
    const c = SHARED.get(CHAT.ME_HIRE_ID).cancel;
    if (!c) return '';
    if (c.status === 'reversed') {
      return `<div class="banner alert" style="margin-bottom:16px">${svg('shield')}<div><strong>Your role has been cancelled</strong><div class="small" style="margin-top:4px">Anything set up for you has been reversed. HR will be in touch.</div></div></div>`;
    }
    if (c.by === 'hire') {
      return `<div class="banner info" style="margin-bottom:16px">${svg('check')}<div><strong>You have withdrawn from the role</strong><div class="small" style="margin-top:4px">${esc(manager.name)} will confirm the next steps with you.</div></div></div>`;
    }
    if (c.callBooked) {
      return `<div class="banner alert" style="margin-bottom:16px">${svg('phone')}<div><strong>${esc(manager.name)} has booked a call with you</strong><div class="small" style="margin-top:4px">${fmtShort(new Date(c.callBooked))}. They want to talk to you about your role.</div></div></div>`;
    }
    return '';
  }

  // ---------- Day 1 to Day 30 ----------

  // Ask the assistant and keep the exchange in the shared store
  function askAssistant(text) {
    const sh = SHARED.get(CHAT.ME_HIRE_ID);
    const reply = ASSISTANT.answer(text);
    const log = (sh.assistant || []).concat([
      { from: 'you', text: text },
      { from: 'bot', text: reply.text, links: reply.links },
    ]);
    SHARED.update(CHAT.ME_HIRE_ID, { assistant: log.slice(-40) });
  }

  // Banner on home when Jordan or the onboarding team has sent an update
  function updatesBanner() {
    const n = NOTIFY.unread('hire');
    if (!n) return '';
    return `<a class="banner info" href="#/first30" style="margin-bottom:16px;text-decoration:none;color:inherit">${svg('calendar')}<div><strong>${n} new ${n === 1 ? 'update' : 'updates'} from your team</strong><div class="small" style="margin-top:4px">See your first 30 days for the details.</div></div></a>`;
  }

  // Tasks unlock on Day 1. Before then the pages can be read, and a demo button opens them early.
  function day1Open(sh) {
    return TODAY >= person.startDate || !!sh.demoDay1 || daysIn(CHAT.ME_HIRE_ID) >= 0;
  }

  function gateBanner(sh) {
    if (day1Open(sh)) return '';
    return `<div class="banner info" style="margin-top:16px">${svg('calendar')}<div><strong>Your first 30 days start on ${fmtLong(person.startDate)}</strong>
      <div class="small" style="margin-top:4px">You can read ahead now. Tasks unlock on Day 1.</div>
      <button class="btn btn-ghost btn-sm" style="margin-top:8px" data-demo-day1="1">Demo: open Day 1 now</button></div></div>`;
  }

  // Each plan item is done when its own action is complete
  function first30Done(sh, item) {
    const f = sh.first30 || {};
    if (item.video) return !!(sh.videos || {})[item.video];
    if (item.oneToOne) return !!sh.oneToOne;
    if (item.intros) return TEAM_INTROS.every((i) => (sh.intros || {})[i.id]);
    if (item.benefits) return !!sh.benefits;
    if (item.communities) return (sh.communities || []).length > 0;
    if (item.goals) return !!(sh.goals && sh.goals.items && sh.goals.items.length);
    if (item.access) { const items = accessItems(CHAT.ME_HIRE_ID); return items.length > 0 && items.every((i) => (sh.access || {})[i.key] === 'verified'); }
    return !!f[item.key];
  }

  function renderFirst30() {
    const sh = SHARED.get(CHAT.ME_HIRE_ID);
    const open = day1Open(sh);
    const doneCount = FIRST30_PLAN.filter((i) => first30Done(sh, i)).length;
    const pct = Math.round((doneCount / FIRST30_PLAN.length) * 100);
    const updates = NOTIFY.list('hire');
    const unread = updates.filter((n) => !n.read).length;
    const windows = ['Day 1', 'Week 1', 'Week 2-4'];

    const itemHtml = (item) => {
      const done = first30Done(sh, item);
      let action = '';
      if (item.video) action = `<a class="btn btn-ghost btn-sm" href="#/learn/${item.video}">${svg('play')} ${done ? 'Watch again' : 'Watch'}</a>`;
      else if (item.oneToOne) action = sh.oneToOne
        ? `<span class="pill green">Booked ${fmtShort(new Date(sh.oneToOne.when))}</span>`
        : `<span class="pill grey">Your manager will book this</span>`;
      else if (item.intros) action = `<a class="btn btn-ghost btn-sm" href="#/intros">${svg('calendar')} Team intros</a>`;
      else if (item.benefits) action = `<a class="btn btn-ghost btn-sm" href="#/benefits">${svg('book')} Choose benefits</a>`;
      else if (item.communities) action = `<a class="btn btn-ghost btn-sm" href="#/communities">${svg('people')} Explore communities</a>`;
      else if (item.access) action = `<a class="btn btn-ghost btn-sm" href="#/access">${svg('shield')} Check my access</a>`;
      else if (item.goals) action = `<a class="btn btn-ghost btn-sm" href="#/goals">${svg('check')} My goals</a>`;
      else action = open
        ? `<button class="check ${done ? 'on' : ''}" data-first30="${item.key}" aria-label="Mark ${esc(item.title)} as done">${done ? svg('check') : ''}</button>`
        : '<span class="pill grey">Opens Day 1</span>';
      return `
        <div class="todo ${done ? 'is-done' : ''}">
          <span class="rag rag-${done ? 'green' : 'amber'}"></span>
          <div class="todo-body">
            <strong>${esc(item.title)}</strong>
            <div class="detail">${esc(item.detail)}</div>
            <div class="row small" style="margin-top:8px">${done ? '<span class="pill green">Done</span>' : ''}${action}</div>
          </div>
        </div>`;
    };

    // After onboarding and Day 1, the to-do list and this plan are one page. Finished items are tidied away.
    const combined = combinedMode();
    const openTodos = DEMO.todos.filter((t) => !state.doneTodos.includes(t.id));
    const planLeft = FIRST30_PLAN.filter((i) => !first30Done(sh, i));
    const tidied = doneCount + (DEMO.todos.length - openTodos.length);

    return `
      ${breadcrumbs([{ label: 'Home', href: '#/home' }, { label: combined ? 'To do' : 'First 30 days' }])}

      <div class="stack" style="gap:6px;margin-top:10px">
        <p class="eyebrow">${combined ? 'To do' : 'Day 1 to Day 30'}</p>
        <h1>${combined ? 'What is left to do' : 'Your first 30 days'}</h1>
        <p class="muted">${combined
          ? 'Your to-dos and your first 30 days plan, in one list. Finished items are tidied away.'
          : 'Everything for your first month in one place: the training you need, your first one-to-one, team intros, benefits and community pages.'}</p>
      </div>
      ${gateBanner(sh)}
      ${combined ? `<p class="small muted" style="margin-top:12px">${tidied} finished item${tidied === 1 ? '' : 's'} tidied away. ${openTodos.length + planLeft.length} left.</p>` : ''}

      <div class="card" style="margin-top:16px">
        <div class="spread small"><span><strong>${doneCount} of ${FIRST30_PLAN.length}</strong> done</span><span>${pct}%</span></div>
        <div class="progress" style="margin-top:8px"><span style="width:${pct}%"></span></div>
      </div>

      <div class="section-head"><h2>Updates from your team</h2>${unread ? `<button class="btn btn-ghost btn-sm" id="updates-read">Mark ${unread} as read</button>` : ''}</div>
      <div class="card">
        ${updates.length ? updates.map((n) => `
          <div class="alert-row ${n.read ? '' : 'unread'}">
            <span class="rag rag-green"></span>
            <div class="alert-body"><strong>${esc(n.title)}</strong><span class="small muted">${esc(n.text)} · ${fmtShort(new Date(n.time))}</span></div>
            ${n.read ? '' : '<span class="pill amber">New</span>'}
          </div>`).join('') : '<p class="muted">Nothing yet. Your manager will let you know about your first one-to-one here.</p>'}
      </div>

      ${combined && openTodos.length ? `
        <div class="section-head"><h2>Still to do from before Day 1</h2></div>
        <div class="card">${renderTodoList(openTodos)}</div>` : ''}

      ${windows.map((w) => {
        const items = FIRST30_PLAN.filter((i) => i.window === w && (!combined || !first30Done(sh, i)));
        if (combined && !items.length) return '';
        return `
          <div class="section-head"><h2>${esc(w)}</h2></div>
          <div class="card">${items.map(itemHtml).join('')}</div>`;
      }).join('')}

      ${combined && !openTodos.length && !planLeft.length ? '<div class="card" style="margin-top:16px"><p><strong>All done.</strong> Nothing is left on your list.</p></div>' : ''}`;
  }

  // Once onboarding has finished and Day 1 has arrived, To do and First 30 days are one list
  function combinedMode() {
    const sh = SHARED.get(CHAT.ME_HIRE_ID);
    return !!sh.onb && sh.onb.status === 'complete' && day1Open(sh);
  }

  function renderLearn() {
    const sh = SHARED.get(CHAT.ME_HIRE_ID);
    const watched = sh.videos || {};
    const modules = ['Day 1', 'Week 1', 'Week 2-4'];
    return `
      ${breadcrumbs([{ label: 'Home', href: '#/home' }, { label: 'Training' }])}
      <div class="stack" style="gap:6px;margin-top:10px">
        <p class="eyebrow">Training</p>
        <h1>Training videos</h1>
        <p class="muted">Watch these in the app. Nothing opens another site.</p>
      </div>
      ${modules.map((m) => `
        <div class="section-head"><h2>${esc(m)}</h2></div>
        <div class="grid two">
          ${TRAINING_VIDEOS.filter((v) => v.module === m).map((v) => `
            <a class="card video-card" href="#/learn/${v.id}">
              <div class="video-thumb"><span class="play-badge">${svg('play')}</span></div>
              <div class="spread"><strong>${esc(v.title)}</strong>${watched[v.id] ? '<span class="pill green">Watched</span>' : `<span class="pill grey">${v.minutes} min</span>`}</div>
              <span class="small muted">${esc(v.summary)}</span>
            </a>`).join('')}
        </div>`).join('')}`;
  }

  function renderLearnVideo(id) {
    const v = TRAINING_VIDEOS.find((x) => x.id === id);
    if (!v) return `${breadcrumbs([{ label: 'Home', href: '#/home' }, { label: 'Training', href: '#/learn' }, { label: 'Not found' }])}<p class="muted">That video could not be found.</p>`;
    const sh = SHARED.get(CHAT.ME_HIRE_ID);
    const watched = !!(sh.videos || {})[v.id];
    return `
      ${breadcrumbs([{ label: 'Home', href: '#/home' }, { label: 'Training', href: '#/learn' }, { label: v.title }])}
      <div class="stack" style="gap:6px;margin-top:10px">
        <p class="eyebrow">${esc(v.module)} · ${v.minutes} minutes</p>
        <h1>${esc(v.title)}</h1>
        <p class="muted">${esc(v.summary)}</p>
      </div>
      <div class="card" style="margin-top:16px">
        <div class="player" id="player">
          <button class="player-play" data-play="${v.id}" aria-label="Play ${esc(v.title)}">${svg('play')}</button>
          <span class="player-note">Demo player. A real recording plays here.</span>
        </div>
        <h3 style="margin-top:16px">Transcript</h3>
        <p class="small muted" style="margin-top:6px">${esc(v.transcript)}</p>
        <div class="row" style="margin-top:14px">
          ${watched
            ? '<span class="pill green">Watched</span>'
            : `<button class="btn" data-watched="${v.id}">Mark as watched</button>`}
          <a class="btn btn-ghost" href="#/learn">Back to training</a>
        </div>
      </div>`;
  }

  function renderBenefits() {
    const sh = SHARED.get(CHAT.ME_HIRE_ID);
    const saved = sh.benefits || null;
    const picked = (g) => (saved && saved[g.id]) || g.options[0].id;
    const open = day1Open(sh);
    return `
      ${breadcrumbs([{ label: 'Home', href: '#/home' }, { label: 'Rewards and benefits' }])}
      <div class="stack" style="gap:6px;margin-top:10px">
        <p class="eyebrow">Rewards and benefits</p>
        <h1>Choose your benefits</h1>
        <p class="muted">Pick one option in each group. You have 30 days from Day 1 to decide, and you can change them later at open enrolment.</p>
      </div>
      ${gateBanner(sh)}
      <form id="benefits-form" class="stack" style="margin-top:16px">
        ${BENEFIT_GROUPS.map((g) => `
          <div class="card">
            <h2>${esc(g.title)}</h2>
            <p class="small muted" style="margin-top:4px">${esc(g.help)}</p>
            <div class="benefit-options">
              ${g.options.map((o) => `
                <label class="delivery ${picked(g) === o.id ? 'on' : ''}">
                  <input type="radio" name="${g.id}" value="${o.id}" ${picked(g) === o.id ? 'checked' : ''} ${open ? '' : 'disabled'} />
                  <span><strong>${esc(o.label)}</strong><span class="small muted">${esc(o.cost)}</span></span>
                </label>`).join('')}
            </div>
          </div>`).join('')}
        ${open
          ? `<button class="btn btn-block" type="submit">${saved ? 'Update my choices' : 'Save my choices'}</button>`
          : '<p class="small muted">Choices open on Day 1.</p>'}
        ${saved ? '<p class="small muted">Your choices are saved. Your manager has been told.</p>' : ''}
      </form>`;
  }

  function renderCommunities() {
    const sh = SHARED.get(CHAT.ME_HIRE_ID);
    const joined = sh.communities || [];
    return `
      ${breadcrumbs([{ label: 'Home', href: '#/home' }, { label: 'Community pages' }])}
      <div class="stack" style="gap:6px;margin-top:10px">
        <p class="eyebrow">Community pages</p>
        <h1>Explore communities</h1>
        <p class="muted">Colleague networks that suit your interests. Join as many as you like.</p>
      </div>
      <div class="grid two" style="margin-top:16px">
        ${COMMUNITIES.map((c) => {
          const on = joined.includes(c.id);
          return `
            <div class="card stack">
              <div class="spread"><strong>${esc(c.name)}</strong><span class="pill grey">${c.members} members</span></div>
              <span class="small muted">${esc(c.desc)}</span>
              <button class="btn ${on ? 'btn-ghost is-done' : 'btn-ghost'}" data-community="${c.id}">${on ? 'Joined · leave' : 'Join community'}</button>
            </div>`;
        }).join('')}
      </div>`;
  }

  function renderIntros() {
    const sh = SHARED.get(CHAT.ME_HIRE_ID);
    const booked = sh.intros || {};
    return `
      ${breadcrumbs([{ label: 'Home', href: '#/home' }, { label: 'Team intros' }])}
      <div class="stack" style="gap:6px;margin-top:10px">
        <p class="eyebrow">Week 1</p>
        <h1>Team intro calls</h1>
        <p class="muted">Short 20-minute calls with people you will work with. Book the ones you want this week.</p>
      </div>
      <div class="card" style="margin-top:16px">
        ${TEAM_INTROS.map((t) => `
          <div class="todo">
            <span class="avatar">${initials(t.name)}</span>
            <div class="todo-body">
              <strong>${esc(t.name)}</strong>
              <div class="detail">${esc(t.role)} · ${esc(t.topic)}</div>
              <div class="row small" style="margin-top:8px">
                ${booked[t.id] ? '<span class="pill green">Booked</span>' : `<button class="btn btn-ghost btn-sm" data-intro="${t.id}">Book 20 minutes</button>`}
              </div>
            </div>
          </div>`).join('')}
      </div>`;
  }

  function renderPurpose() {
    return `
      ${breadcrumbs([{ label: 'Home', href: '#/home' }, { label: 'How you fit in' }])}
      <div class="stack" style="gap:6px;margin-top:10px">
        <p class="eyebrow">Why you matter</p>
        <h1>How you fit in</h1>
        <p class="muted">What the bank needs, all the way down to what you do each day, and why each part matters.</p>
      </div>
      <div class="cascade" style="margin-top:16px">
        ${PURPOSE_CASCADE.map((p, i) => `
          <div class="cascade-step ${p.you ? 'you' : ''}">
            <div class="cascade-level"><span class="cascade-num">${i + 1}</span>${esc(p.level)}</div>
            <div class="cascade-body">
              <p><strong>What the bank wants</strong><br>${esc(p.want)}</p>
              <p class="small muted" style="margin-top:8px"><strong style="color:var(--ink)">Why it matters</strong><br>${esc(p.why)}</p>
              ${p.you ? `<a class="btn btn-sm" style="margin-top:12px" href="#/goals">${svg('check')} Link this to your goals</a>` : ''}
            </div>
          </div>`).join('')}
      </div>
      <p class="small muted" style="margin-top:16px">The wording here is a draft for the bank's strategy team to confirm.</p>`;
  }

  // ---------- Unlocks, comms, welcome pack, badge, Day 30 check-in, start date and cover ----------

  const UNLOCK_ROUTE = { contract: '#/workspace', device: '#/device', kit: '#/workspace', first30: '#/first30', channels: '#/channels', welcome: '#/welcome', review: '#/review', m2: '#/next', m3: '#/next' };

  function unlockPanel() {
    const items = unlockStatus(CHAT.ME_HIRE_ID);
    const sh = SHARED.get(CHAT.ME_HIRE_ID);
    const open = items.filter((i) => i.open).length;
    // Items the hire has already finished show as done, with nothing left to press
    const done = {
      contract: !!sh.contractSigned,
      device: !!sh.device && sh.device.status !== 'cancelled',
      kit: !!sh.homeOrder && !sh.homeOrder.cancelled,
      review: !!sh.review,
      m2: !!(sh.m2 && sh.m2.workday && sh.m2.hr),
      m3: !!sh.m3,
    };
    const CTA = { contract: 'Sign contract', device: 'Choose laptop', kit: 'Order equipment', first30: 'Open plan', channels: 'See channels', welcome: 'Open pack', review: 'Start check-in', m2: 'Start checks', m3: 'Start check-in' };
    const row = (i) => {
      if (done[i.key]) {
        return `
          <div class="alert-row">
            <span class="rag rag-green"></span>
            <div class="alert-body"><strong>${esc(i.label)}</strong><span class="small muted">Done. Nothing more to do here.</span></div>
            <span class="pill green">Done</span>
          </div>`;
      }
      if (i.open) {
        return `
          <div class="alert-row">
            <span class="rag rag-green"></span>
            <div class="alert-body"><strong>${esc(i.label)}</strong><span class="small muted">${esc(i.how)}</span></div>
            <a class="btn btn-sm" href="${UNLOCK_ROUTE[i.key]}">${CTA[i.key]}</a>
          </div>`;
      }
      return `
        <div class="alert-row">
          <span class="rag rag-amber"></span>
          <div class="alert-body"><strong>${esc(i.label)}</strong>
            <span class="small muted">Locked. Waiting for ${esc(i.waitingFor.join(' and '))}.</span>
            <span class="row small" style="gap:10px;margin-top:4px">
              ${i.steps.filter((s) => s.href).map((s) => `<a href="${s.href}">${esc(s.cta)}</a>`).join('')}
            </span>
          </div>
          <span class="pill grey">Locked</span>
        </div>`;
    };
    return `
      <div class="card" style="margin-bottom:16px" data-tour="unlock">
        <div class="spread"><h2>What is unlocked</h2><span class="small muted">${open} of ${items.length} open</span></div>
        <p class="small muted" style="margin-top:4px">Things open as you reach each step. Each row says what to do, or what it is waiting for and where to sort that out.</p>
        <div style="margin-top:10px">
          ${items.map(row).join('')}
        </div>
        <div class="row" style="margin-top:10px;gap:10px">
          <button class="btn btn-ghost btn-sm" data-demo-days="30">Demo: jump to Day 30</button>
          <button class="btn btn-ghost btn-sm" data-demo-days="20">Demo: jump to Day 20</button>
          <button class="btn btn-ghost btn-sm" data-demo-days="45">Demo: jump to Day 45</button>
          <button class="btn btn-ghost btn-sm" data-demo-days="75">Demo: jump to Day 75</button>
          <button class="linkish small" data-demo-days="reset">Reset days</button>
        </div>
      </div>`;
  }

  function startMovedBanner() {
    const sh = SHARED.get(CHAT.ME_HIRE_ID);
    if (!sh.startMoved) return '';
    return `<div class="banner warn" style="margin-bottom:16px">${svg('calendar')}<div><strong>Your start date has moved to ${fmtLong(person.startDate)}</strong>
      <div class="small" style="margin-top:4px">Your contract window, delivery dates and first 30 days have been updated to match.</div></div></div>`;
  }

  // Shown on the team and chat pages while the manager is out of office
  function coverBanner() {
    const away = managerAway();
    if (!away.away) return '';
    return `<div class="banner info" style="margin-bottom:16px">${svg('people')}<div><strong>${esc(manager.name)} is away${away.until ? ' until ' + fmtShort(new Date(away.until)) : ''}</strong>
      <div class="small" style="margin-top:4px">Your cover is ${esc(away.cover || 'a colleague')}. For anything urgent, contact them.</div></div></div>`;
  }

  function renderChannels() {
    const sh = SHARED.get(CHAT.ME_HIRE_ID);
    const status = unlockStatus(CHAT.ME_HIRE_ID).find((u) => u.key === 'channels');
    const joined = sh.channels || [];
    return `
      ${breadcrumbs([{ label: 'Home', href: '#/home' }, { label: 'Comms and communities' }])}
      <div class="stack" style="gap:6px;margin-top:10px">
        <p class="eyebrow">Get connected</p>
        <h1>Comms channels</h1>
        <p class="muted">The channels that keep you up to date and connected. Join the ones that help.</p>
      </div>
      ${status.open ? '' : `<div class="banner info" style="margin-top:16px">${svg('calendar')}<div>Channels open on Day 1. Waiting for ${esc(status.waitingFor.join(' and '))}.</div></div>`}
      <div class="grid two" style="margin-top:16px">
        ${COMMS_CHANNELS.map((c) => `
          <div class="card stack">
            <div class="spread"><strong>${esc(c.name)}</strong><span class="pill grey">${esc(c.kind)}</span></div>
            <span class="small muted">${esc(c.desc)}</span>
            ${status.open
              ? `<button class="btn ${joined.includes(c.id) ? 'btn-ghost is-done' : 'btn-ghost'}" data-channel-join="${c.id}">${joined.includes(c.id) ? 'Joined · leave' : 'Join channel'}</button>`
              : '<span class="pill grey">Opens Day 1</span>'}
          </div>`).join('')}
      </div>`;
  }

  function renderWelcome() {
    const sh = SHARED.get(CHAT.ME_HIRE_ID);
    const status = unlockStatus(CHAT.ME_HIRE_ID).find((u) => u.key === 'welcome');
    const read = sh.packRead || [];
    const badge = sh.badge || null;
    const badgeText = !badge ? 'Your manager will request your ID badge.'
      : badge.status === 'requested' ? 'Requested. It will be ready for Day 1 at reception.'
      : 'Issued. Collect it from reception on Day 1.';
    return `
      ${breadcrumbs([{ label: 'Home', href: '#/home' }, { label: 'Welcome pack' }])}
      <div class="stack" style="gap:6px;margin-top:10px">
        <p class="eyebrow">Welcome</p>
        <h1>Your welcome pack</h1>
        <p class="muted">Sent once you have set your goals with ${esc(manager.name)}.</p>
      </div>
      ${status.open ? '' : `<div class="banner info" style="margin-top:16px">${svg('check')}<div>The welcome pack opens once you have saved your goals. Waiting for ${esc(status.waitingFor.join(' and '))}.</div></div>`}
      <div class="card" style="margin-top:16px">
        <div class="spread"><strong>ID badge</strong><span class="pill ${badge && badge.status === 'issued' ? 'green' : 'grey'}">${badge ? (badge.status === 'issued' ? 'Issued' : 'Requested') : 'Not yet'}</span></div>
        <p class="small muted" style="margin-top:6px">${badgeText}</p>
      </div>
      ${status.open ? WELCOME_PACK.map((p) => `
        <div class="card" style="margin-top:16px">
          <div class="spread"><h2>${esc(p.title)}</h2>${read.includes(p.id) ? '<span class="pill green">Read</span>' : ''}</div>
          <p style="margin-top:8px">${esc(p.body)}</p>
          ${read.includes(p.id) ? '' : `<button class="btn btn-ghost btn-sm" style="margin-top:12px" data-pack-read="${p.id}">Mark as read</button>`}
        </div>`).join('') : ''}`;
  }

  // Day 30 check-in: how the hire feels, and what happens next
  function renderReview() {
    const sh = SHARED.get(CHAT.ME_HIRE_ID);
    const status = unlockStatus(CHAT.ME_HIRE_ID).find((u) => u.key === 'review');
    const rv = sh.review || null;
    const plan = sh.supportPlan || null;
    const risk = sh.riskLevel || 'green';
    const result = rv ? `
      <div class="banner ${rv.tone === 'green' ? 'info' : rv.tone === 'amber' ? 'warn' : 'alert'}">
        <span class="rag rag-${rv.tone}" style="margin-top:6px"></span>
        <div><strong>${rv.tone === 'green' ? 'Green: you are settling in well' : rv.tone === 'amber' ? 'Amber: a few things to sort out' : 'Red: you would like support'}</strong>
          <div class="small" style="margin-top:4px">${rv.tone === 'green' ? 'Keep going. Your manager will see your progress.' : 'Your manager has been told and a support plan has been drafted below.'}</div></div>
      </div>` : '';
    return `
      ${breadcrumbs([{ label: 'Home', href: '#/home' }, { label: 'Day 30 check-in' }])}
      <div class="stack" style="gap:6px;margin-top:10px">
        <p class="eyebrow">Day 30</p>
        <h1>How are you settling in?</h1>
        <p class="muted">Four quick questions. Honest answers help us put the right support in place.</p>
      </div>
      ${status.open ? '' : `<div class="banner info" style="margin-top:16px">${svg('calendar')}<div>This check-in opens from Day 25. Waiting for ${esc(status.waitingFor.join(' and '))}.</div></div>`}
      ${result ? `<div style="margin-top:16px">${result}</div>` : ''}
      ${plan ? `
        <div class="card" style="margin-top:16px">
          <div class="spread"><h2>Your support plan</h2><span class="pill ${risk === 'red' ? 'red' : 'amber'}">${risk === 'red' ? 'Support now' : 'Early support'}</span></div>
          <p class="small muted" style="margin-top:6px">Drafted ${fmtShort(new Date(plan.createdOn))}. Your manager will go through it with you.</p>
          <ul class="tips" style="margin-top:10px">${plan.actions.map((a) => `<li>${esc(a)}</li>`).join('')}</ul>
          <p class="small" style="margin-top:10px">Free and confidential, any time: <strong>the Employee Assistance Programme (EAP)</strong>. Ask the assistant how to reach it.</p>
        </div>` : ''}
      ${status.open ? `
        <form id="review-form" class="card stack" style="margin-top:16px">
          ${REVIEW_QUESTIONS.map((q) => `
            <fieldset class="review-q">
              <legend class="field-label">${esc(q.q)}</legend>
              <div class="row small" style="gap:16px;flex-wrap:wrap">
                ${q.opts.map((o, i) => `<label><input type="radio" name="${q.id}" value="${o[0]}" ${i === 0 ? 'required' : ''} /> ${esc(o[1])}</label>`).join('')}
              </div>
            </fieldset>`).join('')}
          <button class="btn btn-block" type="submit">${rv ? 'Send an updated check-in' : 'Send my check-in'}</button>
        </form>` : ''}`;
  }

  // ---------- Day 30 to 90: system checks, monthly one-to-one, teething issues ----------

  const SYSTEM_CHECKS = [
    { key: 'workday', name: 'Workday', desc: 'Sign in and check your personal details, pay and time off look right.' },
    { key: 'hr', name: 'HR', desc: 'Check you can open HR self-service, and that you know how to reach your HR contact.' },
  ];
  const TEETHING_TEXT = {
    green: ['Green: no teething issues', 'Good to hear. Nothing more is needed.'],
    amber: ['Amber: a few teething issues', 'Thanks. Your manager can see this and will pick it up at your next one-to-one.'],
    red: ['Red: something to raise', 'Thanks for telling us. Your manager has been told and will get in touch with you.'],
  };

  function renderNext90() {
    const me = CHAT.ME_HIRE_ID;
    const sh = SHARED.get(me);
    const ev = journeyEvents(me);
    const m2 = sh.m2 || {};
    const m3 = sh.m3 || null;
    const period = monthPeriod(me);
    const monthly = (sh.monthly || {})[period];

    const systemCard = (s) => {
      const state = m2[s.key];
      return `
        <div class="card stack">
          <div class="spread"><strong>${esc(s.name)}</strong>
            ${state === 'ok' ? '<span class="pill green">I can get in</span>' : state === 'problem' ? '<span class="pill red">Help requested</span>' : '<span class="pill grey">Not checked</span>'}</div>
          <span class="small muted">${esc(s.desc)}</span>
          ${ev.day30 ? `
            <div class="row" style="gap:8px">
              <button class="btn btn-sm ${state === 'ok' ? 'is-done' : ''}" data-sys="${s.key}" data-sys-state="ok">Yes, I can get in</button>
              <button class="btn btn-ghost btn-sm" data-sys="${s.key}" data-sys-state="problem">No, I need help</button>
            </div>
            ${state === 'problem' ? `<span class="small muted">${esc(manager.name)} has been told. The IT helpdesk can also help with sign-in problems.</span>` : ''}` : ''}
        </div>`;
    };

    const teethingResult = m3 ? `
      <div class="banner ${m3.tone === 'green' ? 'info' : m3.tone === 'amber' ? 'warn' : 'alert'}" style="margin-bottom:12px">
        <span class="rag rag-${m3.tone}" style="margin-top:6px"></span>
        <div><strong>${esc(TEETHING_TEXT[m3.tone][0])}</strong><div class="small" style="margin-top:4px">${esc(TEETHING_TEXT[m3.tone][1])}</div></div>
      </div>` : '';

    return `
      ${breadcrumbs([{ label: 'Home', href: '#/home' }, { label: 'Day 30 to 90' }])}
      <div class="stack" style="gap:6px;margin-top:10px">
        <p class="eyebrow">After your first 30 days</p>
        <h1>Day 30 to Day 90</h1>
        <p class="muted">Two short check-ins to make sure the basics work for you, and that anything bothering you gets raised.</p>
      </div>

      <div class="section-head"><h2>Day 30 to 60: can you get into Workday and HR?</h2>${ev.day30 ? '' : '<span class="pill grey">Opens Day 30</span>'}</div>
      ${ev.day30 ? '' : `<div class="banner info">${svg('calendar')}<div>These checks open at Day 30.</div></div>`}
      <div class="grid two" style="margin-top:${ev.day30 ? 0 : 12}px">${SYSTEM_CHECKS.map(systemCard).join('')}</div>
      ${ev.day30 ? `
        <div class="card" style="margin-top:16px">
          <div class="spread"><strong>Monthly one-to-one</strong>${monthly
            ? `<span class="pill green">Booked ${fmtShort(new Date(monthly))}</span>`
            : '<span class="pill grey">Your manager will book this</span>'}</div>
          <p class="small muted" style="margin-top:6px">After your first 30 days you meet ${esc(manager.name)} once a month.</p>
        </div>` : ''}

      <div class="section-head"><h2>Day 60 to 90: any teething issues?</h2>${ev.day60 ? '' : '<span class="pill grey">Opens Day 60</span>'}</div>
      ${ev.day60 ? `
        <div class="card">
          ${teethingResult}
          <form id="teething-form" class="stack">
            <fieldset class="review-q">
              <legend class="field-label">Are there any teething issues?</legend>
              <div class="row small" style="gap:16px;flex-wrap:wrap">
                <label><input type="radio" name="issues" value="none" required /> No, all fine</label>
                <label><input type="radio" name="issues" value="few" /> A few small things</label>
                <label><input type="radio" name="issues" value="many" /> Yes, some real problems</label>
              </div>
              <textarea class="field" name="issuesNote" rows="2" placeholder="What is getting in the way? (optional)" style="margin-top:8px"></textarea>
            </fieldset>
            <fieldset class="review-q">
              <legend class="field-label">Do you need to raise anything with ${esc(manager.name)}?</legend>
              <div class="row small" style="gap:16px;flex-wrap:wrap">
                <label><input type="radio" name="raise" value="no" required /> No</label>
                <label><input type="radio" name="raise" value="yes" /> Yes</label>
              </div>
              <textarea class="field" name="raiseNote" rows="2" placeholder="What would you like to raise? (optional)" style="margin-top:8px"></textarea>
            </fieldset>
            <button class="btn btn-block" type="submit">${m3 ? 'Send an updated check-in' : 'Send my check-in'}</button>
          </form>
        </div>` : `<div class="banner info">${svg('calendar')}<div>This check-in opens at Day 60.</div></div>`}`;
  }

  // Home banner when a Day 30 to 90 check is waiting
  function phaseBanner() {
    const me = CHAT.ME_HIRE_ID;
    const sh = SHARED.get(me);
    const ev = journeyEvents(me);
    const m2 = sh.m2 || {};
    let text = '';
    if (ev.day60 && !sh.m3) text = 'Day 60 to 90 check-in: any teething issues, or anything to raise with your manager?';
    else if (ev.day30 && !(m2.workday && m2.hr)) text = 'Day 30 to 60: check you can get into Workday and HR.';
    if (!text) return '';
    return `<a class="banner warn" href="#/next" style="margin-bottom:16px;text-decoration:none;color:inherit">${svg('check')}<div><strong>${esc(text)}</strong><div class="small" style="margin-top:4px">It takes a minute.</div></div></a>`;
  }

  function renderGoals() {
    const sh = SHARED.get(CHAT.ME_HIRE_ID);
    const open = day1Open(sh);
    const meeting = sh.goalMeeting;
    const saved = sh.goals && sh.goals.items ? sh.goals.items : [];
    return `
      ${breadcrumbs([{ label: 'Home', href: '#/home' }, { label: 'My goals' }])}
      <div class="stack" style="gap:6px;margin-top:10px">
        <p class="eyebrow">First 30 days</p>
        <h1>Set your goals</h1>
        <p class="muted">Agree up to three goals with ${esc(manager.name)} for your first 30 days. Keep them specific and achievable. You can revisit them together later.</p>
      </div>
      ${gateBanner(sh)}
      <div class="card" style="margin-top:16px">
        <div class="spread"><h2>Goal-setting check-in</h2>${meeting
          ? `<span class="pill green">Booked ${fmtShort(new Date(meeting.when))}</span>`
          : '<span class="pill grey">Your manager will book this</span>'}</div>
        <p class="small muted" style="margin-top:6px">${meeting ? 'Booked with ' + esc(manager.name) + ' on Teams. Bring your draft goals.' : 'You will be told as soon as it is booked.'}</p>
      </div>
      <form id="goals-form" class="card stack" style="margin-top:16px">
        ${[0, 1, 2].map((i) => `
          <div>
            <label class="field-label" for="goal-${i}">Goal ${i + 1}${i === 0 ? '' : ' (optional)'}</label>
            <textarea class="field" id="goal-${i}" name="goal${i}" rows="2" ${open ? '' : 'disabled'}
              placeholder="${['For example: learn the reporting tools and build my first dashboard', 'For example: meet the people in my product area', 'For example: complete my mandatory courses'][i]}">${esc(saved[i] || '')}</textarea>
          </div>`).join('')}
        ${open
          ? `<button class="btn btn-block" type="submit">${saved.length ? 'Update my goals' : 'Save my goals'}</button>`
          : '<p class="small muted">Goals open on Day 1.</p>'}
      </form>`;
  }

  function renderAccess() {
    const sh = SHARED.get(CHAT.ME_HIRE_ID);
    const acc = sh.access || {};
    const items = accessItems(CHAT.ME_HIRE_ID);
    const verified = items.filter((i) => acc[i.key] === 'verified').length;
    const fam = JOB_FAMILIES.find((f) => f.id === sh.family);
    const packs = fam ? fam.packs.map((pid) => ACCESS_PACKS[pid].name) : [];
    const body = !fam
      ? '<p class="muted">Your access depends on your job family. Your manager sets it, and your systems will appear here.</p>'
      : fam.packs.map((pid) => {
          const p = ACCESS_PACKS[pid];
          return `
            <div class="card stack">
              <div class="spread"><strong>${esc(p.name)}</strong><span class="pill ${p.approval ? 'amber' : 'green'}">${p.approval ? 'Needs approval' : 'Automatic'}</span></div>
              ${p.items.map((label, i) => {
                const key = pid + ':' + i;
                const state = acc[key];
                return `
                  <div class="todo ${state === 'verified' ? 'is-done' : ''}">
                    <span class="rag rag-${state === 'verified' ? 'green' : state === 'requested' ? 'amber' : 'amber'}"></span>
                    <div class="todo-body">
                      <strong>${esc(label)}</strong>
                      <div class="row small" style="margin-top:8px">
                        ${state === 'verified' ? '<span class="pill green">Access confirmed</span>' : ''}
                        ${state === 'requested' ? '<span class="pill amber">Access requested</span>' : ''}
                        ${!state && p.approval ? `<button class="btn btn-ghost btn-sm" data-access-request="${key}" data-access-label="${esc(label)}">Request access</button>` : ''}
                        ${!state && !p.approval ? `<button class="btn btn-ghost btn-sm" data-access-check="${key}">Check I can open it</button>` : ''}
                        ${state === 'verified' ? `<button class="linkish small" data-access-check="${key}">Undo</button>` : ''}
                      </div>
                    </div>
                  </div>`;
              }).join('')}
            </div>`;
        }).join('');
    return `
      ${breadcrumbs([{ label: 'Home', href: '#/home' }, { label: 'System access' }])}
      <div class="stack" style="gap:6px;margin-top:10px">
        <p class="eyebrow">Week 2 to 4</p>
        <h1>Check your system access</h1>
        <p class="muted">Open each system your role needs. If one will not open, request access here and your manager is told. Access is set by your job family${packs.length ? ': ' + esc(packs.join(', ')) : ''}.</p>
      </div>
      <div class="spread" style="margin-top:16px"><span class="pill ${items.length && verified === items.length ? 'green' : 'grey'}">${verified} of ${items.length} confirmed</span></div>
      <div class="stack" style="margin-top:12px">${body}</div>
      <p class="small muted" style="margin-top:14px">Cannot get into a system? Ask the assistant, or call the IT helpdesk.</p>`;
  }

  // ---------- Weekly routine: desk booking and mood check-in ----------

  // Which week of the first month this is (week 1 starts on Day 1)
  function checkinWeek() {
    const days = Math.floor((TODAY - person.startDate) / 86400000);
    return Math.max(1, Math.floor(days / 7) + 1);
  }

  const TONE_TEXT = {
    green: ['Green: you are doing well', 'Great to hear. Keep going, and book your desk for next week.'],
    amber: ['Amber: a few things to sort out', 'Thanks for being honest. We have let your buddy know so they can help with anything you are finding hard.'],
    red: ['Red: you would like a call', 'Thank you. Jordan has been told and will get in touch with you this week. If you need support sooner, the EAP is free and confidential.'],
  };

  function renderWeekly() {
    const sh = SHARED.get(CHAT.ME_HIRE_ID);
    const open = day1Open(sh);
    const checks = sh.checkins || [];
    const week = checkinWeek();
    const thisWeek = checks.find((c) => c.week === week);
    const fridays = fridaysFrom(person.startDate, 6);
    const nextFriday = fridays.find((d) => d >= TODAY) || fridays[0];

    const result = thisWeek ? `
      <div class="banner ${thisWeek.tone === 'green' ? 'info' : thisWeek.tone === 'amber' ? 'warn' : 'alert'}" style="margin-bottom:12px">
        <span class="rag rag-${thisWeek.tone}" style="margin-top:6px"></span>
        <div><strong>${esc(TONE_TEXT[thisWeek.tone][0])}</strong><div class="small" style="margin-top:4px">${esc(TONE_TEXT[thisWeek.tone][1])}</div></div>
      </div>` : '';

    const moodRadios = MOOD_OPTIONS.map((m) => `
      <label class="mood mood-${m.tone}">
        <input type="radio" name="mood" value="${m.id}" required />
        <span class="rag rag-${m.tone}"></span>
        <span><strong>${esc(m.label)}</strong><span class="small muted">${esc(m.text)}</span></span>
      </label>`).join('');

    const checkForm = `
      <form id="checkin-form" class="stack" style="margin-top:6px">
        <div>
          <div class="field-label">How are you doing this week?</div>
          <div class="mood-options">${moodRadios}</div>
        </div>
        <div>
          <div class="field-label">Are you having trouble finding anything? (systems, people, places, process)</div>
          <div class="row small" style="gap:16px"><label><input type="radio" name="find" value="no" required /> No</label><label><input type="radio" name="find" value="yes" /> Yes</label></div>
          <textarea class="field" name="findNote" rows="2" placeholder="What are you looking for?" style="margin-top:8px"></textarea>
        </div>
        <div>
          <div class="field-label">Do you need to raise anything?</div>
          <div class="row small" style="gap:16px;flex-wrap:wrap">
            <label><input type="radio" name="raise" value="none" required /> Nothing</label>
            <label><input type="radio" name="raise" value="buddy" /> Talk to my buddy</label>
            <label><input type="radio" name="raise" value="manager" /> Talk to Jordan</label>
          </div>
          <textarea class="field" name="note" rows="2" placeholder="Anything else you want us to know (optional)" style="margin-top:8px"></textarea>
        </div>
        <button class="btn btn-block" type="submit">Send my check-in</button>
      </form>`;

    return `
      ${breadcrumbs([{ label: 'Home', href: '#/home' }, { label: 'Weekly' }])}
      <div class="stack" style="gap:6px;margin-top:10px">
        <p class="eyebrow">Every week</p>
        <h1>Your weekly check-in</h1>
        <p class="muted">A quick check on how you are doing, and whether you need a hand. Take a minute, every week.</p>
      </div>
      ${gateBanner(sh)}

      <div class="grid two" style="margin-top:16px">
        <div class="card stack">
          <div class="spread"><h2>Weekly check-in</h2><span class="pill ${thisWeek ? 'green' : 'amber'}">${thisWeek ? 'Done for week ' + week : 'Due this week (week ' + week + ')'}</span></div>
          ${result}
          ${!open ? '<p class="small muted">Check-ins open on Day 1.</p>' : thisWeek ? '<p class="small muted">Thanks, your check-in for this week is in. You can send another one next week.</p>' : checkForm}
        </div>

        <div class="card stack">
          <div class="spread"><h2>Book your desk</h2></div>
          <p class="small muted">Every Friday at 9:00 we send a reminder to book a desk for the following week.</p>
          <div class="info-list">
            <div class="info-row"><span class="muted small">Next reminder</span><span>${fmtLong(nextFriday)}, 9:00</span></div>
            <div class="info-row"><span class="muted small">Upcoming</span><span>${fridays.slice(0, 4).map((d) => fmtShort(d)).join(' · ')}</span></div>
          </div>
          <a class="btn btn-block" href="${esc(DESK_BOOKING.url)}" target="_blank" rel="noopener">${svg('calendar')} Open the ${esc(DESK_BOOKING.label)}</a>
          <button class="btn btn-ghost btn-block" data-desk-remind="1">Demo: send this Friday's reminder now</button>
        </div>
      </div>

      ${checks.length ? `
        <div class="section-head"><h2>Your check-ins</h2></div>
        <div class="card">
          ${checks.slice().reverse().map((c) => `
            <div class="alert-row">
              <span class="rag rag-${c.tone}"></span>
              <div class="alert-body"><strong>Week ${c.week}: ${esc(MOOD_OPTIONS.find((m) => m.id === c.mood).label)}</strong>
                <span class="small muted">${c.find === 'yes' ? 'Finding things hard. ' : ''}${c.raise === 'buddy' ? 'Asked to talk to buddy. ' : ''}${c.raise === 'manager' ? 'Asked to talk to Jordan. ' : ''}${esc(c.note || '')}</span></div>
            </div>`).join('')}
        </div>` : ''}`;
  }

  function weeklyBanner() {
    const sh = SHARED.get(CHAT.ME_HIRE_ID);
    if (!day1Open(sh)) return '';
    const done = (sh.checkins || []).some((c) => c.week === checkinWeek());
    if (done) return '';
    return `<a class="banner warn" href="#/weekly" style="margin-bottom:16px;text-decoration:none;color:inherit">${svg('check')}<div><strong>Your weekly check-in is due</strong><div class="small" style="margin-top:4px">How are you doing this week? It takes a minute.</div></div></a>`;
  }

  function renderHelp() {
    const sh = SHARED.get(CHAT.ME_HIRE_ID);
    const log = sh.assistant || [];
    const bubbles = log.map((m) => `
      <div class="bubble ${m.from === 'you' ? 'mine' : ''}">
        <div class="small muted">${m.from === 'you' ? 'You' : 'Assistant'}</div>
        <div>${esc(m.text)}</div>
        ${(m.links || []).length ? `<div class="row" style="margin-top:8px">${m.links.map((l) => `<a class="btn btn-ghost btn-sm" href="${esc(l.href)}">${esc(l.label)}</a>`).join('')}</div>` : ''}
      </div>`).join('');
    const hello = log.length ? '' : `<div class="bubble">
        <div class="small muted">Assistant</div>
        <div>Hi ${esc(person.firstName)}. Ask me what an acronym means, or how to get something. For example:</div>
        <div class="quick">${ASSISTANT.EXAMPLES.map((q) => `<button type="button" class="chip" data-ask="${esc(q)}">${esc(q)}</button>`).join('')}</div>
      </div>`;
    return `
      ${breadcrumbs([{ label: 'Home', href: '#/home' }, { label: 'Assistant' }])}
      <div class="stack" style="gap:6px;margin-top:10px">
        <p class="eyebrow">New starter assistant</p>
        <h1>Ask a question</h1>
        <p class="muted">Acronyms, how-tos and where to find things. If I cannot help, I will point you to HR.</p>
      </div>
      <div class="card" style="margin-top:16px">
        <div class="thread">${hello}${bubbles}</div>
        <form class="reply" id="assist-form">
          <label class="sr-only" for="assist-text">Your question</label>
          <textarea id="assist-text" name="text" rows="2" placeholder="For example: what is DBS, or how do I order a monitor?" required></textarea>
          <button class="btn btn-sm" type="submit">Ask</button>
        </form>
        ${log.length ? '<p style="margin-top:10px"><button class="linkish small" id="assist-clear">Clear chat</button></p>' : ''}
      </div>`;
  }

  function renderChat(channel) {
    const isBuddy = channel === 'buddy';
    const other = isBuddy ? buddy : manager;
    const firstName = other.name.split(' ')[0];
    // Opening the thread clears the unread badge
    CHAT.markRead(CHAT.ME_HIRE_ID, 'hire', channel);
    const msgs = CHAT.thread(CHAT.ME_HIRE_ID, channel);
    const bubbles = msgs.map((m) => {
      const mine = m.from === 'hire';
      const who = mine ? 'You' : (m.name || (m.from === 'hr' ? 'HR Onboarding' : other.name));
      const time = new Date(m.time).toLocaleDateString('en-GB', { day: 'numeric', month: 'short' });
      return `<div class="bubble ${mine ? 'mine' : ''}">
        <div class="small muted">${esc(who)} · ${time}</div>
        <div>${esc(m.text)}</div>
      </div>`;
    }).join('');
    return `
      ${breadcrumbs([
        { label: 'Home', href: '#/home' },
        { label: isBuddy ? 'Chat with your buddy' : 'Messages' },
      ])}

      <div class="stack" style="gap:6px;margin-top:10px">
        <p class="eyebrow">${isBuddy ? 'Buddy chat' : 'Messages'}</p>
        <h1>Chat with ${esc(other.name)}</h1>
        <p class="muted">${isBuddy
          ? 'Your buddy is there for the everyday questions: where things are, how Teams works, where to get lunch. No question is too small.'
          : 'Your manager, buddy and HR can see this thread. Use it for quick questions. For anything urgent, call.'}</p>
      </div>

      <div class="card" style="margin-top:16px">
        <div class="thread">${bubbles || '<p class="muted small">No messages yet.</p>'}</div>
        <form class="reply" id="chat-form" data-channel="${channel}">
          <label class="sr-only" for="chat-text">Message ${esc(other.name)}</label>
          <textarea id="chat-text" name="text" rows="2" placeholder="Write a message to ${esc(firstName)}" required></textarea>
          <button class="btn btn-sm" type="submit">Send</button>
        </form>
      </div>`;
  }

  function renderTeam() {
    return `
      <div class="stack" style="gap:6px">
        ${coverBanner()}
        <p class="eyebrow">My team</p>
        <h1>Who you will meet</h1>
        <p class="muted">Your manager and buddy will reach out before Day 1. You can also book time with them yourself.</p>
      </div>

      <div class="grid two" style="margin-top:16px">
        <div class="card">
          <h2>Manager</h2>
          <div class="person" style="margin-top:14px">
            <span class="avatar lg">${initials(manager.name)}</span>
            <div class="person-meta"><strong>${esc(manager.name)}</strong><span>${esc(manager.role)}</span></div>
          </div>
          <div class="row" style="margin-top:14px">
            <a class="btn btn-ghost btn-sm" href="tel:${esc(manager.phone.replace(/\s/g, ''))}">${svg('phone')} Call</a>
            <a class="btn btn-ghost btn-sm" href="mailto:${esc(manager.email)}">${svg('mail')} Email</a>
            <a class="btn btn-ghost btn-sm" href="#/chat">${svg('chat')} Message${chatBadge()}</a>
            <button class="btn btn-ghost btn-sm" id="team-callback">${svg('phone')} Request call back</button>
          </div>
        </div>
        <div class="card">
          <h2>Buddy</h2>
          <div class="person" style="margin-top:14px">
            <span class="avatar lg">${initials(buddy.name)}</span>
            <div class="person-meta"><strong>${esc(buddy.name)}</strong><span>${esc(buddy.role)}</span></div>
          </div>
          ${buddyProfile()}
          <div class="row" style="margin-top:14px">
            <a class="btn btn-ghost btn-sm" href="mailto:${esc(buddy.email)}">${svg('mail')} Email</a>
            <a class="btn btn-ghost btn-sm" href="#/buddy">${svg('chat')} Message${chatBadge('buddy')}</a>
            <button class="btn btn-ghost btn-sm" data-invite="Virtual coffee with Sam Okafor">${svg('calendar')} Book a coffee</button>
          </div>
        </div>
      </div>

      <div class="section-head"><h2>Meet-ups before Day 1</h2></div>
      <div class="card">
        ${DEMO.events.map(eventRow).join('')}
      </div>

      <div class="section-head"><h2>The team</h2></div>
      <div class="grid three" style="grid-template-columns:repeat(auto-fill,minmax(220px,1fr))">
        ${DEMO.team.map((m) => `
          <div class="card person">
            <span class="avatar">${initials(m.name)}</span>
            <div class="person-meta"><strong>${esc(m.name)}</strong><span>${esc(m.role)}</span></div>
          </div>`).join('')}
      </div>`;
  }

  // ---------- Router ----------
  const ROUTES = {
    signin: renderSignin,
    setup: renderSetup,
    home: renderHome,
    vetting: renderVetting,
    todo: renderTodo,
    team: renderTeam,
    place: renderPlace,
    me: renderMe,
    chat: () => renderChat('manager'),
    buddy: () => renderChat('buddy'),
    device: renderDevice,
    workspace: renderWorkspace,
    withdraw: renderWithdraw,
    first30: renderFirst30,
    learn: (arg) => (arg ? renderLearnVideo(arg) : renderLearn()),
    benefits: renderBenefits,
    communities: renderCommunities,
    intros: renderIntros,
    access: renderAccess,
    goals: renderGoals,
    purpose: renderPurpose,
    channels: renderChannels,
    welcome: renderWelcome,
    review: renderReview,
    next: renderNext90,
    weekly: renderWeekly,
    help: renderHelp,
  };

  // Floating assistant button, shown on the main pages once the user is set up
  const fab = document.createElement('a');
  fab.id = 'assistant-fab';
  fab.href = '#/help';
  fab.setAttribute('aria-label', 'Ask the new starter assistant');
  fab.innerHTML = svg('help') + '<span>Ask</span>';
  document.body.appendChild(fab);

  function route() {
    const raw = (location.hash.replace(/^#\/?/, '') || 'home').split('?')[0];
    const parts = raw.split('/');
    let r = parts[0];
    let arg = parts[1] || null;

    if (r === 'reset') {
      localStorage.clear();
      location.hash = '#/signin';
      location.reload();
      return;
    }
    if (!state.signedIn) r = 'signin';
    else if (!state.setupDone && r !== 'setup') r = 'setup';
    else if (state.setupDone && r === 'signin') r = 'home';
    if (!ROUTES[r]) { r = 'home'; arg = null; }

    // The hire's start date can move, so the shared value is read on every page
    person.startDate = effectiveStart(CHAT.ME_HIRE_ID);

    const full = r + (arg ? '/' + arg : '');
    if (location.hash !== '#/' + full) history.replaceState(null, '', '#/' + full);
    renderChrome(r);
    fab.hidden = !(state.signedIn && state.setupDone) || r === 'help';
    if (assistOpen && (r === 'help' || fab.hidden)) setAssist(false); // the full page replaces the pop-up
    // Only a move to a different page goes back to the top. Ticking a box or pressing a button
    // re-draws the same page, so the scroll position is kept.
    const samePage = route.last === full;
    const keepY = window.scrollY;
    $('#app').innerHTML = ROUTES[r](arg);
    if (samePage) {
      window.scrollTo({ top: keepY, behavior: 'instant' });
    } else {
      $('#app').focus({ preventScroll: true });
      window.scrollTo({ top: 0, behavior: 'instant' });
    }
    route.last = full;
    pushPending();

    // Dashboard tour: starts on the first visit to Home, and stays on Home only
    if (r === 'home' && state.signedIn && state.setupDone) {
      if (tourStep === null && !load('tourDone', false)) startTour();
      else showTour();
    } else if (tourStep !== null) {
      endTour();
    }
  }

  // ---------- Dashboard tour ----------
  const TOUR = [
    { sel: null, title: 'Welcome to your dashboard', text: 'A quick tour of what is here and what to do first. It takes under a minute, and you can close it at any time.' },
    { sel: '[data-tour="journey"]', title: 'Your journey', text: 'This shows where you are between your offer and your first 30 days, and how many steps are done.' },
    { sel: '[data-tour="unlock"]', title: 'Start here', text: 'Things open as you go. Your first job is to sign your contract. Each row tells you what to do, or what it is waiting for and where to sort that out.' },
    { sel: '[data-tour="todos"]', title: 'Your to-dos', text: 'Red needs action now, amber is due soon, and green is on track. Tick things off as you finish them.' },
    { sel: '[data-tour="people"]', title: 'Your manager and buddy', text: 'Message Jordan or your buddy Sam at any time. They are here to help before you start.' },
    { sel: '#assistant-fab', title: 'Ask anything', text: 'Not sure what an acronym means, or how to get something? Ask the assistant.' },
  ];
  let tourStep = null;
  const tourBox = document.createElement('div');
  tourBox.id = 'tour';
  tourBox.hidden = true;
  tourBox.setAttribute('role', 'dialog');
  tourBox.setAttribute('aria-labelledby', 'tour-title');
  document.body.appendChild(tourBox);

  function showTour() {
    document.querySelectorAll('.tour-highlight').forEach((e) => e.classList.remove('tour-highlight'));
    if (tourStep === null) { tourBox.hidden = true; return; }
    const s = TOUR[tourStep];
    const target = s.sel ? document.querySelector(s.sel) : null;
    if (target) {
      target.classList.add('tour-highlight');
      target.scrollIntoView({ block: 'center', behavior: 'smooth' });
    }
    const last = tourStep === TOUR.length - 1;
    tourBox.hidden = false;
    tourBox.innerHTML = `
      <div class="spread"><span class="small muted">Step ${tourStep + 1} of ${TOUR.length}</span>
        <button class="linkish small" data-tour-close="1">Close tour</button></div>
      <h2 id="tour-title" style="margin-top:6px">${esc(s.title)}</h2>
      <p class="small" style="margin-top:6px">${esc(s.text)}</p>
      <div class="row" style="justify-content:flex-end;margin-top:12px;gap:8px">
        ${tourStep > 0 ? '<button class="btn btn-ghost btn-sm" data-tour-back="1">Back</button>' : ''}
        <button class="btn btn-sm" data-tour-next="1">${last ? 'Finish' : 'Next'}</button>
      </div>`;
  }

  function startTour() {
    tourStep = 0;
    showTour();
    const next = tourBox.querySelector('[data-tour-next]');
    if (next) next.focus({ preventScroll: true });
  }

  function endTour() {
    tourStep = null;
    save('tourDone', true);
    showTour();
  }

  document.addEventListener('keydown', (ev) => {
    if (ev.key === 'Escape' && tourStep !== null) endTour();
    else if (ev.key === 'Escape' && assistOpen) { setAssist(false); fab.focus(); }
  });

  // ---------- Assistant pop-up (opens from the Ask button, stays open while you move between screens) ----------
  let assistOpen = false;
  const assistBox = document.createElement('div');
  assistBox.id = 'assist-pop';
  assistBox.hidden = true;
  assistBox.setAttribute('role', 'dialog');
  assistBox.setAttribute('aria-label', 'New starter assistant');
  document.body.appendChild(assistBox);

  function renderAssistPop() {
    if (!assistOpen) { assistBox.hidden = true; return; }
    const log = SHARED.get(CHAT.ME_HIRE_ID).assistant || [];
    const bubbles = log.map((m) => `
      <div class="bubble ${m.from === 'you' ? 'mine' : ''}">
        <div class="small muted">${m.from === 'you' ? 'You' : 'Assistant'}</div>
        <div>${esc(m.text)}</div>
        ${(m.links || []).length ? `<div class="row" style="margin-top:8px">${m.links.map((l) => `<a class="btn btn-ghost btn-sm" href="${esc(l.href)}">${esc(l.label)}</a>`).join('')}</div>` : ''}
      </div>`).join('');
    const hello = log.length ? '' : `<div class="bubble">
        <div class="small muted">Assistant</div>
        <div>Hi ${esc(person.firstName)}. Ask me what an acronym means, or how to get something.</div>
        <div class="quick">${ASSISTANT.EXAMPLES.map((q) => `<button type="button" class="chip" data-ask="${esc(q)}">${esc(q)}</button>`).join('')}</div>
      </div>`;
    assistBox.hidden = false;
    assistBox.innerHTML = `
      <div class="assist-head">
        <strong>Ask the assistant</strong>
        <span class="row" style="gap:10px">
          <a class="small" href="#/help" data-assist-full="1">Open full screen</a>
          <button class="linkish small" data-assist-close="1">Close</button>
        </span>
      </div>
      <div class="thread assist-thread">${hello}${bubbles}</div>
      <form class="reply" id="assist-pop-form">
        <label class="sr-only" for="assist-pop-text">Your question</label>
        <textarea id="assist-pop-text" name="text" rows="2" placeholder="For example: what is DBS?" required></textarea>
        <button class="btn btn-sm" type="submit">Ask</button>
      </form>
      ${log.length ? '<button class="linkish small" id="assist-clear" style="justify-self:start">Clear chat</button>' : ''}`;
    const thread = assistBox.querySelector('.assist-thread');
    thread.scrollTop = thread.scrollHeight;
  }

  function setAssist(open) {
    assistOpen = open;
    fab.setAttribute('aria-expanded', open ? 'true' : 'false');
    renderAssistPop();
    if (open) { const box = $('#assist-pop-text'); if (box) box.focus(); }
  }

  // ---------- Web notifications (system notifications on laptop and phone) ----------
  // Uses the browser's Notifications API through a service worker, so it works on phones too.
  // In this demo they fire while the app is open or running in the background. A push server
  // would be needed to reach a device where the app is fully closed.
  const WEBN_SUPPORTED = 'Notification' in window;
  let swReg = null;
  if ('serviceWorker' in navigator && location.protocol !== 'file:') {
    navigator.serviceWorker.register('sw.js').then((reg) => { swReg = reg; }).catch(() => { swReg = null; });
    navigator.serviceWorker.addEventListener('message', (ev) => {
      if (ev.data && ev.data.go) location.hash = ev.data.go; // a tapped notification opens its page
    });
  }

  function webNotifyOn() {
    return WEBN_SUPPORTED && Notification.permission === 'granted' && load('webNotify', false);
  }

  function showWebNotification(n) {
    const opts = { body: n.text || '', icon: 'brand/icon-192.png', badge: 'brand/icon-192.png', tag: n.id, data: { url: n.link || '#/home' } };
    if (swReg && swReg.showNotification) return swReg.showNotification(n.title, opts);
    try {
      const x = new Notification(n.title, opts);
      x.onclick = () => { window.focus(); location.hash = opts.data.url; x.close(); };
    } catch (e) { /* some phones only allow notifications through the service worker */ }
    return null;
  }

  // Everything the hire has not been notified about yet: updates from the team, and new chat messages
  function pendingForPush() {
    const pushed = load('pushed', []);
    const items = NOTIFY.list('hire').filter((n) => !n.read && !pushed.includes(n.id))
      .map((n) => ({ id: n.id, title: n.title, text: n.text, link: n.link && n.link.indexOf('#') === 0 ? n.link : '#/first30' }));
    [['manager', '#/chat'], ['buddy', '#/buddy']].forEach(([channel, link]) => {
      CHAT.thread(CHAT.ME_HIRE_ID, channel).forEach((m) => {
        if (m.from === 'hire' || m.read.hire || pushed.includes(m.id)) return;
        const who = m.name || (m.from === 'buddy' ? buddy.name : m.from === 'hr' ? 'HR Onboarding' : manager.name);
        items.push({ id: m.id, title: 'New message from ' + who, text: m.text, link: link });
      });
    });
    return items;
  }

  function pushPending() {
    if (!webNotifyOn()) return;
    const items = pendingForPush();
    if (!items.length) return;
    save('pushed', load('pushed', []).concat(items.map((i) => i.id)).slice(-300));
    items.slice(0, 4).forEach(showWebNotification);
  }

  // Card on Home (until answered) and on My details (always), to turn notifications on or off
  function notifyCard(onHome) {
    if (!WEBN_SUPPORTED) {
      return onHome ? '' : `<div class="card" style="margin-top:16px"><h2>Notifications on this device</h2>
        <p class="small muted" style="margin-top:6px">This browser does not support notifications. On an iPhone, add the app to your Home Screen first.</p></div>`;
    }
    const perm = Notification.permission;
    const on = webNotifyOn();
    if (onHome && (on || perm === 'denied' || load('webNotifyAsked', false))) return '';
    const status = on ? '<span class="pill green">On</span>' : perm === 'denied' ? '<span class="pill red">Blocked</span>' : '<span class="pill grey">Off</span>';
    const body = perm === 'denied'
      ? '<p class="small muted" style="margin-top:6px">Notifications are blocked for this site. Allow them in your browser\'s site settings, then come back here.</p>'
      : on
        ? `<p class="small muted" style="margin-top:6px">You get a notification here when your manager, buddy or the onboarding team sends something.</p>
           <div class="row" style="margin-top:12px;gap:8px">
             <button class="btn btn-ghost btn-sm" data-webnotify="test">Send a test notification</button>
             <button class="btn btn-ghost btn-sm" data-webnotify="off">Turn off</button>
           </div>`
        : `<p class="small muted" style="margin-top:6px">Get a notification on this device when your manager, buddy or the onboarding team sends something, even when you are in another tab or app.</p>
           <div class="row" style="margin-top:12px;gap:8px">
             <button class="btn btn-sm" data-webnotify="on">Turn on notifications</button>
             ${onHome ? '<button class="btn btn-ghost btn-sm" data-webnotify="later">Not now</button>' : ''}
           </div>`;
    return `
      <div class="card" style="margin-${onHome ? 'bottom' : 'top'}:16px">
        <div class="spread"><h2>Notifications on this device</h2>${status}</div>
        ${body}
      </div>`;
  }

  // ---------- Events (delegated) ----------
  document.addEventListener('click', (ev) => {
    const el = ev.target.closest('button, a');
    if (!el) return;

    if (el.dataset.webnotify) {
      const act = el.dataset.webnotify;
      if (act === 'later') { save('webNotifyAsked', true); return route(); }
      if (act === 'off') { save('webNotify', false); toast('Notifications turned off on this device'); return route(); }
      if (act === 'test') {
        showWebNotification({ id: 'test-' + Date.now(), title: 'Test notification', text: 'This is how updates from your team will appear.', link: '#/home' });
        toast('Test notification sent');
        return;
      }
      // Turning on has to come from a click, which is why it is a button
      Notification.requestPermission().then((perm) => {
        save('webNotifyAsked', true);
        if (perm === 'granted') {
          save('webNotify', true);
          // Do not replay old updates: start from now
          save('pushed', load('pushed', []).concat(pendingForPush().map((i) => i.id)).slice(-300));
          showWebNotification({ id: 'on-' + Date.now(), title: 'Notifications are on', text: 'You will hear from your manager, buddy and the onboarding team here.', link: '#/home' });
          toast('Notifications turned on');
        } else {
          toast(perm === 'denied' ? 'Notifications were blocked in the browser' : 'Notifications were not turned on');
        }
        route();
      });
      return;
    }
    if (el.id === 'assistant-fab') { ev.preventDefault(); setAssist(!assistOpen); return; }
    if (el.dataset.assistClose) { setAssist(false); fab.focus(); return; }
    if (el.dataset.assistFull) { setAssist(false); return; } // the link itself goes to the full page
    if (el.dataset.tourNext) {
      if (tourStep === TOUR.length - 1) { endTour(); toast('Tour finished. You can replay it from the bottom of Home'); }
      else { tourStep += 1; showTour(); const n = tourBox.querySelector('[data-tour-next]'); if (n) n.focus({ preventScroll: true }); }
      return;
    }
    if (el.dataset.tourBack) { tourStep = Math.max(0, tourStep - 1); showTour(); return; }
    if (el.dataset.tourClose) { endTour(); return; }
    if (el.dataset.tourStart) { save('tourDone', false); startTour(); return; }

    if (el.id === 'sso-btn') {
      state.signedIn = true; save('signedIn', true);
      location.hash = state.setupDone ? '#/home' : '#/setup';
      return;
    }
    if (el.dataset.tick !== undefined) {
      const i = Number(el.dataset.tick);
      state.setupTicks = state.setupTicks.includes(i) ? state.setupTicks.filter((x) => x !== i) : [...state.setupTicks, i];
      save('setupTicks', state.setupTicks);
      return route();
    }
    if (el.id === 'setup-finish') {
      state.setupDone = true; save('setupDone', true);
      toast('Welcome aboard. Your journey is ready.');
      location.hash = '#/home';
      return;
    }
    if (el.id === 'setup-later') {
      state.setupDone = true; save('setupDone', true);
      location.hash = '#/home';
      return;
    }
    if (el.dataset.check) {
      const id = el.dataset.check;
      const was = state.doneTodos.includes(id);
      state.doneTodos = was ? state.doneTodos.filter((x) => x !== id) : [...state.doneTodos, id];
      save('doneTodos', state.doneTodos);
      toast(was ? 'Marked as not done' : 'Nice, marked as done');
      return route();
    }
    if (el.dataset.sys) {
      const me = CHAT.ME_HIRE_ID;
      const key = el.dataset.sys;
      const st = el.dataset.sysState;
      const sys = SYSTEM_CHECKS.find((s) => s.key === key);
      SHARED.update(me, { m2: Object.assign({}, SHARED.get(me).m2, { [key]: st }) });
      if (st === 'problem') {
        NOTIFY.add({ to: 'manager', type: 'system', tone: 'amber', hireId: me, title: person.name.split(' ')[0] + ' cannot get into ' + sys.name,
          text: 'Raised in the Day 30 to 60 check. Help them get access.', link: '#/hire/' + me });
      }
      toast(st === 'ok' ? sys.name + ' confirmed' : 'Help requested. ' + manager.name + ' has been told');
      return route();
    }
    if (el.dataset.demoDays) {
      const v = el.dataset.demoDays;
      SHARED.update(CHAT.ME_HIRE_ID, { demoDays: v === 'reset' ? undefined : Number(v) });
      toast(v === 'reset' ? 'Days reset to the real calendar' : 'Journey jumped to Day ' + v + ' (demo)');
      return route();
    }
    if (el.dataset.channelJoin) {
      const id = el.dataset.channelJoin;
      const joined = SHARED.get(CHAT.ME_HIRE_ID).channels || [];
      SHARED.update(CHAT.ME_HIRE_ID, { channels: joined.includes(id) ? joined.filter((x) => x !== id) : joined.concat(id) });
      return route();
    }
    if (el.dataset.packRead) {
      const id = el.dataset.packRead;
      const read = SHARED.get(CHAT.ME_HIRE_ID).packRead || [];
      SHARED.update(CHAT.ME_HIRE_ID, { packRead: read.concat(id) });
      return route();
    }
    if (el.dataset.journeyNext) {
      const me = CHAT.ME_HIRE_ID;
      const idx = journeyIndex();
      const next = Math.min(idx + 1, DEMO.stages.length - 1);
      // Leaving Vetting clears the checks. Reaching Day 1 opens the Day 1 tasks.
      if (idx === 1) markVettingComplete(me);
      const patch = { stageIndex: next };
      if (next >= 3) patch.demoDay1 = true;
      SHARED.update(me, patch);
      toast('Journey moved on to: ' + DEMO.stages[next].label);
      return route();
    }
    if (el.dataset.journeyReset) {
      SHARED.update(CHAT.ME_HIRE_ID, { stageIndex: undefined });
      toast('Journey reset to the start');
      return route();
    }
    if (el.dataset.demoDay1) {
      SHARED.update(CHAT.ME_HIRE_ID, { demoDay1: true });
      toast('Day 1 opened (demo)');
      return route();
    }
    if (el.dataset.first30) {
      const key = el.dataset.first30;
      const sh = SHARED.get(CHAT.ME_HIRE_ID);
      const f = Object.assign({}, sh.first30, { [key]: !(sh.first30 || {})[key] });
      SHARED.update(CHAT.ME_HIRE_ID, { first30: f });
      return route();
    }
    if (el.dataset.watched) {
      const id = el.dataset.watched;
      const sh = SHARED.get(CHAT.ME_HIRE_ID);
      SHARED.update(CHAT.ME_HIRE_ID, { videos: Object.assign({}, sh.videos, { [id]: true }) });
      toast('Marked as watched');
      return route();
    }
    if (el.dataset.play) {
      const p = $('#player');
      if (p) p.classList.add('playing');
      el.blur();
      toast('Demo player: a real recording would play here');
      return;
    }
    if (el.dataset.sampleCheckins) {
      const sample = [
        { week: 1, mood: 'good', find: 'no', findNote: '', raise: 'none', note: '', tone: 'green' },
        { week: 2, mood: 'okay', find: 'yes', findNote: 'Finding the reporting tools', raise: 'buddy', note: '', tone: 'amber' },
        { week: 3, mood: 'poor', find: 'no', findNote: '', raise: 'manager', note: 'Feeling the workload', tone: 'red' },
        { week: 4, mood: 'good', find: 'no', findNote: '', raise: 'none', note: '', tone: 'green' },
      ].map((c) => Object.assign({}, c, { at: TODAY.toISOString() }));
      SHARED.update(CHAT.ME_HIRE_ID, { checkins: sample });
      toast('Sample weeks added to the mood chart');
      return route();
    }
    if (el.dataset.deskRemind) {
      NOTIFY.add({ to: 'hire', type: 'reminder', title: 'Reminder: book your desk for next week',
        text: 'Friday 9:00. Book at the ' + DESK_BOOKING.label + ' (link on the Weekly page).', link: '#/weekly' });
      toast('Reminder sent to your updates');
      return route();
    }
    if (el.dataset.accessCheck) {
      const key = el.dataset.accessCheck;
      const sh = SHARED.get(CHAT.ME_HIRE_ID);
      const acc = Object.assign({}, sh.access);
      acc[key] = acc[key] === 'verified' ? null : 'verified';
      SHARED.update(CHAT.ME_HIRE_ID, { access: acc });
      toast(acc[key] ? 'Access confirmed' : 'Marked as not confirmed');
      return route();
    }
    if (el.dataset.accessRequest) {
      const key = el.dataset.accessRequest;
      const sh = SHARED.get(CHAT.ME_HIRE_ID);
      const acc = Object.assign({}, sh.access, { [key]: 'requested' });
      SHARED.update(CHAT.ME_HIRE_ID, { access: acc });
      NOTIFY.add({ to: 'manager', type: 'access', hireId: CHAT.ME_HIRE_ID, title: 'Access requested: ' + person.name,
        text: el.dataset.accessLabel + '. Needs approval.', link: '#/hire/' + CHAT.ME_HIRE_ID });
      toast('Access requested. Jordan has been told');
      return route();
    }
    if (el.dataset.community) {
      const id = el.dataset.community;
      const sh = SHARED.get(CHAT.ME_HIRE_ID);
      const joined = sh.communities || [];
      const next = joined.includes(id) ? joined.filter((x) => x !== id) : joined.concat(id);
      SHARED.update(CHAT.ME_HIRE_ID, { communities: next });
      toast(joined.includes(id) ? 'Left community' : 'Joined community');
      return route();
    }
    if (el.dataset.intro) {
      const id = el.dataset.intro;
      const sh = SHARED.get(CHAT.ME_HIRE_ID);
      SHARED.update(CHAT.ME_HIRE_ID, { intros: Object.assign({}, sh.intros, { [id]: true }) });
      toast('Intro call booked');
      return route();
    }
    if (el.dataset.ask) {
      askAssistant(el.dataset.ask);
      return assistOpen ? renderAssistPop() : route();
    }
    if (el.id === 'assist-clear') {
      SHARED.update(CHAT.ME_HIRE_ID, { assistant: [] });
      return assistOpen ? renderAssistPop() : route();
    }
    if (el.id === 'updates-read') {
      NOTIFY.markAll('hire');
      return route();
    }
    if (el.dataset.demoWindow) {
      // (demo window handler)
      SHARED.update(CHAT.ME_HIRE_ID, { demoWindow: true });
      toast('Contract window opened (demo)');
      return route();
    }
    if (el.dataset.signContract) {
      SHARED.update(CHAT.ME_HIRE_ID, { contractSigned: TODAY.toISOString() });
      NOTIFY.add({ to: 'manager', type: 'contract', hireId: CHAT.ME_HIRE_ID, title: 'Contract signed: ' + person.name,
        text: 'Home equipment ordering is now open for them.', link: '#/hire/' + CHAT.ME_HIRE_ID });
      toast('Contract signed. Home equipment is now open');
      return route();
    }
    if (el.dataset.kitId) {
      const me = CHAT.ME_HIRE_ID;
      const sh = SHARED.get(me);
      const draft = sh.kitDraft || { items: {}, delivery: 'day-before' };
      const q = Math.max(0, (draft.items[el.dataset.kitId] || 0) + Number(el.dataset.kitStep));
      draft.items = Object.assign({}, draft.items, { [el.dataset.kitId]: q });
      SHARED.update(me, { kitDraft: draft });
      return route();
    }
    if (el.dataset.placeOrder) {
      const me = CHAT.ME_HIRE_ID;
      const sh = SHARED.get(me);
      const draft = sh.kitDraft || { items: {}, delivery: 'day-before' };
      const items = {};
      Object.keys(draft.items).forEach((id) => { if (draft.items[id] > 0) items[id] = draft.items[id]; });
      const total = Object.keys(items).reduce((a, id) => a + HOME_KIT.find((k) => k.id === id).price * items[id], 0);
      const overBy = Math.max(0, total - HOME_KIT_ALLOWANCE);
      SHARED.update(me, {
        homeOrder: {
          items: items,
          delivery: draft.delivery,
          total: total,
          overBy: overBy,
          approved: overBy === 0,
          orderedOn: TODAY.toISOString(),
        },
      });
      if (overBy > 0) {
        NOTIFY.add({ to: 'manager', type: 'kit', hireId: me, title: 'Home equipment needs approval: ' + person.name,
          text: money(overBy) + ' is over the allowance. Approve to place the order.', link: '#/hire/' + me });
      }
      toast(overBy > 0 ? 'Order sent. Waiting for Jordan to approve the extra' : 'Order placed');
      return route();
    }
    if (el.dataset.editKit) {
      SHARED.update(CHAT.ME_HIRE_ID, { homeOrder: null });
      return route();
    }
    if (el.dataset.demoVetting) {
      markVettingComplete(CHAT.ME_HIRE_ID);
      toast('Demo: vetting marked complete. Jordan has been notified');
      return route();
    }
    if (el.dataset.chooseOs) {
      SHARED.update(CHAT.ME_HIRE_ID, { device: { os: el.dataset.chooseOs, dev: false, status: 'chosen' } });
      toast('Standard build chosen');
      return route();
    }
    if (el.dataset.requestOs) {
      SHARED.update(CHAT.ME_HIRE_ID, { device: { os: el.dataset.requestOs, dev: true, status: 'requested' } });
      NOTIFY.add({ to: 'manager', type: 'device', hireId: CHAT.ME_HIRE_ID, title: 'Developer build requested: ' + person.name,
        text: (DEVICES[el.dataset.requestOs].name) + '. Approve or decline.', link: '#/hire/' + CHAT.ME_HIRE_ID });
      toast('Developer build requested from Jordan');
      return route();
    }
    if (el.dataset.todo) {
      toast('Demo: this would open the ' + (DEMO.todos.find((t) => t.id === el.dataset.todo) || {}).cta.toLowerCase() + ' flow');
      return;
    }
    if (el.id === 'callback-btn' || el.id === 'team-callback') {
      state.callbackRequested = true; save('callbackRequested', true);
      NOTIFY.add({ to: 'manager', type: 'call', hireId: CHAT.ME_HIRE_ID, title: 'Call back requested by ' + person.name,
        text: 'They would like a call about their vetting timeline.', link: '#/hire/' + CHAT.ME_HIRE_ID, action: 'Open hire' });
      toast(`Call back requested from ${manager.name}`);
      if (el.id === 'team-callback') return;
      return route();
    }
    if (el.dataset.invite) {
      toast('Invite sent to Sam. Check your calendar.');
      return;
    }
  });

  // Delivery choice: remember it in the draft so re-renders keep it
  document.addEventListener('change', (ev) => {
    const input = ev.target.closest('input[name="delivery"]');
    if (!input) return;
    const sh = SHARED.get(CHAT.ME_HIRE_ID);
    const draft = sh.kitDraft || { items: {}, delivery: 'day-before' };
    SHARED.update(CHAT.ME_HIRE_ID, { kitDraft: Object.assign({}, draft, { delivery: input.value }) });
    route();
  });

  document.addEventListener('submit', (ev) => {
    const pop = ev.target.closest('#assist-pop-form');
    if (pop) {
      ev.preventDefault();
      const q = pop.elements.text.value.trim();
      if (q) askAssistant(q);
      renderAssistPop();
      const box = $('#assist-pop-text');
      if (box) box.focus();
      return;
    }
    const assist = ev.target.closest('#assist-form');
    if (assist) {
      ev.preventDefault();
      const t = assist.elements.text.value.trim();
      if (t) askAssistant(t);
      return route();
    }
    const teething = ev.target.closest('#teething-form');
    if (teething) {
      ev.preventDefault();
      const me = CHAT.ME_HIRE_ID;
      const f = teething.elements;
      const a = { issues: f.issues.value, issuesNote: f.issuesNote.value.trim(), raise: f.raise.value, raiseNote: f.raiseNote.value.trim(), at: TODAY.toISOString() };
      a.tone = a.raise === 'yes' || a.issues === 'many' ? 'red' : a.issues === 'few' ? 'amber' : 'green';
      SHARED.update(me, { m3: a });
      if (a.tone !== 'green') {
        const first = person.name.split(' ')[0];
        NOTIFY.add({ to: 'manager', type: 'teething', tone: a.tone, hireId: me,
          title: (a.raise === 'yes' ? first + ' has something to raise with you' : first + ' has some teething issues') + ' (Day 60 to 90)',
          text: [a.raiseNote ? '"' + a.raiseNote.slice(0, 100) + '"' : '', a.issuesNote ? '"' + a.issuesNote.slice(0, 100) + '"' : ''].filter(Boolean).join(' ') || 'No details given. Check in with them.',
          link: '#/hire/' + me });
      }
      toast(a.tone === 'green' ? 'Check-in sent. Thanks' : 'Check-in sent. ' + manager.name + ' has been told');
      return route();
    }
    const reviewForm = ev.target.closest('#review-form');
    if (reviewForm) {
      ev.preventDefault();
      const me = CHAT.ME_HIRE_ID;
      const answers = {};
      let points = 0;
      REVIEW_QUESTIONS.forEach((q) => {
        const val = new FormData(reviewForm).get(q.id);
        answers[q.id] = val;
        points += val === 'low' ? 2 : val === 'some' ? 1 : 0;
      });
      const tone = points >= 3 ? 'red' : points >= 1 ? 'amber' : 'green';
      SHARED.update(me, { review: { answers: answers, tone: tone, at: TODAY.toISOString() } });
      checkRisk(me);
      toast(tone === 'green' ? 'Thanks. Check-in sent' : 'Thanks. Your manager has been told and a support plan is drafted');
      return route();
    }
    const goalsForm = ev.target.closest('#goals-form');
    if (goalsForm) {
      ev.preventDefault();
      const items = [0, 1, 2].map((i) => goalsForm.elements['goal' + i].value.trim()).filter(Boolean);
      if (!items.length) { toast('Add at least one goal'); return; }
      SHARED.update(CHAT.ME_HIRE_ID, { goals: { items: items, savedOn: TODAY.toISOString() } });
      NOTIFY.add({ to: 'manager', type: 'goals', hireId: CHAT.ME_HIRE_ID, title: 'Goals set: ' + person.name,
        text: items.length + ' goal' + (items.length === 1 ? '' : 's') + ' saved for the first 30 days.', link: '#/hire/' + CHAT.ME_HIRE_ID });
      // Setting goals unlocks the welcome pack
      NOTIFY.add({ to: 'hire', type: 'pack', title: 'Your welcome pack is ready', text: 'Your goals are saved, so your welcome pack is open.', link: '#/welcome' });
      toast('Goals saved. Your welcome pack is open');
      return route();
    }
    const ben = ev.target.closest('#benefits-form');
    if (ben) {
      ev.preventDefault();
      const fd = new FormData(ben);
      const choice = {};
      BENEFIT_GROUPS.forEach((g) => { choice[g.id] = fd.get(g.id) || g.options[0].id; });
      SHARED.update(CHAT.ME_HIRE_ID, { benefits: choice });
      const label = (g) => g.options.find((o) => o.id === choice[g.id]).label;
      NOTIFY.add({ to: 'manager', type: 'benefits', hireId: CHAT.ME_HIRE_ID, title: 'Benefits chosen: ' + person.name,
        text: 'Pension: ' + label(BENEFIT_GROUPS[0]) + '. Holiday: ' + label(BENEFIT_GROUPS[1]) + '. ShareMatch: ' + label(BENEFIT_GROUPS.find((g) => g.id === 'sharematch')) + '.', link: '#/hire/' + CHAT.ME_HIRE_ID });
      toast('Benefits saved. Jordan has been told');
      return route();
    }
    const check = ev.target.closest('#checkin-form');
    if (check) {
      ev.preventDefault();
      const me = CHAT.ME_HIRE_ID;
      const f = check.elements;
      const answers = {
        week: checkinWeek(),
        mood: f.mood.value,
        find: f.find.value,
        findNote: f.findNote.value.trim(),
        raise: f.raise.value,
        note: f.note.value.trim(),
        at: TODAY.toISOString(),
      };
      const tone = checkinTone(answers);
      SHARED.update(me, { checkins: (SHARED.get(me).checkins || []).concat(Object.assign({}, answers, { tone: tone })) });

      const firstName = person.name.split(' ')[0];
      const buddyAsked = answers.raise === 'buddy' || answers.find === 'yes';
      if (buddyAsked) {
        const parts = [];
        if (answers.find === 'yes') parts.push('I am having trouble finding things.' + (answers.findNote ? ' ' + answers.findNote : ''));
        if (answers.raise === 'buddy') parts.push('I would like to talk something through with you.');
        CHAT.send(me, 'hire', 'Weekly check-in: ' + parts.join(' '), person.name, 'buddy');
      }
      if (tone !== 'green') {
        const title = tone === 'red' ? 'Weekly check-in needs a call: ' + person.name : 'Weekly check-in: some support needed for ' + firstName;
        const text = [answers.raise === 'manager' ? 'Asked to talk to you.' : '',
          answers.find === 'yes' ? 'Having trouble finding things.' : '',
          answers.raise === 'buddy' ? 'Buddy has been asked to help.' : '',
          answers.note ? '"' + answers.note.slice(0, 100) + '"' : ''].filter(Boolean).join(' ');
        NOTIFY.add({ to: 'manager', type: 'checkin', tone: tone, hireId: me, title: title,
          text: text || 'Mood: ' + MOOD_OPTIONS.find((m) => m.id === answers.mood).label + '.', link: '#/hire/' + me });
      }
      toast(tone === 'green' ? 'Check-in sent. Thanks' : 'Check-in sent. Your support team has been told');
      return route();
    }
    const withdraw = ev.target.closest('#withdraw-form');
    if (withdraw) {
      ev.preventDefault();
      const me = CHAT.ME_HIRE_ID;
      const reason = withdraw.elements.reason.value.trim();
      SHARED.update(me, { cancel: { by: 'hire', status: 'open', reason: reason, startedOn: TODAY.toISOString(), callBooked: null, callDone: false } });
      NOTIFY.add({ to: 'manager', type: 'withdrawal', hireId: me, title: 'Withdrawal: ' + person.name,
        text: reason ? '"' + reason.slice(0, 120) + '"' : 'They have withdrawn from the role. Reverse their set-up to close it.',
        link: '#/hire/' + me, action: 'Reverse and cancel' });
      toast('Withdrawal sent. ' + manager.name + ' has been notified');
      location.hash = '#/withdraw';
      return route();
    }
    const form = ev.target.closest('#chat-form');
    if (!form) return;
    ev.preventDefault();
    const text = form.elements.text.value.trim();
    if (!text) return;
    const channel = form.dataset.channel || 'manager';
    CHAT.send(CHAT.ME_HIRE_ID, 'hire', text, person.name, channel);
    if (channel === 'manager') {
      NOTIFY.add({ to: 'manager', type: 'message', hireId: CHAT.ME_HIRE_ID, title: 'New message from ' + person.name,
        text: text.slice(0, 120), link: '#/hire/' + CHAT.ME_HIRE_ID, action: 'Reply' });
    }
    route();
  });

  // Keep this tab in step when the manager portal replies in another tab
  window.addEventListener('storage', (ev) => {
    if (ev.key !== CHAT.KEY && ev.key !== 'lbg.shared' && ev.key !== NOTIFY.KEY) return;
    pushPending(); // system notification for anything new from the manager, buddy or onboarding
    if (document.activeElement && document.activeElement.tagName === 'TEXTAREA') return;
    route();
  });

  window.addEventListener('hashchange', route);
  route();
})();
