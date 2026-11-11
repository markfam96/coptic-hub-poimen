// The screens that build someone else's canon: the priest's canon builder
// (components/priest/CanonEditor.tsx, behind app/(priest)/assign-canon and
// app/(priest)/canon-templates) and the servant's app/(servant)/assign-canon.
//
// Several tables below are keyed by a value the app STORES (a category, a
// frequency such as 'Monthly'). The key is never shown and never translated;
// only the text beside it is. The names of hours, services, weekdays and
// frequencies come from lib/canon/rule-store.ts (the `canon` dictionary).
export const canonEditor = {
  // ─── Option names, keyed by the stored value ───────────────────────────────
  // Canon categories (lib/canon/assigned.ts).
  categories: {
    prostrations: 'Prostrations',
    quiet: 'Quiet time',
    fasting: 'Fasting',
    bible: 'Bible reading',
    book: 'Spiritual book',
    confession: 'Confession frequency',
    agpeya_hours: 'Agpeya hours',
    services: 'Church services',
    heart_of_service: 'Heart of Service',
    custom: 'Custom',
  },
  // The unit beside a service's count ("2 × / week"), keyed by its frequency.
  periodUnits: {
    Weekly: '× / week',
    'Every 2 weeks': '× / 2 weeks',
    Monthly: '× / month',
    'Every 2 months': '× / 2 months',
    Quarterly: '× / quarter',
  },

  // ─── The unit beside a stepper's number ("30 metanias") ────────────────────
  // The number is shown by the stepper itself, so these carry no {n}.
  units: {
    metanias: { one: 'metanias', other: 'metanias' },
    minutes: { one: 'min', other: 'min' },
    bibleChapters: { one: 'chapter', other: 'chapters' },
    bookChapters: { one: 'chapter', other: 'chapters' },
  },

  // ─── A category's one-line summary ─────────────────────────────────────────
  // Shown under a category that is switched off, and in a template's row.
  summary: {
    // A template row lists each part as "Prostrations — 30 metanias".
    part: '{category} — {summary}',
    prostrations: { one: '{n} metanias', other: '{n} metanias' },
    quiet: { one: '{n} min', other: '{n} min' },
    fastUntil: 'until {time}',
    // The English shows the stored reading mode as it is.
    chapters: { one: '{n} chapters', other: '{n} chapters' },
    minutes: { one: '{n} minutes', other: '{n} minutes' },
    bookFallback: 'a spiritual book',
    // Agpeya hours added up over the week's days.
    hourDays: { one: '{n} hour-days', other: '{n} hour-days' },
    // Services committed to by count, added up over every service.
    perPeriod: { one: '{n}× / period', other: '{n}× / period' },
    // Services committed to by weekday, added up over the week's days.
    serviceDays: { one: '{n} service-days', other: '{n} service-days' },
    commitments: { one: '{n} commitments', other: '{n} commitments' },
  },

  // ─── Page heading ──────────────────────────────────────────────────────────
  page: {
    // Stands in for the member's name when the screen was opened without one.
    memberFallback: 'Member',
    builderTitle: 'Canon Builder',
    memberTitle: "Build {name}'s Canon",
    builderIntro:
      'Build a canon here and keep it as a template, ready to apply to anyone in your flock. Nothing on this screen belongs to a member — assigning happens from their own canon.',
    memberIntro:
      'Turn on a category to assign it. Assigned parts are locked for the member until their next confession, or until you change or remove them. Untouched categories stay as the member set them.',
  },

  // ─── Templates ─────────────────────────────────────────────────────────────
  templates: {
    titleMine: 'My Templates',
    title: 'Templates',
    newTemplate: '+ New template',
    saveThisCanon: '+ Save this canon',
    saveNamePlaceholder: 'Name it — e.g. New believer, Youth, Lent',
    saveAsTemplate: 'SAVE AS TEMPLATE',
    saveHint: 'Saves the categories switched on right now, with their values and any custom components.',
    emptyBuilder:
      'No templates yet. Switch on the parts of the canon below, name it, and save — then it’s one tap on any member’s canon.',
    emptyMember: 'No templates yet. Build them in the Canon tab, or “Save this canon” to reuse this one.',

    // A template's row.
    openHint: 'Open — tap to close',
    appliedHint: 'Applied — tap to undo',
    customCount: { one: '{n} custom component', other: '{n} custom components' },
    emptyTemplate: 'Empty template',

    // What just happened, shown under the list.
    msgEditing: 'Editing “{name}”. Tap it again to take it back out.',
    msgApplied: 'Applied “{name}” — review it, then Save to assign. Tap it again to undo.',
    msgRemovedBuilder: 'Removed “{name}” — the builder is back as it was.',
    msgRemovedCanon: 'Removed “{name}” — the canon is back as it was.',
    msgDetached: '“{name}” is left as it is. Name this one and tap Create template.',
    msgSaved: 'Saved “{name}”.',
    msgCreatedFrom: 'Created “{name}” — “{from}” is untouched. The builder is clear.',
    msgCreated: 'Created “{name}”. The builder is clear for the next one.',
    msgRenamed: 'Saved “{name}” (was “{was}”).',
    msgTemplateSaved: 'Template saved.',
    msgUpdated: 'Updated “{name}”.',
    errNothingOn: 'Turn on at least one part of the canon first.',
    errNameRequired: 'Give the template a name.',
    // The name offered for a template split off from another one.
    copyName: '{name} (copy)',

    deleteTitle: 'Delete template',
    deleteBody: 'Remove “{name}”? Canons already assigned from it are not affected.',

    // The name field and buttons at the bottom of the template workshop.
    nameLabel: 'TEMPLATE NAME',
    nameLabelNew: 'NAME THIS TEMPLATE',
    namePlaceholder: 'e.g. New believer, Youth, Lent',
    newNameHint: 'A new name makes a new template — “{name}” stays as it is.',
    create: 'CREATE TEMPLATE',
    createNamed: 'CREATE “{name}”',
    saveOver: 'SAVE OVER “{name}”',
    renameAndSaveOver: 'Rename “{from}” to “{to}” and save over it instead',
    keepAndSaveNew: 'Keep “{name}” and save these changes as a new template',
  },

  // ─── Inside the category cards ─────────────────────────────────────────────
  cards: {
    bibleChapters: 'Chapters',
    bibleMinutes: 'Minutes',
    bookChapters: 'Chapters',
    bookMinutes: 'Minutes',
    bookPlaceholder: 'Book title (e.g. The Spiritual Ladder)',

    specificDays: 'Specific days',
    timesPerWeek: 'Times per week',
    countsHelp:
      'How often to attend each service, and how many times per period. The member logs each one as they attend.',
    daysHelp: "Set what's prayed/served on each weekday. Tap a day to edit it.",
    // How many things are set on one weekday.
    daySet: '{n} set',
    dayNone: 'none',
    servicePlaceholder: 'Service (e.g. visiting the sick)',
    addCommitment: '+ Add commitment',
  },

  // ─── Custom components ─────────────────────────────────────────────────────
  custom: {
    title: 'Custom components',
    note: "Free-text additions to the member's canon. Read-only for them; you manage these.",
    noDay: 'No day chosen — it will show every day of the week.',
    placeholder: 'e.g. Read the Sayings of the Desert Fathers',
  },

  // ─── Saving a member's canon ───────────────────────────────────────────────
  save: {
    error: 'Could not save the canon — please try again.',
    savedTo: '✓ SAVED TO {name}',
    saveCanon: "SAVE {name}'S CANON",
  },

  // ─── Servant: assign a practice to a student ───────────────────────────────
  servant: {
    // Stands in for the student's name when the screen was opened without one.
    studentFallback: 'Student',
    title: 'Assign Canon',
    subtitle: '{name} · Sunday School Student',
    scopeButton: 'Prayer & Scripture only  ⓘ',
    scopeTitle: 'Why only Prayer & Scripture?',
    scopeBody:
      'As a Sunday School servant, you can assign Prayer and Bible Reading canons to your students.\n\nFasting, Confession, and advanced spiritual practices are assigned by the Father of Confession.',
    scopeDismiss: 'Got it',

    choosePractice: 'Choose Practice',
    groupPrayer: 'Prayer',
    groupScripture: 'Scripture',
    // Ready-made practices. The one chosen is saved as the practice's text,
    // exactly as a practice typed by hand would be.
    prayerPresets: [
      'Morning Agpeya',
      'Evening Agpeya',
      'Short morning prayer (Our Father + Glory Be)',
      'Intercessory prayer for family',
      'Gratitude prayer before bed',
    ],
    scripturePresets: [
      'Gospel Reading (1 chapter)',
      'Psalm Reading (1 psalm)',
      'Proverbs Reading (1 chapter)',
      'Read a passage and write one reflection',
      'Memorize one Bible verse per week',
    ],
    orCustom: '— or enter a custom practice —',
    customPlaceholder: 'E.g., Read one Bible story each evening with a parent',

    frequency: 'Frequency',
    // Keyed by the stored value.
    freq: {
      Daily: 'Daily',
      '3x/week': '3x/week',
      Weekly: 'Weekly',
      Custom: 'Custom',
    },
    customFreqPlaceholder: 'Describe the frequency...',

    startDate: 'Start Date',
    startDatePlaceholder: 'E.g., Jun 8, 2026',
    startDateInvalid: 'Enter the start date as a date, for example Jun 8, 2026.',
    saveFailed: "Couldn't assign the canon. Check your connection and try again.",

    noteTitle: 'Encouragement Note (Optional)',
    notePlaceholder: 'Leave an encouraging note for {name}...',
    noteHint: 'Visible to the student in their Canon panel.',

    assigned: '✓ ASSIGNED TO {name}',
    assign: 'ASSIGN TO {name}',
  },
};
