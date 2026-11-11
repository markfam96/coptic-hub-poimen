// The Confession tab (app/(tabs)/confession.tsx): the hub, the journal and its
// composer, the notes used during confession, the on-device history and the
// completion screen. The examination's own wording is in examination.ts.
export const confession = {
  // ─── Hub ───────────────────────────────────────────────────────────────────
  hub: {
    title: 'Confession',
    subtitle: 'Private — encrypted and kept on this device',
    // One sentence in two runs: the first is bold.
    privacyBold: 'Encrypted on your device. ',
    privacyBody:
      'Your journal and examination are saved between confessions, encrypted with a key that never leaves this phone. Only the date of your confession is ever shared with your Father of Confession.',
    howItWorks: 'How this tab works  →',

    sectionPrepare: 'PREPARE',
    sectionDuring: 'DURING CONFESSION',
    sectionLookBack: 'LOOK BACK',

    // A line break in a card's second line starts a new line on screen.
    journalTitle: 'Confession journal',
    journalSub: 'Log incidents and questions for your father — waiting in your notes',
    examTitle: 'Examination of conscience',
    examSub: 'Review each day and before confession — carries into your notes',
    notesTitle: 'My confession notes',
    notesSub: 'Tap each item as you speak it —\nnothing is sent anywhere',
    historyTitle: 'Confession history',
    historySub: "What you've confessed over time — what keeps returning,\nwhat has fallen away. This phone only.",

    logTitle: 'Log My Last Confession',
    lastRecorded: 'Last recorded: {date}',
    datePlaceholder: 'E.g., Jun 15, 2026',
    dateInvalid: 'Invalid date — use a format like "Jun 15, 2026"',
    logButton: 'LOG CONFESSION',
    logged: '✓ LOGGED',
    logHint: 'Only the date is saved. No content is recorded.',

    scheduleTitle: 'Schedule Confession',
    requestTitle: 'Request a confession appointment',
    requestSub: 'Pick from the times your father has opened —\nhe confirms the request from his end',

    datesTitle: 'Confession History',
    datesEmptyTitle: 'No history yet',
    datesEmptyBody:
      'Confession dates appear here after your Father of Confession logs your meeting, or when you record one. Content is never stored on the server.',
    holyConfession: 'Holy Confession',
    received: '✝︎ Received',
    datesFooter: 'Dates only. Content protected by the holy seal.',

    deleteDateTitle: 'Delete confession date',
    deleteDateBody: 'This removes it from your history and cannot be undone.',

    // Demo mode: notes shown beside two sample confession dates.
    demoNotePsalms: 'Fr. assigned: 40-day Psalm reading plan',
    demoNoteMarriage: 'Fr. assigned: Marriage prayer practice',
  },

  // ─── Journal ───────────────────────────────────────────────────────────────
  journal: {
    title: 'Journal',
    emptyTitle: 'Nothing logged yet',
    emptyBody:
      'As things happen through the day, tap ＋ to note them under an examination domain. Whatever you record here will be waiting in your confession notes.',
    logIncident: '＋  Log an incident',
    sinceLast: 'SINCE YOUR LAST CONFESSION',

    guidanceLabel: 'SPIRITUAL GUIDANCE',
    guidanceHint:
      'Questions you want to ask your father of confession. They will be waiting in your confession notes, so nothing is forgotten in the moment.',
    questionPlaceholder: 'e.g. How do I keep my prayer rule when I travel for work?',
    addQuestion: '＋  Add question',

    removeEntryTitle: 'Remove entry',
    removeEntryBody: 'Delete this journal entry?',
    removeQuestionTitle: 'Remove question',
    removeQuestionBody: 'Delete this question?',

    // When an entry was written.
    todayAt: 'Today · {time}',
    yesterdayAt: 'Yesterday · {time}',
    dateAt: '{date} · {time}',

    // The title an entry is saved with when it has none.
    untitled: 'Untitled',
  },

  // ─── New journal entry ─────────────────────────────────────────────────────
  composer: {
    title: 'New entry',
    whichDomain: 'WHICH DOMAIN?',
    whatWasIt: 'WHAT WAS IT?',
    whatWasItHint: '(optional — tap to select)',
    whatHappened: 'WHAT HAPPENED?',
    optionalHint: '(optional)',
    notePlaceholder: 'Describe the moment in your own words…',
    notePlaceholderOther: 'Describe what you want to confess…',
    hint:
      '🔒  Encrypted on your device and shown in your confession notes. It clears when you delete your notes after confession.',
  },

  // ─── Notes used during confession ──────────────────────────────────────────
  session: {
    title: 'In confession',
    remaining: '{n} left',
    intro:
      'Everything from your examination, journal, guidance notes, and anything flagged in your Spiritual Journal, grouped together. Tap each as you speak it aloud. Everything stays on this device only.',
    emptyTitle: 'Nothing noted this period',
    emptyBody:
      'Whatever you mark in your examination, log in your journal, or bring as a question appears here, ready to speak. You can still confess freely from the heart.',
    guidanceGroup: 'Questions & Guidance',
    journalGroup: 'From Your Journal',
    // How often, then the scripture reference, under an examination item.
    frequencyAndReference: '{frequency} · {reference}',
    guideNote: "This is a guide, not a script. If something comes to mind that isn't listed, speak it freely.",
    complete: '✓  Confession complete',
  },

  // ─── History kept on this device ───────────────────────────────────────────
  history: {
    title: 'Confession history',
    intro:
      'Each time you tap “Record this confession”, your notes are saved here as they stood. Encrypted, on this phone only — never sent anywhere, not even to your father.',
    emptyTitle: 'No history yet',
    emptyBody:
      'After your next confession, tap “Record this confession” and what you noted will be kept here to look back on.',

    patternsAcross: { one: 'PATTERNS ACROSS {n} CONFESSION', other: 'PATTERNS ACROSS {n} CONFESSIONS' },
    recurringTitle: 'Still recurring',
    recurringHintTooFew: 'Patterns show once you have recorded two confessions.',
    recurringHintNone: 'Nothing from before came back this time.',
    firstTitle: 'First time',
    firstHint: 'Nothing new in your latest confession.',
    fadedTitle: 'Fallen away',
    fadedHintTooFew: 'Once there is more than one confession here, what you stopped confessing shows up.',
    fadedHintNone: 'Everything confessed before was confessed again.',
    // {n} is how many confessions are recorded; {appearances} how many of them
    // this appeared in; {domain} the section it belongs to.
    appearedIn: {
      one: '{appearances} of {n} confession · {domain}',
      other: '{appearances} of {n} confessions · {domain}',
    },
    lastConfessed: 'Last confessed {date} · {appearances} of {total}',

    eachConfession: 'EACH CONFESSION',
    // The three parts of a record's summary line, joined with " · ".
    summaryConfessed: '{n} confessed',
    summaryNotes: { one: '{n} journal note', other: '{n} journal notes' },
    summaryQuestions: { one: '{n} question', other: '{n} questions' },
    nothingNoted: 'Nothing was noted for this confession.',
    quotedNote: '“{note}”',
    questionsBrought: 'Questions brought',

    removeTitle: 'Remove this record',
    removeBody: 'Delete the notes saved from {date}? This cannot be undone.',
  },

  // ─── After confession ──────────────────────────────────────────────────────
  complete: {
    title: 'Glory to God',
    // The reference under the verse. The verse itself stays in the screen.
    verseReference: '1 John 1:9',
    afterTitle: 'AFTER CONFESSION',
    afterSteps: [
      'Receive Holy Communion if you have fasted and are permitted',
      'Fulfill your epitimia as instructed by your Father of Confession',
      'Update your Rule with any changes he gave you, if applicable',
    ],
    record: '✝︎  Record this confession',
    recording: 'Recording…',
    recorded: '✓ {date} recorded as your confession',
    recordHint: 'Nothing is logged until you tap this — if you got here by accident, just go back.',
    resetVitals: '↻  Reset my Spiritual Vitals',
    vitalsReset: '✓ Vitals now track from today',
    deleteNotes: '🗑  Delete my confession notes',
    notesDeleted: '✓ Notes permanently deleted',
    returnToConfession: 'Return to confession',

    deleteTitle: 'Delete confession notes',
    deleteBody:
      'Your examination, journal, and guidance notes for this period will be permanently deleted from this device, and any journal entries flagged for confession will be unmarked. This cannot be undone.',
    deleteConfirm: 'Delete permanently',
  },
};
