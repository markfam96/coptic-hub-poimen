// The Psalms tab (app/(tabs)/psalms.tsx) and the names the Agpeya's hours,
// psalms and prayers are shown by (lib/psalms). The psalms and prayers
// themselves are not here: their text stays in lib/psalms/*.json and is not
// translated by the app.
export const psalms = {
  title: 'Psalms',
  subtitle: 'Hide the Agpeya in your heart',

  // "3 / 5": a session's position and a milestone's progress.
  progressOf: '{n} / {total}',

  // The canonical hours, keyed by the hour's `key` in the JSON.
  hours: {
    prime: 'First Hour · Prime',
    third: 'Third Hour · Terce',
    sixth: 'Sixth Hour · Sext',
    ninth: 'Ninth Hour · None',
    vespers: 'Eleventh Hour · Vespers',
    compline: 'Twelfth Hour · Compline',
    midnight: 'The Midnight Prayer',
    veil: 'Prayer of the Veil',
  },
  // The three watches of the Midnight Prayer.
  watches: {
    first: 'First Watch',
    second: 'Second Watch',
    third: 'Third Watch',
  },

  psalmN: 'Psalm {n}',
  // One of the 22 sections of Psalm 118.
  psalmSection: 'Psalm {n} · Section {section}',

  // Titles of the Agpeya's prayers, keyed by their id in
  // lib/psalms/agpeyaPrayers.json and identical to the titles there.
  prayerTitles: {
    lit_heavenly_king: 'O Heavenly King',
    lit_savior_peace: 'Just as You Were with Your Disciples',
    lit_sanctuary: 'Whenever We Stand in Your Sanctuary',
    kneel: 'Come, Let Us Kneel Down',
    pauline_first: 'Pauline Epistle — Ephesians 4:1-5',
    faith_church: 'The Faith of the Church',
    gospel_prime: 'First Hour Gospel — John 1:1-17',
    lit_prime_1: 'First Hour Litany I',
    lit_prime_2: 'First Hour Litany II',
    lit_prime_3: 'First Hour Litany III',
    gloria: 'The Gloria',
    trisagion: 'The Trisagion',
    hail_to_you: 'Hail to You',
    creed_intro: 'Introduction to the Creed',
    orthodox_creed: 'The Orthodox Creed',
    holy_holy_holy: 'Holy, Holy, Holy',
    absol_prime_1: 'First Hour Absolution I',
    absol_prime_2: 'First Hour Absolution II',
    conclusion_every_hour: 'Conclusion of Every Hour',
    gospel_third: 'Third Hour Gospel — John 14:26–15:4',
    lit_third_1: 'Third Hour Litany I',
    lit_third_2: 'Third Hour Litany II',
    lit_third_3: 'Third Hour Litany III',
    absol_third: 'Third Hour Absolution',
    gospel_sixth: 'Sixth Hour Gospel — Matthew 5:1-16',
    lit_sixth_1: 'Sixth Hour Litany I',
    lit_sixth_2: 'Sixth Hour Litany II',
    lit_sixth_3: 'Sixth Hour Litany III',
    lit_sixth_4: 'Sixth Hour Litany IV',
    lit_sixth_5: 'Sixth Hour Litany V',
    lit_sixth_6: 'Sixth Hour Litany VI',
    absol_sixth: 'Sixth Hour Absolution',
    gospel_ninth: 'Ninth Hour Gospel — Luke 9:10-17',
    lit_ninth_1: 'Ninth Hour Litany I',
    lit_ninth_2: 'Ninth Hour Litany II',
    lit_ninth_3: 'Ninth Hour Litany III',
    lit_ninth_4: 'Ninth Hour Litany IV',
    lit_ninth_5: 'Ninth Hour Litany V',
    lit_ninth_6: 'Ninth Hour Litany VI',
    absol_ninth: 'Ninth Hour Absolution',
    gospel_vespers: 'Eleventh Hour Gospel — Luke 4:38-41',
    lit_vespers_1: 'Eleventh Hour Litany I',
    lit_vespers_2: 'Eleventh Hour Litany II',
    lit_vespers_3: 'Eleventh Hour Litany III',
    absol_vespers: 'Eleventh Hour Absolution',
    gospel_compline: 'Twelfth Hour Gospel — Luke 2:25-32',
    lit_compline_1: 'Twelfth Hour Litany I',
    lit_compline_2: 'Twelfth Hour Litany II',
    lit_compline_3: 'Twelfth Hour Litany III',
    graciously_accord: 'Graciously Accord, O Lord',
    absol_compline: 'Twelfth Hour Absolution',
    gospel_watch1: 'Midnight Gospel (First Watch) — Matthew 25:1-13',
    lit_watch1_1: 'First Watch Litany I',
    lit_watch1_2: 'First Watch Litany II',
    lit_watch1_3: 'First Watch Litany III',
    gospel_watch2: 'Midnight Gospel (Second Watch) — Luke 7:36-50',
    lit_watch2_1: 'Second Watch Litany I',
    lit_watch2_2: 'Second Watch Litany II',
    lit_watch2_3: 'Second Watch Litany III',
    gospel_watch3: 'Midnight Gospel (Third Watch) — Luke 12:32-46',
    lit_watch3_1: 'Third Watch Litany I',
    lit_watch3_2: 'Third Watch Litany II',
    lit_watch3_3: 'Third Watch Litany III',
    absol_midnight: 'Midnight Absolution',
    gospel_veil: 'Veil Gospel — John 6:15-23',
    lit_veil_1: 'Veil Litany I',
    lit_veil_2: 'Veil Litany II',
    lit_veil_3: 'Veil Litany III',
    absol_veil: 'Veil Absolution',
  },

  // Tag and one-line description for the kinds of prayer, keyed by the kind
  // stored in the JSON.
  kinds: {
    gospel: { label: 'Gospel', blurb: 'The Gospel reading of this hour, as prayed in the Agpeya.' },
    litany: { label: 'Litany', blurb: 'A litany of the hour — prayed after the Gospel.' },
    absolution: { label: 'Absolution', blurb: 'The absolution that concludes this hour.' },
    prayer: { label: 'Prayer', blurb: 'A fixed prayer of the hour.' },
    creed: { label: 'Creed', blurb: 'The confession of the faith of the Church.' },
    epistle: { label: 'Epistle', blurb: 'The reading from the epistles of St. Paul.' },
  },

  // Tag and one-line description for the character of a psalm.
  categories: {
    repentance: { label: 'Repentance', blurb: 'Penitential — sorrow for sin and a plea for mercy.' },
    praise: { label: 'Praise', blurb: 'Glorifying God for who He is.' },
    thanksgiving: { label: 'Thanksgiving', blurb: 'Gratitude for God’s deliverance and gifts.' },
    trust: { label: 'Trust', blurb: 'Confidence and refuge in God.' },
    supplication: { label: 'Supplication', blurb: 'Lament and prayer for help.' },
    wisdom: { label: 'Wisdom', blurb: 'The way of the righteous and the law of God.' },
    messianic: { label: 'Messianic', blurb: 'Royal psalms pointing to Christ the King.' },
    ascents: { label: 'Song of Ascents', blurb: 'Sung by pilgrims going up to the Lord.' },
  },

  // Milestones (lib/psalms/badges.ts).
  badges: {
    firstFruits: { label: 'First Fruits', description: 'Memorize your first passage in full' },
    firstRecitation: { label: 'From the Heart', description: 'Recite a whole passage from memory' },
    week: { label: 'Faithful Week', description: '7-day streak' },
    month: { label: 'Steadfast Month', description: '30-day streak' },
    hundred: { label: 'Hundred Days', description: '100-day streak' },
    five: { label: 'Five Treasures', description: 'Memorize 5 passages' },
    twenty: { label: 'Twenty Treasures', description: 'Memorize 20 passages' },
  },

  // Reading one psalm or prayer.
  reader: {
    title: 'Reading',
    inList: '✓ In your list — remove',
    addToList: '+ Add to my list',
    sectionOf: 'Section {n} of {total}',
  },

  // A learning or review session.
  session: {
    end: 'End',
    // Whole-passage recitation.
    reciteTag: 'Recite it in full from memory',
    recitePrompt: 'Recite it aloud in full from memory, then reveal the text to check yourself.',
    revealText: 'Reveal text',
    forgot: 'Forgot',
    someSlips: 'Some slips',
    recited: '✓ Recited',
    // One portion at a time. {label} is the psalm's or prayer's name.
    titlePortion: '{label}  ·  portion {n}/{total}',
    newTag: 'NEW — read & learn',
    cueRevealed: 'How well did you recall it?',
    cueNew: 'New — fill in the blanks, then learn it',
    cueReview: 'Continue from memory — fill in the blanks',
    revealCheck: 'Reveal & check',
    wrong: 'Wrong',
    againToday: 'again today',
    hard: 'Hard',
    good: 'Good',
    easy: 'Easy',
  },

  // Choosing and ordering passages.
  manage: {
    title: 'Choose Passages',
    myPassagesOrdered: 'My passages · in order',
    noneChosen: 'None chosen yet — add from the hours below.',
    portions: { one: '{n} portion', other: '{n} portions' },
  },

  overview: {
    reviewed: {
      one: '✦  Reviewed {n} passage — glory to God.',
      other: '✦  Reviewed {n} passages — glory to God.',
    },
    emptyTitle: 'Memorize the Agpeya',
    emptyText:
      "Choose psalms and prayers from the canonical hours to hide in your heart — each hour's Gospel, litanies, and absolution, the fixed prayers of the First Hour, the three watches of Midnight, and the Prayer of the Veil. Spaced repetition brings each passage back just as you're about to forget it.",
    choosePassages: 'Choose passages',

    heroLabel: 'MEMORIZE THE AGPEYA',
    // Follows the number of mature portions, in smaller type: "12 / 40 portions mature".
    heroOf: '/ {total} portions mature',
    streak: { one: '🔥  {n}-day streak', other: '🔥  {n}-day streak' },
    streakBest: 'Best: {n}',
    freezeReady: '🧊 freeze ready',

    statNew: 'New',
    statLearning: 'Learning',
    statMemorized: 'Memorized',

    caughtUp: 'All caught up for today ✦',
    // Two-line buttons: the count above, the caption below.
    review: 'Review {n}',
    reviewSub: 'due today',
    learn: 'Learn {n}',
    learnSub: 'new',

    newPerDay: 'Number of new cards per day',
    myPassages: 'My passages',
    manage: 'Manage',

    // Under each passage in the list. {n} is the passage's portion count,
    // {mature} how many of them are mature.
    learningNow: {
      one: 'Learning now · {mature}/{n} portions',
      other: 'Learning now · {mature}/{n} portions',
    },
    upNext: 'Up next — finish earlier passages first',
    portionsMemorized: {
      one: '{mature}/{n} portions memorized',
      other: '{mature}/{n} portions memorized',
    },
    readyToRecite: 'All portions mature — recite it in Review',
    reciteDue: 'Whole-passage recitation due in Review',
    memorized: '✓ Memorized — recited in full',
    recite: 'Recite',

    milestones: 'Milestones',
  },

  leaderboard: {
    yourClass: 'Your Class',
    classLeaderboard: 'Class Leaderboard',
    optInTitle: 'Compare with your class?',
    optInBody:
      "Your streak and how many psalms you've memorized would be visible to the others in your class, and to your servant. Your psalm selection, your canon and everything else stay private. You can turn this off whenever you like.",
    joining: 'Joining…',
    join: 'Join the leaderboard',
    emptyServant: 'No one in your class has joined the leaderboard yet.',
    emptyFirst: "You're the first in your class to join — others will appear as they do.",
    you: 'You',
    memorized: '{n} memorized',
    leave: 'Leave the leaderboard',
  },
};
