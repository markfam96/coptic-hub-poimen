// The member's Appointments tab (app/(tabs)/appointments.tsx), the time and
// weekday words of lib/scheduling/slots.ts, and the events that
// lib/scheduling/calendar-sync.ts writes into the priest's own calendar.
export const appointments = {
  title: 'Appointments',

  // The state of a request the member has made.
  status: {
    requested: 'Pending confirmation',
    confirmed: 'Confirmed',
    declined: 'Declined',
    cancelled: 'Cancelled',
  },

  // A date and a time on one line: "Sun, Jul 26 · 2:00 PM".
  dateTime: '{date} · {time}',

  mine: {
    title: 'My Appointments',
    cancel: 'Cancel',
    cancelConfirmTitle: 'Cancel',
    cancelConfirmBody: 'Cancel your {type} on {date}?',
    cancelConfirmAction: 'Cancel it',
  },

  // The confirm step, after a slot is tapped. {name} is the priest.
  request: {
    title: 'Request appointment',
    duration: {
      one: '{n} minutes · with {name}',
      other: '{n} minutes · with {name}',
    },
    noteLabel: 'NOTE (OPTIONAL)',
    notePlaceholder: "Anything you'd like your father to know ahead of time.",
    send: 'SEND REQUEST',
    hint: '{name} will confirm or decline your request.',
  },

  empty: {
    noFoc: 'Link a Father of Confession from your home screen to request appointments.',
    calendlyNoLink: '{name} takes bookings outside the app right now — reach out directly to schedule.',
    notConsented: 'Confirm sharing with {name} to request appointments.',
    closed: "{name} isn't accepting appointment requests right now. Check back later.",
    noSlots: 'No open times in the year ahead. Check back later.',
  },

  calendly: {
    title: 'Book on Calendly',
    sub: '{name} schedules appointments through Calendly — opens in your browser.',
  },

  // Under the time on a slot tile: the kind of appointment and its length in
  // minutes.
  slotMeta: '{type} · {n}m',

  // Other screens open this tab with ?focus=confession or ?focus=visit, and
  // the tab preselects the priest's appointment type whose own label contains
  // that word. A priest who names his types in another language is matched by
  // the words here instead; alternatives are separated by "|".
  focusKeywords: {
    confession: 'confession',
    visit: 'visit',
  },

  // What the server answers when a request is refused
  // (supabase/migrations/20260723_scheduling.sql). In English its own message
  // is shown as it arrives, so the text here is only the reference copy; in
  // another language the screen recognises these and shows its own sentence.
  errors: {
    notLinked: 'You must be linked to a Father of Confession',
    typeUnavailable: 'That appointment type is unavailable',
    closed: 'Scheduling is currently closed',
    pastTime: 'Choose a time in the future',
    taken: 'That time was just taken — please pick another',
  },

  // ─── Times and weekdays (lib/scheduling/slots.ts) ──────────────────────────
  time: {
    // The end of the day, as the end of a window: "9:00 PM – midnight".
    midnight: 'midnight',
    am: '{time} AM',
    pm: '{time} PM',
    range: '{start} – {end}',
  },
  // Index 0 = Sunday.
  weekdays: ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'],
  weekdaysShort: ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'],
  // One letter each, for the head of a month grid.
  weekdayInitials: ['S', 'M', 'T', 'W', 'T', 'F', 'S'],

  // ─── Events written to the priest's calendar ───────────────────────────────
  calendarEvent: {
    title: '{type} — {member}',
    notes: 'Booked through Poimen. This event blocks the time on Calendly and anywhere else that reads this calendar.',
  },

  // ─── Demo mode ─────────────────────────────────────────────────────────────
  demo: {
    focName: 'Fr. Bishoy',
    typeConfession: 'Holy Confession',
    typeVisit: 'Home Visitation',
  },
};
