// Manager portal dummy data. Loads after data.js (uses D() and TODAY from there).

const MANAGER_ME = {
  name: 'Jordan Ellis',
  role: 'Commercial Data Lead',
  team: 'Commercial Banking · Data & Insight',
  initials: 'JE',
};

// Stages a hire moves through, in order
const HIRE_STAGES = [
  { key: 'offer', label: 'Offer accepted' },
  { key: 'vetting', label: 'Vetting' },
  { key: 'preboard', label: 'Pre-boarding' },
  { key: 'day1', label: 'Day 1' },
  { key: 'first30', label: 'First 30 days' },
];

// Job families decide which access packs are granted automatically
// os: operating systems this family may be issued. devEligible: may request a developer spec build.
const JOB_FAMILIES = [
  { id: 'ba', name: 'Business Analysis', band: 'Band 4', packs: ['core', 'data-read', 'bi-tools', 'team-site'], os: ['windows', 'mac'], devEligible: false },
  { id: 'de', name: 'Data Engineering', band: 'Band 5', packs: ['core', 'data-read', 'data-dev', 'bi-tools', 'dev-platform'], os: ['windows', 'mac'], devEligible: true },
  { id: 'ra', name: 'Risk Analytics', band: 'Band 4', packs: ['core', 'bi-tools', 'risk-data'], os: ['windows'], devEligible: false },
  { id: 'co', name: 'Customer Operations', band: 'Band 3', packs: ['core', 'case-mgmt'], os: ['windows'], devEligible: false },
];

// Device catalogue (dummy specs). Standard builds are issued to everyone; developer builds need a request.
const DEVICES = {
  windows: {
    name: 'Windows laptop',
    spec: 'Lenovo ThinkPad T14 · 16 GB memory · 512 GB storage · Windows 11 Enterprise',
    dev: {
      name: 'Windows developer build',
      spec: 'Lenovo ThinkPad P16 · 32 GB memory · 1 TB storage · Windows 11 Enterprise with WSL 2, container tooling and developer admin rights (approved by your manager)',
    },
  },
  mac: {
    name: 'Mac laptop',
    spec: 'MacBook Air 13-inch M3 · 16 GB memory · 512 GB storage · macOS',
    dev: {
      name: 'Mac developer build',
      spec: 'MacBook Pro 14-inch M4 Pro · 32 GB memory · 1 TB storage · macOS with Xcode, Homebrew and container tooling (approved by your manager)',
    },
  },
};

const ACCESS_PACKS = {
  core: { name: 'Core workplace', items: ['Email and calendar', 'Microsoft Teams', 'HR self-service', 'Learning hub'], approval: false },
  'data-read': { name: 'Data read access', items: ['Commercial data warehouse (read)', 'Data catalogue'], approval: false },
  'data-dev': { name: 'Data development', items: ['Development workspace', 'Source control'], approval: true },
  'bi-tools': { name: 'Reporting tools', items: ['BI dashboard authoring', 'Shared report library'], approval: false },
  'team-site': { name: 'Team site', items: ['Commercial Data & Insight SharePoint', 'Team channel membership'], approval: false },
  'dev-platform': { name: 'Dev platform', items: ['Cloud sandbox subscription'], approval: true },
  'risk-data': { name: 'Risk data (restricted)', items: ['Risk model outputs (read)'], approval: true },
  'case-mgmt': { name: 'Case management', items: ['Customer case system', 'Complaints queue'], approval: false },
};

// Home equipment the new starter can order once they have signed their contract .
// Allowance is the amount the bank covers. Anything above it needs the manager to approve.
const HOME_KIT_ALLOWANCE = 600;
const HOME_KIT = [
  { id: 'monitor', name: '27-inch monitor (QHD)', price: 229, desc: 'Flat-panel, USB-C input' },
  { id: 'keyboard', name: 'Keyboard and mouse set', price: 59, desc: 'Wireless, quiet keys' },
  { id: 'chair', name: 'Ergonomic office chair', price: 349, desc: 'Adjustable lumbar and arms' },
  { id: 'desk', name: 'Sit-stand desk', price: 449, desc: 'Electric height, 140 cm top' },
  { id: 'dock', name: 'USB-C dock and cable kit', price: 129, desc: 'Dual display, power, ethernet' },
  { id: 'lamp', name: 'Desk lamp', price: 35, desc: 'LED, dimmable' },
  { id: 'stand', name: 'Laptop stand', price: 39, desc: 'Aluminium, folding' },
  { id: 'headset', name: 'Headset with microphone', price: 79, desc: 'Noise-cancelling, for calls' },
  { id: 'footrest', name: 'Footrest', price: 29, desc: 'Tilt angle adjustable' },
];
const HOME_DELIVERY = [
  { id: 'day-before', label: 'Day before you start', date: D(2027, 1, 31), note: 'Sunday 31 January, morning' },
  { id: 'day-1', label: 'Day 1', date: D(2027, 2, 1), note: 'Monday 1 February, before 9:00' },
];
// Contract is available this many days before the start date
const CONTRACT_LEAD_DAYS = 7;

// Steps the automated onboarding runner works through once a manager kicks it off
const ONBOARDING_STEPS = [
  { key: 'identity', label: 'Create Lloyds identity and single sign-on' },
  { key: 'mailbox', label: 'Create email, calendar and Teams' },
  { key: 'family', label: 'Assign job family and access packs' },
  { key: 'kit', label: 'Order laptop and equipment' },
  { key: 'pass', label: 'Issue building pass for Day 1' },
  { key: 'learning', label: 'Enrol in mandatory learning' },
  { key: 'notify', label: 'Notify buddy, team and the new starter' },
];

const HIRES = [
  {
    id: 'alex',
    name: 'Alex Morgan',
    initials: 'AM',
    title: 'Business Analyst',
    team: 'Commercial Banking · Data & Insight',
    location: 'Canary Wharf, London',
    startDate: D(2027, 2, 1),
    stage: 'vetting',
    progress: 27,
    nextStep: 'Waiting on referee and DBS checks. Expected complete by 18 Dec.',
    email: 'alex.morgan@lloydsbankinggroup.com',
    vetting: [
      { name: 'Right to work', status: 'complete' },
      { name: 'Identity & address', status: 'complete' },
      { name: 'Credit reference', status: 'in_progress', eta: D(2026, 11, 20), needBy: D(2026, 12, 4) },
      { name: 'Employment references', status: 'waiting', eta: D(2026, 12, 9), needBy: D(2026, 12, 4) },
      { name: 'Financial crime screening', status: 'queued', eta: D(2026, 12, 4), needBy: D(2026, 12, 4) },
      { name: 'Criminal record check (DBS)', status: 'in_progress', eta: D(2026, 12, 18), needBy: D(2026, 12, 4) },
    ],
    requests: [
      { id: 'r1', type: 'call', title: 'Call back about vetting timeline', status: 'open', raisedOn: D(2026, 11, 9), auto: true },
    ],
    messages: [
      { from: 'hire', text: 'Hi Jordan, is it normal for the DBS check to take this long?', time: D(2026, 11, 8), read: false },
      { from: 'hr', name: 'HR Onboarding', text: 'Hi Alex, DBS can take up to 6 weeks in busy periods. We will keep you posted.', time: D(2026, 11, 8), read: true },
    ],
    family: null,
  },
  {
    id: 'chloe',
    name: 'Chloe Bennett',
    initials: 'CB',
    title: 'Data Engineer',
    team: 'Commercial Banking · Data & Insight',
    location: 'Canary Wharf, London',
    startDate: D(2027, 1, 18),
    stage: 'preboard',
    progress: 78,
    nextStep: 'Vetting complete. Confirm job family to start onboarding.',
    email: 'chloe.bennett@lloydsbankinggroup.com',
    vetting: [
      { name: 'Right to work', status: 'complete' },
      { name: 'Identity & address', status: 'complete' },
      { name: 'Credit reference', status: 'complete' },
      { name: 'Employment references', status: 'complete' },
      { name: 'Financial crime screening', status: 'complete' },
      { name: 'Criminal record check (DBS)', status: 'complete' },
    ],
    requests: [],
    messages: [
      { from: 'hire', text: 'Thanks for the call. Will I need a laptop with a particular spec?', time: D(2026, 11, 7), read: false },
    ],
    family: null,
  },
  {
    id: 'marcus',
    name: 'Marcus Hale',
    initials: 'MH',
    title: 'Customer Operations Specialist',
    team: 'Retail Banking · Customer Operations',
    location: 'Birmingham',
    startDate: D(2027, 1, 11),
    stage: 'vetting',
    progress: 12,
    nextStep: 'Identity and right-to-work checks in progress.',
    email: 'marcus.hale@lloydsbankinggroup.com',
    vetting: [
      { name: 'Right to work', status: 'in_progress', eta: D(2026, 11, 16), needBy: D(2026, 12, 1) },
      { name: 'Identity & address', status: 'queued', eta: D(2026, 11, 20), needBy: D(2026, 12, 1) },
      { name: 'Credit reference', status: 'queued', eta: D(2026, 12, 2), needBy: D(2026, 12, 1) },
      { name: 'Criminal record check (DBS)', status: 'queued', eta: D(2026, 12, 15), needBy: D(2026, 12, 1) },
    ],
    requests: [],
    messages: [],
    family: null,
  },
  {
    id: 'yusuf',
    name: 'Yusuf Karim',
    initials: 'YK',
    title: 'Risk Analyst',
    team: 'Commercial Banking · Risk',
    location: 'Canary Wharf, London',
    startDate: D(2026, 11, 23),
    stage: 'preboard',
    progress: 88,
    nextStep: 'Onboarding complete. Day 1 logistics sent. Buddy call booked for 20 Nov.',
    email: 'yusuf.karim@lloydsbankinggroup.com',
    vetting: [
      { name: 'Right to work', status: 'complete' },
      { name: 'Identity & address', status: 'complete' },
      { name: 'Credit reference', status: 'complete' },
      { name: 'Employment references', status: 'complete' },
      { name: 'Financial crime screening', status: 'complete' },
      { name: 'Criminal record check (DBS)', status: 'complete' },
    ],
    requests: [
      { id: 'r2', type: 'call', title: 'Call back about laptop delivery', status: 'booked', raisedOn: D(2026, 11, 5), when: D(2026, 11, 12), auto: false },
    ],
    messages: [
      { from: 'hire', text: 'Could the Day 1 pass be sent to my home address instead?', time: D(2026, 11, 9), read: false },
    ],
    family: 'ra',
    onboarding: { status: 'complete', startedOn: D(2026, 11, 2) },
  },
];
