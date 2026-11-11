// The priest's portal (app/(priest)): the drawer, the flock list, one member's
// page and the encounter log. The scheduling console has its own file
// (schedule.ts).
//
// Several tables below are keyed by a value the app STORES (an encounter
// type, a life stage, a prayer category, a frequency). The key is never shown
// and never translated; only the text beside it is.
export const priest = {
  // ─── Drawer (app/(priest)/_layout.tsx) ─────────────────────────────────────
  nav: {
    flock: 'Flock',
    schedule: 'Schedule',
    member: 'Member',
    canon: 'Canon',
    encounter: 'Encounter',
  },

  // Used on more than one of the portal's screens.
  shared: {
    // Also the label of the "back" link on the member and encounter screens.
    myFlock: 'My Flock',
    // A member whose profile has no name.
    unknownMember: 'Unknown',
    visitRequested: '◎ Requested a pastoral visit',
    // Joins the parts of a one-line summary: "6 members · 2 overdue".
    dot: ' · ',
    // Joins a short list of names or numbers.
    listSeparator: ', ',
  },

  // ─── Flock list (app/(priest)/index.tsx) ───────────────────────────────────
  flock: {
    // "Monday, November 9 · Fr. Mina"
    subtitle: '{date} · {name}',
    myView: 'MY VIEW',
    memberCount: { one: '{n} member', other: '{n} members' },
    // How many members are overdue for confession.
    overdueCount: '{n} overdue',
    visitRequestCount: { one: '{n} visit request', other: '{n} visit requests' },
    searchPlaceholder: 'Search members...',
    filters: {
      all: 'All',
      due: 'Due',
      overdue: 'Overdue',
      flagged: 'Flagged',
    },
    // How long since the member's last confession, as a pill.
    status: {
      recent: '✓ Recent',
      due: '⚠ Due',
      overdue: '⚠ Overdue',
    },
    listTitle: 'Members ({n})',
    emptyTitle: 'No spiritual children yet',
    emptyBody: 'Members who list you as their Father of Confession will appear here.',
    noMatchTitle: 'No members match this filter',
    noMatchBody: 'Try a different filter.',
    // Days since the last confession.
    daysAgo: { one: '{n}d ago', other: '{n}d ago' },
    noRecord: 'No record',
    flagged: '⚑ Flagged for follow-up',

    // The sheet opened by a long press on a member.
    sheetDaysSince: { one: '{n}d since confession', other: '{n}d since confession' },
    sheetNoConfession: 'No confession on record',
    logEncounter: 'Log Encounter',
    assignCanon: 'Assign Canon',
    viewProfile: 'View Profile',
  },

  // ─── One member (app/(priest)/member.tsx) ──────────────────────────────────
  member: {
    nameFallback: 'Member',
    contactFallback: 'Contact',
    heroStage: 'Stage: {stage}',
    heroJoined: 'Joined {date}',
    // Keyed by the stored life stage.
    lifeStages: {
      single: 'Single',
      engaged: 'Engaged',
      married: 'Married',
      widowed: 'Widowed',
      divorced: 'Divorced',
    },
    children: { one: '{n} child', other: '{n} children' },
    // {ages} is a list of approximate ages: "~8, ~5".
    childrenWithAges: { one: '{n} child ({ages})', other: '{n} children ({ages})' },
    childAge: '~{age}',
    flagNote: '⚑ {note}',

    photoYours: 'Your photo of this member (visible only to you)',
    photoNone: 'No profile photo — add one (visible only to you)',
    photoCamera: '◉ Camera',
    photoChange: '▤ Change',
    photoUpload: '▤ Upload',
    photoRemove: '✕ Remove',
    photoRemoveTitle: 'Remove photo',
    photoRemoveBody: 'Remove the photo you added for this member?',
    errUpload: "Couldn't upload: {error}",
    errSave: "Couldn't save: {error}",
    errRemove: "Couldn't remove: {error}",

    statSinceConfession: 'SINCE CONF.',
    statCanons: 'CANONS',
    statRequests: 'REQUESTS',
    // The number above "SINCE CONF.": days since the last confession.
    statDays: { one: '{n}d', other: '{n}d' },
    lastVisit: 'Last pastoral visit',
    lastVisitNone: 'None logged',
    logEncounter: 'LOG ENCOUNTER',

    tabs: {
      overview: 'Overview',
      canon: 'Canon',
      prayer: 'Prayer',
      notes: 'Notes',
    },

    vitalsTitle: 'Spiritual Vitals',
    vitalsEmpty: "Member hasn't shared any vitals yet.",
    vitalNotShared: '{label} (not shared)',
    // Days since confession, in the narrow value column of the vitals list.
    vitalDays: '{n}d',

    psalmTitle: 'Psalm Memorization',
    psalmEmpty: "Member hasn't shared psalm memorization progress yet.",
    psalmStreak: 'day streak',
    psalmBest: 'best streak',
    psalmMemorized: 'memorized',

    confessionTitle: 'Confession History',
    confessionPrivacy: '✦ Dates and type only. Content is never stored.',
    confessionEmpty: 'No confession history recorded yet.',
    holyConfession: 'Holy Confession',
    selfReported: 'Self-reported by the member',

    currentCanonTitle: 'Current Canon',
    currentCanonEmpty: 'No personal rule synced yet.',
    // Follows a category name on the same line.
    assignedByYou: '  ·  assigned by you',
    currentCanonHint:
      "The member's own rule. Open the editor below to adjust it — categories you assign become read-only for the member until their next confession.",
    assignedCanonTitle: 'Assigned Canon',
    assignedCanonEmpty: 'No canon assigned yet.',
    canonSince: '{frequency} · since {date}',
    canonThisWeek: '{done}/{total} this week',
    assignCanon: 'ASSIGN CANON',

    // A summary of the member's own rule: the row names, then how each reads.
    rule: {
      prostrations: 'Prostrations',
      quiet: 'Quiet time',
      fasting: 'Fasting',
      bible: 'Bible',
      book: 'Spiritual book',
      confession: 'Confession',
      agpeyaHours: 'Agpeya hours',
      services: 'Church services',
      heartOfService: 'Heart of Service',

      prostrationsDaily: { one: '{n} daily', other: '{n} daily' },
      quietDaily: { one: '{n} min daily', other: '{n} min daily' },
      fastUntil: 'Until {time} on fasting days',
      bibleChapters: { one: '{n} chapters daily', other: '{n} chapters daily' },
      bibleMinutes: { one: '{n} minutes daily', other: '{n} minutes daily' },
      bookChapters: { one: '{title} — {n} chapters', other: '{title} — {n} chapters' },
      bookMinutes: { one: '{title} — {n} minutes', other: '{title} — {n} minutes' },
      bookUntitled: 'Untitled',
      // One weekday and what is kept on it: "Sun · Prime, Vespers".
      dayLine: '{day} · {items}',
      // A service kept a number of times per period, keyed by the stored
      // frequency.
      servicePer: {
        Weekly: '{service} · {n}× per week',
        'Every 2 weeks': '{service} · {n}× per fortnight',
        Monthly: '{service} · {n}× per month',
        'Every 2 months': '{service} · {n}× per 2 months',
        Quarterly: '{service} · {n}× per quarter',
      },
      // A Heart of Service commitment and how often it recurs.
      serving: '{text} ({freq})',
    },

    prayerTitle: 'Prayer Requests',
    prayerPrivacy: '✦ Requests shared with FOC only, or with both FOC and Sunday school servant.',
    prayerEmpty: 'No requests shared with Father of Confession.',
    // Keyed by the stored category of a prayer request.
    prayerCategories: {
      health: 'health',
      family: 'family',
      relationships: 'relationships',
      work: 'work',
      faith: 'faith',
      gratitude: 'gratitude',
      other: 'other',
    },

    notesTitle: 'Pastoral Notes (Private)',
    notesPrivacy: '✦ Your private notes. Never visible to the member.',
    notesEmpty: 'No notes yet. Add your first note below.',
    noteEdited: '{date}  (edited)',
    // The heading of a private note written while logging an encounter.
    encounterNoteHeading: '{type} · {date}',
    // Keyed by the stored encounter type.
    encounterTypes: {
      confession: 'Confession',
      counseling: 'Counseling',
      advice: 'Advice',
      visit: 'Visit',
      phone: 'Phone',
      group: 'Group',
    },
    noteSaving: 'SAVING…',
    noteSave: 'SAVE',
    noteCancel: 'CANCEL',
    notePlaceholder: 'Add a pastoral note…',
    noteAdd: 'ADD NOTE',
    noteSaveFailed: 'Failed to save — please try again.',

    // The sheet behind the ··· button: assign a canon, call, write, map.
    sheet: {
      assignCanon: 'Assign Canon',
      assignCanonSub: 'Add a spiritual practice',
      assignAction: 'ASSIGN',
      phone: 'Phone',
      phoneAction: 'CALL',
      email: 'Email',
      emailAction: 'EMAIL',
      address: 'Address',
      addressAction: 'MAP',
      empty: 'No contact info on file yet.\nMember can add this in their Profile settings.',
      close: 'CLOSE',
    },
  },

  // ─── Encounter log (app/(priest)/log-encounter.tsx) ────────────────────────
  encounter: {
    title: 'Log Pastoral Encounter',
    memberCard: 'Member',
    memberSearchPlaceholder: 'Search member...',
    typeCard: 'Encounter Type',
    // Keyed by the stored encounter type.
    types: {
      confession: { label: 'Holy Confession', desc: 'Sacramental confession' },
      counseling: { label: 'Counseling Session', desc: 'In-person pastoral guidance' },
      advice: { label: 'Spiritual Advice', desc: 'Brief direction or answer' },
      visit: { label: 'Pastoral Visit', desc: 'Home or hospital visit' },
      phone: { label: 'Phone / Video Call', desc: 'Remote check-in' },
      group: { label: 'Group Encounter', desc: 'Retreat, group study, etc.' },
    },
    dateCard: 'Date',
    datePlaceholder: 'E.g., Jun 7, 2026',
    memberNoteCard: 'Note to Member (Visible in their Timeline)',
    memberNotePlaceholder: 'E.g., We discussed the importance of the Agpeya as a rhythm of prayer...',
    memberNoteHint: "This note appears in the member's Pastoral Journey timeline.",
    privateNoteCard: 'Private Pastoral Notes (FOC Only)',
    privateNoteBanner: '✦ Never visible to the member.',
    privateNotePlaceholder: 'Your private observations and pastoral notes...',
    followUpCard: 'Schedule Follow-Up (Optional)',
    followUpPlaceholder: 'E.g., Jun 29, 2026',
    followUpHint: 'A reminder date for your Flock view. Leave blank if none.',
    sealTitle: '✝︎ Sacramental Privacy',
    sealBody:
      "Confession content is protected by holy seal. Only the date and encounter type are recorded. No content from the member's examination is stored or transmitted.",
    save: 'LOG ENCOUNTER',
    saved: '✓ ENCOUNTER LOGGED',

    errSelectMember: 'Please select a member from the list first.',
    errDemo: 'You are in demo mode — sign in with a real account to save encounters.',
    errDate: 'Invalid date — use a format like "Jun 7, 2026"',
    errFollowUp: 'Enter a date like "Jun 29, 2026", or leave this blank.',
    errSave: "Couldn't save: {error}",
  },

  // ─── Demo mode: a fictional flock ──────────────────────────────────────────
  // Keyed by the short id of each demo member (demo-mh → mh).
  demo: {
    names: {
      mh: 'Michael Hanna',
      sg: 'Sara Girgis',
      pb: 'Peter Botros',
      mm: 'Mary Mikhail',
      ag: 'Andrew George',
      cn: 'Christine Naguib',
    },
    // What the avatar shows when there is no photo.
    initials: {
      mh: 'MH',
      sg: 'SG',
      pb: 'PB',
      mm: 'MM',
      ag: 'AG',
      cn: 'CN',
    },
    stages: {
      growing: 'Growing',
      mature: 'Mature',
      new: 'New',
      seeking: 'Seeking',
      multiplying: 'Multiplying',
    },
    // The line under a member's name in the flock list.
    flockNotes: {
      mh: 'New father — pastoral visit completed May 4.',
      pb: 'Flagged: missed two follow-up appointments.',
      ag: 'New to the church — needs initial meeting.',
    },
    // Why a member is flagged, on their own page.
    flagNotes: {
      pb: 'Missed two follow-up appointments.',
      ag: 'New to the church — needs initial meeting.',
    },
    spouses: {
      mh: 'Nadia Hanna',
      pb: 'Maria Botros',
      mm: 'Fady Mikhail',
      cn: 'Mina Naguib',
    },
    children: {
      mh: ['Kyrillos'],
      pb: ['Anthony', 'Mary'],
      mm: ['Bishoy', 'Irene'],
      cn: ['Verena', 'Mark', 'Irini'],
    },
    introMeeting: 'Introductory Meeting',
    // Notes on each member's past confessions, newest first.
    confessionNotes: {
      mh: [
        'Discussed new-father anxieties. Encouraged daily Agpeya.',
        'Pre-birth spiritual preparation.',
      ],
      sg: [
        'Discussed vocation discernment. Encouraged continued prayer and patience.',
        'Lenten preparation.',
        'Start-of-year spiritual plan.',
      ],
      pb: [
        'Set spiritual goals.',
        'Getting to know one another.',
      ],
      mm: [
        'Marriage enrichment focus. Prayed together with Fady.',
        'Lenten preparation. Addressed anxiety about second child.',
      ],
      cn: [
        "Strong spiritually. Discussed leading the women's Bible study.",
        'Lenten reflection — themes of gratitude and service.',
        'Pre-Advent preparation.',
      ],
    },
    prayerTopics: {
      mh: [
        'Gratitude for new baby — prayers of thanksgiving',
        'Wisdom as a new father',
      ],
      sg: ['Discernment of vocation — monastery vs. marriage'],
      pb: [
        'Job transition — feeling lost',
        'Family reconciliation with brother',
      ],
      mm: [
        'Peace in marriage — communication difficulties',
        'Healing for mother-in-law',
      ],
      ag: ['Searching for meaning — career feels empty'],
      cn: ["Guidance for Verena's school transition"],
    },
    canons: {
      morningAgpeya: 'Morning Agpeya',
      psalmReading: 'Psalm reading (1 chapter)',
      completeAgpeya: 'Complete Agpeya (all 7 hours)',
      bibleTwo: 'Bible reading (2 chapters)',
      gospelOne: 'Gospel Reading (1 chapter)',
      eveningPrayer: 'Evening Prayer (Compline)',
      bibleOne: 'Bible reading (1 chapter)',
      midnightPraise: 'Midnight Praise (Tasbeha)',
      bibleThree: 'Bible reading (3 chapters)',
    },
    // The priest's private note on each member.
    notes: {
      mh: 'Growing well since the birth of Kyrillos. Pastoral visit May 4 was fruitful. Follow up on consistent Agpeya practice — suggested praying together as a couple after the baby sleeps.',
      sg: 'Spiritually mature and consistent. Currently in a season of vocational discernment. Needs gentle guidance, not pressure. Recommend reading Fr. Matta El-Meskeen on the monastic call.',
      pb: 'Needs consistent follow-up. Has expressed interest in deepening faith but struggles with consistency. Suggested accountability partner from the young adult group.',
      mm: "Consistent growth. Fady and Mary attend together which is encouraging. Consider inviting them to lead a young couples' small group — they have the maturity for it.",
      ag: 'Has not had a first confession yet. Moved from Chicago in January. Attends Sunday Liturgy irregularly. Needs a warm personal invitation — try a phone call this week before Sunday.',
      cn: "One of the strongest members of the flock. Mentoring two younger women. Consider formally appointing her to lead the women's spiritual development group.",
    },
  },
};
