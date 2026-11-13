// The Home tab (app/(tabs)/index.tsx) and the name helpers it shares with
// other screens (lib/names.ts).
export const home = {
  // A priest shown by title alone, when the profile has no usable given name.
  clergyFallbackName: 'Father',
  // Stands in for the first name when the profile has none.
  friend: 'friend',

  header: {
    // {date} is the Gregorian date, {coptic} is `copticDate` filled in,
    // {fast} a name from calendar.fastNames, {day} the day within that fast.
    subtitle: '{date} · {coptic}',
    subtitleFast: '{date} · {coptic} · {fast} · Day {day}',
    copticDate: '{day} {month}',
    // The switch to a priest's / servant's dashboard, named after the screen
    // it opens (components/ui/HeaderActions.tsx).
    focChip: 'MY FLOCK',
    classChip: 'MY STUDENTS',
  },

  // The pinned pair at the top. Each label sits under a large number.
  tiles: {
    confessionLabel: 'days since confession',
    statusRecent: '✓ Recent',
    statusDue: '⚠ Due',
    statusOverdue: '⚠ Overdue',
    statusUnknown: '— log it',
    canonLabel: 'canon today',
    canonSetUp: '— set up',
    canonAllDone: '✓ All done',
    canonInProgress: '↑ In progress',
  },

  psalms: {
    title: 'Memorize the Psalms',
    sub: 'Agpeya psalter · spaced repetition',
  },

  surveyPrompt: {
    title: 'Five quick questions?',
    body: 'Anonymous, about a minute — it decides what we build next.',
    answer: 'Answer',
    notNow: 'Not now',
  },

  churchPrompt: {
    confirmTitle: 'Is "{church}" in the directory?',
    serveTitle: 'Which church do you serve at?',
    attendTitle: 'Which church do you attend?',
    confirmBody: 'Pick it from the list so your parish is counted — or keep the name you typed.',
    serveBody: 'Members who look you up by invite code will see it. You can change it any time in Profile.',
    attendBody: 'Pick your parish from the directory — it takes a moment, and you can change it any time in Profile.',
    findIt: 'Find it',
    choose: 'Choose',
    keepAsTyped: 'Keep as typed',
    notNow: 'Not now',
  },

  // Shown when confession is due or overdue. {n} is days since confession.
  banner: {
    label: 'PREPARE',
    title: 'Examination of Conscience',
    demoBody: {
      one: 'Fr. Bishoy has confession hours this Sunday. You last confessed {n} days ago.',
      other: 'Fr. Bishoy has confession hours this Sunday. You last confessed {n} days ago.',
    },
    body: {
      one: 'You last confessed {n} days ago. Use the Confession tab to prepare before your next meeting.',
      other: 'You last confessed {n} days ago. Use the Confession tab to prepare before your next meeting.',
    },
    begin: 'Begin →',
  },

  vitals: {
    title: 'Spiritual Vitals',
    since: 'Since {date}',
    allTime: 'All time',
    // One sentence followed by a link in a bolder style.
    nudgeBefore: "◇ Your FOC can't see your vitals yet. Sharing helps him guide you better.",
    nudgeLink: 'Turn on sharing →',
    confessionLabel: 'Confession (days since)',
    // Days since confession, in the narrow value column.
    daysShort: { one: '{n}d', other: '{n}d' },
    addToCanon: 'Add to your canon  ›',
  },

  journey: {
    title: 'Pastoral Journey',
    lastVisit: 'Last pastoral visit',
    noneYet: 'None yet',
    empty: 'Your encounters with your FOC will appear here.',
    // Keyed by the encounter type stored on the server. The mark and the
    // space after it are part of the tag; the row's title is the tag
    // without them.
    tags: {
      confession: '✝︎ Confession',
      counseling: '◎ Counseling',
      visit: '⊕ Pastoral Visit',
      advice: '◇ Advice',
      phone: '◈ Call',
      group: '◉ Group',
    },
  },

  // The sample journey shown in demo mode.
  demoTimeline: [
    {
      date: 'MAY 21, 2026',
      title: 'Holy Confession',
      body: 'Fr. Bishoy assigned a 40-day reading plan from the Psalms.',
      tag: '✝︎ Confession',
    },
    {
      date: 'MAY 4, 2026',
      title: 'Pastoral Visit — Home',
      body: 'Pastoral visit following the birth of your daughter.',
      tag: '◎ Pastoral Visit',
    },
    {
      date: 'APR 20, 2026',
      title: 'Holy Week Confession',
      body: 'Guidance on marriage and family prayer practices.',
      tag: '✝︎ Confession',
    },
    {
      date: 'MAR 12, 2026',
      title: 'Small Group Check-in',
      body: "Discussed the Book of Job with the young couples' group.",
      tag: '◇ Note',
    },
  ],

  feasts: {
    feastsTitle: 'Upcoming Feasts',
    commemorationsTitle: 'Upcoming Commemorations',
  },

  foc: {
    title: 'My Father of Confession',
    demoInitials: 'BM',
    demoName: 'Fr. Bishoy Marcos',
    demoChurch: "St. Mary's Coptic Orthodox Church",
    requestConfession: 'Request Confession Appointment',
    demoNextAvailable: 'Next available: Sunday after Liturgy',
    beginExamination: 'Begin Confession Examination',
    prepareBefore: 'Prepare before your next meeting',
    notLinked: 'Your Father of Confession will link your account when they set up their Nepsis profile.',
  },

  visit: {
    requested: 'Pastoral Visit Requested',
    request: 'Request Pastoral Visit',
    requestedSub: 'Your Father of Confession has been notified · tap to cancel',
    requestSub: 'Let your Father of Confession know you’d like a visit',
    schedule: 'Schedule a Pastoral Visit',
    scheduleSub: 'Request a time from your Father of Confession',
  },

  // Asked once a member has a Father of Confession and has not yet decided.
  consent: {
    title: 'Share Your Vitals?',
    // {name} is the priest's display name, or common.yourFatherOfConfession.
    withName: 'with {name}',
    body: "Sharing your spiritual vitals lets your FOC understand how you're doing and guide you more intentionally between confessions. You can change this at any time in your profile.",
    share: 'SHARE WITH MY FOC',
    keepPrivate: 'Keep private for now',
  },

  customize: {
    title: 'Customize Dashboard',
    sub: 'The confession and canon tiles are always pinned at the top.',
    save: 'SAVE LAYOUT',
    // Keyed by section id (lib/dashboard-layout.ts keeps the id).
    sections: {
      vitals: 'Spiritual Vitals',
      journey: 'Pastoral Journey',
      feasts: 'Upcoming Feasts',
      foc: 'My FOC',
    },
  },
};
