// Manager portal: hires list, hire detail, requests and messages, and onboarding kick-off.
(function () {
  'use strict';

  // ---------- Persisted demo state ----------
  const load = (k, fallback) => {
    try { const v = localStorage.getItem('mgr.' + k); return v === null ? fallback : JSON.parse(v); }
    catch (e) { return fallback; }
  };
  const save = (k, v) => localStorage.setItem('mgr.' + k, JSON.stringify(v));

  let signedIn = load('signedIn', false);
  let overrides = load('hires', {}); // per-hire changes made in the portal
  const persist = () => save('hires', overrides);
  const hireState = (id) => (overrides[id] = overrides[id] || {});

  // ---------- Helpers ----------
  const $ = (sel) => document.querySelector(sel);
  const esc = (s) => String(s).replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
  const plural = (n, word) => n + ' ' + word + (n === 1 ? '' : 's');
  const money = (n) => '£' + n.toLocaleString('en-GB');
  const ICON = {
    check: '<path d="M4 12l5 5 11-11"/>',
    arrow: '<path d="M5 12h14M13 6l6 6-6 6"/>',
    phone: '<path d="M5 4h4l2 5-2.5 1.5a11 11 0 0 0 5 5L15 13l5 2v4a2 2 0 0 1-2 2A16 16 0 0 1 3 6a2 2 0 0 1 2-2z"/>',
    chat: '<path d="M4 5h16v11H9l-5 4z"/>',
    people: '<circle cx="9" cy="8" r="3.5"/><path d="M2.5 20c.6-3.4 3.3-5.5 6.5-5.5s5.9 2.1 6.5 5.5"/><path d="M16 4.6a3.5 3.5 0 0 1 0 6.8"/><path d="M18 14.6c2 .8 3.2 2.7 3.5 5.4"/>',
    inbox: '<path d="M3 13l3-8h12l3 8v6H3z"/><path d="M3 13h5l1 2h6l1-2h5"/>',
    bell: '<path d="M6 16V11a6 6 0 0 1 12 0v5l2 2H4z"/><path d="M10 20a2 2 0 0 0 4 0"/>',
    list: '<path d="M9 6h11M9 12h11M9 18h11"/><circle cx="4.5" cy="6" r="1"/><circle cx="4.5" cy="12" r="1"/><circle cx="4.5" cy="18" r="1"/>',
    logout: '<path d="M14 4h4a2 2 0 0 1 2 2v12a2 2 0 0 1-2 2h-4M10 8l-4 4 4 4M6 12h11"/>',
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

  // Dates saved in localStorage come back as strings, so normalise before formatting
  const dt = (x) => (x instanceof Date ? x : new Date(x));

  // Merge a hire's dummy data with anything changed in this session
  function view(h) {
    const s = overrides[h.id] || {};
    const sh = SHARED.get(h.id); // vetting, family and device choice are shared with the employee app
    const family = sh.family !== undefined ? sh.family : (s.family !== undefined ? s.family : h.family);
    const device = sh.device || null;
    const rawOnb = sh.onb || h.onboarding || { status: 'idle', done: [] };
    // Sample data may record a finished run without its step list, so fill it in
    const onb = Object.assign({}, rawOnb, {
      done: rawOnb.done || (rawOnb.status === 'complete' ? ONBOARDING_STEPS.map((s) => s.key) : []),
    });
    const requests = (h.requests || []).concat(s.extraReqs || []).map((r) => ({
      ...r,
      status: (s.reqs && s.reqs[r.id]) || r.status,
      when: (s.bookedWhen && s.bookedWhen[r.id]) || r.when,
    }));
    const messages = CHAT.thread(h.id);
    const vetTotal = h.vetting.length;
    const vetDone = sh.vettingDone ? vetTotal : h.vetting.filter((c) => c.status === 'complete').length;
    const pendingVet = sh.vettingDone ? [] : h.vetting.filter((c) => c.status !== 'complete');
    return {
      ...h,
      family,
      device,
      devRequested: !!device && device.status === 'requested',
      contractSigned: !!sh.contractSigned,
      cancel: sh.cancel || null,
      checkins: sh.checkins || [],
      startDate: effectiveStart(h.id), // moved by the manager, if it has been
      readyNotified: !!sh.readyNotified,
      homeOrder: sh.homeOrder || null,
      onb,
      requests,
      messages,
      vetDone,
      vetTotal,
      vettingComplete: vetDone === vetTotal,
      openReqs: requests.filter((r) => r.status !== 'done'),
      unread: CHAT.unread(h.id, 'manager'),
      // The employee's demo journey button moves this on, so the manager sees the same stage
      stageIndex: typeof sh.stageIndex === 'number' ? sh.stageIndex : HIRE_STAGES.findIndex((st) => st.key === h.stage),
      pendingVet,
    };
  }

  function progressFor(v) {
    if (v.onb.status === 'complete') return 95;
    if (v.onb.status === 'running') {
      return Math.min(94, v.progress + Math.round((v.onb.done.length / ONBOARDING_STEPS.length) * 10));
    }
    return v.progress;
  }

  function onbPill(v) {
    if (v.onb.status === 'complete') return '<span class="pill green">Onboarded</span>';
    if (v.onb.status === 'running') return `<span class="pill amber">Onboarding ${v.onb.done.length}/${ONBOARDING_STEPS.length}</span>`;
    if (v.vettingComplete) return '<span class="pill green">Ready to onboard</span>';
    return '<span class="pill grey">Waiting on vetting</span>';
  }

  function vetTone(v) {
    if (v.vettingComplete) return 'green';
    if (v.pendingVet.some((c) => c.eta && c.needBy && c.eta > c.needBy)) return 'red';
    return 'amber';
  }

  const REQ_LABEL = {
    open: ['Call requested', 'red'],
    booked: ['Call booked', 'amber'],
    done: ['Completed', 'green'],
  };

  // ---------- Chrome ----------
  function renderChrome(section) {
    const show = signedIn;
    document.body.classList.toggle('has-nav', show);
    $('#topbar-user').innerHTML = show
      ? `<span>${esc(MANAGER_ME.name)}</span><span class="avatar">${MANAGER_ME.initials}</span>`
      : '';
    if (!show) { $('#sidenav').innerHTML = ''; $('#tabbar').innerHTML = ''; return; }

    const open = HIRES.map(view).reduce((a, v) => a + v.openReqs.length + v.unread, 0);
    const items = [
      ['', 'New hires', 'people'],
      ['todo', 'To do', 'list', managerTodos().filter((t) => t.tone !== 'green').length],
      ['alerts', 'Alerts', 'bell', NOTIFY.unread('manager')],
      ['requests', 'Calls and messages', 'inbox', open],
    ];
    const navHtml = (cls) => items.map(([key, label, icon, count]) => {
      const active = key === (section || '') ? 'active' : '';
      const badge = count ? `<span class="nav-count">${count}</span>` : '';
      return `<a href="#/${key}" class="${active}">${svg(icon)}<span>${label}</span>${badge}</a>`;
    }).join('');
    $('#sidenav').innerHTML = navHtml('side') +
      `<div class="side-foot">
         <div class="muted small">Signed in as</div>
         <strong>${esc(MANAGER_ME.name)}</strong>
         <div class="small" style="margin-top:14px"><button class="linkish" id="mgr-signout">Sign out</button></div>
       </div>`;
    $('#tabbar').innerHTML = navHtml('tab') +
      `<button class="tab-btn" id="mgr-signout-tab">${svg('logout')}<span>Sign out</span></button>`;
  }

  // ---------- Screens ----------
  function renderSignin() {
    return `
      <section class="signin">
        <div class="signin-card">
          <div class="stack">
            <p class="eyebrow">Manager portal</p>
            <h1>Welcome, ${esc(MANAGER_ME.name.split(' ')[0])}</h1>
            <p class="muted">Track your new starters, see what they need from you, and kick off their accounts once vetting is complete.</p>
          </div>
          <div class="card stack">
            <div class="sso-account">
              <span class="avatar">${MANAGER_ME.initials}</span>
              <div class="person-meta"><strong>${esc(MANAGER_ME.name)}</strong><span>${esc(MANAGER_ME.role)}</span></div>
            </div>
            <button class="btn btn-block" id="mgr-sso">Continue with Lloyds SSO</button>
            <p class="small muted" style="text-align:center">Demo only: nothing is sent.</p>
          </div>
        </div>
      </section>`;
  }

  function tile(n, label, tone) {
    return `<div class="stat ${tone || ''}"><strong>${n}</strong><span>${label}</span></div>`;
  }

  function hireCard(v) {
    const pct = progressFor(v);
    const stage = HIRE_STAGES[v.stageIndex] || HIRE_STAGES[0];
    return `
      <a class="card hire-card" href="#/hire/${v.id}">
        <div class="hire-top">
          <span class="avatar lg">${esc(v.initials)}</span>
          <div class="person-meta">
            <strong>${esc(v.name)}</strong>
            <span>${esc(v.title)} · ${esc(v.location)}</span>
          </div>
          <span class="pill">${esc(stage.label)}</span>
        </div>
        <div class="progress-row">
          <div class="progress"><span style="width:${pct}%"></span></div>
          <strong class="small">${pct}%</strong>
        </div>
        <div class="hire-meta">
          <span class="pill ${vetTone(v)}">Vetting ${v.vetDone}/${v.vetTotal}</span>
          ${onbPill(v)}
          ${v.openReqs.length ? `<span class="pill red">${svg('phone').replace('<svg', '<svg class="ico"')} ${plural(v.openReqs.length, 'call request')}</span>` : ''}
          ${v.unread ? `<span class="pill amber">${svg('chat').replace('<svg', '<svg class="ico"')} ${plural(v.unread, 'new message')}</span>` : ''}
          ${v.devRequested ? '<span class="pill amber">Developer build to approve</span>' : ''}
          ${v.homeOrder && v.homeOrder.overBy > 0 && !v.homeOrder.approved && !v.homeOrder.denied ? '<span class="pill amber">Home kit to approve</span>' : ''}
          ${v.cancel && v.cancel.status === 'open' ? '<span class="pill red">Cancellation in progress</span>' : ''}
          ${v.cancel && v.cancel.status === 'reversed' ? '<span class="pill grey">Role cancelled</span>' : ''}
          ${!v.cancel && v.readyNotified ? '<span class="pill green">Ready for Day 1</span>' : ''}
        </div>
        <div class="next-step"><span class="eyebrow">Next</span> ${esc(v.nextStep)}</div>
        <div class="small muted">Starts ${fmtShort(v.startDate)}</div>
      </a>`;
  }

  function renderDashboard() {
    HIRES.forEach((h) => { checkRisk(h.id); checkMonthly(h.id); }); // early support and monthly reminders are checked each time the portal is opened
    const vs = HIRES.map(view).sort((a, b) => a.startDate - b.startDate);
    const ready = vs.filter((v) => v.vettingComplete && v.onb.status === 'idle').length;
    const calls = vs.reduce((a, v) => a + v.openReqs.length, 0);
    const unread = vs.reduce((a, v) => a + v.unread, 0);
    return `
      <div class="stack" style="gap:6px">
        <p class="eyebrow">Manager portal</p>
        <h1>Your new hires</h1>
        <p class="muted">Follow each starter from offer to Day 1. Anything that needs you is flagged on the card.</p>
      </div>

      <div style="margin-top:16px">${awayCard()}</div>

      ${(() => {
        const todos = managerTodos();
        if (!todos.length) return '';
        return `<div class="card" style="margin-top:16px">
          <div class="spread"><h2>Your to-do list</h2><a href="#/todo" class="small">See all ${todos.length}</a></div>
          <div style="margin-top:8px">${todos.slice(0, 5).map(todoRow).join('')}</div>
        </div>`;
      })()}

      <div class="stats" style="margin-top:16px">
        ${tile(vs.length, 'New hires')}
        ${tile(ready, 'Ready to onboard', ready ? 'good' : '')}
        ${tile(calls, 'Open call requests', calls ? 'alert' : '')}
        ${tile(unread, 'Unread messages', unread ? 'warn' : '')}
      </div>

      ${NOTIFY.unread('manager') ? `
        <div class="card" style="margin-top:16px">
          <div class="spread"><h2>Needs your attention</h2><a href="#/alerts" class="small">All alerts</a></div>
          <div style="margin-top:8px">${NOTIFY.list('manager').filter((n) => !n.read).slice(0, 3).map(alertRow).join('')}</div>
        </div>` : ''}

      <div class="section-head"><h2>Hires</h2><span class="small muted">Sorted by start date</span></div>
      <div class="hire-list">
        ${vs.map(hireCard).join('')}
      </div>`;
  }

  function crumbs(items) {
    return `
      <nav class="crumbs" aria-label="Breadcrumb"><ol>
        ${items.map((it, i) => (i === items.length - 1
          ? `<li><span aria-current="page">${esc(it.label)}</span></li>`
          : `<li><a href="${it.href}">${esc(it.label)}</a></li>`)).join('')}
      </ol></nav>`;
  }

  function vettingList(v) {
    const contractRow = `
      <div class="check-row">
        <div class="check-top">
          <div class="name"><span class="rag rag-${v.contractSigned ? 'green' : 'amber'}"></span>Employment contract</div>
          <span class="pill ${v.contractSigned ? 'green' : 'grey'}">${v.contractSigned ? 'Signed' : 'Awaiting signature'}</span>
        </div>
        <div class="check-meta" style="padding-left:22px"><span>Available for the hire to sign at any time</span></div>
      </div>`;
    // Once vetting is cleared (by the override or the checks themselves), every check shows as complete
    const checks = v.vettingComplete ? v.vetting.map((c) => Object.assign({}, c, { status: 'complete' })) : v.vetting;
    return checks.map((c) => {
      const label = { complete: ['Complete', 'green'], in_progress: ['In progress', 'amber'], waiting: ['Waiting on referee', 'amber'], queued: ['Queued', 'grey'] }[c.status];
      const late = c.status !== 'complete' && c.eta && c.needBy && c.eta > c.needBy;
      const rag = c.status === 'complete' ? 'green' : late ? 'red' : 'green';
      return `
        <div class="check-row">
          <div class="check-top">
            <div class="name"><span class="rag rag-${rag}"></span>${esc(c.name)}</div>
            <span class="pill ${label[1]}">${label[0]}</span>
          </div>
          <div class="check-meta" style="padding-left:22px">
            ${c.status === 'complete'
              ? '<span>Cleared</span>'
              : `<span>Expected <strong style="color:var(--ink)">${fmtShort(c.eta)}</strong></span>
                 <span class="${late ? 'late' : ''}">Needed by ${fmtShort(c.needBy)}${late ? ' · running late' : ''}</span>`}
          </div>
        </div>`;
    }).join('') + contractRow;
  }

  function journey(v) {
    const cancelled = !!v.cancel && v.cancel.status === 'reversed';
    return `<ul class="timeline">
      ${HIRE_STAGES.map((st, i) => {
        const state = i < v.stageIndex ? 'done' : i === v.stageIndex ? 'current' : 'pending';
        return `<li class="${state === 'pending' ? 'pending' : ''}"><div><strong>${esc(st.label)}</strong>
          <span class="small muted"> · ${state === 'done' ? 'Done' : state === 'current' ? 'Now' : cancelled ? 'Cancelled' : 'Upcoming'}</span></div></li>`;
      }).join('')}
    </ul>`;
  }

  function onbCard(h) {
    const v = view(h);
    const total = ONBOARDING_STEPS.length;
    const head = `<div class="spread"><h2>Onboarding</h2>${onbPill(v)}</div>`;
    const stepList = (running) => `
      <ol class="steps">
        ${ONBOARDING_STEPS.map((st) => {
          const done = v.onb.done.includes(st.key);
          const current = running && !done && ONBOARDING_STEPS.find((x) => !v.onb.done.includes(x.key)).key === st.key;
          return `<li class="${done ? 'done' : current ? 'current' : ''}">
            <span class="step-dot">${done ? svg('check') : ''}</span>
            <span class="step-label">${esc(st.label)}</span>
            <span class="small muted">${done ? 'Done' : current ? 'In progress' : 'Queued'}</span>
          </li>`;
        }).join('')}
      </ol>`;

    if (v.onb.status === 'complete') {
      const fam = JOB_FAMILIES.find((f) => f.id === v.family);
      return `${head}
        <p class="small muted" style="margin-top:6px">Finished${v.onb.completedOn ? ' on ' + fmtShort(dt(v.onb.completedOn)) : ''}. ${esc(h.name.split(' ')[0])} has an account and access for ${fam ? esc(fam.name) + ', ' + esc(fam.band) : 'their job family'}.</p>
        ${stepList(false)}`;
    }
    if (v.onb.status === 'running') {
      return `${head}
        <p class="small muted" style="margin-top:6px">Running automatically. Nothing else is needed from you.</p>
        <div class="progress" style="margin:12px 0 4px"><span style="width:${Math.round((v.onb.done.length / total) * 100)}%"></span></div>
        <div class="small muted">${v.onb.done.length} of ${total} steps done</div>
        ${stepList(true)}`;
    }

    if (v.onb.status === 'reversed') {
      return `${head}
        <p class="small muted" style="margin-top:6px">Onboarding was reversed when the role was cancelled. No accounts or hardware remain active.</p>`;
    }

    // Not started
    if (!v.vettingComplete) {
      return `${head}
        <div class="banner warn" style="margin-top:12px">
          <div><strong>Vetting is not complete yet</strong>
          <div class="small" style="margin-top:4px">${v.vetDone} of ${v.vetTotal} checks cleared. Onboarding unlocks when every check is complete.</div></div>
        </div>
        <label class="field-label" for="family-select" style="margin-top:14px">Job family</label>
        <select class="field" disabled><option>Available after vetting</option></select>
        <button class="btn btn-block" style="margin-top:12px" disabled>Start onboarding</button>
        <button class="btn btn-ghost btn-block" style="margin-top:8px" data-demo-vetting="${h.id}">Demo: mark vetting complete</button>
        <p class="small muted" style="margin-top:6px">Demo override. Marks every check as cleared and notifies you.</p>`;
    }

    const fam = JOB_FAMILIES.find((f) => f.id === v.family);
    return `${head}
      <div class="banner info" style="margin-top:12px">
        <div><strong>Vetting is complete</strong>
        <div class="small" style="margin-top:4px">Choose a job family. Access packs for that family are then granted automatically.</div></div>
      </div>
      <label class="field-label" for="family-select" style="margin-top:14px">Job family</label>
      <select class="field" id="family-select" data-hire="${h.id}">
        <option value="">Choose a job family</option>
        ${JOB_FAMILIES.map((f) => `<option value="${f.id}" ${f.id === v.family ? 'selected' : ''}>${esc(f.name)} (${esc(f.band)})</option>`).join('')}
      </select>
      ${fam ? `
        <div class="packs">
          ${fam.packs.map((pid) => {
            const p = ACCESS_PACKS[pid];
            return `<div class="pack">
              <div class="spread"><strong>${esc(p.name)}</strong>
                <span class="pill ${p.approval ? 'amber' : 'green'}">${p.approval ? 'Needs approval' : 'Automatic'}</span></div>
              <div class="small muted">${p.items.map(esc).join(' · ')}</div>
            </div>`;
          }).join('')}
        </div>` : ''}
      <button class="btn btn-block" style="margin-top:14px" id="start-onb" data-hire="${h.id}" ${fam ? '' : 'disabled'}>
        Start onboarding
      </button>
      <p class="small muted" style="margin-top:8px">Runs ${total} automated steps: identity, mailbox, access, equipment, building pass, learning and notifications.</p>`;
  }

  function reverseList(v) {
    return `<ul class="tips" style="margin-top:10px">${reversePlan(v.id).map((l) => `<li>${esc(l)}</li>`).join('')}</ul>`;
  }

  // Cancelling a role: the bank's version (call first, then reverse) and the hire's withdrawal
  // Free text: why the hire is leaving. Needed before the role is cancelled, so the record is complete.
  function exitBox(v) {
    const saved = v.cancel && v.cancel.exitNote ? v.cancel.exitNote : '';
    const fromHire = v.cancel && v.cancel.by === 'hire' && v.cancel.reason ? '<p class="small muted" style="margin-top:6px">They said: "' + esc(v.cancel.reason) + '"</p>' : '';
    return `
      <label class="field-label" for="exit-note" style="margin-top:14px">Why are they leaving?</label>
      <textarea class="field" id="exit-note" rows="3" placeholder="The reason, in plain words. Required before the role is cancelled.">${esc(saved)}</textarea>
      ${fromHire}`;
  }

  function cancelCard(v) {
    const c = v.cancel;
    const first = v.name.split(' ')[0];
    if (c && c.status === 'reversed') {
      return `
        <div class="spread"><h2>Role cancelled</h2><span class="pill grey">Reversed ${fmtShort(dt(c.reversedOn))}</span></div>
        <p class="small muted" style="margin-top:8px">${c.by === 'hire' ? esc(first) + ' withdrew from the role.' : 'The role was no longer available.'} These actions were reversed:</p>
        ${c.exitNote ? `<div class="info-row" style="margin-top:12px"><span class="muted small">Why they left</span><span>${esc(c.exitNote)}</span></div>` : ''}
        <ul class="tips" style="margin-top:10px">${c.log.map((l) => `<li>${esc(l)}</li>`).join('')}</ul>`;
    }
    if (c && c.status === 'open' && c.by === 'hire') {
      return `
        <div class="spread"><h2>Withdrawal received</h2><span class="pill red">${esc(first)} withdrew</span></div>
        <p class="small muted" style="margin-top:8px">${c.reason ? '"' + esc(c.reason) + '"' : 'No reason was given.'}</p>
        <p class="small" style="margin-top:8px">Reverse their laptop, equipment and accounts to close the role. This will:</p>
        ${reverseList(v)}
        ${exitBox(v)}
        <button class="btn btn-block" style="margin-top:12px;background:var(--red);border-color:var(--red)" data-cancel-reverse="${v.id}">Cancel role and reverse actions</button>`;
    }
    if (c && c.status === 'open' && c.by === 'manager') {
      const callStep = c.callBooked
        ? `<div class="banner info">${svg('phone')}<div><strong>Call booked with ${esc(first)} for ${fmtShort(dt(c.callBooked))}</strong>
             <div class="small" style="margin-top:4px">Tell them the role is no longer available, and check they are OK.</div></div></div>
           ${c.callDone ? '' : `<button class="btn btn-ghost btn-block" style="margin-top:10px" data-cancel-done="${v.id}">I have spoken to ${esc(first)}</button>`}`
        : `<p class="small muted">Book a call to break the news before anything is reversed.</p>
           <button class="btn btn-ghost btn-block" style="margin-top:10px" data-cancel-call="${v.id}">Book call with ${esc(first)}</button>`;
      return `
        <div class="spread"><h2>Role no longer available</h2><span class="pill red">In progress</span></div>
        <div style="margin-top:12px">${callStep}</div>
        <p class="small" style="margin-top:14px">Cancelling will reverse:</p>
        ${reverseList(v)}
        ${exitBox(v)}
        <button class="btn btn-block" style="margin-top:12px;background:var(--red);border-color:var(--red)" data-cancel-reverse="${v.id}" ${c.callDone ? '' : 'disabled'}>
          Cancel role and reverse actions
        </button>
        ${c.callDone ? '' : '<p class="small muted" style="margin-top:6px">Available once the call has taken place.</p>'}`;
    }
    return `
      <div class="spread"><h2>Role changes</h2></div>
      <p class="small muted" style="margin-top:8px">If the role is no longer available, book a call to tell ${esc(first)}. Then cancel the role here, which reverses any laptop, equipment and account set-up.</p>
      <button class="btn btn-ghost btn-block" style="margin-top:12px" data-cancel-start="${v.id}">Role no longer available</button>`;
  }

  function dateValue(d) {
    const p = (n) => String(n).padStart(2, '0');
    return d.getFullYear() + '-' + p(d.getMonth() + 1) + '-' + p(d.getDate());
  }

  // Start date: moving it updates the hire's dates and tells them, their buddy and onboarding
  function startCard(v) {
    const first = v.name.split(' ')[0];
    const sh = SHARED.get(v.id);
    const flags = [sh.oneToOne ? 'the Week 1 one-to-one' : '', sh.goalMeeting ? 'the goal-setting check-in' : ''].filter(Boolean);
    return `
      <div class="spread"><h2>Start date</h2><span class="pill grey">${fmtShort(v.startDate)}</span></div>
      <p class="small muted" style="margin-top:6px">Moving the date updates the contract window, delivery dates and Day 1 plan, and tells ${esc(first)}, their buddy and onboarding.${flags.length ? ' ' + esc(flags.join(' and ')) + ' stay booked, so re-confirm them.' : ''}</p>
      <label class="field-label" for="new-start-${v.id}" style="margin-top:10px">New start date</label>
      <input class="field" type="date" id="new-start-${v.id}" value="${dateValue(v.startDate)}" />
      <button class="btn btn-ghost btn-block" style="margin-top:10px" data-move-start="${v.id}">Move start date</button>`;
  }

  // ID badge and welcome pack
  function packCard(v) {
    const sh = SHARED.get(v.id);
    const badge = sh.badge;
    const badgeLine = !badge ? '<span class="pill grey">Not requested</span>'
      : badge.status === 'requested' ? '<span class="pill amber">Requested</span>' : '<span class="pill green">Issued</span>';
    const buttons = !badge ? `<button class="btn btn-sm" data-badge-request="${v.id}">Request ID badge</button>`
      : badge.status === 'requested' ? `<button class="btn btn-sm" data-badge-issue="${v.id}">Mark badge issued</button>` : '';
    const pack = sh.goals && sh.goals.items ? '<span class="pill green">Sent, goals set</span>' : '<span class="pill grey">Opens when goals are set</span>';
    return `
      <div class="spread"><h2>Badge and welcome pack</h2></div>
      <div class="info-list" style="margin-top:10px">
        <div class="info-row"><span class="muted small">ID badge</span><span>${badgeLine}</span></div>
        <div class="info-row"><span class="muted small">Welcome pack</span><span>${pack}</span></div>
      </div>
      <div style="margin-top:10px">${buttons}</div>`;
  }

  // Wellbeing and the Day 30 check-in, with the support plan when one exists
  function riskCard(v) {
    const sh = SHARED.get(v.id);
    const level = sh.riskLevel || 'green';
    const reasons = sh.riskReasons || [];
    const plan = sh.supportPlan;
    const pill = level === 'red' ? ['Support now', 'red'] : level === 'amber' ? ['Early support', 'amber'] : ['On track', 'green'];
    const rv = sh.review;
    return `
      <div class="spread"><h2>Wellbeing and Day 30</h2><span class="pill ${pill[1]}">${pill[0]}</span></div>
      <p class="small muted" style="margin-top:6px">${reasons.length ? esc(reasons.join('. ')) + '.' : 'Nothing needs attention right now. Day 20 and the Day 30 check-in are watched automatically.'}</p>
      ${rv ? `<div class="info-row" style="margin-top:10px"><span class="muted small">Day 30 check-in</span><span class="pill ${rv.tone === 'red' ? 'red' : rv.tone === 'amber' ? 'amber' : 'green'}">${rv.tone === 'red' ? 'Red' : rv.tone === 'amber' ? 'Amber' : 'Green'}</span></div>` : ''}
      ${plan ? `<strong style="display:block;margin-top:12px">Support plan</strong><ul class="tips" style="margin-top:6px">${plan.actions.map((a) => `<li>${esc(a)}</li>`).join('')}</ul>` : ''}`;
  }

  // Out of office and cover, shown on the dashboard
  function awayCard() {
    const a = managerAway();
    if (a.away) {
      return `<div class="banner info">${svg('people')}<div><strong>You are out of office${a.until ? ' until ' + fmtShort(new Date(a.until)) : ''}</strong>
        <div class="small" style="margin-top:4px">Cover: ${esc(a.cover || 'not set')}. Alerts raised while you are away are tagged for cover.</div>
        <button class="btn btn-ghost btn-sm" style="margin-top:8px" data-ooo-back="1">I am back</button></div></div>`;
    }
    const others = DEMO.team.filter((m) => m.name !== MANAGER_ME.name);
    return `
      <div class="card">
        <div class="spread"><h2>Out of office</h2></div>
        <p class="small muted" style="margin-top:4px">Set a cover person for when you are away. Alerts raised while you are out are tagged for them.</p>
        <div class="row" style="margin-top:10px;gap:12px;align-items:flex-end">
          <div style="flex:1;min-width:160px"><label class="field-label" for="ooo-until">Back on</label><input class="field" type="date" id="ooo-until" value="${dateValue(new Date(2026, 10, 16))}" /></div>
          <div style="flex:1;min-width:160px"><label class="field-label" for="ooo-cover">Cover</label>
            <select class="field" id="ooo-cover">${others.map((m) => `<option>${esc(m.name)}</option>`).join('')}</select></div>
          <button class="btn btn-sm" data-ooo-set="1">Set out of office</button>
        </div>
      </div>`;
  }

  // Latest weekly check-in, with the traffic light and anything the hire asked for
  function checkinCard(v) {
    const list = (SHARED.get(v.id).checkins || []);
    const first = v.name.split(' ')[0];
    if (!list.length) {
      return `<div class="spread"><h2>Weekly check-in</h2><span class="pill grey">None yet</span></div>
        <p class="small muted" style="margin-top:8px">${esc(first)}'s weekly check-in opens on Day 1.</p>
        <button class="btn btn-ghost btn-sm" style="margin-top:10px" data-sample-checkins="${v.id}">Demo: add sample weeks</button>`;
    }
    const c = list[list.length - 1];
    const moodLabel = MOOD_OPTIONS.find((m) => m.id === c.mood).label;
    const pillTone = c.tone === 'red' ? 'red' : c.tone === 'amber' ? 'amber' : 'green';
    const asks = [
      c.find === 'yes' ? 'Having trouble finding things' : '',
      c.raise === 'buddy' ? 'Wants to talk to their buddy' : '',
      c.raise === 'manager' ? 'Wants to talk to you' : '',
    ].filter(Boolean);
    return `
      <div class="spread"><h2>Weekly check-in</h2><span class="pill ${pillTone}">${c.tone === 'red' ? 'Red' : c.tone === 'amber' ? 'Amber' : 'Green'} · week ${c.week}</span></div>
      <div class="info-list" style="margin-top:10px">
        <div class="info-row"><span class="muted small">Mood</span><span>${esc(moodLabel)}</span></div>
        <div class="info-row"><span class="muted small">Raised</span><span>${asks.length ? esc(asks.join('. ')) : 'Nothing'}</span></div>
        ${c.note ? `<div class="info-row"><span class="muted small">Note</span><span>${esc(c.note)}</span></div>` : ''}
      </div>
      <p class="small muted" style="margin-top:8px">${list.length} check-in${list.length === 1 ? '' : 's'} so far.</p>
      <div style="margin-top:10px">${moodStrip(list)}</div>`;
  }

  // Day 30 to 90: monthly one-to-one, the hire's Workday and HR checks, and the teething issues check-in
  function after30Card(v) {
    const sh = SHARED.get(v.id);
    const first = v.name.split(' ')[0];
    const p = monthPeriod(v.id);
    if (!p) {
      return `<div class="spread"><h2>Day 30 to 90</h2><span class="pill grey">From Day 30</span></div>
        <p class="small muted" style="margin-top:8px">Monthly one-to-ones, system checks and the teething issues check-in start after ${esc(first)}'s first 30 days.</p>`;
    }
    const m2 = sh.m2 || {};
    const m3 = sh.m3;
    const sysPill = (state) => state === 'ok' ? '<span class="pill green">Can get in</span>'
      : state === 'problem' ? '<span class="pill red">Needs help</span>' : '<span class="pill grey">Not checked yet</span>';
    const booked = (sh.monthly || {})[p];
    return `
      <div class="spread"><h2>Day 30 to 90</h2><span class="pill grey">Day ${p * 30} to ${(p + 1) * 30}</span></div>
      <div style="margin-top:12px"><strong>Monthly one-to-one</strong></div>
      <div style="margin-top:6px">${booked
        ? `<span class="pill green">Booked ${fmtShort(new Date(booked))}</span>`
        : `<p class="small muted">Book this month's one-to-one. ${esc(first)} is told straight away.</p>
           <button class="btn btn-sm" style="margin-top:10px" data-book-monthly="${v.id}">Book monthly one-to-one</button>`}</div>
      <div class="info-list" style="margin-top:12px">
        <div class="info-row"><span class="muted small">Workday</span><span>${sysPill(m2.workday)}</span></div>
        <div class="info-row"><span class="muted small">HR</span><span>${sysPill(m2.hr)}</span></div>
        <div class="info-row"><span class="muted small">Teething issues (Day 60 to 90)</span><span>${m3
          ? `<span class="pill ${m3.tone === 'red' ? 'red' : m3.tone === 'amber' ? 'amber' : 'green'}">${m3.tone === 'red' ? 'Something to raise' : m3.tone === 'amber' ? 'A few issues' : 'None'}</span>`
          : '<span class="pill grey">Not answered yet</span>'}</span></div>
        ${m3 && m3.raiseNote ? `<div class="info-row"><span class="muted small">Wants to raise</span><span>${esc(m3.raiseNote)}</span></div>` : ''}
        ${m3 && m3.issuesNote ? `<div class="info-row"><span class="muted small">Issues</span><span>${esc(m3.issuesNote)}</span></div>` : ''}
      </div>`;
  }

  // First 30 days progress as seen by the manager (the hire does the tasks, the manager books the 1-1)
  function first30Card(v) {
    const sh = SHARED.get(v.id);
    const videos = Object.keys(sh.videos || {}).length;
    const intros = Object.keys(sh.intros || {}).length;
    const comms = (sh.communities || []).length;
    const accItems = accessItems(v.id);
    const accDone = accItems.filter((i) => (sh.access || {})[i.key] === 'verified').length;
    const first = v.name.split(' ')[0];
    const oneToOne = sh.oneToOne
      ? `<span class="pill green">Booked ${fmtShort(new Date(sh.oneToOne.when))}</span>
         <p class="small muted" style="margin-top:6px">${esc(first)} has been told. Teams, with you.</p>`
      : `<p class="small muted">Book the Week 1 one-to-one. ${esc(first)} is notified straight away.</p>
         <button class="btn btn-sm" style="margin-top:10px" data-book-one="${v.id}">Book Week 1 one-to-one</button>`;
    return `
      <div class="spread"><h2>First 30 days</h2><span class="pill ${sh.benefits ? 'green' : 'grey'}">${sh.benefits ? 'Benefits chosen' : 'Benefits not chosen'}</span></div>
      <div class="info-list" style="margin-top:10px">
        <div class="info-row"><span class="muted small">Training videos watched</span><span>${videos} of ${TRAINING_VIDEOS.length}</span></div>
        <div class="info-row"><span class="muted small">Team intro calls booked</span><span>${intros} of ${TEAM_INTROS.length}</span></div>
        <div class="info-row"><span class="muted small">Community pages joined</span><span>${comms}</span></div>
        <div class="info-row"><span class="muted small">System access confirmed</span><span>${accItems.length ? accDone + ' of ' + accItems.length : 'Set job family first'}</span></div>
      </div>
      <div style="margin-top:14px"><strong>Week 1 one-to-one</strong></div>
      <div style="margin-top:6px">${oneToOne}</div>
      <div style="margin-top:14px"><strong>Goal-setting check-in</strong></div>
      <div style="margin-top:6px">${sh.goalMeeting
        ? `<span class="pill green">Booked ${fmtShort(new Date(sh.goalMeeting.when))}</span>
           ${sh.goals && sh.goals.items ? `<ul class="tips" style="margin-top:8px">${sh.goals.items.map((g) => `<li>${esc(g)}</li>`).join('')}</ul>` : '<p class="small muted" style="margin-top:6px">Goals not set yet.</p>'}`
        : `<p class="small muted">Book the goal-setting check-in with ${esc(first)} for their first 30 days.</p>
           <button class="btn btn-sm" style="margin-top:10px" data-book-goals="${v.id}">Book goal-setting check-in</button>`}</div>`;
  }

  function homeKitCard(v) {
    if (!v.contractSigned) {
      return `<h2>Home equipment</h2><p class="small muted" style="margin-top:8px">Opens once the contract is signed.</p>`;
    }
    const o = v.homeOrder;
    if (!o) {
      return `<div class="spread"><h2>Home equipment</h2><span class="pill grey">Not ordered yet</span></div>
        <p class="small muted" style="margin-top:8px">${esc(v.name.split(' ')[0])} has signed and can now order a monitor, desk, chair and cables.</p>`;
    }
    const delivery = HOME_DELIVERY.find((d) => d.id === o.delivery);
    const denied = !!o.denied;
    const needsApproval = o.overBy > 0 && !o.approved && !denied;
    const lines = Object.keys(o.items).map((id) => {
      const k = HOME_KIT.find((x) => x.id === id);
      return `<div class="info-row"><span>${o.items[id]} × ${esc(k.name)}</span><span>${money(k.price * o.items[id])}</span></div>`;
    }).join('');
    return `
      <div class="spread"><h2>Home equipment</h2>
        <span class="pill ${denied ? 'red' : needsApproval ? 'amber' : 'green'}">${denied ? 'Denied' : needsApproval ? 'Needs your approval' : 'Ordered'}</span></div>
      <div class="info-list" style="margin-top:8px">
        ${lines}
        <div class="info-row"><strong>Total</strong><strong>${money(o.total)} <span class="small muted">of ${money(HOME_KIT_ALLOWANCE)} allowance</span></strong></div>
        <div class="info-row"><span class="muted small">Delivery</span><span>${esc(delivery.label)}, ${esc(deliveryNote(delivery, v.id))}</span></div>
      </div>
      ${needsApproval ? `
        <div class="banner warn" style="margin-top:12px"><div>${money(o.overBy)} is over the allowance. Approve it to place the order.</div></div>
        <div class="row" style="margin-top:12px">
          <button class="btn btn-sm" data-kit-approve="${v.id}">Approve ${money(o.overBy)} over allowance</button>
          <button class="btn btn-ghost btn-sm" data-kit-deny="${v.id}">Deny</button>
        </div>` : ''}
      ${denied ? `<div class="banner alert" style="margin-top:12px"><div>You denied the ${money(o.overBy)} over the allowance. ${esc(v.name.split(' ')[0])} has been asked to change the order. Nothing has been ordered.</div></div>` : ''}`;
  }

  function deviceCard(v) {
    if (!v.vettingComplete) {
      return `<h2>Device</h2><p class="small muted" style="margin-top:8px">The device choice opens once vetting is complete.</p>`;
    }
    const d = v.device;
    if (!d) {
      return `<div class="spread"><h2>Device</h2><span class="pill grey">Not chosen yet</span></div>
        <p class="small muted" style="margin-top:8px">${esc(v.name.split(' ')[0])} picks a laptop in their app. Options depend on their job family.</p>`;
    }
    const cat = DEVICES[d.os];
    const spec = d.dev ? cat.dev : cat;
    const pill = {
      chosen: ['Standard build chosen', 'green'],
      requested: ['Developer build requested', 'amber'],
      approved: ['Developer build approved', 'green'],
      declined: ['Developer build declined', 'grey'],
    }[d.status] || ['Chosen', 'green'];
    return `
      <div class="spread"><h2>Device</h2><span class="pill ${pill[1]}">${pill[0]}</span></div>
      <div class="pack" style="margin-top:12px">
        <div class="spread"><strong>${esc(spec.name)}</strong><span class="pill grey">${esc(d.os === 'mac' ? 'macOS' : 'Windows')}</span></div>
        <div class="small muted">${esc(spec.spec)}</div>
      </div>
      ${d.status === 'requested' ? `
        <div class="row" style="margin-top:12px">
          <button class="btn btn-sm" data-dev-action="approve" data-hire="${v.id}">Approve developer build</button>
          <button class="btn btn-ghost btn-sm" data-dev-action="decline" data-hire="${v.id}">Decline</button>
        </div>` : ''}`;
  }

  function requestRow(r, h) {
    const [label, tone] = REQ_LABEL[r.status] || REQ_LABEL.open;
    const action = r.status === 'open'
      ? `<button class="btn btn-ghost btn-sm" data-req="${r.id}" data-hire="${h.id}" data-next="booked">Book call</button>`
      : r.status === 'booked'
        ? `<button class="btn btn-ghost btn-sm" data-req="${r.id}" data-hire="${h.id}" data-next="done">Mark done</button>`
        : '';
    const when = r.status === 'booked' && r.when ? `Booked for ${fmtShort(dt(r.when))}` : `Raised ${fmtShort(dt(r.raisedOn))}`;
    return `
      <div class="req-row">
        <div class="req-body">
          <strong>${esc(r.title)}</strong>
          <div class="small muted">${when}${r.auto ? ' · raised automatically because a check slipped' : ''}</div>
        </div>
        <div class="row" style="gap:8px">
          <span class="pill ${tone}">${label}</span>
          ${action}
        </div>
      </div>`;
  }

  function messagesCard(v) {
    const bubbles = v.messages.map((m) => {
      const mine = m.from === 'manager';
      const who = mine ? MANAGER_ME.name : m.from === 'hr' ? (m.name || 'HR') : v.name;
      return `<div class="bubble ${mine ? 'mine' : ''}">
        <div class="small muted">${esc(who)} · ${fmtShort(dt(m.time))}</div>
        <div>${esc(m.text)}</div>
      </div>`;
    }).join('');
    return `
      <div class="thread">${bubbles || '<p class="muted small">No messages yet.</p>'}</div>
      <form class="reply" id="reply-form" data-hire="${v.id}">
        <label class="sr-only" for="reply-text">Reply to ${esc(v.name)}</label>
        <textarea id="reply-text" name="text" rows="2" placeholder="Write a reply to ${esc(v.name.split(' ')[0])}" required></textarea>
        <button class="btn btn-sm" type="submit">Send</button>
      </form>`;
  }

  function renderHire(id) {
    const h = HIRES.find((x) => x.id === id);
    if (h) { checkRisk(h.id); checkMonthly(h.id); }
    if (!h) return `${crumbs([{ label: 'New hires', href: '#/' }, { label: 'Not found' }])}<p class="muted">We could not find that hire.</p>`;
    // Opening the chat clears its unread badge
    CHAT.markRead(h.id, 'manager');
    // Back-fill: hires onboarded before the notify step existed still tell their buddy
    if (((overrides[h.id] && overrides[h.id].onb) || (SHARED.get(h.id).onb || {})).status === 'complete') notifyOnboardingDone(h.id);
    const v = view(h);
    const pct = progressFor(v);
    const stage = HIRE_STAGES[v.stageIndex] || HIRE_STAGES[0];
    return `
      ${crumbs([{ label: 'New hires', href: '#/' }, { label: v.name }])}

      <div class="card hire-head" style="margin-top:10px">
        <div class="hire-top">
          <span class="avatar lg">${esc(v.initials)}</span>
          <div class="person-meta">
            <strong style="font-size:1.25rem">${esc(v.name)}</strong>
            <span>${esc(v.title)} · ${esc(v.team)}</span>
            <span>${esc(v.location)} · Starts ${fmtLong(v.startDate)}</span>
          </div>
          <span class="pill">${esc(stage.label)}</span>
        </div>
        <div class="progress-row" style="margin-top:14px">
          <div class="progress"><span style="width:${pct}%"></span></div>
          <strong class="small">${pct}%</strong>
        </div>
        <div class="next-step" style="margin-top:12px"><span class="eyebrow">What's next</span> ${esc(v.nextStep)}</div>
      </div>

      <div class="grid two" style="margin-top:16px">
        <div class="stack">
          <div class="card" id="onb-card">${onbCard(h)}</div>
          <div class="card">${deviceCard(v)}</div>
          <div class="card">${homeKitCard(v)}</div>
          <div class="card">${cancelCard(v)}</div>
          <div class="card">${first30Card(v)}</div>
          <div class="card">${after30Card(v)}</div>
          <div class="card">${checkinCard(v)}</div>
          <div class="card">${riskCard(v)}</div>
          <div class="card">${startCard(v)}</div>
          <div class="card">${packCard(v)}</div>
          <div class="card">
            <div class="spread"><h2>Vetting</h2><span class="pill ${vetTone(v)}">${v.vetDone} of ${v.vetTotal} cleared</span></div>
            <div style="margin-top:12px">${vettingList(v)}</div>
          </div>
        </div>

        <div class="stack">
          <div class="card">
            <h2>Journey</h2>
            <div style="margin-top:14px">${journey(v)}</div>
          </div>
          <div class="card">
            <div class="spread"><h2>Call requests</h2>
              <button class="btn btn-ghost btn-sm" data-request-call="${v.id}">${svg('phone').replace('<svg', '<svg class="ico"')} Ask for a call</button>
            </div>
            <div style="margin-top:8px">
              ${v.requests.length ? v.requests.map((r) => requestRow(r, v)).join('') : '<p class="muted small">No call requests.</p>'}
            </div>
          </div>
          <div class="card">
            <div class="spread"><h2>Messages</h2><span class="small muted">${v.email}</span></div>
            <div style="margin-top:12px">${messagesCard(v)}</div>
          </div>
        </div>
      </div>`;
  }

  function renderRequests() {
    const vs = HIRES.map(view);
    const allReqs = vs.flatMap((v) => v.requests.map((r) => ({ r, v })));
    const open = allReqs.filter(({ r }) => r.status !== 'done');
    const withMessages = vs.filter((v) => v.messages.length).sort((a, b) => b.unread - a.unread);
    return `
      <div class="stack" style="gap:6px">
        <p class="eyebrow">Calls and messages</p>
        <h1>What needs you</h1>
        <p class="muted">Call requests from your hires and vetting team, and their latest messages.</p>
      </div>

      <div class="section-head"><h2>Call requests</h2><span class="pill ${open.length ? 'red' : 'green'}">${open.length} open</span></div>
      <div class="card">
        ${allReqs.length ? allReqs.map(({ r, v }) => `
          <div class="req-hire"><a href="#/hire/${v.id}"><strong>${esc(v.name)}</strong></a></div>
          ${requestRow(r, v)}`).join('') : '<p class="muted">No call requests.</p>'}
      </div>

      <div class="section-head"><h2>Messages</h2></div>
      <div class="stack">
        ${withMessages.map((v) => {
          const last = v.messages[v.messages.length - 1];
          // (last message text is shown as a snippet)
          return `<a class="card msg-row" href="#/hire/${v.id}">
            <span class="avatar">${esc(v.initials)}</span>
            <div class="person-meta" style="flex:1;min-width:0">
              <strong>${esc(v.name)}</strong>
              <span class="snippet">${esc(last.text)}</span>
            </div>
            ${v.unread ? `<span class="pill amber">${plural(v.unread, 'new')}</span>` : '<span class="pill grey">Read</span>'}
          </a>`;
        }).join('')}
      </div>`;
  }

  function alertTone(type) {
    if (type === 'vetting' || type === 'onboarding' || type === 'contract' || type === 'ready' || type === 'benefits') return 'green';
    if (type === 'withdrawal' || type === 'cancelled') return 'red';
    if (type === 'message' || type === 'access') return 'amber';
    if (type === 'goals' || type === 'badge' || type === 'pack' || type === 'review') return 'green';
    if (type === 'startdate') return 'amber';
    return 'red'; // call, device, kit: something needs a decision
  }

  function alertRow(n) {
    return `
      <div class="alert-row ${n.read ? '' : 'unread'}">
        <span class="rag rag-${n.tone || alertTone(n.type)}"></span>
        <div class="alert-body">
          <a href="${esc(n.link)}" data-alert="${n.id}" class="alert-title">${esc(n.title)}</a>
          <div class="small muted">${esc(n.text)} · ${fmtShort(new Date(n.time))}${n.cover ? ' · For cover: ' + esc(n.cover) : ''}</div>
        </div>
        ${n.read ? '' : '<span class="pill amber">New</span>'}
      </div>`;
  }

  function renderAlerts() {
    const list = NOTIFY.list('manager');
    const unread = list.filter((n) => !n.read).length;
    return `
      <div class="stack" style="gap:6px">
        <p class="eyebrow">Alerts</p>
        <h1>Notifications</h1>
        <p class="muted">Things that need you, from your new starters and the onboarding team.</p>
      </div>
      <div class="row" style="margin-top:16px;justify-content:space-between">
        <span class="pill ${unread ? 'amber' : 'green'}">${unread} unread</span>
        ${unread ? '<button class="btn btn-ghost btn-sm" id="alerts-read">Mark all as read</button>' : ''}
      </div>
      <div class="card" style="margin-top:12px">
        ${list.length ? list.map(alertRow).join('') : '<p class="muted">No alerts yet.</p>'}
      </div>`;
  }

  // ---------- Manager to-do list ----------
  // Worked out from the state of each hire, so an item disappears as soon as it is done.
  function managerTodos() {
    const out = [];
    HIRES.map(view).forEach((v) => {
      const sh = SHARED.get(v.id);
      const first = v.name.split(' ')[0];
      const add = (tone, text) => out.push({ tone: tone, text: text, name: v.name, hireId: v.id, initials: v.initials, title: v.title, href: '#/hire/' + v.id });
      const c = v.cancel;
      if (c && c.status === 'reversed') return; // role cancelled, nothing left to do
      if (c && c.status === 'open') {
        if (c.by === 'hire') add('red', 'Reverse set-up and close the role: ' + first + ' has withdrawn');
        else if (!c.callBooked) add('red', 'Book the call to tell ' + first + ' the role is no longer available');
        else if (!c.callDone) add('amber', 'Confirm you have spoken to ' + first + ' about the role');
        else add('red', 'Cancel the role and reverse ' + first + "'s set-up");
        return;
      }
      if ((sh.riskLevel || 'green') !== 'green') add(sh.riskLevel, 'Go through the support plan with ' + first);
      v.requests.forEach((r) => {
        if (r.status === 'open') add('red', 'Book a call back with ' + first);
        if (r.status === 'booked') add('amber', 'Call ' + first + ' (call booked)');
      });
      if (v.unread) add('amber', 'Reply to ' + first + ' (' + plural(v.unread, 'new message') + ')');
      if (v.vettingComplete && v.onb.status === 'idle') add('amber', v.family ? 'Start onboarding for ' + first : 'Set the job family for ' + first);
      if (v.devRequested) add('amber', 'Approve or decline the developer build for ' + first);
      if (v.homeOrder && v.homeOrder.overBy > 0 && !v.homeOrder.approved && !v.homeOrder.denied) add('amber', 'Approve or deny the home equipment order for ' + first);
      // After Day 30: the monthly one-to-one, and anything the hire flagged in their checks
      const period = monthPeriod(v.id);
      if (period && !(sh.monthly || {})[period]) add('amber', "Book this month's one-to-one with " + first);
      const m2 = sh.m2 || {};
      if (m2.workday === 'problem') add('amber', 'Help ' + first + ' get into Workday');
      if (m2.hr === 'problem') add('amber', 'Help ' + first + ' get into HR');
      if (sh.m3 && sh.m3.tone !== 'green') add(sh.m3.tone, sh.m3.raise === 'yes' ? 'Talk to ' + first + ': they have something to raise' : 'Check in with ' + first + ' about their teething issues');
      if (!sh.oneToOne) add(v.vettingComplete ? 'amber' : 'green', 'Book the Week 1 one-to-one with ' + first);
      if (!sh.goalMeeting) add(v.vettingComplete ? 'amber' : 'green', 'Book the goal-setting check-in with ' + first);
      if (!sh.badge) add(v.vettingComplete ? 'amber' : 'green', 'Request the ID badge for ' + first);
      else if (sh.badge.status === 'requested') add('green', 'Mark the ID badge as issued for ' + first);
    });
    const order = { red: 0, amber: 1, green: 2 };
    return out.sort((a, b) => order[a.tone] - order[b.tone]);
  }

  function todoRow(t, hideName) {
    return `
      <a class="alert-row todo-link" href="${t.href}">
        <span class="rag rag-${t.tone}"></span>
        <div class="alert-body"><strong>${esc(t.text)}</strong>${hideName === true ? '' : `<span class="small muted">${esc(t.name)}</span>`}</div>
        <span class="pill ${t.tone === 'red' ? 'red' : t.tone === 'amber' ? 'amber' : 'green'}">${t.tone === 'red' ? 'Do now' : t.tone === 'amber' ? 'This week' : 'When ready'}</span>
      </a>`;
  }

  // Which urgency the to-do page is filtered to: 'all', 'red', 'amber' or 'green'
  let todoFilter = 'all';

  function renderTodos() {
    const allTodos = managerTodos();
    const todos = todoFilter === 'all' ? allTodos : allTodos.filter((t) => t.tone === todoFilter);
    const countOf = (tone) => allTodos.filter((t) => t.tone === tone).length;
    const filterBtn = (key, label, tone) => `
      <button type="button" class="filter-btn ${todoFilter === key ? 'on' : ''}" data-todo-filter="${key}" aria-pressed="${todoFilter === key}">
        ${tone ? `<i class="rag rag-${tone}"></i>` : ''}${label} <span class="small muted">${key === 'all' ? allTodos.length : countOf(key)}</span>
      </button>`;
    // One section per colleague. Colleagues with the most urgent items come first.
    const ids = [];
    todos.forEach((t) => { if (!ids.includes(t.hireId)) ids.push(t.hireId); });
    const byColleague = ids.map((id) => {
      const items = todos.filter((t) => t.hireId === id);
      const worst = items[0].tone; // items are already sorted red, amber, green
      const counts = ['red', 'amber', 'green'].map((tone) => {
        const n = items.filter((t) => t.tone === tone).length;
        return n ? `<span class="pill ${tone}">${n} ${tone === 'red' ? 'do now' : tone === 'amber' ? 'this week' : 'when ready'}</span>` : '';
      }).join('');
      return `
        <div class="section-head">
          <a class="person" href="${items[0].href}" style="text-decoration:none;color:var(--ink)">
            <span class="avatar">${esc(items[0].initials)}</span>
            <span class="person-meta"><strong>${esc(items[0].name)}</strong><span>${esc(items[0].title)}</span></span>
          </a>
          <span class="row" style="gap:6px;justify-content:flex-end" data-worst="${worst}">${counts}</span>
        </div>
        <div class="card">${items.map((t) => todoRow(t, true)).join('')}</div>`;
    }).join('');
    return `
      <div class="stack" style="gap:6px">
        <p class="eyebrow">To do</p>
        <h1>Your to-do list</h1>
        <p class="muted">Everything your new starters need from you. Items clear themselves as soon as they are done.</p>
      </div>
      <div class="card" style="margin-top:16px">
        <div class="filter-row" role="group" aria-label="Filter to-dos by urgency">
          ${filterBtn('all', 'All')}
          ${filterBtn('red', 'Do now', 'red')}
          ${filterBtn('amber', 'This week', 'amber')}
          ${filterBtn('green', 'When ready', 'green')}
        </div>
      </div>
      ${todos.length ? byColleague
        : `<div class="card" style="margin-top:16px"><p>${allTodos.length
            ? 'Nothing in this group. <button class="linkish" data-todo-filter="all">Show all</button>'
            : '<strong>All done.</strong> Nothing needs you right now.'}</p></div>`}`;
  }

  function renderSigninPage() {
    return renderSignin();
  }

  // ---------- Onboarding runner (simulated automation) ----------
  let timer = null;

  // Onboarding state lives in the shared store, so reversals and readiness can see it
  function anyRunning() {
    return HIRES.some((h) => { const o = SHARED.get(h.id).onb; return !!o && o.status === 'running'; });
  }

  function ensureTimer() {
    if (!timer) timer = setInterval(tick, 1400);
  }

  function tick() {
    let changed = false;
    HIRES.forEach((h) => {
      const o = SHARED.get(h.id).onb;
      if (!o || o.status !== 'running') return;
      const next = ONBOARDING_STEPS.find((st) => !o.done.includes(st.key));
      if (next && next.key === 'notify') notifyOnboardingDone(h.id); // buddy, team and the new starter
      const done = next ? o.done.concat(next.key) : o.done;
      const finished = done.length === ONBOARDING_STEPS.length;
      SHARED.update(h.id, {
        onb: Object.assign({}, o, {
          done: done,
          status: finished ? 'complete' : 'running',
          completedOn: finished ? TODAY.toISOString() : o.completedOn,
        }),
      });
      changed = true;
      if (finished) {
        toast(`${h.name}: onboarding complete`);
        NOTIFY.add({ to: 'manager', type: 'onboarding', hireId: h.id, title: 'Onboarding complete: ' + h.name,
          text: 'Accounts, access and equipment orders are set up.', link: '#/hire/' + h.id });
      }
    });
    if (changed) refreshLive();
    if (!anyRunning()) { clearInterval(timer); timer = null; }
  }

  // Update only what changed, so the reply box keeps its text
  function refreshLive() {
    const m = location.hash.match(/^#\/hire\/(.+)$/);
    if (m) {
      const h = HIRES.find((x) => x.id === m[1]);
      const box = $('#onb-card');
      if (h && box) box.innerHTML = onbCard(h);
      return;
    }
    route();
  }

  function startOnboarding(id) {
    const h = HIRES.find((x) => x.id === id);
    const v = view(h);
    if (!v.vettingComplete || !v.family) return;
    SHARED.update(id, { onb: { status: 'running', done: [], startedOn: TODAY.toISOString() } });
    toast(`Onboarding started for ${h.name}`);
    ensureTimer();
    route();
  }

  // ---------- Router ----------
  function route() {
    const raw = location.hash.replace(/^#\/?/, '');
    const [section, id] = raw.split('/');
    renderChrome(section === 'hire' ? '' : section);

    if (!signedIn) {
      $('#app').innerHTML = renderSigninPage();
      return;
    }
    let html;
    if (section === 'hire' && id) html = renderHire(id);
    else if (section === 'requests') html = renderRequests();
    else if (section === 'alerts') html = renderAlerts();
    else if (section === 'todo') html = renderTodos();
    else html = renderDashboard();

    // Keep the scroll position when the same page is re-drawn (a button press), and go to the top on a new page
    const samePage = route.last === raw;
    const keepY = window.scrollY;
    $('#app').innerHTML = html;
    window.scrollTo({ top: samePage ? keepY : 0, behavior: 'instant' });
    route.last = raw;
  }

  // ---------- Events ----------
  document.addEventListener('click', (ev) => {
    const el = ev.target.closest('button, a');
    if (!el) return;

    if (el.id === 'mgr-sso') {
      signedIn = true; save('signedIn', true);
      location.hash = '#/';
      return route();
    }
    if (el.id === 'mgr-signout' || el.id === 'mgr-signout-tab') {
      signedIn = false; save('signedIn', false);
      location.hash = '#/';
      return route();
    }
    if (el.id === 'start-onb') {
      return startOnboarding(el.dataset.hire);
    }
    if (el.dataset.moveStart) {
      const id = el.dataset.moveStart;
      const h = HIRES.find((x) => x.id === id);
      const val = $('#new-start-' + id).value;
      if (!val) { toast('Pick a new start date first'); return; }
      const [y, m, d] = val.split('-').map(Number);
      const next = new Date(y, m - 1, d);
      if (dateValue(next) === dateValue(effectiveStart(id))) { toast('That is already the start date'); return; }
      SHARED.update(id, { startDate: next.toISOString(), startMoved: true });
      NOTIFY.add({ to: 'hire', hireId: id, type: 'startdate', title: 'Your start date has moved',
        text: 'Your new start date is ' + fmtLong(next) + '. Your contract window and delivery dates have been updated.', link: '#/home' });
      CHAT.send(id, 'hr', h.name.split(' ')[0] + "'s start date has moved to " + fmtLong(next) + '. Their Day 1 plan has been updated.',
        'Onboarding team', 'buddy');
      toast('Start date moved. ' + h.name.split(' ')[0] + ', their buddy and onboarding have been told');
      return route();
    }
    if (el.dataset.badgeRequest || el.dataset.badgeIssue) {
      const requesting = !!el.dataset.badgeRequest;
      const id = el.dataset.badgeRequest || el.dataset.badgeIssue;
      SHARED.update(id, { badge: { status: requesting ? 'requested' : 'issued', at: TODAY.toISOString() } });
      if (!requesting) NOTIFY.add({ to: 'hire', hireId: id, type: 'badge', title: 'Your ID badge is ready', text: 'Collect it from reception on Day 1.', link: '#/welcome' });
      toast(requesting ? 'ID badge requested' : 'ID badge marked as issued');
      return route();
    }
    if (el.dataset.oooSet) {
      const until = $('#ooo-until').value;
      const cover = $('#ooo-cover').value;
      const [y, m, d] = until.split('-').map(Number);
      SHARED.update('_manager', { away: true, until: new Date(y, m - 1, d).toISOString(), cover: cover });
      toast('Out of office set. Cover: ' + cover);
      return route();
    }
    if (el.dataset.oooBack) {
      SHARED.update('_manager', { away: false, cover: null, until: null });
      toast('Welcome back');
      return route();
    }
    if (el.dataset.bookMonthly) {
      const id = el.dataset.bookMonthly;
      const h = HIRES.find((x) => x.id === id);
      const p = monthPeriod(id);
      const start = effectiveStart(id);
      const when = new Date(start.getFullYear(), start.getMonth(), start.getDate() + (p * 30) + 7, 10, 0); // a week into the month
      SHARED.update(id, { monthly: Object.assign({}, SHARED.get(id).monthly, { [p]: when.toISOString() }) });
      NOTIFY.add({ to: 'hire', hireId: id, type: 'monthly', title: 'Monthly one-to-one booked with ' + MANAGER_ME.name,
        text: fmtLong(when) + ', 10:00, on Teams.', link: '#/next' });
      toast(h.name.split(' ')[0] + ' has been told about the monthly one-to-one');
      return route();
    }
    if (el.dataset.bookGoals) {
      const id = el.dataset.bookGoals;
      const h = HIRES.find((x) => x.id === id);
      const when = new Date(2027, 1, 17, 11, 0); // Wed 17 Feb 2027, 11:00, inside the first 30 days
      SHARED.update(id, { goalMeeting: { when: when.toISOString(), with: MANAGER_ME.name } });
      NOTIFY.add({ to: 'hire', hireId: id, type: 'goals', title: 'Goal-setting check-in booked with ' + MANAGER_ME.name,
        text: fmtLong(when) + ', 11:00, on Teams. Bring your draft goals.', link: '#/goals' });
      toast(h.name.split(' ')[0] + ' has been notified of the goal-setting check-in');
      return route();
    }
    if (el.dataset.bookOne) {
      const id = el.dataset.bookOne;
      const h = HIRES.find((x) => x.id === id);
      const when = new Date(2027, 1, 3, 10, 0); // Wed 3 Feb 2027, 10:00
      SHARED.update(id, { oneToOne: { when: when.toISOString(), with: MANAGER_ME.name, place: 'Teams' } });
      NOTIFY.add({ to: 'hire', hireId: id, type: '1to1', title: 'Week 1 one-to-one booked with ' + MANAGER_ME.name,
        text: fmtLong(when) + ', 10:00, on Teams.', link: '#/first30' });
      toast(h.name.split(' ')[0] + ' has been notified of the one-to-one');
      return route();
    }
    if (el.dataset.cancelStart) {
      SHARED.update(el.dataset.cancelStart, { cancel: { by: 'manager', status: 'open', startedOn: TODAY.toISOString(), callBooked: null, callDone: false } });
      toast('Book a call before cancelling the role');
      return route();
    }
    if (el.dataset.cancelCall) {
      const id = el.dataset.cancelCall;
      const c = SHARED.get(id).cancel || {};
      SHARED.update(id, { cancel: Object.assign({}, c, { callBooked: new Date(2026, 10, 10).toISOString() }) });
      toast('Call booked for tomorrow. The new starter has been told');
      return route();
    }
    if (el.dataset.cancelDone) {
      const id = el.dataset.cancelDone;
      const c = SHARED.get(id).cancel || {};
      SHARED.update(id, { cancel: Object.assign({}, c, { callDone: true }) });
      toast('Call recorded. You can now cancel the role');
      return route();
    }
    if (el.dataset.cancelReverse) {
      const id = el.dataset.cancelReverse;
      const h = HIRES.find((x) => x.id === id);
      const box = $('#exit-note');
      const note = box ? box.value.trim() : '';
      if (!note) {
        toast('Please say why they are leaving before cancelling');
        if (box) box.focus();
        return;
      }
      const c = SHARED.get(id).cancel || {};
      SHARED.update(id, { cancel: Object.assign({}, c, { exitNote: note }) });
      reverseActions(id);
      NOTIFY.add({ to: 'manager', type: 'cancelled', hireId: id, title: 'Role cancelled and reversed: ' + h.name,
        text: 'Laptop, equipment and accounts have been reversed. The log is on the hire page.', link: '#/hire/' + id });
      toast('Role cancelled. Actions reversed');
      return route();
    }
    if (el.dataset.demoVetting) {
      markVettingComplete(el.dataset.demoVetting);
      toast('Vetting marked complete. Start onboarding when ready');
      return route();
    }
    if (el.dataset.alert) {
      NOTIFY.markRead(el.dataset.alert);
      return; // let the link navigate
    }
    if (el.id === 'alerts-read') {
      NOTIFY.markAll('manager');
      toast('All alerts marked as read');
      return route();
    }
    if (el.dataset.todoFilter) {
      todoFilter = el.dataset.todoFilter;
      return route();
    }
    if (el.dataset.sampleCheckins) {
      const sample = [
        { week: 1, mood: 'good', find: 'no', raise: 'none', note: '', tone: 'green' },
        { week: 2, mood: 'okay', find: 'yes', raise: 'buddy', note: '', tone: 'amber' },
        { week: 3, mood: 'poor', find: 'no', raise: 'manager', note: 'Feeling the workload', tone: 'red' },
        { week: 4, mood: 'good', find: 'no', raise: 'none', note: '', tone: 'green' },
      ].map((c) => Object.assign({}, c, { at: TODAY.toISOString() }));
      SHARED.update(el.dataset.sampleCheckins, { checkins: sample });
      toast('Sample check-in weeks added');
      return route();
    }
    if (el.dataset.kitDeny) {
      const id = el.dataset.kitDeny;
      const cur = SHARED.get(id).homeOrder;
      SHARED.update(id, { homeOrder: Object.assign({}, cur, { denied: true, deniedOn: TODAY.toISOString() }) });
      NOTIFY.add({ to: 'hire', hireId: id, type: 'kit', title: 'Your home equipment order was not approved',
        text: 'It is ' + money(cur.overBy) + ' over the ' + money(HOME_KIT_ALLOWANCE) + ' allowance. Change your order to bring it within the allowance.', link: '#/workspace' });
      toast('Order denied. The new starter has been asked to change it');
      return route();
    }
    if (el.dataset.kitApprove) {
      const cur = SHARED.get(el.dataset.kitApprove).homeOrder;
      SHARED.update(el.dataset.kitApprove, { homeOrder: Object.assign({}, cur, { approved: true, approvedOn: TODAY.toISOString() }) });
      toast('Over-allowance equipment approved. Order placed');
      return route();
    }
    if (el.dataset.devAction) {
      // Approve or decline a developer build the employee requested
      const approved = el.dataset.devAction === 'approve';
      const cur = SHARED.get(el.dataset.hire).device || {};
      SHARED.update(el.dataset.hire, {
        device: Object.assign({}, cur, { status: approved ? 'approved' : 'declined', dev: approved, decidedOn: TODAY.toISOString() }),
      });
      toast(approved ? 'Developer build approved' : 'Developer build declined. Standard build will be issued');
      return route();
    }
    if (el.dataset.req) {
      const s = hireState(el.dataset.hire);
      s.reqs = Object.assign({}, s.reqs, { [el.dataset.req]: el.dataset.next });
      if (el.dataset.next === 'booked') {
        // Record the date the call was booked for
        s.bookedWhen = Object.assign({}, s.bookedWhen, { [el.dataset.req]: TODAY.toISOString() });
      }
      persist();
      toast(el.dataset.next === 'booked' ? 'Call booked with the hire' : 'Marked as completed');
      return route();
    }
    if (el.dataset.requestCall) {
      const s = hireState(el.dataset.requestCall);
      s.extraReqs = (s.extraReqs || []).concat({
        id: 'mr' + Date.now(),
        type: 'call',
        title: 'Call requested by manager',
        status: 'open',
        raisedOn: TODAY.toISOString(),
        auto: false,
      });
      persist();
      toast('Call request sent to HR');
      return route();
    }
  });

  document.addEventListener('change', (ev) => {
    const sel = ev.target.closest('#family-select');
    if (!sel) return;
    SHARED.update(sel.dataset.hire, { family: sel.value });
    const h = HIRES.find((x) => x.id === sel.dataset.hire);
    const box = $('#onb-card');
    if (box) box.innerHTML = onbCard(h);
  });

  document.addEventListener('submit', (ev) => {
    const form = ev.target.closest('#reply-form');
    if (!form) return;
    ev.preventDefault();
    const text = form.elements.text.value.trim();
    if (!text) return;
    CHAT.send(form.dataset.hire, 'manager', text, MANAGER_ME.name);
    route();
  });

  // Keep this tab in step when the employee app sends or reads messages
  window.addEventListener('storage', (ev) => {
    if (ev.key !== CHAT.KEY && ev.key !== 'lbg.shared' && ev.key !== NOTIFY.KEY) return;
    if (document.activeElement && document.activeElement.tagName === 'TEXTAREA') return; // don't wipe a draft
    route();
  });

  window.addEventListener('hashchange', route);
  if (anyRunning()) ensureTimer();
  route();
})();
