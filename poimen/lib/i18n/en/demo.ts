// Fictional people and records shown to someone exploring the app without an
// account. Only what is displayed lives here: ids, emails, phone numbers,
// dates and every stored value (roles, categories, frequencies) stay in the
// code.
export const demo = {
  // ─── The servant's demo class ──────────────────────────────────────────────
  // app/(servant)/index.tsx and app/(servant)/student.tsx.
  servant: {
    johnMark: {
      name: 'John Mark',
      initials: 'JM',
      canonMorningAgpeya: 'Morning Agpeya',
      canonGospel: 'Gospel Reading (1 chapter)',
      // The servant's own note about him.
      note:
        "Good attendance at Sunday School. Misses service occasionally due to soccer practice. Spoke about feeling disconnected from faith — suggested starting with the morning Agpeya as a simple anchor. Follow up next Sunday on how it's going.",
      prayer: [
        'Passing his math exams this week',
        'His grandmother who has been ill',
      ],
    },
    esther: {
      name: 'Esther Mikhail',
      initials: 'EM',
      canonCompline: 'Evening Compline',
      note:
        'Thoughtful and engaged — asks deep questions about fasting and prayer. Parents are very supportive of her spiritual growth. Mentioned feeling nervous about transitioning to the youth group next year. Worth checking in with her parents.',
      prayer: [
        'Peace for her parents who are going through a difficult season',
        'That she would understand the faith more deeply',
      ],
    },
  },

  // ─── The demo database ─────────────────────────────────────────────────────
  // lib/db/dummy.ts: one parish with two priests, two servants and five
  // members.
  db: {
    people: {
      frBishoy: 'Fr. Bishoy Marcos',
      frKyrillos: 'Fr. Kyrillos Abdelmassih',
      mary: 'Mary Naguib',
      david: 'David Asaad',
      michael: 'Michael Hanna',
      sara: 'Sara Girgis',
      peter: 'Peter Botros',
      nadia: 'Nadia Henein',
      mina: 'Mina Aziz',
    },
    churches: {
      stMary: "St. Mary's Coptic Orthodox Church",
      stMark: "St. Mark's Coptic Orthodox Church",
    },
    occupations: {
      softwareEngineer: 'Software Engineer',
      nurse: 'Nurse',
      student: 'Student',
      teacher: 'Teacher',
      accountant: 'Accountant',
    },

    // What the member reads about a logged encounter with the priest.
    encounters: {
      psalmPlan: 'Fr. Bishoy assigned a 40-day reading plan from the Psalms.',
      visitAfterBirth: 'Pastoral visit following the birth of your daughter. Prayers and blessings offered.',
      holyWeekConfession: 'Holy Week confession. Guidance on family prayer.',
      jobWithCouples: 'Discussed the Book of Job with the young couples group.',
      fastingTalk: 'Discussed fasting and the upcoming Apostles Fast.',
      careerTalk: 'Career discernment conversation.',
      liturgyReminder: 'Reminded to attend Sunday Liturgy more consistently.',
      regularConfession: 'Regular confession. Spiritual growth noted.',
      familyCall: 'Called to check in about family situation.',
    },

    // The practices in the members' canons.
    canons: {
      agpeyaMorningPrayer: 'Agpeya Morning Prayer',
      psalm50: 'Psalm 50 Reading',
      almsgiving: 'Almsgiving',
      liturgyAttendance: 'Divine Liturgy Attendance',
      eveningAgpeya: 'Evening Agpeya',
      scriptureMeditation: 'Scripture Meditation',
      morningAgpeya: 'Morning Agpeya',
      fastingNineveh: 'Fasting (Nineveh)',
      service: 'Service / Diakonia',
    },
    reflectionPrompts: {
      phrase: 'Note one phrase that stayed with you.',
      verse: 'One verse that spoke to you today.',
    },

    // The disciplines a member tracks in the journal, and the short progress
    // line beside each.
    disciplines: {
      morningAgpeya: 'Morning Agpeya',
      bibleReading: 'Bible Reading',
      vespers: 'Vespers',
      divineLiturgy: 'Divine Liturgy',
      almsgiving: 'Almsgiving',
      dayOfPrayer: 'Day of Prayer',
      eveningPrayer: 'Evening Prayer',
      dailyScripture: 'Daily Scripture',
      sundayLiturgy: 'Sunday Liturgy',
      agpeyaThreeHours: 'Agpeya (3 hours)',
      fasting: 'Fasting',
    },
    streaks: {
      fiveDays: '5-day streak',
      twelveDays: '12-day streak',
      twentyDays: '20-day streak',
      threeThisMonth: '3 this month',
      eightOfTenSundays: '8/10 Sundays',
      tenOfTenSundays: '10/10 Sundays',
      everyWedFri: 'Every Wed+Fri',
    },

    // A member's journal entries. `scripture` is the reference the entry is
    // about, not the passage itself.
    journal: {
      psalm23: {
        title: 'Reflection on Psalm 23',
        reflection: 'The Lord is my shepherd — I noticed how this psalm pairs provision with peace.',
        scripture: 'Psalm 23:1',
        prayerIntention: 'For patience with my children.',
      },
      afterLiturgy: {
        title: 'After the Divine Liturgy',
        reflection: 'The doxology of the Theotokos moved me unexpectedly today.',
        scripture: 'Luke 1:46-55',
        prayerIntention: 'For Mary Naguib and her family.',
      },
      morningFast: {
        title: 'Morning fast reflection',
        reflection: 'Found it easier this week. Less food, more awareness.',
        scripture: 'Matthew 6:16',
        prayerIntention: 'For strength during the Apostles Fast.',
      },
    },

    // The priest's private notes about two of his members.
    pastoralNotes: {
      michael:
        'Michael is growing steadily. New father — pray for him as he navigates family life. Assigned 40-day Psalm plan after May confession. Follow up in August.',
      peter:
        'Peter is struggling with attendance. Second missed appointment. Needs gentle but firm follow-up. Consider involving servant.',
    },
  },
};
