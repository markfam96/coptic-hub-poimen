// The Reminders screen (app/reminders.tsx) and the text of the reminders
// themselves (lib/reminders/content.ts, phrasing.ts, schedule.ts). {app} is
// the app's name.
export const reminders = {
  title: 'Reminders',
  subtitle: 'Set by you, kept on this phone',

  // Shown on the web build, which cannot schedule anything.
  unsupported: {
    title: 'Not available here',
    body: 'Reminders are sent by your phone, so they work in the {app} app on iPhone and Android — not in the browser. Everything else on this screen works the same in both.',
  },

  // The phone's own notification permission is off. `strong` is set in bold
  // and `rest` follows it on the same line.
  blocked: {
    strong: 'Notifications are turned off for {app}. ',
    rest: "Turn them back on in your phone's Settings, then come back here.",
    openSettings: 'Open Settings →',
  },

  remindMe: 'Remind me',
  everyDayAt: 'Every day at',

  // The two reminders this phone writes for itself. `on` and `off` describe
  // the reminder while its switch is on or off.
  canon: {
    title: 'Your canon',
    on: 'Names what your rule actually asks of you that day — the hours, the services, anything your father has assigned. Nothing arrives on a day your rule is empty, or after you have finished it.',
    off: 'A reminder each day your rule has something standing in it.',
  },
  psalms: {
    title: 'Psalm memorization',
    on: 'Arrives only when portions are actually due for review, and leads with your streak when there is one to keep. A day with nothing due stays quiet.',
    off: 'A reminder on the days your review queue has something in it.',
  },

  // The notifications sent by the server.
  push: {
    groupLabel: 'SENT TO YOU',
    title: 'From Nepsis',
    intro: 'These come from {app} rather than from this phone, because they are about things your phone has no way of knowing — a time your father confirmed while the app was closed. Turning the first one on asks for permission and registers this device.',
    appointments: {
      title: 'Appointments',
      hint: 'When your father confirms, declines or cancels a time you asked for. Without this you find out by opening the app and noticing.',
    },
    assignments: {
      title: 'Something assigned to you',
      hint: 'When your Father of Confession assigns part of your canon, or your servant assigns psalms.',
    },
    canonNudge: {
      title: 'A nudge about your canon',
      hint: 'Only when this phone has already told the server the day is unfinished. If you have been away, nothing is sent — the server would be guessing.',
    },
    reengagement: {
      title: 'If you have been away a while',
      hint: 'One message after a long absence. Never more than one.',
    },
  },

  // What is and is not shared to make a reminder happen. The quoted name in
  // `sent` is the title of the card above it (push.title).
  knows: {
    title: 'What a reminder knows',
    local: 'The two reminders above are written by this phone, not sent to it. Your rule, your review queue and your streak are read from this device to write them, and none of that leaves it.',
    sent: 'What {app} is sent, so that the messages under “From Nepsis” can reach you: a code identifying this device, your time zone and the hour you chose, and — only if you turn on the canon nudge — how many things your rule asked of you each day and how many you marked done. Counts only, never which ones.',
    unseen: 'Your Father of Confession, your servant and your church see none of it, and cannot see whether reminders are on or whether you acted on one.',
    statusNone: 'Nothing scheduled right now — there is nothing due in the next two weeks.',
    statusScheduled: {
      one: '{n} reminder scheduled over the next two weeks.',
      other: '{n} reminders scheduled over the next two weeks.',
    },
    statusSub: 'Days with nothing due are skipped. The schedule is refreshed each time you open {app}.',
  },

  // ─── The reminders themselves ──────────────────────────────────────────────
  // Read on a lock screen, without the app open.
  notification: {
    // The name Android shows for this kind of notification in its settings.
    channelName: 'Prayer reminders',

    canonToday: 'Your canon today',
    canonRest: 'The rest of your canon',
    // The day's canon items as one sentence. {a} and {b} are the first two
    // items; {n} counts the ones not named.
    listOne: '{a}.',
    listTwo: '{a} and {b}.',
    listMore: {
      one: '{a}, {b}, and {n} more.',
      other: '{a}, {b}, and {n} more.',
    },

    // {n} is the length of the streak in days.
    psalmsStreak: {
      one: 'Keep your {n}-day streak',
      other: 'Keep your {n}-day streak',
    },
    psalmsTitle: 'Time for your psalms',
    // {n} portions due, all from one passage, named by {item}.
    psalmsDueOne: {
      one: '{n} portion of {item} ready to review.',
      other: '{n} portions of {item} ready to review.',
    },
    // {n} portions due, spread over several passages. {passages} is the
    // `passages` entry below, already counted.
    psalmsDueAcross: {
      one: '{n} portion ready to review across {passages}.',
      other: '{n} portions ready to review across {passages}.',
    },
    passages: {
      one: '{n} passage',
      other: '{n} passages',
    },
    psalmsLearnNew: 'Nothing to review — a good day to learn a new portion.',
  },
};
