// Day 1 to Day 30 content. Dummy data for the demo. Loaded by the employee app and the manager portal.

// Training videos are played inside this app (no links out to other sites).
// The player is a placeholder in the demo: swap `src` for a real MP4 hosted in the project.
const TRAINING_VIDEOS = [
  { id: 'welcome', title: 'Welcome to Lloyds Banking Group', minutes: 4, module: 'Day 1',
    summary: 'Who we are, what we care about, and how the first month works.',
    transcript: 'Welcome. This short film explains our purpose, how the bank is organised, and where to go when you have a question.',
    src: null },
  { id: 'security', title: 'Information security basics', minutes: 9, module: 'Day 1',
    summary: 'Phishing, passwords, screen locking and what to do if something looks wrong.',
    transcript: 'Information security is everyone’s job. Never share your password, check senders before opening links, and report anything suspicious straight away.',
    src: null },
  { id: 'teams', title: 'Working in Microsoft Teams', minutes: 6, module: 'Week 1',
    summary: 'Chats, channels, calls and how to find your team’s files.',
    transcript: 'Teams is where we talk day to day. Use channels for team topics, chats for one-to-one questions, and calls for anything that needs a conversation.',
    src: null },
  { id: 'data', title: 'Data protection and handling customer data', minutes: 12, module: 'Week 1',
    summary: 'The rules for personal data, and how to classify and store information.',
    transcript: 'Personal data needs care. Know what you hold, keep it only as long as needed, and use the approved tools for storage and sharing.',
    src: null },
  { id: 'culture', title: 'How we make decisions as a team', minutes: 5, module: 'Week 2-4',
    summary: 'Ways of working, planning cycles and how to raise ideas.',
    transcript: 'Our teams work in short cycles. Bring an idea with the problem it solves, the evidence you have, and who you need to talk to.',
    src: null },
];

// The first 30 days plan. `when` is the window the item is due in.
const FIRST30_PLAN = [
  { key: 'day1-arrive', window: 'Day 1', title: 'Arrive at reception for 9:00', detail: 'Level 12 reception. Your building pass is ready.' },
  { key: 'day1-induction', window: 'Day 1', title: 'Induction and IT set-up', detail: 'Sign in to your laptop and set up multi-factor authentication.' },
  { key: 'day1-video-welcome', window: 'Day 1', title: 'Watch: Welcome to Lloyds Banking Group', detail: 'Four minutes, in the training section.', video: 'welcome' },
  { key: 'day1-video-security', window: 'Day 1', title: 'Watch: Information security basics', detail: 'Nine minutes, in the training section.', video: 'security' },
  { key: 'week1-1to1', window: 'Week 1', title: 'Week 1 one-to-one with your manager', detail: 'Booked by your manager. Your calendar invite is in Updates.', oneToOne: true },
  { key: 'week1-intro', window: 'Week 1', title: 'Team intro call', detail: 'A short call with the team. Book a slot from Team intros.', intros: true },
  { key: 'week1-video-teams', window: 'Week 1', title: 'Watch: Working in Microsoft Teams', detail: 'Six minutes.', video: 'teams' },
  { key: 'week1-video-data', window: 'Week 1', title: 'Watch: Data protection', detail: 'Twelve minutes.', video: 'data' },
  { key: 'week1-benefits', window: 'Week 1', title: 'Choose your rewards and benefits', detail: 'Pension, holiday and health cover. You have 30 days to decide.', benefits: true },
  { key: 'week2-access', window: 'Week 2-4', title: 'Check your access to systems', detail: 'Confirm you can open the systems your role needs. Request anything that is missing.', access: true },
  { key: 'week1-goals', window: 'Week 1', title: 'Set your goals with your manager', detail: 'Book a goal-setting check-in with Jordan and agree up to three goals for your first 30 days.', goals: true },
  { key: 'week2-communities', window: 'Week 2-4', title: 'Explore the community pages', detail: 'Join the networks that match your interests.', communities: true },
  { key: 'week2-video-culture', window: 'Week 2-4', title: 'Watch: How we make decisions as a team', detail: 'Five minutes.', video: 'culture' },
];

// Team intro calls (short, 20 minutes each)
const TEAM_INTROS = [
  { id: 'intro-priya', name: 'Priya Natarajan', role: 'Senior Data Engineer', topic: 'How data pipelines work for our reports' },
  { id: 'intro-tom', name: 'Tom Reynolds', role: 'Data Analyst', topic: 'The reporting tools we use every day' },
  { id: 'intro-leah', name: 'Leah Simmons', role: 'Product Owner, Insight', topic: 'How we plan and prioritise work' },
  { id: 'intro-dan', name: 'Dan Whitfield', role: 'Risk Analytics Manager', topic: 'Where Commercial Banking and Risk work together' },
];

// Rewards and benefits: each group has one choice, with the default first
const BENEFIT_GROUPS = [
  { id: 'pension', title: 'Pension contribution', help: 'Your contribution, matched by the bank.', options: [
    { id: 'p5', label: '5% of salary', cost: 'Included' },
    { id: 'p8', label: '8% of salary', cost: '+ £0 per month' },
    { id: 'p10', label: '10% of salary', cost: '+ £0 per month, matched up to 10%' },
  ] },
  { id: 'holiday', title: 'Annual holiday', help: 'Swap days of pay for extra holiday, or buy days back.', options: [
    { id: 'h25', label: '25 days (standard)', cost: 'Included' },
    { id: 'h30', label: '30 days', cost: 'Costs 5 days of pay' },
    { id: 'h27', label: '27 days', cost: 'Costs 2 days of pay' },
  ] },
  { id: 'health', title: 'Health cover', help: 'Private medical cover for you.', options: [
    { id: 'hc-std', label: 'Standard health cover', cost: 'Included' },
    { id: 'hc-plus', label: 'Plus cover (dental and optical)', cost: '£12 per month' },
  ] },
  { id: 'cycle', title: 'Cycle to work scheme', help: 'Spread the cost of a bike and kit through salary.', options: [
    { id: 'cy-no', label: 'Not this year', cost: '' },
    { id: 'cy-yes', label: 'Yes, interested', cost: 'Set up through payroll' },
  ] },
  { id: 'sharematch', title: 'ShareMatch', help: 'Buy Lloyds Banking Group shares from your pay each month. We add matching shares up to a limit. Demo terms, to be confirmed by the reward team.', options: [
    { id: 'sm-none', label: 'Not joining now', cost: '' },
    { id: 'sm-25', label: '£25 a month', cost: 'Matching shares up to £50 a year (demo terms)' },
    { id: 'sm-50', label: '£50 a month', cost: 'Matching shares up to £100 a year (demo terms)' },
  ] },
];

// Community pages suggested for new starters
const COMMUNITIES = [
  { id: 'women-data', name: 'Women in Data', members: 412, desc: 'Networking, mentoring and talks for women working with data across the bank.' },
  { id: 'running', name: 'Canary Wharf Running Club', members: 128, desc: 'Lunchtime and after-work runs around the docks. All paces welcome.' },
  { id: 'sustain', name: 'Sustainability Network', members: 635, desc: 'Ideas and projects to lower our carbon footprint at work and at home.' },
  { id: 'graduates', name: 'Early Careers Network', members: 281, desc: 'For colleagues in their first three years. Mentoring and social events.' },
  { id: 'disability', name: 'Accessibility and Disability Network', members: 344, desc: 'Support, adjustments advice and events for everyone who wants a more accessible workplace.' },
  { id: 'chess', name: 'Board Games and Chess Club', members: 77, desc: 'Monthly lunchtime games in the Level 12 social area.' },
];

// Desk booking system. Placeholder address: replace with the real booking system link before the demo.
const DESK_BOOKING = {
  label: 'Desk booking system',
  url: 'https://deskbooking.example.lloydsbankinggroup.com',
};

// Weekly check-in answers
const MOOD_OPTIONS = [
  { id: 'good', label: 'Good', tone: 'green', text: 'Things are going well.' },
  { id: 'okay', label: 'Okay', tone: 'amber', text: 'Mostly fine, with a few bumps.' },
  { id: 'poor', label: 'Not great', tone: 'red', text: 'Finding this hard at the moment.' },
];

// How you fit in: from what the bank wants, down to what the new starter does, and why each level matters.
// Draft wording for the demo. The strategy team should confirm each line before use.
const PURPOSE_CASCADE = [
  { level: 'The bank', want: 'Help Britain prosper by being the bank people trust with their everyday and long-term money.',
    why: 'Every level below is built to deliver this. Small, careful work in each team adds up to customer trust.' },
  { level: 'Commercial Banking', want: 'Help businesses start, grow and bank well, with reliable lending, payments and advice.',
    why: 'Businesses create jobs and growth. Dependable service and sound lending keep that going, especially in hard months.' },
  { level: 'Data and Insight', want: 'Turn customer and business data into decisions people can trust.',
    why: 'Good data stops us making the wrong call on a loan, a price or a risk, and it protects customers from errors.' },
  { level: 'Your team and role', want: 'Turn business questions into clear requirements, reports and recommendations.',
    why: 'This is the bridge between the business and the data teams. A clear question answered well saves weeks of rework.' },
  { level: 'What you do', want: 'Deliver accurate analysis for your product area, handle data safely, and share what you learn with your team.',
    why: 'Your work is what the business sees day to day. A report that is right and on time lets a team act with confidence.', you: true },
];
