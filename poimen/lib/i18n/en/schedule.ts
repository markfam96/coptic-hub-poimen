// The priest's scheduling console (app/(priest)/schedule.tsx): where members
// book, the open/closed switch, requests to answer, appointment types, weekly
// hours, single-date changes, the Calendly link and calendar sync.
//
// Weekday names, AM/PM times, "{date} · {time}" and "{type} · {n}m" are shared
// with the member's Appointments tab and live in appointments.ts.
export const schedule = {
  title: 'Schedule',
  // A member whose profile has no name — on this screen and in the title of
  // the event written to the priest's calendar.
  memberFallback: 'Member',

  // ─── Where members book ────────────────────────────────────────────────────
  mode: {
    title: 'How Members Book',
    appTitle: 'In this app',
    appSub: 'You set availability below; members request open slots and you confirm each one.',
    calendlyTitle: 'Through my Calendly',
    calendlySub: 'Members book on your Calendly page. Nothing to maintain here — Calendly is the one source of truth.',
    calendlyHint: 'Requests and appointments already made in the app stay below until they play out — only new in-app requests stop.',
    // The choice could not be saved because the database lacks a column;
    // "scheduling_mode" is that column's name.
    migrationMissing: 'The app’s database is missing an update (scheduling_mode) — apply the latest migration and try again.',
    saveFailed: 'Couldn’t save: {error}',
  },

  // ─── The open / closed switch ──────────────────────────────────────────────
  master: {
    openTitle: '● Accepting appointments',
    closedTitle: '○ Scheduling closed',
    openSub: 'Members can request open time slots. Tap to close.',
    closedSub: 'Members cannot request appointments. Tap to open.',
  },

  // ─── Requests waiting for an answer ────────────────────────────────────────
  requests: {
    title: 'Requests ({n})',
    empty: 'No pending requests.',
    // What the member wrote with the request, in quotation marks.
    note: '“{note}”',
    confirm: '✓ Confirm',
    decline: '✕ Decline',
    changed: 'That request changed before you responded — the list has been refreshed.',
  },

  // ─── Confirmed appointments still ahead ────────────────────────────────────
  upcoming: {
    title: 'Upcoming ({n})',
    // "Holy Confession · Sun, Jul 26 · 2:00 PM"
    line: '{type} · {date} · {time}',
    cancel: 'Cancel',
    cancelConfirmTitle: 'Cancel appointment',
    // {name} is the member.
    cancelConfirmBody: 'Cancel the {type} with {name}?',
    cancelConfirmAction: 'Cancel it',
    cancelFailed: 'Could not cancel — the list has been refreshed.',
  },

  // ─── Appointment types ─────────────────────────────────────────────────────
  types: {
    title: 'Appointment Types',
    empty: 'Add the kinds of appointments you offer and how long each takes.',
    // The small switch on a type or a weekly window.
    on: 'ON',
    off: 'OFF',
    duration: { one: '{n} minutes', other: '{n} minutes' },
    newLabel: 'NEW TYPE',
    newPlaceholder: 'e.g. Spiritual Counseling',
    lengthLabel: 'LENGTH',
    // A length in minutes on a pill: "30m".
    durationShort: '{n}m',
    add: 'ADD TYPE',
    deleteConfirmTitle: 'Delete type',
    deleteConfirmBody: 'Remove "{label}"? Existing appointments keep their label.',
  },

  // ─── Weekly availability ───────────────────────────────────────────────────
  weekly: {
    title: 'Weekly Availability',
    empty: 'Add recurring weekly windows. They repeat every week until you remove them.',
    // Under the weekday: "2:00 PM – 4:00 PM · Holy Confession".
    windowLine: '{range} · {type}',
    newLabel: 'NEW WINDOW',
    needType: 'Add an active appointment type above first.',
    start: 'Start',
    end: 'End',
    add: 'ADD WINDOW',
    errPickType: 'Pick an appointment type first.',
    errEndBeforeStart: 'End time must be after the start time.',
    deleteConfirmTitle: 'Delete window',
    // "Remove Sunday 2:00 PM – 4:00 PM?"
    deleteConfirmBody: 'Remove {day} {range}?',
  },

  // ─── Single dates: closures and extra hours ────────────────────────────────
  days: {
    title: 'Days Away & Extra Hours',
    intro: "Change a single date without touching your weekly pattern. Close a day, or part of one, when you're travelling or otherwise unavailable — or open extra hours on a date your weekly pattern doesn't cover.",
    // The key under the month grid.
    legend: {
      open: 'open',
      extra: 'extra hours',
      partial: 'partly closed',
      closed: 'closed',
    },
    noRecurring: "Nothing recurring on this weekday — there's nothing to close, but you can open extra hours below.",
    closedAllDay: 'Closed all day',
    closedRange: 'Closed {range}',
    reopen: 'REOPEN THIS DAY',
    closeWholeDay: 'CLOSE THE WHOLE DAY',
    orClosePart: 'OR CLOSE PART OF IT',
    from: 'From',
    to: 'To',
    closeThisTime: 'CLOSE THIS TIME',
    extraRange: '+ Extra {range}',
    closedHint: 'This day is closed — reopen it to add extra hours.',
    needTypeForExtra: 'Add an active appointment type above to open extra hours.',
    openExtraLabel: 'OPEN EXTRA HOURS',
    openThisTime: 'OPEN THIS TIME',
    errSave: 'Could not save that — check your connection and try again.',
    errAlreadyClosed: 'That day is already closed entirely.',
    errNeedType: 'Add an active appointment type first.',
    errClosedReopen: 'That day is closed — reopen it first.',
  },

  // ─── The priest's Calendly link ────────────────────────────────────────────
  // “Book on Calendly” is the button members see (appointments.calendly.title).
  calendly: {
    title: 'My Calendly Link',
    intro: 'This is how your flock books you: they see a “Book on Calendly” button on their Appointments tab that opens this link.',
    noLink: 'No link yet — until you save one, members have no way to book you.',
    placeholder: 'calendly.com/your-name',
    errInvalid: "That doesn't look like a Calendly link — it should start with calendly.com/…",
    saved: 'Saved — your flock now sees a “Book on Calendly” option.',
    removeConfirmTitle: 'Remove Calendly link',
    removeConfirmBody: 'Members will no longer see the “Book on Calendly” option. Your Calendly account itself is untouched.',
    removed: 'Calendly link removed.',
    update: 'UPDATE LINK',
    save: 'SAVE LINK',
    open: 'Open my Calendly ↗',
  },

  // ─── Writing confirmed bookings to the phone's calendar ────────────────────
  sync: {
    title: 'Add Bookings to Your Calendar',
    intro: 'When you confirm an appointment here, Nepsis adds it to a calendar you choose on this phone — so it shows up where the rest of your week lives, with reminders. Anything that reads that calendar (a Calendly you keep for other work, a shared parish calendar) sees the time as taken. Cancelling here removes the event.',
    webOnly: "Available in the mobile app — calendars on this device can't be reached from the browser.",
    demo: 'Demo mode — sign in to connect your real calendar.',
    // {title} is the calendar's own name.
    writingTo: '⇄ Writing to “{title}”',
    // Stands in for the name of a calendar that has none.
    calendarFallback: 'calendar',
    turnOff: 'Turn off',
    // Wraps one of the two warnings below.
    warning: '⚠ {message}',
    permissionLost: 'Calendar access was turned off in Settings — bookings are NOT being written, so Calendly may double-book. Allow calendar access for Nepsis to fix this.',
    writeFailed: {
      one: "Couldn't write {n} booking to the calendar — check that it still exists and try again.",
      other: "Couldn't write {n} bookings to the calendar — check that it still exists and try again.",
    },
    denied: 'Calendar access was declined — allow it in Settings → Nepsis to use this.',
    readError: "Couldn't read this device's calendars — try again.",
    noCalendars: 'No writable calendars found on this device.',
    turnedOnAdded: {
      one: 'On. {n} upcoming appointment added to “{title}”.',
      other: 'On. {n} upcoming appointments added to “{title}”.',
    },
    turnedOn: 'On — confirmed bookings are written to “{title}”.',
    turnedOff: 'Off. Events already on the calendar were left in place.',
    close: 'CLOSE',
    change: 'CHANGE CALENDAR',
    choose: 'CHOOSE A CALENDAR',
  },

  // ─── Demo mode ─────────────────────────────────────────────────────────────
  // The two other demo appointment types are appointments.demo.typeConfession
  // and typeVisit.
  demo: {
    typeMeeting: 'Meeting',
    requestNote: 'Would like to confess before the feast.',
    closureNote: 'Travelling',
    names: {
      pb: 'Peter Botros',
      sg: 'Sara Girgis',
      mh: 'Michael Hanna',
      mm: 'Mary Mikhail',
    },
  },
};
