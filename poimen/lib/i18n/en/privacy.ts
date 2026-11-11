// Everything the app says about privacy.
//
// `copy` is the short statements shown beside the data they describe; screens
// read them as PRIVACY_COPY.<name> (lib/privacy-copy.ts, which also records
// what each one promises and why). `policy` is the full privacy policy
// (app/privacy.tsx): a legal document, so its Arabic twin is a faithful,
// sentence-for-sentence translation. {app} is the app's name.
export const privacy = {
  copy: {
    confession: 'Your examination and journal are encrypted on this device and never sent to our servers. Only the dates you confess are shared with your Father of Confession — never what you wrote.',

    prayer: 'The words of your request are encrypted before they leave this device, for the people you pick and no one else. We store them but cannot read them.',

    journal: 'Your journal and blessings are encrypted on this device before they are saved, so no one else can read them — not your Father of Confession, and not us. Flagging an entry only adds it to your own confession notes.',

    vitals: 'Your Father of Confession sees adherence percentages, never the individual check-offs, and only while you leave this on. You can withdraw it at any time.',

    canon: 'Your spiritual canon stays private to you — no one is shown what you keep or miss. If you turn the canon reminder on, your phone sends daily totals only (how many things were due, how many you marked done) so a reminder is never sent about a day you have already finished.',

    signup: 'What you write in Confession stays on your device. Prayer requests and pastoral notes are encrypted so only their intended reader can open them.',

    churchChoice: 'Your church is saved on your profile as written, next to your name. The people who run Nepsis can see it, and so can your Father of Confession or servant once you link with them. Nothing is sent to the church directory.',

    churchChoiceClergy: 'Your church is saved on your profile as written, next to your name. Because you are signing up as a priest or servant, any signed-in member can see your name and church — that is how members find you by invite code. The people who run Nepsis can see it too. Nothing is sent to the church directory.',

    churchLocation: 'Your location is used on this phone to order the list and show how far each church is. It is never sent or saved.',

    onboardingTitle: 'What stays on your device',
    onboarding: 'Your confession journal never leaves this phone. Prayer requests are encrypted for their recipients before they are sent. Your canon is yours alone — your Father of Confession sees adherence only after you turn sharing on. Settings → Your data & privacy has the full picture.',

    settingsTitle: 'Your data & privacy',
    settingsSummary: 'On this device only: your confession examination and journal. Encrypted before upload: prayer request bodies, your journal and blessings, and the notes your priest writes. Stored as written: your name, church, confession dates, and anything you enter for visitation — phone, address, and family details. Only if you switch notifications on: a code for this device, your time zone, the hour you picked, and — for the canon reminder — daily totals of what was due and done.',
  },

  policy: {
    title: 'Privacy Policy',
    lastUpdated: 'Last updated: {date}',

    overview: {
      title: 'Overview',
      body: [
        '{app} is a pastoral care application for Coptic Orthodox communities. It is designed for use by priests, servants, and congregants within a trusted parish context. We take the privacy of spiritual data seriously and have built this app with data minimization and end-to-end encryption as core principles.',
      ],
    },

    collect: {
      title: 'Information We Collect',
      intro: "We collect only what is necessary to provide the app's features:",
      items: [
        'Name, email address, and role (congregant, servant, or priest) provided during registration.',
        'Church affiliation (chosen from a list imported from the Coptic Orthodox Directory, or typed by you) and Father of Confession (FOC) linkage, set by you in the app.',
        'Spiritual wellness data (prayer frequency, fasting, scripture reading) that you choose to share with your FOC. This sharing requires your explicit consent and can be revoked at any time.',
        'Prayer requests you submit. The body of each prayer request is end-to-end encrypted — only you and your designated recipients can read the content. The server stores only ciphertext.',
        'Pastoral and encounter notes written by your priest or servant about you. These are end-to-end encrypted on their device before being stored, and restricted so only their author can open them. We hold only ciphertext and cannot read them.',
        'Contact details for pastoral visitation, if you enter them: phone, contact email, and home address. These are stored as written — not encrypted — and are readable by your Father of Confession once you have linked and consented.',
        "Family details, if you enter them: your life stage, spouse's name, and the first names and birth years of your children. Stored as written, and visible to your Father of Confession under the same consent.",
        'The date of your last confession, if you choose to self-report it.',
        'Your last active timestamp (used to display your online status to your FOC only).',
        'If you turn on notifications from {app}: a code identifying each device you enable them on, your time zone, and the hour you chose to be notified. The device code is issued by our notification provider and identifies the device, not you; the time zone is needed because notifications are scheduled in your local time and our servers cannot otherwise know when your evening is.',
        'If you additionally turn on the canon reminder: for each day, how many things your rule asked of you and how many you marked done. Counts only — never which ones. "3 of 5" is what decides whether a reminder would be wrong to send; which five is not something we ask for.',
      ],
    },

    notCollected: {
      title: "What We Don't Collect",
      items: [
        'Your location. If you tap "Sort by nearest" in the church picker, your device\'s location is used on the device to order the list and show how far each church is. It is not sent to us or to anyone, and it is not stored.',
        'Reminders about your canon and your psalms are written by your phone, not sent to it. Your rule, your review queue and your streak are read from the device to write them and none of that leaves it. Notifications from our servers are a separate thing you switch on yourself, and they are about events your phone cannot know — an appointment your father confirmed while the app was closed.',
        'Which parts of your canon you kept or missed. Only daily totals are sent, and only if you turn the canon reminder on. Your Father of Confession sees the same wellness percentages as before; the daily counts are used to schedule a reminder and are not shown to anyone.',
        'Your confession journal and examination of conscience stay on your device. They are encrypted before being written to local storage and are never sent to our servers, so we never receive or store their content. The key that opens them is your own keypair; we hold only a copy of it that your PIN unlocks, and your PIN never reaches us.',
      ],
    },

    encryption: {
      title: 'End-to-End Encryption',
      body: [
        "Prayer request bodies, and the pastoral and encounter notes a priest or servant writes, are encrypted on the author's device before being stored. The encryption keys are generated on the device and are never transmitted to our servers. Even if our database were compromised, the content of these fields would remain unreadable.",
        'Your encryption keypair is protected by a PIN you set during onboarding. A backup of your encrypted keypair is stored in your profile so you can recover access on a new device using your PIN.',
      ],
    },

    use: {
      title: 'How We Use Your Information',
      items: [
        'To provide the pastoral care features of the app (flock management, prayer, canon assignment).',
        'To connect you with your Father of Confession, if you choose to link accounts.',
        'To display your spiritual wellness data to your FOC — only with your explicit consent.',
        'To send the notifications you have switched on, at the hour and in the time zone you set.',
        'We do not use your data for advertising, analytics profiling, or sale to third parties.',
      ],
    },

    sharing: {
      title: 'Data Sharing',
      intro: 'Your data is shared only as follows:',
      items: [
        'With your designated Father of Confession, for data categories you have explicitly consented to share.',
        'With servants assigned to your parish, for features within their role scope.',
        'With Supabase (our database provider) as encrypted storage. Supabase does not have access to the content of encrypted fields.',
        'With Expo, our notification provider, if you switch notifications on: the device code and the text of the notification itself, which is what delivery through Apple and Google requires. A notification\'s text names what is due — "Your appointment is confirmed", or how many things remain in your rule — so keep that in mind when choosing which to enable. No confession, journal or prayer content is ever placed in one.',
        'We do not share your data with any other third parties.',
      ],
    },

    rights: {
      title: 'Your Choices and Rights',
      items: [
        "You may revoke FOC consent at any time from your Profile screen. This immediately removes your FOC's access to your wellness data.",
        "You may turn any notification off at any time from Reminders in your Profile. Switching the last one off removes that device's code from our servers.",
        'You may delete your account at any time in the app, from Profile → Delete my account. Deletion is immediate and cannot be undone. Your Father of Confession keeps his own records of your encounters and his notes about you, no longer linked to any account. If you can no longer sign in, email us at the address below and we will delete it for you.',
        'You may request a copy of your data at any time.',
      ],
    },

    retention: {
      title: 'Data Retention',
      body: [
        'We retain your data for as long as your account is active. If you request account deletion, we will remove your personal data within 30 days, except where retention is required by law.',
        'Notifications are kept only as long as sending them requires: a queued notification is discarded once it is delivered or once it is too late to be worth sending, and the record of it is removed within 30 days.',
      ],
    },

    children: {
      title: "Children's Privacy",
      body: [
        '{app} is not directed to children under the age of 13. We do not knowingly collect personal information from children under 13. If you believe a child has provided us with personal information, please contact us and we will delete it promptly.',
      ],
    },

    changes: {
      title: 'Changes to This Policy',
      body: [
        'We may update this Privacy Policy from time to time. The "Last updated" date at the top of this page reflects the most recent revision. Continued use of the app after changes constitutes acceptance of the updated policy.',
      ],
    },

    contact: {
      title: 'Contact',
      body: [
        'If you have questions about this Privacy Policy or how we handle your data, contact us at:',
      ],
    },
  },
};
