// Shared message store for the employee app, the manager portal and the buddy portal.
// Each hire has one thread per channel: 'manager' (manager <-> hire) and 'buddy' (buddy <-> hire).
// All apps run on the same origin and share this localStorage key. Every read goes back to
// localStorage, so a tab never works from a stale copy. Load after data.js and manager-data.js.
const CHAT = (function () {
  const KEY = 'lbg.threads';
  const ME_HIRE_ID = 'alex'; // the employee using the app in this demo

  function key(hireId, channel) {
    return hireId + ':' + (channel || 'manager');
  }

  function seed() {
    const s = {};
    HIRES.forEach((h) => {
      s[key(h.id, 'manager')] = (h.messages || []).map((m, i) => ({
        id: h.id + '-m' + i,
        from: m.from,
        name: m.name || null,
        text: m.text,
        time: m.time.toISOString(),
        read: {
          hire: m.from === 'hire' ? true : !!m.read,
          manager: m.from === 'hire' ? !!m.read : true,
          buddy: true,
        },
      }));
    });
    // Buddy channel starts with a welcome from Sam for Alex
    s[key(ME_HIRE_ID, 'buddy')] = [{
      id: 'alex-b0',
      from: 'buddy',
      name: 'Sam Okafor',
      text: 'Welcome to the team, Alex. I am your buddy for your first few months. Ask me anything, including the small questions.',
      time: D(2026, 11, 10).toISOString(),
      read: { hire: false, manager: true, buddy: true },
    }];
    return s;
  }

  function read() {
    let s = null;
    try { s = JSON.parse(localStorage.getItem(KEY) || 'null'); } catch (e) { s = null; }
    if (!s) {
      s = seed();
      localStorage.setItem(KEY, JSON.stringify(s));
    }
    return s;
  }

  function write(s) {
    localStorage.setItem(KEY, JSON.stringify(s));
  }

  function thread(hireId, channel) {
    return (read()[key(hireId, channel)] || []).slice();
  }

  // from: 'hire' | 'manager' | 'buddy'
  function send(hireId, from, text, name, channel) {
    const s = read();
    const k = key(hireId, channel);
    const msg = {
      id: Date.now().toString(36) + Math.random().toString(36).slice(2, 6),
      from: from,
      name: name || null,
      text: text,
      time: new Date(2026, 10, 9).toISOString(), // demo "today"
      read: { hire: from === 'hire', manager: from === 'manager', buddy: from === 'buddy' },
    };
    s[k] = (s[k] || []).concat(msg);
    write(s);
    return msg;
  }

  // side: 'hire' | 'manager' | 'buddy' (who is looking at the thread)
  function markRead(hireId, side, channel) {
    const s = read();
    const list = s[key(hireId, channel)] || [];
    let changed = false;
    list.forEach((m) => {
      if (!m.read[side]) { m.read[side] = true; changed = true; }
    });
    if (changed) write(s);
  }

  function unread(hireId, side, channel) {
    return (read()[key(hireId, channel)] || []).filter((m) => !m.read[side]).length;
  }

  return { ME_HIRE_ID, KEY, thread, send, markRead, unread };
})();
