import type { Localized } from '../core';
import type { canon as En } from '../en/canon';

export const canon: Localized<typeof En> = {
  // ─── Option names ──────────────────────────────────────────────────────────
  // No brackets in these names: the priest's summary of a member's rule keeps
  // only the bracketed part of a name when there is one.
  hours: {
    prime: 'صلاة باكر',
    terce: 'صلاة الساعة الثالثة',
    sext: 'صلاة الساعة السادسة',
    none: 'صلاة الساعة التاسعة',
    vespers: 'صلاة الغروب',
    compline: 'صلاة النوم',
    veil: 'صلاة الستار',
    midnight: 'صلاة نصف الليل بخدماتها الثلاث',
  },
  services: {
    church_vespers: 'رفع بخور عشية',
    matins: 'رفع بخور باكر',
    liturgy: 'القداس الإلهي',
    communion: 'التناول',
    midnight_praise: 'التسبحة',
  },
  verbAttend: 'حضور',
  verbReceive: 'تناول',
  serviceActions: {
    church_vespers: 'حضور رفع بخور عشية',
    matins: 'حضور رفع بخور باكر',
    liturgy: 'حضور القداس الإلهي',
    communion: 'التناول من الأسرار المقدسة',
    midnight_praise: 'حضور التسبحة',
  },
  attendOther: 'حضور {service}',

  freq: {
    Daily: 'يوميًا',
    Weekly: 'أسبوعيًا',
    'Every 2 weeks': 'كل أسبوعين',
    Monthly: 'شهريًا',
    'Every 2 months': 'كل شهرين',
    Quarterly: 'كل 3 أشهر',
    'Twice a year': 'مرتين في السنة',
  },
  freqInSentence: {
    Daily: 'يوميًا',
    Weekly: 'أسبوعيًا',
    'Every 2 weeks': 'كل أسبوعين',
    Monthly: 'شهريًا',
    'Every 2 months': 'كل شهرين',
    Quarterly: 'كل 3 أشهر',
    'Twice a year': 'مرتين في السنة',
  },

  weekdays: ['الأحد', 'الاثنين', 'الثلاثاء', 'الأربعاء', 'الخميس', 'الجمعة', 'السبت'],
  // Arabic has no short weekday names; the full name is used.
  weekdaysShort: ['الأحد', 'الاثنين', 'الثلاثاء', 'الأربعاء', 'الخميس', 'الجمعة', 'السبت'],
  listSeparator: '، ',

  timeAm: '\u200F{time} ص',
  timePm: '\u200F{time} م',

  // ─── Periods ───────────────────────────────────────────────────────────────
  periodNouns: {
    Weekly: 'أسبوع',
    'Every 2 weeks': 'أسبوعان',
    Monthly: 'شهر',
    'Every 2 months': 'شهران',
    Quarterly: 'ربع سنة',
  },
  periodUnits: {
    Weekly: '× في الأسبوع',
    'Every 2 weeks': '× كل أسبوعين',
    Monthly: '× في الشهر',
    'Every 2 months': '× كل شهرين',
    Quarterly: '× كل 3 أشهر',
  },
  countWithUnit: '\u200F{n} {unit}',

  // ─── Spiritual Vitals rows ─────────────────────────────────────────────────
  vitals: {
    prayer: 'الصلاة اليومية (الأجبية + الميطانيات)',
    quiet: 'وقت الخلوة',
    scripture: 'قراءة الكتاب المقدس',
    book: 'الكتاب الروحي',
    liturgy: 'الصلوات الكنسية',
    communion: 'التناول',
    fasting: 'الصوم',
    service: 'الخدمة',
    confession: 'الاعتراف',
  },

  // ─── Canon items for a day ─────────────────────────────────────────────────
  items: {
    prayHour: '{hour}',
    countProgress: {
      Weekly: '{action} — {done} من {target} هذا الأسبوع',
      'Every 2 weeks': '{action} — {done} من {target} في هذين الأسبوعين',
      Monthly: '{action} — {done} من {target} هذا الشهر',
      'Every 2 months': '{action} — {done} من {target} في هذين الشهرين',
      Quarterly: '{action} — {done} من {target} في هذا الربع من السنة',
    },
    countComplete: {
      Weekly: '✓ اكتمل لهذا الأسبوع',
      'Every 2 weeks': '✓ اكتمل لهذين الأسبوعين',
      Monthly: '✓ اكتمل لهذا الشهر',
      'Every 2 months': '✓ اكتمل لهذين الشهرين',
      Quarterly: '✓ اكتمل لهذا الربع من السنة',
    },
    fast: 'الصوم — الانقطاع عن الطعام حتى {time}',
    prostrations: {
      one: 'ميطانية واحدة',
      two: 'ميطانيتان',
      few: '\u200F{n} ميطانيات',
      many: '\u200F{n} ميطانية',
      other: '\u200F{n} ميطانية',
    },
    quiet: {
      one: 'دقيقة واحدة من الخلوة',
      two: 'دقيقتان من الخلوة',
      few: '\u200F{n} دقائق من الخلوة',
      many: '\u200F{n} دقيقة من الخلوة',
      other: '\u200F{n} دقيقة من الخلوة',
    },
    readChapters: { one: 'أصحاح واحد', two: 'أصحاحان', few: '\u200F{n} أصحاحات', many: '\u200F{n} أصحاحًا', other: '\u200F{n} أصحاح' },
    readMinutes: { one: 'دقيقة واحدة', two: 'دقيقتان', few: '\u200F{n} دقائق', many: '\u200F{n} دقيقة', other: '\u200F{n} دقيقة' },
    bible: 'قراءة الكتاب المقدس — {amount}',
    book: '\u200F{title} — {amount}',
    bookFallback: 'كتاب روحي',
    adhocDone: '✓ مُسجَّل — ليس ضمن قانونك · اضغط للإزالة',
  },

  // ─── Postponing a Heart of Service item ────────────────────────────────────
  postpone: {
    nextWeek: 'الأسبوع القادم',
    nextMonth: 'الشهر القادم',
  },

  // ─── Priest canon templates ────────────────────────────────────────────────
  templates: {
    untitled: 'بدون اسم',
    nameRequired: 'اكتب اسمًا للقالب.',
    emptyBody: 'فعِّل بندًا واحدًا على الأقل من القانون أولًا.',
    customComponents: {
      one: 'بند خاص واحد',
      two: 'بندان خاصان',
      few: '\u200F{n} بنود خاصة',
      many: '\u200F{n} بندًا خاصًا',
      other: '\u200F{n} بند خاص',
    },
    empty: 'قالب فارغ',
  },

  // ─── Canon tab ─────────────────────────────────────────────────────────────
  tab: {
    title: 'القانون الروحي',
    subtitle: 'دواء للنفس، لا قائمة مهام',
    cardTitle: 'قانوني الروحي',
    fastingDay: 'يوم صوم',

    completingDay: 'استكمال يوم {date}',
    completingDaySettled: 'استكمال يوم {date} · الصلوات الكنسية المحدَّدة بعدد مرات سبق احتسابها عن تلك الفترة',

    assignedTag: '🔒 حدّده أب اعترافك',
    doneToday: '✓ تم اليوم',
    postponeButton: 'تأجيل ▾',
    postponeUntil: 'تأجيل إلى',
    assignedWithFreq: '\u200F{text} · {freq}',
    assignedWithFreqDays: '\u200F{text} · {freq} · {days}',

    emptyTitle: 'لم يُحدَّد قانون بعد',
    emptyBody:
      'حدِّد قانونك الروحي مع أب اعترافك: صلوات الأجبية، والصلوات الكنسية، والصوم، والميطانيات، ووقت الخلوة، والقراءة، لكل يوم من أيام الأسبوع.',
    setMyCanon: 'تحديد قانوني',
    or: 'أو',
    logAttendance: '＋  تسجيل صلاة كنسية أو تناول',
    attendedToday: 'ماذا حضرت اليوم؟',
    attendedThatDay: 'ماذا حضرت في ذلك اليوم؟',

    readinessTitle: 'الاستعداد للتناول',
    readyLabel: 'مستعد',
    readyBody: {
      zero: 'اعترفت اليوم، وهذا ضمن قانونك: الاعتراف {freq}. أنت في وضع جيد للتقدّم إلى التناول.',
      one: 'مرّ يوم واحد على اعترافك، وهذا ضمن قانونك: الاعتراف {freq}. أنت في وضع جيد للتقدّم إلى التناول.',
      two: 'مرّ يومان على اعترافك، وهذا ضمن قانونك: الاعتراف {freq}. أنت في وضع جيد للتقدّم إلى التناول.',
      few: 'مرّت {n} أيام على اعترافك، وهذا ضمن قانونك: الاعتراف {freq}. أنت في وضع جيد للتقدّم إلى التناول.',
      many: 'مرّ {n} يومًا على اعترافك، وهذا ضمن قانونك: الاعتراف {freq}. أنت في وضع جيد للتقدّم إلى التناول.',
      other: 'مرّ {n} يوم على اعترافك، وهذا ضمن قانونك: الاعتراف {freq}. أنت في وضع جيد للتقدّم إلى التناول.',
    },
    overdueLabel: 'تأخّر الاعتراف عن موعده',
    overdueBody: {
      one: 'مرّ يوم واحد على آخر اعتراف لك، وقانونك يقتضي الاعتراف {freq}. فكّر في تحديد موعد قبل تناولك القادم.',
      two: 'مرّ يومان على آخر اعتراف لك، وقانونك يقتضي الاعتراف {freq}. فكّر في تحديد موعد قبل تناولك القادم.',
      few: 'مرّت {n} أيام على آخر اعتراف لك، وقانونك يقتضي الاعتراف {freq}. فكّر في تحديد موعد قبل تناولك القادم.',
      many: 'مرّ {n} يومًا على آخر اعتراف لك، وقانونك يقتضي الاعتراف {freq}. فكّر في تحديد موعد قبل تناولك القادم.',
      other: 'مرّ {n} يوم على آخر اعتراف لك، وقانونك يقتضي الاعتراف {freq}. فكّر في تحديد موعد قبل تناولك القادم.',
    },
    readinessEmpty: 'بعد أن تُتمّ اعترافك (أو تسجّل اعترافًا في تبويب الاعتراف) يظهر هنا إرشاد الاستعداد.',
    readinessNote: 'بناءً على تاريخ اعترافك. قد يعدّل أب اعترافك هذا الإرشاد.',

    pastCanons: 'القوانين السابقة ({n})',
    dateRange: '{start} – {end}',
    demoHistoryLent: 'قانون الصوم الكبير',
    demoHistoryNewYear: 'قانون السنة الجديدة',
  },

  // ─── Rule editor ───────────────────────────────────────────────────────────
  rule: {
    backToCanon: 'القانون',
    title: 'تعديل القانون',
    savedTick: 'تم الحفظ ✓',
    intro: 'حدِّد قانونك مع أب اعترافك. لا تُضف إلا ما تستطيع المواظبة عليه بأمانة.',
    lockBanner:
      '🔒 بعض بنود قانونك حدّدها أب اعترافك. هذه البنود للقراءة فقط حتى اعترافك القادم، أو حتى يغيّرها هو. أما الباقي فيمكنك تعديله.',
    lockNote:
      '🔒 حدّده أب اعترافك؛ لا يمكنك تغييره حتى اعترافك القادم، أو حتى يغيّره هو أو يزيله.',

    everyDay: 'كل يوم',
    prostrations: 'الميطانيات',
    prostrationsNote: 'لا تُضرب في أيام السبت والأحد، ولا في الخماسين المقدسة.',
    quietTime: 'وقت الخلوة',
    minutesShort: { one: 'دقيقة واحدة', two: 'دقيقتان', few: '\u200F{n} دقائق', many: '\u200F{n} دقيقة', other: '\u200F{n} دقيقة' },

    fastUntil: 'الصوم الانقطاعي حتى (في أيام الصوم)',
    fastNote:
      'أيام الأربعاء والجمعة وأصوام الكنيسة تُعَدّ أيام صوم تلقائيًا، إلا في الخماسين المقدسة.',

    bibleReading: 'قراءة الكتاب المقدس',
    chapters: 'أصحاحات',
    minutes: 'دقائق',
    amountChapters: { one: 'أصحاح واحد', two: 'أصحاحان', few: '\u200F{n} أصحاحات', many: '\u200F{n} أصحاحًا', other: '\u200F{n} أصحاح' },
    amountMinutes: { one: 'دقيقة واحدة', two: 'دقيقتان', few: '\u200F{n} دقائق', many: '\u200F{n} دقيقة', other: '\u200F{n} دقيقة' },

    spiritualBook: 'كتاب روحي',
    addPlus: '+ إضافة',
    lockedBook: '\u200F{title} · {amount}',
    lockedBookFallback: 'كتاب روحي',
    bookPlaceholder: 'عنوان الكتاب (مثال: السلم إلى الله)',

    confessionFrequency: 'معدّل الاعتراف',

    churchServices: 'الصلوات الكنسية',
    lockedCount: {
      Weekly: '{service} · {n} × في الأسبوع',
      'Every 2 weeks': '{service} · {n} × كل أسبوعين',
      Monthly: '{service} · {n} × في الشهر',
      'Every 2 months': '{service} · {n} × كل شهرين',
      Quarterly: '{service} · {n} × كل 3 أشهر',
    },
    setOnDaysBelow: 'محدَّدة بأيام معيّنة أدناه.',
    servicesHelp:
      'التزم إمّا بأيام محدّدة من الأسبوع، أو بعدد مرات في الأسبوع تسجّلها كلما حضرت؛ إحدى الطريقتين لا كلتاهما.',
    specificDays: 'أيام محدّدة',
    timesPerWeek: 'عدد مرات في الأسبوع',
    countsHelp: 'تظهر هذه الصلوات في قانونك كل يوم إلى أن تسجّل حضورها عن الفترة.',

    eachDay: 'لكل يوم من أيام الأسبوع',
    dayToday: '{day}  · اليوم',
    summaryHours: {
      one: 'صلاة واحدة من الأجبية',
      two: 'صلاتان من الأجبية',
      few: '\u200F{n} صلوات من الأجبية',
      many: '\u200F{n} صلاة من الأجبية',
      other: '\u200F{n} صلاة من الأجبية',
    },
    summaryServices: {
      one: 'صلاة كنسية واحدة',
      two: 'صلاتان كنسيتان',
      few: '\u200F{n} صلوات كنسية',
      many: '\u200F{n} صلاة كنسية',
      other: '\u200F{n} صلاة كنسية',
    },
    summaryServing: { one: 'خدمة واحدة', two: 'خدمتان', few: '\u200F{n} خدمات', many: '\u200F{n} خدمة', other: '\u200F{n} خدمة' },
    summaryFastDay: 'يوم صوم',
    summaryNothing: 'لا شيء محدَّد',

    agpeyaHours: 'صلوات الأجبية',
    setAsCountsAbove: 'محدَّدة بعدد مرات في الأسبوع أعلاه.',
    heartOfService: 'قلب الخدمة',
    servingWithFreq: '\u200F{text} · {freq}',
    servicePlaceholder: 'خدمتك (مثال: مدارس الأحد، افتقاد المرضى)',
    serviceNote:
      'تظهر الخدمة في يوم {day} من كل أسبوع إلى أن تسجّل إتمامها، ثم تغيب بحسب معدّلها (فالخدمة الشهرية تعود بعد نحو شهر من إتمامها).',
    autoFast: '✦ يوم صوم تلقائيًا (إلا في الخماسين المقدسة).',

    done: 'تم — التغييرات تُحفظ تلقائيًا',
  },
};
