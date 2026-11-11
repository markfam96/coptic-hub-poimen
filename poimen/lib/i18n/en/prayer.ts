// The Prayer Requests tab (app/(tabs)/prayer.tsx).
export const prayer = {
  title: 'Prayer Requests',
  subtitle: 'Submit, track, and mark answered prayers',

  // Labels for the stored category values.
  categories: {
    health: 'Health',
    family: 'Family',
    relationships: 'Relationships',
    work: 'Work / School',
    faith: 'Faith Journey',
    gratitude: 'Gratitude',
    other: 'Other',
  },

  // Short labels on the visibility chips, for the stored visibility values.
  visibilityChips: {
    private: 'Private',
    focOnly: 'Father of Confession',
    focAndServant: 'FOC + Servant',
    servantOnly: 'Servant only',
  },
  // The same values spelled out, under the chips and on each request.
  visibility: {
    private: 'Private — only me',
    focOnly: 'Visible to your Father of Confession only',
    focAndServant: 'Visible to your Father of Confession and Sunday school servant',
    servantOnly: 'Sunday school servant only',
  },

  // A request row.
  requestFallback: 'Request',
  markAnswered: '✓ Mark Answered',
  delete: '✕ Delete',

  activeTitle: 'Active ({n})',
  answeredTitle: 'Answered ({n})',
  emptyTitle: 'No active requests',
  emptyBody: 'Add your first prayer request below.',

  // The new-request form.
  newRequest: 'New Request',
  encryptionNote:
    "Prayer details are encrypted on your device before storage. Only the intended recipient's device can decrypt them — not even Nepsis can read them.",
  categoryLabel: 'CATEGORY',
  visibilityLabel: 'VISIBILITY',
  detailsLabel: 'DETAILS (OPTIONAL)',
  detailsPlaceholder:
    'Describe your request — this is encrypted and only readable by the recipient(s) you chose above.',
  submit: 'SUBMIT REQUEST',
  submitError: 'Failed to submit — please try again.',

  // Confirmations.
  deleteRequestTitle: 'Delete Request',
  deleteRequestBody: 'Remove this prayer request?',
  deleteAnsweredTitle: 'Delete',
  deleteAnsweredBody: 'Remove this answered prayer?',

  // Fictional requests shown in the demo.
  demo: {
    motherTopic: 'Health of my mother',
    motherBody:
      "My mother was diagnosed with a heart condition. Asking for Fr. Bishoy's prayers and guidance on how to support her spiritually.",
    fastTopic: 'Strength during the fast',
    fastBody: "Struggling with consistency in the Apostles' Fast. Asking for prayers for perseverance.",
    jobTopic: 'New job transition',
    jobBody: 'Starting a new role next month. Praying for wisdom, humility, and that God would direct my path.',
    daughterTopic: 'Safe delivery of our daughter',
    daughterNote: 'God blessed us with a healthy daughter. Giving thanks for answered prayer.',
  },
};
