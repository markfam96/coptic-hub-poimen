// The Profile screen (app/profile.tsx).
export const profile = {
  // Back link at the top.
  back: 'Home',

  photo: {
    camera: '◉ Camera',
    change: '▤ Change Photo',
    add: '▤ Add Photo',
    remove: '✕ Remove',
    uploadFailed: "Couldn't upload: {error}",
    saveFailed: "Couldn't save: {error}",
    removeTitle: 'Remove photo',
    removeBody: 'Remove your profile picture?',
  },

  // Shown on a save button for two seconds after a save.
  savedBadge: '✓ SAVED',
  saveFailed: 'Failed to save — please try again.',
  saveChildrenFailed: 'Failed to save children — please try again.',
  // Under the Contact and Family card titles.
  sharedWithFocOnly: 'Shared only with your Father of Confession.',

  account: {
    title: 'Account Details',
    fullName: 'Full Name',
    fullNamePlaceholder: 'Your name',
    email: 'Email',
    emailHint: 'Email cannot be changed here. Contact support.',
    church: 'Church',
    churchPlaceholder: 'Select your church…',
    save: 'SAVE CHANGES',
  },

  contact: {
    title: 'Contact for Visitation',
    phone: 'Phone',
    phonePlaceholder: '(555) 000-0000',
    email: 'Contact Email',
    emailPlaceholder: 'preferred@email.com',
    address: 'Address',
    street: 'Street address',
    line2: 'Apt, suite, etc. (optional)',
    city: 'City',
    // Two-letter state, in a narrow box.
    state: 'ST',
    zip: 'ZIP',
    // Two-letter country code; US when left empty.
    country: 'Country (US)',
    save: 'SAVE CONTACT',
  },

  family: {
    title: 'Life Stage & Family',
    lifeStage: 'Life Stage',
    // Labels for the stored values single / engaged / married / widowed / divorced.
    stages: {
      single: 'Single',
      engaged: 'Engaged',
      married: 'Married',
      widowed: 'Widowed',
      divorced: 'Divorced',
    },
    spouseName: "Spouse's Name",
    spousePlaceholder: 'Full name',
    children: 'Children',
    noChildren: 'No children added yet.',
    // {n} is the child's age in years, {year} the year of birth.
    childMeta: { one: 'b. {year} · ~{n} yrs old', other: 'b. {year} · ~{n} yrs old' },
    childName: 'Name',
    childYear: 'Year',
    addChild: 'ADD',
    save: 'SAVE FAMILY',
  },

  appearance: {
    title: 'Appearance',
    dark: 'Dark Mode',
    light: 'Light Mode',
    note: "Dark mode is Nepsis's navy and gold; light mode is a bright Byzantine palette — warm parchment, sepia ink, and liturgical crimson. Switching reloads the app.",
    // Only when the app could not reload itself.
    savedTitle: 'Theme saved',
    savedBody: 'Close and reopen the app to apply the new appearance.',
  },

  language: {
    title: 'Language',
    note: 'Switching reloads the app.',
  },

  // The card's title and summary are PRIVACY_COPY.settingsTitle / settingsSummary.
  privacy: {
    readPolicy: 'Read the full privacy policy →',
  },

  reminders: {
    title: 'Reminders',
    body: 'A nudge for your canon and your psalms, at a time you pick. Written by this phone rather than sent to it — nothing about your rule leaves the device to make one happen.',
    button: 'Set up reminders',
  },

  feedback: {
    title: 'Feedback',
    body: 'Something broken, or an idea for the app? Tell us directly — it goes to the people who build Nepsis, not to your Father of Confession or your church.',
    button: 'Send feedback',
  },

  invite: {
    title: 'Your Invite Code',
    sharePriest: 'Share this code with your congregants so they can link to you in their app.',
    shareServant: 'Share this code with your students so they can link to you in their app.',
  },

  foc: {
    title: 'Father of Confession',
    linked: '✓ Linked',
    shareVitals: 'Share vitals with my FOC',
    shareVitalsHint: 'Allows your priest to see your spiritual vitals',
    link: 'LINK TO FATHER OF CONFESSION',
  },

  servant: {
    title: 'Sunday School Servant',
    linked: '✓ Linked',
    link: 'LINK TO SUNDAY SCHOOL SERVANT',
  },

  tutorial: 'View App Tutorial',

  faceId: {
    label: 'Face ID Lock',
    hint: 'Require Face ID to open the app',
  },

  demo: {
    label: 'Demo Mode',
    hint: 'Shows sample data — no Supabase required',
  },

  signOut: {
    button: 'Sign Out',
    confirmTitle: 'Sign Out',
    confirmBody: 'Are you sure you want to sign out?',
    confirmButton: 'Sign Out',
  },

  deleteAccount: 'Delete my account',
};
