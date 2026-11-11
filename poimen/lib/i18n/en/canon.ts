// The member's own canon: the Canon tab, the rule editor (app/canon/rule.tsx)
// and the lib/canon modules that word a rule's items.
//
// Several tables below are keyed by a value the app STORES (an hour or
// service key, a frequency such as 'Monthly'). The key is never shown and
// never translated; only the text beside it is.
export const canon = {
  // ─── Option names (lib/canon/rule-store.ts) ────────────────────────────────
  // Agpeya hours, keyed by the stored hour key.
  hours: {
    prime: 'First Hour (Prime)',
    terce: 'Third Hour (Terce)',
    sext: 'Sixth Hour (Sext)',
    none: 'Ninth Hour (None)',
    vespers: 'Eleventh Hour (Vespers)',
    compline: 'Twelfth Hour (Compline)',
    veil: 'Prayer of the Veil',
    midnight: 'Midnight (Three Watches)',
  },
  // Church services, keyed by the stored service key.
  services: {
    church_vespers: 'Vespers (Raising of Incense)',
    matins: 'Matins',
    liturgy: 'Divine Liturgy',
    communion: 'Holy Communion',
    midnight_praise: 'Midnight Praise (Tasbeha)',
  },
  verbAttend: 'Attend',
  verbReceive: 'Receive',
  // How a service reads as a canon item: you attend a service, but you
  // receive the Eucharist.
  serviceActions: {
    church_vespers: 'Attend Vespers (Raising of Incense)',
    matins: 'Attend Matins',
    liturgy: 'Attend Divine Liturgy',
    communion: 'Receive Holy Communion',
    midnight_praise: 'Attend Midnight Praise (Tasbeha)',
  },
  attendOther: 'Attend {service}',

  // Frequencies, keyed by the stored value.
  freq: {
    Daily: 'Daily',
    Weekly: 'Weekly',
    'Every 2 weeks': 'Every 2 weeks',
    Monthly: 'Monthly',
    'Every 2 months': 'Every 2 months',
    Quarterly: 'Quarterly',
    'Twice a year': 'Twice a year',
  },
  // The same, as it reads inside a sentence ("your rule of monthly confession").
  freqInSentence: {
    Daily: 'daily',
    Weekly: 'weekly',
    'Every 2 weeks': 'every 2 weeks',
    Monthly: 'monthly',
    'Every 2 months': 'every 2 months',
    Quarterly: 'quarterly',
    'Twice a year': 'twice a year',
  },

  // Index 0 = Sunday.
  weekdays: ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'],
  weekdaysShort: ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'],
  // Joins a short list of weekdays.
  listSeparator: ', ',

  // The "fast until" time is stored as '3:00 PM'; this is how it is shown.
  timeAm: '{time} AM',
  timePm: '{time} PM',

  // ─── Periods (lib/canon/periods.ts), keyed by the stored frequency ─────────
  periodNouns: {
    Weekly: 'week',
    'Every 2 weeks': 'fortnight',
    Monthly: 'month',
    'Every 2 months': '2 months',
    Quarterly: 'quarter',
  },
  // The unit shown beside a count: "2 × / week".
  periodUnits: {
    Weekly: '× / week',
    'Every 2 weeks': '× / 2 weeks',
    Monthly: '× / month',
    'Every 2 months': '× / 2 months',
    Quarterly: '× / quarter',
  },
  countWithUnit: '{n} {unit}',

  // ─── Spiritual Vitals rows (lib/canon/vitals.ts), keyed by category key ────
  vitals: {
    prayer: 'Daily Prayer (Agpeya + Prostrations)',
    quiet: 'Quiet Time',
    scripture: 'Scripture Reading',
    book: 'Spiritual Book',
    liturgy: 'Liturgical Services',
    communion: 'Holy Communion',
    fasting: 'Fasting',
    service: 'Service / Diakonia',
    confession: 'Confession',
  },

  // ─── Canon items for a day (lib/canon/today.ts) ────────────────────────────
  items: {
    prayHour: 'Pray the {hour}',
    // A service committed to by count, keyed by its frequency.
    countProgress: {
      Weekly: '{action} — {done} of {target} this week',
      'Every 2 weeks': '{action} — {done} of {target} this fortnight',
      Monthly: '{action} — {done} of {target} this month',
      'Every 2 months': '{action} — {done} of {target} this 2 months',
      Quarterly: '{action} — {done} of {target} this quarter',
    },
    countComplete: {
      Weekly: '✓ Complete for this week',
      'Every 2 weeks': '✓ Complete for this fortnight',
      Monthly: '✓ Complete for this month',
      'Every 2 months': '✓ Complete for this 2 months',
      Quarterly: '✓ Complete for this quarter',
    },
    fast: 'Fast — abstain from food until {time}',
    prostrations: { one: '{n} prostrations (metanias)', other: '{n} prostrations (metanias)' },
    quiet: { one: '{n} min of quiet time', other: '{n} min of quiet time' },
    readChapters: { one: '{n} chapter', other: '{n} chapters' },
    readMinutes: { one: '{n} min', other: '{n} min' },
    bible: 'Bible reading — {amount}',
    book: '{title} — {amount}',
    bookFallback: 'Spiritual book',
    adhocDone: '✓ Logged — not part of your canon · tap to remove',
  },

  // ─── Postponing a Heart of Service item (lib/canon/postpone.ts) ────────────
  postpone: {
    nextWeek: 'Next week',
    nextMonth: 'Next month',
  },

  // ─── Priest canon templates (lib/canon/templates.ts) ───────────────────────
  templates: {
    untitled: 'Untitled',
    nameRequired: 'Give the template a name.',
    emptyBody: 'Turn on at least one part of the canon first.',
    customComponents: { one: '{n} custom component', other: '{n} custom components' },
    empty: 'Empty template',
  },

  // ─── Canon tab (app/(tabs)/canon.tsx) ──────────────────────────────────────
  tab: {
    title: 'Spiritual Canon',
    subtitle: 'A remedy for the soul, not a task list',
    cardTitle: 'My Spiritual Canon',
    fastingDay: 'Fasting day',

    completingDay: 'Completing {date}',
    completingDaySettled: 'Completing {date} · counted services are already settled for that period',

    assignedTag: '🔒 Assigned by your Father of Confession',
    doneToday: '✓ Done today',
    postponeButton: 'Postpone ▾',
    postponeUntil: 'Postpone until',
    // A priest-assigned component with its frequency, and its weekdays.
    assignedWithFreq: '{text} · {freq}',
    assignedWithFreqDays: '{text} · {freq} · {days}',

    emptyTitle: 'No canon set yet',
    emptyBody:
      'Set your spiritual canon with your Father of Confession — Agpeya hours, church services, fasting, prostrations, quiet time, and reading, per day of the week.',
    setMyCanon: 'Set my canon',
    or: 'or',
    logAttendance: '＋  Log a service or communion',
    attendedToday: 'What did you attend today?',
    attendedThatDay: 'What did you attend that day?',

    readinessTitle: 'Communion Readiness',
    readyLabel: 'Ready',
    readyBody: {
      one: '{n} day since confession — within your rule of {freq} confession. You are in good standing for Holy Communion.',
      other: '{n} days since confession — within your rule of {freq} confession. You are in good standing for Holy Communion.',
    },
    overdueLabel: 'Confession overdue',
    overdueBody: {
      one: '{n} days since your last confession — your canon calls for {freq} confession. Consider scheduling before your next Communion.',
      other: '{n} days since your last confession — your canon calls for {freq} confession. Consider scheduling before your next Communion.',
    },
    readinessEmpty: 'Complete a confession (or log one on the Confession tab) and readiness guidance will appear here.',
    readinessNote: 'Based on your confession date. Your Father of Confession may adjust this guidance.',

    pastCanons: 'Past Canons ({n})',
    dateRange: '{start} – {end}',
    demoHistoryLent: 'Great Lent Canon',
    demoHistoryNewYear: 'New Year Canon',
  },

  // ─── Rule editor (app/canon/rule.tsx) ──────────────────────────────────────
  rule: {
    backToCanon: 'Canon',
    title: 'Edit Rule',
    savedTick: 'Saved ✓',
    intro: 'Set your rule together with your father of confession. Add only what you can keep faithfully.',
    lockBanner:
      '🔒 Some parts of your canon were set by your Father of Confession. Those are read-only until your next confession, or until he changes them. You can still edit the rest.',
    lockNote:
      "🔒 Set by your Father of Confession — you can't change this until your next confession, or until he changes or removes it.",

    everyDay: 'Every day',
    prostrations: 'Prostrations (metanias)',
    prostrationsNote: 'Not done on Saturdays, Sundays, or during the Holy Fifty.',
    quietTime: 'Quiet time',
    minutesShort: { one: '{n} min', other: '{n} min' },

    fastUntil: 'Fast until (on fasting days)',
    fastNote:
      "Wednesdays, Fridays, and the Church's fasting seasons are fasting days automatically, except during the Holy Fifty.",

    bibleReading: 'Bible reading',
    chapters: 'Chapters',
    minutes: 'Minutes',
    // A locked reading amount; the English shows the stored mode as it is.
    amountChapters: { one: '{n} chapters', other: '{n} chapters' },
    amountMinutes: { one: '{n} minutes', other: '{n} minutes' },

    spiritualBook: 'Spiritual book',
    addPlus: '+ Add',
    lockedBook: '{title} · {amount}',
    lockedBookFallback: 'A spiritual book',
    bookPlaceholder: 'Book title (e.g. The Spiritual Ladder)',

    confessionFrequency: 'Confession frequency',

    churchServices: 'Church services',
    // A locked counted service, keyed by its frequency.
    lockedCount: {
      Weekly: '{service} · {n}/ week',
      'Every 2 weeks': '{service} · {n}/ 2 weeks',
      Monthly: '{service} · {n}/ month',
      'Every 2 months': '{service} · {n}/ 2 months',
      Quarterly: '{service} · {n}/ quarter',
    },
    setOnDaysBelow: 'Set on specific days below.',
    servicesHelp:
      'Commit either to specific days of the week, or to a number of times per week that you log as you attend — one or the other, not both.',
    specificDays: 'Specific days',
    timesPerWeek: 'Times per week',
    countsHelp: "These appear in your canon every day until you've logged them for the period.",

    eachDay: 'For each day of the week',
    dayToday: '{day}  · today',
    summaryHours: { one: '{n} hours', other: '{n} hours' },
    summaryServices: { one: '{n} services', other: '{n} services' },
    summaryServing: { one: '{n} serving', other: '{n} serving' },
    summaryFastDay: 'fast day',
    summaryNothing: 'Nothing set',

    agpeyaHours: 'Agpeya hours',
    setAsCountsAbove: 'Set as times per week above.',
    heartOfService: 'Heart of Service',
    servingWithFreq: '{text} · {freq}',
    servicePlaceholder: 'Your service (e.g. Sunday school, visiting the sick)',
    serviceNote:
      "A service appears each {day} until checked off, then rests for its frequency (a monthly service returns about a month after it's done).",
    autoFast: '✦ Automatically a fasting day (except during the Holy Fifty).',

    done: 'DONE — CHANGES SAVE AUTOMATICALLY',
  },
};
