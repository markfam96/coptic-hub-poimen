// The Spiritual Journal tab (app/(tabs)/journal.tsx). Scripture quoted on the
// screen is not here: it stays in the code, in English.
export const journal = {
  title: 'Spiritual Journal',
  subtitle: 'Reflections, prompts, and growth',

  // Shown for an entry saved without a title. The stored title stays
  // "Untitled" in every language; this is only what is displayed for it.
  untitled: 'Untitled',

  // Field labels, on the form and on a saved entry.
  labels: {
    titleOptional: 'TITLE (optional)',
    reflection: 'REFLECTION',
    scripture: 'SCRIPTURE THAT SPOKE TO ME',
    prayerIntention: 'PRAYER INTENTION',
  },

  // The journal could not be opened, or a change could not be saved.
  unavailable: {
    lockedTitle: 'Your journal is locked',
    offlineTitle: "Couldn't load your journal",
    lockedBody:
      'Your journal is encrypted with your key, which is not on this device yet. Restore it with your Recovery PIN to open your entries. Saving is paused so nothing replaces them.',
    offlineBody: 'Check your connection and try again. Saving is paused so nothing replaces your entries.',
    tryAgain: 'TRY AGAIN',
    saveError: "Your last change couldn't be saved. Check your connection — it is still on this screen.",
  },

  // Today's entry form.
  today: {
    title: "Today's Entry",
    titlePlaceholder: 'e.g. Reflection on the fast',
    reflectionPlaceholder:
      'What is God saying to you today? What are you grateful for? What are you struggling with?',
    scripturePlaceholder: 'e.g. Psalm 63:1 — O God, You are my God...',
    intentionPlaceholder: 'What are you bringing to God in prayer today?',
    flagForConfession: '📌  Bring this up with Abouna at my next confession',
    save: 'SAVE ENTRY',
  },

  // The list of saved entries.
  past: {
    title: 'Past Entries ({n})',
    emptyTitle: 'No entries yet',
    emptyBody: 'Your saved entries will appear here.',
    flagBadge: '📌 For your next confession',
  },

  // One saved entry, opened.
  detail: {
    // After the back arrow: where the arrow leads.
    back: 'Journal',
    flagged: '📌  Flagged for your next confession — tap to remove',
    flag: '📌  Bring this up with Abouna at my next confession',
    deleteTitle: 'Delete Entry',
    deleteBody: 'Delete this journal entry?',
  },

  blessings: {
    title: 'Blessings',
    titleCount: 'Blessings ({n})',
    intro:
      'Write down what God has done — an answered prayer, a kindness, a door that opened. In a harder season, come back and read them.',
    placeholder: "e.g. Mom's surgery went well — thank You, Lord.",
    add: 'ADD BLESSING',
    emptyTitle: 'Nothing recorded yet',
    emptyBody: 'Every blessing you add stays here to be read again.',
    showFewer: 'Show fewer ▴',
    showAll: 'Show all {n} blessings ▾',
    removeTitle: 'Remove blessing',
    removeBody: 'Remove this from your blessings?',
  },

  // Today's prompt: the Gospel of the day, or a fixed verse when it cannot load.
  prompt: {
    title: "Today's Prompt",
    fromGospel: 'From the Gospel of the day',
    hideFull: 'Hide the full reading ▴',
    readFull: 'Read the full Gospel — {reference} ▾',
    gospelReflection:
      "Sit with these words from today's liturgy. What is the Lord saying to you through them? Let your entry begin there.",
    fallbackRef: 'Matthew 26:41',
    fallbackReflection:
      "Reflect on a moment this week when your spirit was willing but your flesh felt weak. What did you learn about yourself? What did you learn about God's grace?",
  },

  // Fictional entries and blessings shown in the demo.
  demo: {
    fastTitle: 'Reflection on the fast',
    fastReflection:
      'Felt a deepening sense of gratitude during the Agpeya today. The third hour prayer felt different — more present.',
    fastIntention: 'That this stillness would carry into the workday.',
    gratitudeTitle: 'Gratitude',
    gratitudeReflection:
      "Reflecting on God's faithfulness with the baby's health. Psalm 116 kept coming to mind.",
    confessionTitle: 'After confession',
    confessionReflection: 'Feeling lighter. Beginning the 40-day Psalm plan. Starting with Psalm 50.',
    blessingSleep: 'The baby slept through the night for the first time — and so did we.',
    blessingCall: 'Abouna called just to check in, the day I most needed it.',
    blessingJob: 'The job offer came through after months of waiting. Glory to God.',
  },
};
