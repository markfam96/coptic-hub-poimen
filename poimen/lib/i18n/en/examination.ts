// The examination of conscience: its two catalogues, the names of their
// sections, and the Examination screen. The ids the entries belong to live in
// lib/confession/sinCatalogue.ts and relationalExamination.ts and are what is
// stored; only the wording here is shown.
export const examination = {
  // Section names, keyed by what they are. `other` is the journal's catch-all.
  categories: {
    tongue: 'The Tongue',
    thoughts: 'Thoughts',
    hearing: 'Hearing',
    eyes: 'The Eyes',
    actions: 'Actions',
    neglectedPractices: 'Neglected Practices',
    other: 'Other',
    towardGod: 'Toward God',
    towardOthers: 'Toward Others',
    towardSelf: 'Toward Self',
    omissions: 'Omissions',
  },

  // The two ways the examination is organized.
  styles: {
    senses: 'By the Senses',
    relational: 'Toward God & Others',
  },

  // How often, as written beside an item in the confession notes.
  freqLabel: { once: 'Once', few: 'A few times', often: 'Often' },
  // How often, on the three buttons under each item.
  freqOption: { once: 'Once', few: 'Few times', often: 'Often' },

  screen: {
    title: 'Examination',
    noted: '{n} noted',
    itemsToConsider: { one: '{n} items to consider', other: '{n} items to consider' },
    prev: '← Prev',
    next: 'Next →',
    done: '✓ Done',
    progress: 'Category {current} of {total}',
  },

  // ─── By the senses ─────────────────────────────────────────────────────────
  // `scripture` is a reference (book, chapter, verse), not the verse itself.
  sins: {
    tongueLying: {
      name: 'Lying',
      description: "Telling falsehoods, even 'white lies' to protect yourself or others.",
      scripture: 'Proverbs 12:22',
    },
    tongueGossip: {
      name: 'Gossiping',
      description: "Sharing information about others that damages their reputation, whether true or false.",
      scripture: 'Proverbs 11:13',
    },
    tongueJudging: {
      name: 'Judging others',
      description: 'Condemning another person in speech, assuming the worst about them.',
      scripture: 'Matthew 7:1',
    },
    tongueSwearing: {
      name: 'Swearing / cursing',
      description: "Using the Lord's name in vain, swearing oaths carelessly, or profane speech.",
      scripture: 'Matthew 5:34',
    },
    tongueSlander: {
      name: 'Slander',
      description: "Deliberately saying false things to damage someone's reputation.",
      scripture: 'Psalm 101:5',
    },
    tongueFlattery: {
      name: 'Flattery',
      description: 'Insincere praise given to gain favor or manipulate others.',
      scripture: 'Proverbs 26:28',
    },
    tongueIdle: {
      name: 'Idle / vain talk',
      description: 'Spending much time in conversation that bears no spiritual fruit.',
      scripture: 'Matthew 12:36',
    },
    tongueContention: {
      name: 'Quarrelling & contention',
      description: 'Arguing and seeking to win rather than to reconcile or understand.',
      scripture: 'Proverbs 17:14',
    },
    tongueBoasting: {
      name: 'Boasting',
      description: 'Exaggerating your accomplishments or speaking proudly about yourself.',
      scripture: 'Proverbs 27:1',
    },

    thoughtsPride: {
      name: 'Pride',
      description: 'Exalting yourself above others; believing your gifts come from yourself alone.',
      scripture: 'Philippians 2:3',
    },
    thoughtsEnvy: {
      name: 'Envy',
      description: "Resenting the blessings, gifts, or successes of others.",
      scripture: 'Galatians 5:26',
    },
    thoughtsLust: {
      name: 'Lustful thoughts',
      description: 'Dwelling on impure, sexual fantasies about anyone outside of marriage.',
      scripture: 'Matthew 5:28',
    },
    thoughtsAnger: {
      name: 'Harboured anger',
      description: 'Holding onto anger or resentment toward another person beyond the day.',
      scripture: 'Ephesians 4:26',
    },
    thoughtsGreed: {
      name: 'Greed / covetousness',
      description: 'Longing for what belongs to others; an attachment to wealth and possessions.',
      scripture: 'Luke 12:15',
    },
    thoughtsDespair: {
      name: 'Despair & hopelessness',
      description: "Losing trust in God's mercy; dwelling in darkness rather than turning to prayer.",
      scripture: 'Lamentations 3:22-23',
    },
    thoughtsVainglory: {
      name: 'Vainglory',
      description: "Seeking human praise, reputation, or approval more than God's.",
      scripture: 'John 5:44',
    },
    thoughtsUnbelief: {
      name: 'Doubt & unbelief',
      description: 'Entertaining thoughts that undermine faith: "Is God listening?", "Does He care?"',
      scripture: 'Hebrews 11:6',
    },
    thoughtsJudgment: {
      name: 'Judging inwardly',
      description: "Passing mental verdicts on others' behavior, holiness, or worth.",
      scripture: 'Romans 2:1',
    },

    hearingGossip: {
      name: 'Listening to gossip',
      description: 'Willingly listening to slander or negative talk about others without stopping it.',
      scripture: 'Proverbs 17:4',
    },
    hearingBadMusic: {
      name: 'Filling ears with harmful content',
      description: 'Music, podcasts, or speech that provokes lust, anger, or worldliness.',
      scripture: 'Philippians 4:8',
    },
    hearingBlasphemy: {
      name: 'Tolerating blasphemy',
      description: "Not defending God's name or the faith when it is mocked in your presence.",
      scripture: 'Leviticus 24:15',
    },
    hearingNeglectWord: {
      name: "Neglecting to hear God's word",
      description: 'Avoiding Scripture, sermons, or spiritual instruction without cause.',
      scripture: 'James 1:22',
    },

    eyesPornography: {
      name: 'Viewing pornography',
      description: 'Looking at sexually explicit material intentionally.',
      scripture: 'Job 31:1',
    },
    eyesImmodest: {
      name: 'Gazing at immodest images',
      description: 'Lingering deliberately on images, advertisements, or people to provoke lust.',
      scripture: 'Matthew 5:28',
    },
    eyesViolent: {
      name: 'Consuming violent or degrading content',
      description: 'Entertainment that glorifies violence, cruelty, or human degradation.',
      scripture: 'Psalm 101:3',
    },
    eyesEnvyGaze: {
      name: 'Envious gazing',
      description: "Looking at others' possessions, appearance, or life with covetousness.",
      scripture: 'Proverbs 23:17',
    },
    eyesSocialMedia: {
      name: 'Excessive social media scrolling',
      description: 'Spending hours passively consuming content that feeds vanity or comparison.',
      scripture: 'Colossians 3:2',
    },

    actionsTheft: {
      name: 'Stealing / dishonesty',
      description: 'Taking what is not yours; dishonesty in financial dealings.',
      scripture: 'Ephesians 4:28',
    },
    actionsViolence: {
      name: 'Physical harm or violence',
      description: 'Striking, physically hurting, or intimidating another person.',
      scripture: 'Matthew 26:52',
    },
    actionsFornication: {
      name: 'Fornication / adultery',
      description: 'Any sexual act outside of holy matrimony.',
      scripture: '1 Corinthians 6:18',
    },
    actionsDrunkenness: {
      name: 'Drunkenness / substance abuse',
      description: 'Intoxicating yourself with alcohol, drugs, or other substances.',
      scripture: 'Ephesians 5:18',
    },
    actionsGluttony: {
      name: 'Gluttony / breaking the fast',
      description: 'Eating to excess; breaking prescribed fasts without necessity.',
      scripture: 'Proverbs 23:20',
    },
    actionsDisobedience: {
      name: 'Disobedience to parents or clergy',
      description: 'Defying parents, your father of confession, or lawful spiritual authority.',
      scripture: 'Exodus 20:12',
    },
    actionsHarmSoul: {
      name: 'Scandalizing another',
      description: 'Causing a weaker brother or sister to sin through your example.',
      scripture: 'Matthew 18:6',
    },
    actionsWitchcraft: {
      name: 'Involvement in occult practices',
      description: 'Horoscopes, fortune-telling, magic, or any contact with occult materials.',
      scripture: 'Deuteronomy 18:10',
    },

    neglectPrayer: {
      name: 'Neglecting daily prayer',
      description: 'Skipping Agpeya hours or your personal prayer rule without pressing need.',
      scripture: '1 Thessalonians 5:17',
    },
    neglectFasting: {
      name: 'Breaking the fast without necessity',
      description: 'Eating meat or dairy on appointed fast days out of desire rather than need.',
      scripture: 'Matthew 6:16',
    },
    neglectCommunion: {
      name: 'Avoiding Holy Communion',
      description: 'Staying away from the Eucharist for extended periods without reason.',
      scripture: 'John 6:53-54',
    },
    neglectTithe: {
      name: 'Neglecting charity and almsgiving',
      description: 'Hoarding wealth while the poor are in need; failing to give generously.',
      scripture: 'Matthew 25:42',
    },
    neglectForgiveness: {
      name: 'Withholding forgiveness',
      description: 'Refusing to reconcile with someone who has wronged you.',
      scripture: 'Matthew 6:15',
    },
    neglectLiturgy: {
      name: 'Skipping the Divine Liturgy',
      description: 'Deliberately missing Sunday Liturgy without sickness or genuine emergency.',
      scripture: 'Hebrews 10:25',
    },
    neglectScripture: {
      name: 'Neglecting Scripture reading',
      description: 'Going many days without opening the Bible for personal reading.',
      scripture: 'Psalm 119:105',
    },
    neglectConfessionDelay: {
      name: 'Delaying confession',
      description: 'Putting off confession for months despite awareness of serious sin.',
      scripture: '1 John 1:9',
    },
  },

  // ─── Toward God & others ───────────────────────────────────────────────────
  // Each item is worded as the failing itself ("I broke the fasts of the
  // Church"), so ticking it always means "I need to confess this" and it
  // reads correctly in the confession notes.
  relational: {
    godPrayers: {
      text: 'I neglected or rushed my daily prayers (Agpeya).',
      note: 'Reflect on the quality of your prayer, not only its presence.',
    },
    godLiturgy: { text: 'I was distracted or did not have reverence while attending the Divine Liturgy.' },
    godFasts: {
      text: 'I broke the fasts of the Church.',
      note: 'Including the spirit of fasting — prayer, almsgiving, and avoidance of entertainment.',
    },
    godScripture: { text: 'I did not read or meditate on Scripture regularly.' },
    godDoubt: { text: "I harbored doubt, despair, or distrust in God's providence." },
    godContent: { text: 'I exposed myself to content that weakens my faith or darkens my mind.' },
    godThankful: { text: 'I was not thankful to God for His gifts and blessings.' },

    othersAnger: { text: 'I harbored anger, bitterness, or unforgiveness toward someone.' },
    othersSpeech: { text: 'I spoke ill of others, gossiped, or judged.' },
    othersHonesty: { text: 'I was dishonest in my dealings with others.' },
    othersGenerosity: { text: 'I was not generous with my time, treasure, and talents.' },
    othersNeedy: { text: 'I neglected those in need around me.' },

    selfPurity: { text: 'I indulged in impure thoughts, speech, or actions.' },
    selfHabit: { text: 'I was enslaved to a habit or addiction.' },
    selfBody: { text: 'I did not care for my body as a temple of the Holy Spirit.' },
    selfPride: { text: 'I was proud, boastful, or unwilling to receive correction.' },
    selfComparison: { text: 'I compared myself to others with envy or contempt.' },

    omitPrayForOthers: { text: 'I neglected to pray for others — my family, enemies, or the departed.' },
    omitAlms: { text: 'I failed to give alms or help those in need when I had the means.' },
    omitVisiting: { text: 'I did not visit the sick, the lonely, or those in hardship.' },
    omitFamily: { text: 'I failed to honor my spouse, children, or parents as God calls me to.' },
    omitGoodWorks: { text: 'I left good works undone out of laziness, fear, or indifference.' },
    omitThanks: { text: 'I neglected to give thanks to God for His mercies.' },
  },
};
