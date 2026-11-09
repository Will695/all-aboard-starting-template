// Dummy data for the demo. Swap these for real HR / vetting / calendar feeds later.

// "Today" is pinned so the demo always reads the same way.
const TODAY = new Date(2026, 10, 9); // Mon 9 Nov 2026

const D = (y, m, d) => new Date(y, m - 1, d);
const daysBetween = (a, b) => Math.round((b - a) / 86400000);
const fmtShort = (d) => d.toLocaleDateString('en-GB', { weekday: 'short', day: 'numeric', month: 'short' });
const fmtLong = (d) => d.toLocaleDateString('en-GB', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' });

const DEMO = {
  person: {
    firstName: 'Alex',
    name: 'Alex Morgan',
    email: 'alex.morgan@lloydsbankinggroup.com',
    title: 'Business Analyst',
    team: 'Commercial Banking · Data & Insight',
    location: 'Canary Wharf, London',
    officeKey: 'london',
    offerAccepted: D(2026, 10, 14),
    startDate: D(2027, 2, 1),
    startTime: '09:00',
    startPlace: 'Level 12, Reception, 25 Bank Street, London E14',
    // Personal details (dummy)
    dob: D(1994, 3, 14),
    address: ['1 Demo Close', 'Example Town', 'London', 'SE10 8AB'],
    phone: '+44 7700 900456',
    // Pay (dummy)
    salary: 525000,
    salaryBasis: 'per year, gross',
    payFrequency: 'Paid monthly on the last working day',
    salaryAgreedOn: D(2026, 10, 14),
    bonusEligible: 'Yes, annual discretionary bonus (pro-rata in your first year)',
    firstPayDate: D(2027, 2, 26),
  },

  manager: {
    name: 'Jordan Ellis',
    role: 'Commercial Data Lead',
    phone: '+44 7700 900123',
    email: 'jordan.ellis@lloydsbankinggroup.com',
  },

  buddy: {
    name: 'Sam Okafor',
    role: 'Business Analyst, 2 years in role',
    email: 'sam.okafor@lloydsbankinggroup.com',
  },

  // Journey stages, in order. status: done | current | upcoming
  stages: [
    { key: 'offer', label: 'Offer accepted', date: D(2026, 10, 14), status: 'done' },
    { key: 'vetting', label: 'Pre-employment checks', date: D(2026, 11, 9), status: 'current' },
    { key: 'preboard', label: 'Pre-boarding', date: D(2027, 1, 11), status: 'upcoming' },
    { key: 'day1', label: 'Day 1', date: D(2027, 2, 1), status: 'upcoming' },
    { key: 'first30', label: 'First 30 days', date: D(2027, 3, 1), status: 'upcoming' },
  ],

  // Vetting checks. needBy = the date we need this back to keep your start date on track.
  // eta = the vetting team's current expected completion date.
  vettingUpdate: {
    postedOn: D(2026, 11, 9),
    time: '09:14',
    nextUpdate: D(2026, 11, 13),
    message:
      'Your right-to-work and identity checks are complete, thank you. Two checks are still running. ' +
      'We have chased your referees twice and the credit check is taking longer than usual because of a volume backlog. ' +
      'We will not guess at dates: the ETAs below are what we can stand behind today.',
  },

  vettingChecks: [
    {
      id: 'rtw',
      name: 'Right to work',
      desc: 'Passport and visa check',
      status: 'complete',
      completedOn: D(2026, 10, 20),
      eta: null,
      needBy: D(2026, 11, 20),
    },
    {
      id: 'id',
      name: 'Identity & address',
      desc: 'Photo ID and proof of address',
      status: 'complete',
      completedOn: D(2026, 10, 23),
      eta: null,
      needBy: D(2026, 11, 20),
    },
    {
      id: 'credit',
      name: 'Credit reference',
      desc: 'Standard credit check (you have consented)',
      status: 'in_progress',
      eta: D(2026, 11, 20),
      needBy: D(2026, 12, 4),
    },
    {
      id: 'refs',
      name: 'Employment references',
      desc: 'Last 3 years. Waiting on 1 of 2 referees',
      status: 'waiting',
      eta: D(2026, 12, 9),
      needBy: D(2026, 12, 4),
    },
    {
      id: 'fincrime',
      name: 'Financial crime screening',
      desc: 'Sanctions and PEP screening',
      status: 'queued',
      eta: D(2026, 12, 4),
      needBy: D(2026, 12, 4),
    },
    {
      id: 'dbs',
      name: 'Criminal record check (DBS)',
      desc: 'Basic disclosure via government service',
      status: 'in_progress',
      eta: D(2026, 12, 18),
      needBy: D(2026, 12, 4),
    },
  ],

  // Full ETA for the whole vetting process
  vettingFinalEta: D(2026, 12, 18),

  todos: [
    {
      id: 't1',
      title: 'Confirm your home address for the credit check',
      detail: 'Needed by Tue 10 Nov so the credit check is not delayed further.',
      due: D(2026, 11, 10),
      rag: 'red',
      cta: 'Confirm address',
      done: false,
    },
    {
      id: 't2',
      title: 'Set up Lloyds SSO and multi-factor authentication',
      detail: 'Install the Authenticator app on your phone before Day 1.',
      due: D(2026, 11, 20),
      rag: 'amber',
      cta: 'Start setup',
      done: false,
    },
    {
      id: 't3',
      title: 'Complete "Financial Crime Awareness" e-learning',
      detail: 'About 40 minutes. Required before you start.',
      due: D(2026, 11, 30),
      rag: 'amber',
      cta: 'Open course',
      done: false,
    },
    {
      id: 't4',
      title: 'Choose your laptop and equipment',
      detail: 'Pick your preferred laptop and monitor. Delivered to your desk on Day 1.',
      due: D(2026, 12, 11),
      rag: 'amber',
      cta: 'Choose kit',
      done: false,
    },
    {
      id: 't5',
      title: 'Accept your offer and contract',
      detail: 'Signed on 14 Oct 2026.',
      due: D(2026, 10, 14),
      rag: 'green',
      cta: null,
      done: true,
    },
    {
      id: 't6',
      title: 'Book your virtual coffee with Sam',
      detail: 'Your buddy will send a calendar invite. Please accept it.',
      due: D(2026, 11, 17),
      rag: 'green',
      cta: 'Accept invite',
      done: false,
    },
    {
      id: 't7',
      title: 'Sign your employment contract',
      detail: 'Opens one week before you start (Mon 25 Jan 2027). We will remind you then.',
      due: D(2027, 1, 25),
      rag: 'green',
      cta: 'Open contract',
      done: false,
    },
    {
      id: 't8',
      title: 'Order your home equipment',
      detail: 'Monitor, keyboard, chair, desk and cables. Delivered the day before or on Day 1.',
      due: D(2027, 1, 25),
      rag: 'green',
      cta: 'Order kit',
      done: false,
    },
  ],

  // Setup walkthrough: the questions you will be asked before you start
  setupQuestions: [
    { q: 'Confirm your personal details and emergency contact', when: 'By 16 Nov', mins: 5 },
    { q: 'Upload right-to-work documents (passport or BRP)', when: 'By 13 Nov', mins: 5 },
    { q: 'Give your address history for the last 3 years', when: 'By 20 Nov', mins: 4 },
    { q: 'Declare any unspent criminal convictions (confidential)', when: 'By 16 Nov', mins: 3 },
    { q: 'Nominate two referees who can speak to your work', when: 'By 20 Nov', mins: 5 },
    { q: 'Complete pre-joining e-learning (financial crime, data protection)', when: 'By 30 Nov', mins: 40 },
    { q: 'Choose your laptop, monitor and any accessibility needs', when: 'By 11 Dec', mins: 5 },
    { q: 'Pick your Day 1 lunch and send a badge photo', when: 'By 15 Jan', mins: 5 },
  ],

  // Meet-ups and events before and on Day 1
  events: [
    { title: 'Virtual coffee with Sam Okafor', when: D(2026, 11, 17), time: '10:00', where: 'Teams' },
    { title: 'Meet Jordan Ellis (1:1 introduction)', when: D(2026, 12, 2), time: '14:00', where: 'Teams' },
    { title: 'Team welcome lunch', when: D(2027, 2, 1), time: '12:30', where: 'Level 12 kitchen' },
    { title: 'Day 1 induction and IT set-up', when: D(2027, 2, 1), time: '09:00', where: 'Reception, Level 12' },
  ],

  // Local area guide for the office location (dummy data; times and listings are illustrative)
  place: {
    key: 'london',
    name: 'Canary Wharf, London',
    intro: 'Your office is on the Isle of Dogs, a short hop from the City. Here is how to get in, and what is close by for lunch, errands and a run before work.',
    address: '25 Bank Street, London E14',
    travel: [
      { mode: 'Tube', name: 'Canary Wharf (Jubilee and Elizabeth lines)', detail: 'About 3 minutes walk to the office, via the underground concourse.', time: '~2 min walk' },
      { mode: 'DLR', name: 'Canary Wharf (Docklands Light Railway)', detail: 'Direct from Bank and Stratford. Step-free access to the platform.', time: '~3 min walk' },
      { mode: 'Rail', name: 'Canary Wharf (Elizabeth line, Crossrail)', detail: 'Direct to Heathrow and Reading, and across central London.', time: '~3 min walk' },
      { mode: 'Bus', name: 'Canary Wharf bus station', detail: 'Routes including 135, 277 and D3 serve the estate.', time: '~5 min walk' },
      { mode: 'Cycle', name: 'Santander Cycles and cycle parking', detail: 'Docking stations on Westferry Road. Secure bike storage on Level 0.', time: 'Cycle parking on site' },
      { mode: 'Car', name: 'Car parks on the estate', detail: 'Limited spaces. Book in advance through the facilities team. Not recommended for daily use.', time: 'Pre-booking only' },
    ],
    amenities: [
      { category: 'Food and coffee', name: 'Cabot Square Market', detail: 'Lunch counters and a mix of cuisines, open weekdays.', distance: '4 min walk' },
      { category: 'Food and coffee', name: 'Canada Place cafés', detail: 'Coffee, grab-and-go and a salad bar under the shopping centre.', distance: '3 min walk' },
      { category: 'Food and coffee', name: 'Waterside riverside terrace', detail: 'Good for a team lunch when the weather is kind.', distance: '6 min walk' },
      { category: 'Health and fitness', name: 'Gym on the estate', detail: 'Pay-as-you-go day passes and monthly memberships. Showers available.', distance: '5 min walk' },
      { category: 'Health and fitness', name: 'Nearest GP and pharmacy', detail: 'Walk-in pharmacy on the estate. GP practice on Westferry Road.', distance: '8 min walk' },
      { category: 'Shopping and essentials', name: 'Canada Place shopping', detail: 'Supermarket, post office, dry cleaner and high street names.', distance: '3 min walk' },
      { category: 'Shopping and essentials', name: 'Cash and ATMs', detail: 'Multiple ATMs in the shopping centre and station concourse.', distance: '2 min walk' },
      { category: 'Outdoors', name: 'Canary Wharf Park and Jubilee Park', detail: 'Green space, a 10 minute loop around the docks, good for a walk.', distance: '5 min walk' },
    ],
    tips: [
      'Westferry and Canada Water are the quickest to reach from the south and south-east.',
      'Getting in from Bank is about 15 minutes on the DLR or Jubilee line.',
      'Building access uses your staff pass, which arrives at your home address before Day 1.',
    ],
  },

  team: [
    { name: 'Jordan Ellis', role: 'Commercial Data Lead (your manager)' },
    { name: 'Sam Okafor', role: 'Business Analyst (your buddy)' },
    { name: 'Priya Natarajan', role: 'Senior Data Engineer' },
    { name: 'Tom Reynolds', role: 'Data Analyst' },
    { name: 'Leah Simmons', role: 'Product Owner, Insight' },
    { name: 'Dan Whitfield', role: 'Risk Analytics Manager' },
  ],
};
