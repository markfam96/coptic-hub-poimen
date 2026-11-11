// The five-question survey (app/survey.tsx). {app} is the app's name.
export const survey = {
  notNow: 'Not now',
  title: 'Five questions',
  // The first part is shown in a bolder style and keeps its trailing space.
  anonLead: 'Your answers are anonymous. ',
  anonBody: "They are not linked to your name or account, and no one at your church — including your Father of Confession — can see them. Skip anything you'd rather not answer.",

  // {n} is the question's number.
  questionOf: 'QUESTION {n} OF 5',

  q1: {
    title: 'How often do you use {app}?',
    daily: 'Daily',
    severalTimesAWeek: 'Several times a week',
    aboutOnceAWeek: 'About once a week',
    rarely: 'Rarely',
  },
  q2: {
    title: 'Has {app} helped you keep your canon more consistently?',
    yesNoticeably: 'Yes, noticeably',
    aLittle: 'A little',
    noChange: 'No change',
    noCanon: "I don't use the canon",
  },
  q3: {
    title: 'Which part would you miss most if it disappeared?',
    canon: 'My canon',
    confession: 'Confession preparation',
    psalms: 'Psalms',
    prayer: 'Prayer requests',
    journal: 'Journal',
    appointments: 'Appointments',
  },
  q4: {
    title: "What's the one thing you'd add or change?",
    placeholder: 'Just the one thing that matters most to you…',
  },
  q5: {
    title: "Is there anything you avoid putting in the app because you're not sure who can see it?",
    detailPlaceholder: 'What holds you back?',
  },

  sending: 'Sending…',
  send: 'Send answers',
  later: 'Ask me another time',

  thanksTitle: 'Thank you',
  thanksBody: 'Your answers help decide what {app} does next.',
};
