// Shared state for the employee app and the manager portal (same browser, same origin).
// Holds what both sides must agree on (vetting, job family, device, home kit, contract),
// plus the notification feed for the manager. Every read goes back to localStorage.
const SHARED = (function () {
  const KEY = 'lbg.shared';

  function read() {
    try { return JSON.parse(localStorage.getItem(KEY) || '{}'); } catch (e) { return {}; }
  }

  function get(hireId) {
    return read()[hireId] || {};
  }

  function update(hireId, patch) {
    const s = read();
    s[hireId] = Object.assign({}, s[hireId], patch);
    localStorage.setItem(KEY, JSON.stringify(s));
    if (typeof checkReady === 'function') checkReady(hireId); // Day 1 readiness is re-checked on every change
    return s[hireId];
  }

  return { get, update };
})();

// Notifications for the manager (and anyone else who needs a nudge in the demo)
const NOTIFY = (function () {
  const KEY = 'lbg.notifs';

  function read() {
    try { return JSON.parse(localStorage.getItem(KEY) || '[]'); } catch (e) { return []; }
  }

  function write(list) {
    localStorage.setItem(KEY, JSON.stringify(list.slice(0, 100)));
  }

  // n: { to: 'manager', type, title, text, hireId, link, action }
  function add(n) {
    const list = read();
    const away = SHARED.get('_manager');
    // While the manager is out of office, manager alerts are tagged for the named cover
    const cover = n.to === 'manager' && away.away && away.cover ? away.cover : null;
    list.unshift(Object.assign({
      id: Date.now().toString(36) + Math.random().toString(36).slice(2, 6),
      read: false,
      time: new Date(2026, 10, 9).toISOString(), // demo "today"
      cover: cover,
    }, n));
    write(list);
  }

  function list(to) {
    return read().filter((n) => n.to === to);
  }

  function unread(to) {
    return list(to).filter((n) => !n.read).length;
  }

  function markRead(id) {
    const all = read();
    all.forEach((n) => { if (n.id === id) n.read = true; });
    write(all);
  }

  function markAll(to) {
    const all = read();
    all.forEach((n) => { if (n.to === to) n.read = true; });
    write(all);
  }

  return { KEY, add, list, unread, markRead, markAll };
})();

// Vetting completion, from either the manager's override or the employee's demo button.
// Sets the shared flag and tells the manager they can start onboarding.
function markVettingComplete(hireId) {
  if (SHARED.get(hireId).vettingDone) return false;
  SHARED.update(hireId, { vettingDone: true });
  const h = HIRES.find((x) => x.id === hireId);
  NOTIFY.add({
    to: 'manager',
    type: 'vetting',
    hireId: hireId,
    title: 'Vetting complete: ' + h.name,
    text: 'All checks are cleared. Choose a job family, then start onboarding.',
    link: '#/hire/' + hireId,
    action: 'Start onboarding',
  });
  return true;
}

// ---------- Readiness, Day 1 and cancellation ----------

// Everything that has to be done before the new starter is ready for Day 1
function readiness(hireId) {
  const h = HIRES.find((x) => x.id === hireId);
  const sh = SHARED.get(hireId);
  const items = [
    { key: 'vetting', label: 'Vetting cleared', done: !!sh.vettingDone || h.vetting.every((c) => c.status === 'complete') },
    { key: 'contract', label: 'Contract signed', done: !!sh.contractSigned },
    { key: 'family', label: 'Job family set', done: !!sh.family },
    { key: 'device', label: 'Device chosen', done: !!sh.device && sh.device.status !== 'requested' && sh.device.status !== 'cancelled' },
    { key: 'kit', label: 'Home equipment ordered and approved', done: !!sh.homeOrder && !!sh.homeOrder.approved && !sh.homeOrder.cancelled },
    { key: 'onboarding', label: 'Automated onboarding complete', done: !!sh.onb && sh.onb.status === 'complete' },
  ];
  return { items: items, ready: items.every((i) => i.done) };
}

// Tells the manager once when every action is complete. Called from SHARED.update.
function checkReady(hireId) {
  if (!HIRES.find((x) => x.id === hireId)) return; // not a hire (e.g. the manager's own settings)
  const sh = SHARED.get(hireId);
  if (sh.readyNotified) return;
  if (sh.cancel && sh.cancel.status) return; // withdrawn or cancelled
  if (!readiness(hireId).ready) return;
  SHARED.update(hireId, { readyNotified: true });
  const h = HIRES.find((x) => x.id === hireId);
  NOTIFY.add({
    to: 'manager',
    type: 'ready',
    hireId: hireId,
    title: 'Ready for Day 1: ' + h.name,
    text: 'Every action is complete. ' + h.name.split(' ')[0] + ' starts ' + fmtLong(h.startDate) + '.',
    link: '#/hire/' + hireId,
  });
}

// Reverse everything the hire (or the onboarding run) has set up for the role
// The list of things that would be reversed right now (used as a preview, and by reverseActions)
function reversePlan(hireId) {
  const sh = SHARED.get(hireId);
  const log = [];
  const done = (sh.onb && sh.onb.done) || [];

  if (sh.contractSigned) log.push('Contract marked as not proceeding. Signed copy kept on file for HR records.');
  if (sh.device && sh.device.status !== 'cancelled') {
    const cat = DEVICES[sh.device.os];
    log.push('Laptop order cancelled (' + (sh.device.dev ? cat.dev.name : cat.name) + ')');
  }
  if (sh.homeOrder && !sh.homeOrder.cancelled) log.push('Home equipment order cancelled (' + money(sh.homeOrder.total) + ')');
  if (done.includes('identity')) log.push('Lloyds identity and single sign-on disabled');
  if (done.includes('mailbox')) log.push('Email, calendar and Teams removed');
  if (done.includes('family')) log.push('Access packs revoked for the job family');
  if (done.includes('kit')) log.push('Laptop returned to stock');
  if (done.includes('pass')) log.push('Building pass deactivated');
  if (done.includes('learning')) log.push('Mandatory learning unenrolled');
  if (done.includes('notify')) log.push('Buddy and team told the role is cancelled');
  if (!log.length) log.push('No accounts or hardware had been set up, so there was nothing to reverse');
  return log;
}

// Carry out the reversal and record it, so both sides can see what was undone
function reverseActions(hireId) {
  const sh = SHARED.get(hireId);
  const log = reversePlan(hireId);

  SHARED.update(hireId, {
    device: sh.device ? Object.assign({}, sh.device, { status: 'cancelled' }) : sh.device,
    homeOrder: sh.homeOrder ? Object.assign({}, sh.homeOrder, { cancelled: true }) : sh.homeOrder,
    onb: sh.onb ? Object.assign({}, sh.onb, { status: 'reversed' }) : sh.onb,
    cancel: Object.assign({}, sh.cancel, { status: 'reversed', reversedOn: new Date(2026, 10, 9).toISOString(), log: log }),
  });
  return log;
}

// Money formatter used by shared.js (app.js and manager.js have their own)
function money(n) {
  return '£' + n.toLocaleString('en-GB');
}

// Systems the new starter should be able to reach, from the access packs of their job family
function accessItems(hireId) {
  const sh = SHARED.get(hireId);
  const fam = JOB_FAMILIES.find((f) => f.id === sh.family);
  if (!fam) return [];
  return fam.packs.flatMap((pid) => {
    const pack = ACCESS_PACKS[pid];
    return pack.items.map((label, i) => ({ key: pid + ':' + i, pack: pack.name, label: label, approval: pack.approval }));
  });
}

// Every Friday from the first Friday on or after `from`, at 09:00, for `count` weeks
function fridaysFrom(from, count) {
  const d = new Date(from.getFullYear(), from.getMonth(), from.getDate(), 9, 0);
  while (d.getDay() !== 5) d.setDate(d.getDate() + 1);
  const out = [];
  for (let i = 0; i < count; i++) {
    out.push(new Date(d.getFullYear(), d.getMonth(), d.getDate() + i * 7, 9, 0));
  }
  return out;
}

// Traffic light for a weekly check-in. Red = needs a call from the manager. Amber = buddy or a little support.
function checkinTone(c) {
  if (c.mood === 'poor' || c.raise === 'manager') return 'red';
  if (c.mood === 'okay' || c.find === 'yes' || c.raise === 'buddy') return 'amber';
  return 'green';
}

// Mood over time from weekly check-ins: green = high, amber = middle, red = low. One point per week.
function moodSvg(checks) {
  const W = 320, H = 170, padL = 58, padR = 14, padT = 14, padB = 28;
  const score = { green: 3, amber: 2, red: 1 };
  const colour = { green: '#2e7d32', amber: '#e09a00', red: '#c62828' };
  const latestByWeek = {};
  (checks || []).forEach((c) => { latestByWeek[c.week] = c; });
  const weeks = Object.keys(latestByWeek).map(Number).sort((a, b) => a - b);
  const lastWeek = Math.max(4, weeks.length ? weeks[weeks.length - 1] : 4);
  const x = (w) => padL + ((w - 1) / (lastWeek - 1)) * (W - padL - padR);
  const y = (s) => padT + ((3 - s) / 2) * (H - padT - padB);
  const bandH = (H - padT - padB) / 3;

  const bands = [
    { s: 3, fill: '#e6f6ef', label: 'Good' },
    { s: 2, fill: '#fff4d6', label: 'Okay' },
    { s: 1, fill: '#fdecea', label: 'Low' },
  ].map((b) => `<rect x="${padL}" y="${padT + (3 - b.s) * bandH}" width="${W - padL - padR}" height="${bandH}" fill="${b.fill}"/>
      <text x="${padL - 8}" y="${padT + (3 - b.s) * bandH + bandH / 2 + 4}" text-anchor="end" font-size="11" fill="#5b6763">${b.label}</text>`).join('');

  const axis = Array.from({ length: lastWeek }, (_, i) => i + 1).map((w) =>
    `<text x="${x(w)}" y="${H - 8}" text-anchor="middle" font-size="11" fill="#5b6763">W${w}</text>`).join('');

  const pts = weeks.map((w) => ({ w: w, x: x(w), y: y(score[latestByWeek[w].tone]), tone: latestByWeek[w].tone }));
  const line = pts.length > 1 ? `<polyline points="${pts.map((p) => p.x + ',' + p.y).join(' ')}" fill="none" stroke="#1d2a26" stroke-width="2" stroke-linejoin="round"/>` : '';
  // Shape as well as colour: red square, amber triangle, green circle
  const marker = (p) => {
    const c = colour[p.tone];
    if (p.tone === 'red') return `<rect x="${p.x - 6}" y="${p.y - 6}" width="12" height="12" fill="${c}" stroke="#fff" stroke-width="2"/>`;
    if (p.tone === 'amber') return `<polygon points="${p.x},${p.y - 7} ${p.x + 7},${p.y + 6} ${p.x - 7},${p.y + 6}" fill="${c}" stroke="#fff" stroke-width="2"/>`;
    return `<circle cx="${p.x}" cy="${p.y}" r="6" fill="${c}" stroke="#fff" stroke-width="2"/>`;
  };
  const dots = pts.map(marker).join('');
  const empty = pts.length ? '' : `<text x="${W / 2}" y="${H / 2}" text-anchor="middle" font-size="13" fill="#5b6763">No check-ins yet</text>`;

  return `<svg viewBox="0 0 ${W} ${H}" role="img" aria-label="Mood by week: ${pts.length} check-ins" style="width:100%;height:auto;display:block">
    ${bands}${axis}${line}${dots}${empty}
  </svg>`;
}

// The onboarding "notify" step: tell the buddy and the new starter. Sent once per hire.
function notifyOnboardingDone(hireId) {
  if (SHARED.get(hireId).buddyNotified) return;
  SHARED.update(hireId, { buddyNotified: true });
  const h = HIRES.find((x) => x.id === hireId);
  const first = h.name.split(' ')[0];
  CHAT.send(hireId, 'hr', first + ' has been set up for their first day. Their accounts, access and equipment are in place. Please say hello before Day 1.',
    'Onboarding team', 'buddy');
  NOTIFY.add({ to: 'hire', hireId: hireId, type: 'onboarding', title: 'Your accounts are set up',
    text: 'Your buddy and team have been told. Check My details and First 30 days for what comes next.', link: '#/first30' });
}

// ---------- Start dates, unlocks, Day 30 and risk ----------

// The hire's start date, after any move made by the manager
function effectiveStart(hireId) {
  const sh = SHARED.get(hireId);
  const h = HIRES.find((x) => x.id === hireId);
  return sh.startDate ? new Date(sh.startDate) : h.startDate;
}

// Days since Day 1 (negative before). The demo can jump the journey to Day 30 with a button.
function daysIn(hireId) {
  const sh = SHARED.get(hireId);
  if (typeof sh.demoDays === 'number') return sh.demoDays;
  return Math.floor((TODAY - effectiveStart(hireId)) / 86400000);
}

// Delivery note for home equipment, worked out from the (possibly moved) start date
function deliveryNote(d, hireId) {
  const start = effectiveStart(hireId || 'alex');
  const when = new Date(start.getFullYear(), start.getMonth(), start.getDate() + (d.id === 'day-before' ? -1 : 0));
  return fmtLong(when) + (d.id === 'day-1' ? ', before 9:00' : ', morning');
}

// Events the journey is built from. Each one is either done (a fact) or not yet.
function journeyEvents(hireId) {
  const sh = SHARED.get(hireId);
  const h = HIRES.find((x) => x.id === hireId);
  const start = effectiveStart(hireId);
  const days = daysIn(hireId);
  const goals = !!(sh.goals && sh.goals.items && sh.goals.items.length);
  return {
    vetting: !!sh.vettingDone || h.vetting.every((c) => c.status === 'complete'),
    family: !!sh.family,
    contractWindow: true, // the contract can be signed whenever it is available
    contract: !!sh.contractSigned,
    goals: goals,
    day1: TODAY >= start || !!sh.demoDay1 || days >= 0,
    day25: days >= 25,
    day30: days >= 30,
    day60: days >= 60,
  };
}

// What each part of the journey is waiting for. Shown to the hire so the unlock is visible, not withheld.
// `how` says what to do once the item is open. Each need can carry a link to where it gets sorted out.
const UNLOCK_RULES = [
  { key: 'contract', label: 'Employment contract', how: 'Ready now. Read and sign it on the Home workspace page.', needs: [] },
  { key: 'device', label: 'Laptop choice', how: 'Pick Windows or Mac on the Your device page.', needs: [['vetting', 'vetting to be cleared'], ['family', 'your manager to set your job family']] },
  { key: 'kit', label: 'Home equipment', how: 'Order your monitor, chair, desk and cables on the Home workspace page.', needs: [['contract', 'your contract to be signed']] },
  { key: 'first30', label: 'First 30 days plan', how: 'Your Day 1 tasks, training and one-to-one are on the plan.', needs: [['day1', 'Day 1']] },
  { key: 'channels', label: 'Comms channels and community pages', how: 'Join the channels that keep you connected.', needs: [['day1', 'Day 1']] },
  { key: 'welcome', label: 'Welcome pack', how: 'Read your welcome letter and first week guide.', needs: [['goals', 'your goals to be saved with your manager']] },
  { key: 'review', label: 'Day 30 check-in', how: 'Tell us how you are settling in.', needs: [['day25', 'Day 25']] },
  { key: 'm2', label: 'Day 30 to 60: Workday and HR checks', how: 'Check you can get into Workday and HR.', needs: [['day30', 'Day 30']] },
  { key: 'm3', label: 'Day 60 to 90: teething issues check-in', how: 'Tell us about any teething issues, or anything to raise with your manager.', needs: [['day60', 'Day 60']] },
];

// Where each waiting step gets sorted out, so a locked item is never a dead end
const UNLOCK_STEP_LINK = {
  vetting: { href: '#/vetting', cta: 'See vetting progress' },
  family: { href: '#/chat', cta: 'Message your manager' },
  contract: { href: '#/workspace', cta: 'Sign your contract' },
  goals: { href: '#/goals', cta: 'Set your goals' },
};

function unlockStatus(hireId) {
  const ev = journeyEvents(hireId);
  return UNLOCK_RULES.map((r) => {
    const missing = r.needs.filter(([e]) => !ev[e]);
    return {
      key: r.key,
      label: r.label,
      how: r.how,
      open: missing.length === 0,
      waitingFor: missing.map(([, text]) => text),
      steps: missing.map(([e, text]) => Object.assign({ text: text }, UNLOCK_STEP_LINK[e] || {})),
    };
  });
}

// Wellbeing and early risk. Runs from the check-ins, the plan and the Day 30 review.
function riskLevel(hireId) {
  const sh = SHARED.get(hireId);
  const reasons = [];
  let level = 'green';
  const checks = sh.checkins || [];
  const last = checks[checks.length - 1];
  const prev = checks[checks.length - 2];
  if (last && last.tone === 'red') { level = 'red'; reasons.push('Latest weekly check-in is red'); }
  if (last && last.tone === 'amber' && prev && prev.tone === 'amber') { if (level !== 'red') level = 'amber'; reasons.push('Two amber check-ins in a row'); }
  if (sh.review && sh.review.tone === 'red') { level = 'red'; reasons.push('Day 30 check-in needs support'); }
  if (sh.review && sh.review.tone === 'amber' && level === 'green') { level = 'amber'; reasons.push('Day 30 check-in shows some gaps'); }
  if (daysIn(hireId) >= 20 && planPercent(hireId) < 50) {
    if (level === 'green') level = 'amber';
    reasons.push('Less than half of the first 30 days plan is done by Day 20');
  }
  return { level: level, reasons: reasons };
}

// Plan progress for the first 30 days (same items the hire sees)
function planPercent(hireId) {
  const sh = SHARED.get(hireId);
  const done = FIRST30_PLAN.filter((item) => {
    if (item.video) return !!(sh.videos || {})[item.video];
    if (item.oneToOne) return !!sh.oneToOne;
    if (item.intros) return TEAM_INTROS.every((i) => (sh.intros || {})[i.id]);
    if (item.benefits) return !!sh.benefits;
    if (item.communities) return (sh.communities || []).length > 0;
    if (item.goals) return !!(sh.goals && sh.goals.items && sh.goals.items.length);
    if (item.access) { const items = accessItems(hireId); return items.length > 0 && items.every((i) => (sh.access || {})[i.key] === 'verified'); }
    return !!(sh.first30 || {})[item.key];
  }).length;
  return Math.round((done / FIRST30_PLAN.length) * 100);
}

// Raises the risk once per change of level, and writes a support plan when it turns amber or red
function checkRisk(hireId) {
  const sh = SHARED.get(hireId);
  const r = riskLevel(hireId);
  if (r.level === (sh.riskLevel || 'green')) return r;
  SHARED.update(hireId, { riskLevel: r.level, riskReasons: r.reasons });
  if (r.level !== 'green') {
    const h = HIRES.find((x) => x.id === hireId);
    if (!sh.supportPlan) {
      SHARED.update(hireId, { supportPlan: { createdOn: TODAY.toISOString(), actions: [
        'Book a one-to-one with the manager this week',
        'Buddy catch-up call to talk through the week',
        'Look at the first 30 days plan together and pick one thing to finish',
        'Remind them of the free, confidential EAP support',
      ] } });
    }
    NOTIFY.add({ to: 'manager', type: 'risk', tone: r.level === 'red' ? 'red' : 'amber', hireId: hireId,
      title: (r.level === 'red' ? 'Support needed now: ' : 'Early support check: ') + h.name,
      text: r.reasons.join('. ') + '. A support plan has been drafted.', link: '#/hire/' + hireId, action: 'Open support plan' });
  }
  return r;
}

// Manager's out-of-office and cover, stored under the manager key
function managerAway() {
  return SHARED.get('_manager');
}

// Compact mood trend for the manager: one small traffic-light shape per week, latest on the right
function moodStrip(checks) {
  const byWeek = {};
  (checks || []).forEach((c) => { byWeek[c.week] = c; });
  const weeks = Object.keys(byWeek).map(Number).sort((a, b) => a - b);
  if (!weeks.length) return '';
  const word = { green: 'Good', amber: 'Okay', red: 'Low' };
  return `<div class="mood-strip" role="list" aria-label="Mood by week">
    ${weeks.map((w) => `<span class="mood-week" role="listitem" title="Week ${w}: ${word[byWeek[w].tone]}">
      <span class="rag rag-${byWeek[w].tone}" role="img" aria-label="Week ${w}: ${word[byWeek[w].tone]}"></span><span class="small muted">W${w}</span></span>`).join('')}
  </div>`;
}

// ---------- After Day 30: monthly one-to-ones ----------

// Which month of the role the hire is in after Day 30 (1 = Day 30 to 59, 2 = Day 60 to 89). 0 before Day 30.
function monthPeriod(hireId) {
  const d = daysIn(hireId);
  return d >= 30 ? Math.floor(d / 30) : 0;
}

// Reminds the manager once per month to book the monthly one-to-one, if it is not booked yet
function checkMonthly(hireId) {
  const p = monthPeriod(hireId);
  if (!p) return;
  const sh = SHARED.get(hireId);
  if (sh.cancel && sh.cancel.status) return;
  if ((sh.monthly || {})[p] || (sh.monthlyReminded || {})[p]) return;
  SHARED.update(hireId, { monthlyReminded: Object.assign({}, sh.monthlyReminded, { [p]: true }) });
  const h = HIRES.find((x) => x.id === hireId);
  NOTIFY.add({ to: 'manager', type: 'monthly', tone: 'amber', hireId: hireId,
    title: "Reminder: book this month's one-to-one with " + h.name.split(' ')[0],
    text: 'Day ' + (p * 30) + ' to ' + ((p + 1) * 30) + '. A monthly one-to-one keeps things on track after the first 30 days.',
    link: '#/hire/' + hireId, action: 'Book one-to-one' });
}
