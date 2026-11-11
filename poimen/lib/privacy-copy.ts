// lib/privacy-copy.ts
// One place to say what is private, so the app cannot contradict itself.
//
// This exists because it already went wrong twice. app/privacy.tsx told members
// pastoral notes were "not end-to-end encrypted" months after they were; the
// congregant tutorial told them the confession journal is "never saved", when
// it is saved — encrypted, on the device. One under-claimed, one over-claimed,
// and neither was caught because the wording lived wherever it was rendered.
//
// Rules for editing anything here:
//   1. Name what is encrypted, what leaves the device, and who can see it.
//      "Private and secure" says nothing a member can check.
//   2. Never write a promise the code does not keep. If the answer is "stored
//      on our servers, readable by us", say that instead of softening it.
//   3. If behaviour changes, this file changes in the same commit.

// What actually happens to each kind of entry, as of 2026-09-16.
//
//   confession journal   AsyncStorage only, sealed to the member's keypair.
//                        Never sent to Supabase. (lib/confession/store.ts)
//   prayer body          Sealed per recipient before upload; the server holds
//                        ciphertext only. (app/(tabs)/prayer.tsx)
//   pastoral notes       Sealed to the author's keypair before upload; only
//                        the author can open them. (lib/db/pastoral.ts)
//   journal entries      Sealed to the member's own keypair before upload
//   + blessings          (agent_progress { sealed }); the server holds
//                        ciphertext only. (lib/journal.ts, 2026-10-14)
//   canon + vitals       WHICH items were checked stays on device. Adherence
//                        percentages reach the FOC only after consent. Since
//                        2026-09-16, a member who switches the canon reminder
//                        on also sends DAILY TOTALS — due and done, never which
//                        — because a server that nudges without them is a
//                        server guessing about someone's rule. No person sees
//                        those totals; they exist to decide whether a reminder
//                        would be wrong.
//   notifications        Reminders for the canon and psalms are written by the
//                        phone and involve no server. Server-sent ones are
//                        opt-in per category and require a device code, a time
//                        zone and an hour. Expo carries them, so it sees the
//                        device code and the notification text.
//   profile fields       Name, church, and confession dates are stored plainly
//                        so the app can list and match on them. Since
//                        2026-11-03 the church is chosen at sign-up (or later
//                        in Profile) from a list imported from the Coptic
//                        Orthodox Directory, or typed when it isn't listed;
//                        church_id + church_name land in the same insert as
//                        the account (handle_new_user). Admins see everyone's;
//                        a linked FOC or servant sees their members'; any
//                        signed-in member sees a priest's or servant's.
//   contact + family     PHASE 1 of the rollout: pastoral_contacts (phone,
//                        email, full address) and pastoral_children (names and
//                        birth years) are written BOTH sealed and in plain
//                        text, because build 17 reads only the plain columns.
//                        So they are NOT yet private from us — do not say they
//                        are until phase 2 clears the plaintext. Update this
//                        copy in the same commit that does.
//                        pastoral_profile (spouse, life stage) stays plain.

export const PRIVACY_COPY = {
  // Confession tab. The journal IS saved — locally, encrypted. Saying
  // "never saved" was wrong and made the real guarantee sound smaller.
  confession:
    'Your examination and journal are encrypted on this device and never sent to our servers. ' +
    'Only the dates you confess are shared with your Father of Confession — never what you wrote.',

  // Prayer tab. Bodies are sealed per recipient before they are uploaded.
  prayer:
    'The words of your request are encrypted before they leave this device, for the people you ' +
    'pick and no one else. We store them but cannot read them.',

  // Journal tab. Sealed to the member's own key since 2026-10-14. Flagging
  // only copies an entry into the member's own confession notes.
  journal:
    'Your journal and blessings are encrypted on this device before they are saved, so no one ' +
    'else can read them — not your Father of Confession, and not us. Flagging an entry only ' +
    'adds it to your own confession notes.',

  // Vitals sharing consent.
  vitals:
    'Your Father of Confession sees adherence percentages, never the individual check-offs, and ' +
    'only while you leave this on. You can withdraw it at any time.',

  // Canon tab. "Never shared" was true when nothing about the canon left the
  // phone. Daily totals now do, for members who switch the reminder on, so the
  // sentence says what is true of both.
  canon:
    'Your spiritual canon stays private to you — no one is shown what you keep or miss. ' +
    'If you turn the canon reminder on, your phone sends daily totals only (how many things ' +
    'were due, how many you marked done) so a reminder is never sent about a day you have ' +
    'already finished.',

  // Sign-up, before an account exists.
  signup:
    'What you write in Confession stays on your device. Prayer requests and pastoral notes are ' +
    'encrypted so only their intended reader can open them.',

  // Sign-up, under the church field. Who can read profiles.church_id/church_name
  // follows the profiles SELECT policies: admins (every row), the member's FOC
  // after linking ("priest sees flock"), the member's servant ("servant sees
  // students"). The directory is never told who picked what.
  churchChoice:
    'Your church is saved on your profile as written, next to your name. The people who run ' +
    'Nepsis can see it, and so can your Father of Confession or servant once you link with them. ' +
    'Nothing is sent to the church directory.',

  // Same field when signing up as a priest or servant. Their row is readable by
  // every signed-in member ("priest servant profiles are discoverable", to
  // authenticated) — not only by someone holding their invite code — so say so.
  churchChoiceClergy:
    'Your church is saved on your profile as written, next to your name. Because you are ' +
    'signing up as a priest or servant, any signed-in member can see your name and church — ' +
    'that is how members find you by invite code. The people who run Nepsis can see it too. ' +
    'Nothing is sent to the church directory.',

  // Church picker, under "Sort by nearest" (sign-up and Profile). The order and
  // the distance beside each church are worked out on the phone from a fix
  // asked for only when the button is tapped (lib/location.ts); the fix goes
  // nowhere.
  churchLocation:
    'Your location is used on this phone to order the list and show how far each church is. ' +
    'It is never sent or saved.',

  // Onboarding / tutorial step.
  onboardingTitle: 'What stays on your device',
  onboarding:
    'Your confession journal never leaves this phone. Prayer requests are encrypted for their ' +
    'recipients before they are sent. Your canon is yours alone — your Father of Confession sees ' +
    'adherence only after you turn sharing on. Settings → Your data & privacy has the full picture.',

  // Profile / settings section.
  settingsTitle: 'Your data & privacy',
  settingsSummary:
    'On this device only: your confession examination and journal. ' +
    'Encrypted before upload: prayer request bodies, your journal and blessings, and the notes ' +
    'your priest writes. ' +
    'Stored as written: your name, church, confession dates, and anything you ' +
    'enter for visitation — phone, address, and family details. ' +
    'Only if you switch notifications on: a code for this device, your time zone, the hour you ' +
    'picked, and — for the canon reminder — daily totals of what was due and done.',
} as const;
