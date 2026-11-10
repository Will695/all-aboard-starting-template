// New starter assistant: explains acronyms and shows how to get or request things.
// Rule-based matching against a small knowledge base (no external service), so it works offline
// in the demo. Answers link straight to the right page in this app.
const ASSISTANT = (function () {
  // Acronyms and terms a new starter will hear. Plain-English explanations.
  const ACRONYMS = {
    SSO: { full: 'Single sign-on', plain: 'Your one Lloyds login. It signs you in to most work apps with one password and your MFA check.' },
    MFA: { full: 'Multi-factor authentication', plain: 'A second check, usually an approval in the Authenticator app, to prove it is really you.' },
    DBS: { full: 'Disclosure and Barring Service', plain: 'A criminal records check done through the government. Part of pre-employment vetting.' },
    RTW: { full: 'Right to work', plain: 'The check that confirms you are allowed to work in the UK. Done with your passport or visa.' },
    BRP: { full: 'Biometric residence permit', plain: 'An identity card issued to some visa holders. Used in right-to-work checks.' },
    PEP: { full: 'Politically exposed person', plain: 'A person with a prominent public role. Screened as part of financial crime checks.' },
    KYC: { full: 'Know your customer', plain: 'The checks we do to confirm who our customers are. You will learn more in the financial crime course.' },
    AML: { full: 'Anti-money laundering', plain: 'Rules and checks that stop criminals moving illegal money through the bank.' },
    FCA: { full: 'Financial Conduct Authority', plain: 'The regulator for how financial firms treat customers and run their markets.' },
    PRA: { full: 'Prudential Regulation Authority', plain: 'The regulator that checks banks are safe and have enough capital.' },
    HR: { full: 'Human resources', plain: 'The people team. They handle your contract, pay questions, leave and wellbeing.' },
    IT: { full: 'Information technology', plain: 'The team that looks after your laptop, accounts and the systems you use.' },
    EAP: { full: 'Employee assistance programme', plain: 'Free, confidential support for wellbeing, money or personal worries, 24 hours a day.' },
    VPN: { full: 'Virtual private network', plain: 'A secure connection that keeps your work traffic private when you use it away from the office.' },
    SAYE: { full: 'Save As You Earn', plain: 'A share scheme where you save from pay each month and can buy shares later at a set price.' },
    OOO: { full: 'Out of office', plain: 'The automatic reply you set when you are on leave or away.' },
    ETA: { full: 'Estimated time of arrival', plain: 'In vetting, the date a check is expected to finish.' },
    LBG: { full: 'Lloyds Banking Group', plain: 'The group that includes Lloyds Bank, Halifax and Bank of Scotland.' },
  };

  // How-to answers. `keys` are words or phrases that point at the topic. Higher hits win.
  const HOWTO = [
    {
      id: 'laptop',
      keys: ['laptop', 'device', 'computer', 'mac', 'windows', 'developer build', 'dev build', 'pc'],
      answer: 'Choose your laptop once vetting is complete and your manager has set your job family. You pick Windows or Mac. If you are an engineer or developer you can request a developer build, which your manager approves.',
      links: [{ label: 'Choose your laptop', href: '#/device' }],
    },
    {
      id: 'home-kit',
      keys: ['monitor', 'chair', 'desk', 'keyboard', 'mouse', 'cable', 'equipment', 'home office', 'order kit', 'home kit', 'delivery', 'deliver'],
      answer: 'Sign your contract first. Then order home equipment such as a monitor, chair, desk and cables. Choose delivery the day before you start or on Day 1. Orders over the allowance need your manager to approve them.',
      links: [{ label: 'Home workspace', href: '#/workspace' }],
    },
    {
      id: 'contract',
      keys: ['contract', 'sign', 'signature', 'offer letter'],
      answer: 'Your contract is ready to sign now. You sign it on the Home workspace page. Signing unlocks your home equipment order.',
      links: [{ label: 'Open contract', href: '#/workspace' }],
    },
    {
      id: 'vetting',
      keys: ['vetting', 'check', 'checks', 'referee', 'referees', 'credit', 'background', 'screening', 'how long'],
      answer: 'Vetting is the checks we must do before you start: right to work, identity, credit reference, references, financial crime and criminal records. The Vetting page shows each check, its expected date, and whether it is on track.',
      links: [{ label: 'See vetting progress', href: '#/vetting' }],
    },
    {
      id: 'call-back',
      keys: ['call me', 'call back', 'callback', 'phone', 'ring me', 'speak to', 'talk to someone', 'book a call'],
      answer: 'On the Vetting page you can ask your manager to call you back. If a check slips past the date we need it, a call is requested for you automatically.',
      links: [{ label: 'Request a call back', href: '#/vetting' }],
    },
    {
      id: 'message-manager',
      keys: ['message', 'chat', 'text my manager', 'ask my manager', 'email my manager', 'manager'],
      answer: 'Use Messages to chat with Jordan or HR. For anything urgent, call them directly. Your manager sees your messages in their portal.',
      links: [{ label: 'Messages with Jordan', href: '#/chat' }],
    },
    {
      id: 'buddy',
      keys: ['buddy', 'sam', 'coffee', 'who can i ask', 'everyday question'],
      answer: 'Your buddy is Sam Okafor. Ask Sam the everyday questions: where to get lunch, how Teams works, what to wear. You can message Sam from the buddy chat.',
      links: [{ label: 'Chat with Sam', href: '#/buddy' }],
    },
    {
      id: 'details',
      keys: ['address', 'change address', 'date of birth', 'dob', 'my details', 'personal details', 'name change', 'update my details', 'phone number'],
      answer: 'Your personal, job and pay details are on My details. To change your address, contact HR through Messages. Changes to pay or bank details need HR to approve them.',
      links: [{ label: 'My details', href: '#/me' }],
    },
    {
      id: 'pay',
      keys: ['payslip', 'pay', 'paid', 'salary', 'wage', 'when do i get paid', 'pay date'],
      answer: 'You are paid monthly on the 20th, or the working day before if the 20th falls on a weekend or bank holiday. Your agreed salary and first pay date are on My details.',
      links: [{ label: 'Salary and pay', href: '#/me' }],
    },
    {
      id: 'benefits',
      keys: ['benefit', 'benefits', 'pension', 'holiday', 'annual leave', 'health cover', 'medical', 'reward', 'rewards', 'bike', 'cycle to work'],
      answer: 'Choose your rewards and benefits within your first 30 days: pension contribution, extra holiday, health cover and the cycle to work scheme. You can change them during the year at open enrolment.',
      links: [{ label: 'Choose benefits', href: '#/benefits' }],
    },
    {
      id: 'purpose',
      keys: ['why it matters', 'purpose', 'strategy', 'how i fit', 'my part', 'what the bank wants', 'what does the bank want', 'why do i matter'],
      answer: 'How you fit in shows what the bank wants, all the way down to what you do, and why each level matters.',
      links: [{ label: 'How you fit in', href: '#/purpose' }],
    },
    {
      id: 'goals',
      keys: ['goals', 'goal', 'objectives', 'set my goals', 'targets'],
      answer: 'Your manager books a goal-setting check-in in your first 30 days. Before it, add up to three goals on the My goals page. They are shared with Jordan.',
      links: [{ label: 'My goals', href: '#/goals' }],
    },
    {
      id: 'sharematch',
      keys: ['sharematch', 'share match', 'share scheme', 'share plan', 'buy shares', 'lloyds shares', 'shares', 'share'],
      answer: 'ShareMatch lets you buy Lloyds Banking Group shares from your pay each month, and the bank adds matching shares up to a limit. You choose your monthly amount in Rewards and benefits. The terms shown are demo terms.',
      links: [{ label: 'Choose ShareMatch', href: '#/benefits' }],
    },
    {
      id: 'leave',
      keys: ['leave', 'time off', 'day off', 'book holiday', 'holiday request', 'sick', 'sickness'],
      answer: 'Book annual leave through HR self-service in your Learning hub. For sickness, tell your manager as early as you can on the day, then log it in self-service.',
      links: [],
    },
    {
      id: 'training',
      keys: ['training', 'video', 'videos', 'course', 'courses', 'learn', 'learning', 'e-learning', 'elearning', 'induction', 'mandatory'],
      answer: 'Your training videos are in the Training section. They play inside this app. Watch the Day 1 videos first, then the Week 1 ones. Mandatory courses show a date they need to be done by.',
      links: [{ label: 'Training videos', href: '#/learn' }],
    },
    {
      id: 'first30',
      keys: ['first 30 days', 'first month', 'week 1', 'week one', '1-1', '1:1', 'one to one', 'one-to-one', 'day 1', 'day one', 'what do i do first', 'plan'],
      answer: 'Your first 30 days plan is in one place: Day 1 tasks, your Week 1 one-to-one with Jordan, team intro calls, benefits and community pages.',
      links: [{ label: 'First 30 days', href: '#/first30' }],
    },
    {
      id: 'communities',
      keys: ['community', 'communities', 'network', 'networks', 'club', 'clubs', 'join', 'groups', 'social'],
      answer: 'Community pages are networks run by colleagues. Pick the ones that interest you and join them from the Communities page.',
      links: [{ label: 'Explore communities', href: '#/communities' }],
    },
    {
      id: 'access',
      keys: ['access', 'login', 'log in', 'password', 'locked out', 'cant log in', "can't log in", 'system access', 'account', 'authenticator'],
      answer: 'Your accounts are set up by onboarding. Sign in with SSO and approve the MFA prompt in the Authenticator app. If you still cannot get in, contact IT through the helpdesk.',
      links: [{ label: 'Check my system access', href: '#/access' }],
    },
    {
      id: 'it-help',
      keys: ['it help', 'helpdesk', 'help desk', 'broken', 'not working', 'ticket', 'it support', 'laptop broken'],
      answer: 'For IT problems, raise a ticket with the IT helpdesk. For anything urgent with your laptop on Day 1 or later, call the service desk number on your welcome card.',
      links: [],
    },
    {
      id: 'building',
      keys: ['pass', 'badge', 'building pass', 'entry', 'get in', 'reception', 'lift', 'office'],
      answer: 'Your building pass is issued in onboarding. It is sent with your Day 1 delivery or collected at reception on Day 1. Ask reception if it does not work.',
      links: [],
    },
    {
      id: 'travel',
      keys: ['travel', 'commute', 'tube', 'train', 'get to work', 'transport', 'parking', 'bus', 'cycle', 'nearby', 'lunch', 'shops', 'gym', 'amenities'],
      answer: 'Travel options and local amenities for your office are on the location page, including the nearest stations, bus routes, cycle parking and places to eat.',
      links: [{ label: 'Travel and local area', href: '#/place' }],
    },
    {
      id: 'withdraw',
      keys: ['withdraw', 'leave the role', 'resign', 'quit', 'pull out', 'cancel my role', 'not joining', 'change my mind'],
      answer: 'If you no longer want the role, use Withdraw from role on My details. Your manager will be told and will book a call with you. Anything set up for you is reversed.',
      links: [{ label: 'Withdraw from role', href: '#/withdraw' }],
    },
    {
      id: 'manager-contact',
      keys: ['who is my manager', 'my manager', 'line manager'],
      answer: 'Your line manager is Jordan Ellis, Commercial Data Lead. You can message Jordan, call or email from the My team page.',
      links: [{ label: 'My team', href: '#/team' }],
    },
  ];

  const GREETING = [
    'Hi, I am your new starter assistant. Ask me what an acronym means, or how to get something, for example:',
  ];
  const EXAMPLES = ['What does SSO mean?', 'How do I order a monitor?', 'Where are my training videos?', 'How do I request a developer laptop?'];

  function normalise(text) {
    return ' ' + text.toLowerCase().replace(/[^a-z0-9:\-' ]+/g, ' ').replace(/\s+/g, ' ').trim() + ' ';
  }

  function hasPhrase(text, phrase) {
    return text.indexOf(' ' + phrase + ' ') !== -1 || text.indexOf(' ' + phrase + '?') !== -1;
  }

  // Find acronyms in the question, e.g. "what is DBS" or "explain RTW"
  function acronymIn(raw) {
    const words = raw.replace(/[^A-Za-z0-9 ]+/g, ' ').split(/\s+/).filter(Boolean);
    const found = [];
    words.forEach((w) => {
      const up = w.toUpperCase();
      if (ACRONYMS[up] && (w === up || w.length <= 4)) found.push(up);
    });
    return found;
  }

  function answer(raw) {
    const text = normalise(raw);
    const trimmed = raw.trim();
    if (!trimmed) return { text: 'Ask me anything about joining the bank.', links: [] };

    // Greetings and help
    if (/^(hi|hello|hey|help|what can you do|start)\b/i.test(trimmed) || hasPhrase(text, 'what can you do')) {
      return { text: GREETING[0] + ' ' + EXAMPLES.join(' · '), links: [] };
    }

    // Acronyms: "what does DBS mean", "explain SSO", or just "DBS?"
    const acr = acronymIn(trimmed);
    const asksMeaning = /(what|mean|meaning|explain|stand for|define|what's|whats)/i.test(trimmed);
    if (acr.length && (asksMeaning || trimmed.split(/\s+/).length <= 3)) {
      const parts = acr.map((k) => `${k} means ${ACRONYMS[k].full}. ${ACRONYMS[k].plain}`);
      return { text: parts.join(' '), links: [] };
    }

    // How-to topics: score by keyword hits
    let best = null;
    let bestScore = 0;
    HOWTO.forEach((t) => {
      const score = t.keys.reduce((n, k) => n + (hasPhrase(text, k) ? (k.length > 6 ? 2 : 1) : 0), 0);
      if (score > bestScore) { best = t; bestScore = score; }
    });
    if (best) {
      return { text: best.answer, links: best.links };
    }

    return {
      text: 'I am not sure about that one. Try words like laptop, contract, benefits, training or vetting, or ask about an acronym such as SSO or DBS. If it is still unclear, message HR from Messages and they will help.',
      links: [{ label: 'Messages', href: '#/chat' }],
    };
  }

  return { ACRONYMS, HOWTO, EXAMPLES, answer };
})();
