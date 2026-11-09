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
    list.unshift(Object.assign({
      id: Date.now().toString(36) + Math.random().toString(36).slice(2, 6),
      read: false,
      time: new Date(2026, 10, 9).toISOString(), // demo "today"
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
