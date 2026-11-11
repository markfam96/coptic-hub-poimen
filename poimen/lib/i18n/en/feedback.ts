// The feedback screen (app/feedback.tsx). {app} is the app's name.
export const feedback = {
  title: 'Send Feedback',

  // Keyed by the category stored with the report.
  categories: {
    bug: { label: 'Something is broken', hint: 'What were you doing when it went wrong?' },
    idea: { label: 'An idea', hint: 'What would you like the app to do?' },
    other: { label: 'Something else', hint: 'Anything you want to tell us.' },
  },

  kindLabel: 'What kind of feedback is this?',
  placeholder: 'Type as much or as little as you like…',
  charactersLeft: { one: '{n} characters left', other: '{n} characters left' },
  sending: 'Sending…',

  thanksTitle: 'Thank you',
  thanksBody: "Your message has been sent. We read everything, though we can't always reply.",
  sendAnother: 'Send something else',

  // Who can read a report and what travels with it. One sentence in three
  // parts: the middle part is shown in a bolder style.
  whatGetsSent: {
    title: 'What gets sent',
    bodyBefore: 'Your message goes to the people who build {app}. It is',
    bodyStrong: ' not visible to your Father of Confession',
    bodyAfter: ', your servant, or anyone at your church.',
    version: 'App version · {value}',
    unknown: 'unknown',
    platform: 'Platform · {value}',
    role: 'Your role · {value}',
    notSet: 'not set',
    // What is shown for the role value that is sent.
    roles: {
      congregant: 'congregant',
      servant: 'servant',
      priest: 'priest',
      admin: 'admin',
    },
    nothingElse: 'Nothing else is attached — not your location, not your journal, confession, or prayer entries.',
  },

  // {n} is how many reports the member has sent.
  history: {
    title: "What you've sent ({n})",
    statusSent: 'Sent',
    statusRead: 'Read',
    statusResolved: 'Resolved',
  },
};
