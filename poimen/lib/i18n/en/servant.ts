// The Sunday-school servant's screens: the drawer (app/(servant)/_layout.tsx),
// the class list (app/(servant)/index.tsx) and one student's page
// (app/(servant)/student.tsx). The "assign canon" screen has its own entries
// in canonEditor.ts.
export const servant = {
  drawer: {
    tagline: 'Servant of the class',
    students: 'Students',
    student: 'Student',
    canon: 'Canon',
  },

  // ─── The class list ────────────────────────────────────────────────────────
  list: {
    title: 'My Students',
    // The button that leaves the servant portal for the servant's own view.
    myView: 'MY VIEW',

    // The line under the title: "3 students · 2 with active canon". The second
    // part is left out when nobody has a canon.
    studentCount: { one: '{n} student', other: '{n} students' },
    withActiveCanon: { one: '{n} with active canon', other: '{n} with active canon' },

    searchPlaceholder: 'Search students...',
    // {n} is how many students match the search.
    cardTitle: 'Students ({n})',

    emptyTitle: 'No students yet',
    emptyBody: 'Students who list you as their servant will appear here.',
    noMatchesTitle: 'No matches',
    noMatchesBody: 'Try a different search.',

    // Shown for a student whose profile has no name.
    unknownName: 'Unknown',
    canonCount: { one: '{n} canon', other: '{n} canons' },
    // {when} is a phrase such as "2 days ago".
    lastActive: 'Active {when}',

    scopeNote:
      '✦ As a Sunday School servant, you can assign Bible reading and prayer canons to your students. Confession and counseling records are handled by your Father of Confession.',
  },

  // ─── One student ───────────────────────────────────────────────────────────
  student: {
    // The link back to the class list.
    back: 'My Students',
    // Stands in for the student's name when the screen was opened without one.
    nameFallback: 'Student',
    role: 'Sunday School Student',

    // The servant's own photo of a student who has not set a picture.
    photo: {
      yours: 'Your photo of this student (visible only to you)',
      none: 'No profile photo — add one (visible only to you)',
      camera: '◉ Camera',
      change: '▤ Change',
      upload: '▤ Upload',
      remove: '✕ Remove',
      uploadFailed: "Couldn't upload: {error}",
      saveFailed: "Couldn't save: {error}",
      removeFailed: "Couldn't remove: {error}",
      removeTitle: 'Remove photo',
      removeBody: 'Remove the photo you added for this student?',
    },

    tabs: {
      canons: 'Canons',
      psalms: 'Psalms',
      notes: 'My Notes',
      prayer: 'Prayer',
    },

    canons: {
      assign: '+ ASSIGN CANON',
      cardTitle: 'Assigned Canons ({n})',
      emptyTitle: 'No canons assigned yet',
      emptyBody: 'Assign a Bible reading or prayer practice to get started.',
      // "Daily · since Jun 1, 2026". The frequency's words come from
      // canonEditor.servant.freq, the same table the assign screen offers.
      meta: '{frequency} · since {date}',
      // Completions in the last seven days: "5/7 this week".
      thisWeek: '{done}/{total} this week',
    },

    psalms: {
      cardTitle: 'Psalm Memorization',
      emptyTitle: 'No shared progress',
      // {name} is the student's first name.
      emptyBody: "{name} hasn't shared psalm memorization progress yet.",
      // Captions under a number. The first is chosen by that number.
      dayStreak: { one: 'day streak', other: 'day streak' },
      bestStreak: 'best streak',
      memorized: 'memorized',
    },

    notes: {
      cardTitle: 'My Notes',
      privacy: '✦ Private to you — not visible to the student or their FOC.',
      empty: 'No notes yet. Add your first note below.',
      // The date of a note that was changed after it was written.
      dateEdited: '{date}  (edited)',
      saving: 'SAVING…',
      save: 'SAVE',
      cancel: 'CANCEL',
      placeholder: "Add a note from today's meeting or call…",
      add: 'ADD NOTE',
      saveFailed: 'Failed to save — please try again.',
    },

    prayer: {
      cardTitle: 'Prayer Requests',
      // {name} is the student's first name.
      sharedNote: '✦ Requests {name} has explicitly shared with their Sunday school servant.',
      emptyTitle: 'No shared requests',
      emptyBody: "{name} hasn't shared any prayer requests with you yet.",
      // What is shown for the stored category of a shared request.
      categories: {
        health: 'health',
        family: 'family',
        relationships: 'relationships',
        work: 'work',
        faith: 'faith',
        gratitude: 'gratitude',
        other: 'other',
      },
    },

    scopeNote:
      '✦ You can see canon progress and psalm memorization your students choose to share. Confession history and pastoral counseling are accessible only to their Father of Confession.',
  },

  // ─── Messages from the data layer ──────────────────────────────────────────
  // Returned by lib/db/feedback.ts, lib/db/survey.ts and lib/avatar.ts and
  // shown by whichever screen made the call (feedback, survey, the photo
  // pickers). They are kept here because those modules were converted together
  // with the servant screens.
  data: {
    writeFirst: 'Please write something first.',
    sendFailed: 'Could not send just now — please try again.',
    emptyImage: 'Empty image',
  },
};
