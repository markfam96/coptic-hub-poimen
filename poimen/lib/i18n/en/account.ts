// Screens reached from Profile that act on the account itself: linking to a
// Father of Confession or a servant, and deleting the account.
export const account = {
  // The back control on both screens names where it returns to.
  backToProfile: 'Profile',

  link: {
    titleFoc: 'Link to Father of Confession',
    titleServant: 'Link to Sunday School Servant',
    introFoc: 'Ask your priest for their 6-character invite code, then enter it below.',
    introServant: 'Ask your servant for their 6-character invite code, then enter it below.',
    // A sample of the code's shape, not words: the same in every language.
    codePlaceholder: 'A B C 1 2 3',
    find: 'FIND',
    link: 'LINK',
    unknownName: 'Unknown',

    errNotFound: 'No one found with that code. Check the code and try again.',
    // {role} is one of roleNouns below.
    errWrongRoleFoc: 'That code belongs to a {role}, not a priest.',
    errWrongRoleServant: 'That code belongs to a {role}, not a servant.',
    roleNouns: {
      congregant: 'congregant',
      servant: 'servant',
      priest: 'priest',
      admin: 'admin',
    },
    errNoLongerMatches: 'That code no longer matches. Check it and try again.',

    // Names the LINK button above.
    consent:
      'By tapping LINK you allow {name} to view your spiritual vitals, pastoral journey, and contact information. You can unlink at any time from your Profile.',
    consentNoName:
      'By tapping LINK you allow your priest to view your spiritual vitals, pastoral journey, and contact information. You can unlink at any time from your Profile.',

    hintFoc: 'Your priest can find their code in the Profile tab of their Nepsis app.',
    hintServant: 'Your servant can find their code in the Profile tab of their Nepsis app.',

    successTitle: "You're linked!",
    successBody: '{name} can now see your spiritual profile.',
    // Used when the person's name is missing.
    successBodyNoNameFoc: 'Your leader can now see your spiritual profile.',
    successBodyNoNameServant: 'Your leader can now see your spiritual profile.',
    done: 'DONE',
  },

  deleteAccount: {
    title: 'Delete my account',
    intro: 'This permanently deletes your account. It happens immediately and cannot be undone.',
    deletedHeading: 'What is deleted',
    deletedBody:
      'Your profile and photo, your spiritual journal and blessings, prayer requests, your canon and its history, spiritual vitals, psalm progress, confession dates, appointments, contact and family details, and your encryption key backup. Your confession notes on this phone are erased too.',
    keptHeading: 'What is kept',
    keptBody:
      'Your Father of Confession keeps his own records of your encounters and his notes about you, no longer linked to any account.',
    shepherdPriest:
      "As a priest, your private notes are deleted and the members linked to you are unlinked. Encounters you logged stay in each member's Pastoral Journey, without your name, and any canon you assigned becomes part of their own rule.",
    shepherdServant:
      "As a servant, your private notes are deleted and the members linked to you are unlinked. Encounters you logged stay in each member's Pastoral Journey, without your name, and any canon you assigned becomes part of their own rule.",
    confirmHeading: 'Confirm',
    // {word} is confirmWord: the word the person must type, also shown as the
    // field's placeholder.
    typeToConfirm: 'Type {word} to confirm.',
    confirmWord: 'DELETE',
    submit: 'DELETE MY ACCOUNT',
    signInAgain: 'Sign in again, then try deleting your account.',
  },
};
