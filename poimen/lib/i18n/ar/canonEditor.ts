import type { Localized } from '../core';
import type { canonEditor as En } from '../en/canonEditor';

export const canonEditor: Localized<typeof En> = {
  // ─── Option names, keyed by the stored value ───────────────────────────────
  // These follow the wording of the member's own canon (ar/canon.ts), so a
  // priest and a member read the same names.
  categories: {
    prostrations: 'الميطانيات',
    quiet: 'وقت الخلوة',
    fasting: 'الصوم',
    bible: 'قراءة الكتاب المقدس',
    book: 'كتاب روحي',
    confession: 'معدّل الاعتراف',
    agpeya_hours: 'صلوات الأجبية',
    services: 'الصلوات الكنسية',
    heart_of_service: 'قلب الخدمة',
    custom: 'بند خاص',
  },
  periodUnits: {
    Weekly: '× في الأسبوع',
    'Every 2 weeks': '× كل أسبوعين',
    Monthly: '× في الشهر',
    'Every 2 months': '× كل شهرين',
    Quarterly: '× كل 3 أشهر',
  },

  // ─── The unit beside a stepper's number ────────────────────────────────────
  // The stepper prints the number itself, so «two» is the counted plural that
  // follows a numeral («2 دقائق»), not a dual that already says the number.
  units: {
    metanias: { one: 'ميطانية', two: 'ميطانيات', few: 'ميطانيات', many: 'ميطانية', other: 'ميطانية' },
    minutes: { one: 'دقيقة', two: 'دقائق', few: 'دقائق', many: 'دقيقة', other: 'دقيقة' },
    // A chapter of the Bible is «أصحاح»; a chapter of any other book is «فصل».
    bibleChapters: { one: 'أصحاح', two: 'أصحاحات', few: 'أصحاحات', many: 'أصحاحًا', other: 'أصحاح' },
    bookChapters: { one: 'فصل', two: 'فصول', few: 'فصول', many: 'فصلًا', other: 'فصل' },
  },

  // ─── A category's one-line summary ─────────────────────────────────────────
  summary: {
    part: '{category}: {summary}',
    prostrations: {
      zero: 'بلا ميطانيات',
      one: 'ميطانية واحدة',
      two: 'ميطانيتان',
      few: '\u200F{n} ميطانيات',
      many: '\u200F{n} ميطانية',
      other: '\u200F{n} ميطانية',
    },
    quiet: { one: 'دقيقة واحدة', two: 'دقيقتان', few: '\u200F{n} دقائق', many: '\u200F{n} دقيقة', other: '\u200F{n} دقيقة' },
    fastUntil: 'حتى {time}',
    chapters: { one: 'أصحاح واحد', two: 'أصحاحان', few: '\u200F{n} أصحاحات', many: '\u200F{n} أصحاحًا', other: '\u200F{n} أصحاح' },
    minutes: { one: 'دقيقة واحدة', two: 'دقيقتان', few: '\u200F{n} دقائق', many: '\u200F{n} دقيقة', other: '\u200F{n} دقيقة' },
    bookFallback: 'كتاب روحي',
    hourDays: {
      zero: 'لا شيء محدَّد',
      one: 'صلاة واحدة في الأسبوع',
      two: 'صلاتان في الأسبوع',
      few: '\u200F{n} صلوات في الأسبوع',
      many: '\u200F{n} صلاة في الأسبوع',
      other: '\u200F{n} صلاة في الأسبوع',
    },
    perPeriod: {
      zero: 'لا شيء محدَّد',
      one: 'مرة واحدة في الفترة',
      two: 'مرتان في الفترة',
      few: '\u200F{n} مرات في الفترة',
      many: '\u200F{n} مرة في الفترة',
      other: '\u200F{n} مرة في الفترة',
    },
    serviceDays: {
      zero: 'لا شيء محدَّد',
      one: 'مرة واحدة في الأسبوع',
      two: 'مرتان في الأسبوع',
      few: '\u200F{n} مرات في الأسبوع',
      many: '\u200F{n} مرة في الأسبوع',
      other: '\u200F{n} مرة في الأسبوع',
    },
    commitments: {
      zero: 'لا التزامات',
      one: 'التزام واحد',
      two: 'التزامان',
      few: '\u200F{n} التزامات',
      many: '\u200F{n} التزامًا',
      other: '\u200F{n} التزام',
    },
  },

  // ─── Page heading ──────────────────────────────────────────────────────────
  page: {
    memberFallback: 'العضو',
    builderTitle: 'إعداد القانون الروحي',
    memberTitle: 'إعداد قانون {name} الروحي',
    builderIntro:
      'أعِدَّ هنا قانونًا روحيًا واحفظه قالبًا جاهزًا للتطبيق على أي فرد من رعيتك. لا شيء في هذه الشاشة يخص عضوًا بعينه؛ فتحديد القانون لأي عضو يتم من قانونه هو.',
    memberIntro:
      'فعِّل بندًا لتحديده للعضو. البنود التي تحدِّدها تبقى مقفلة لدى العضو حتى اعترافه القادم، أو حتى تغيّرها أنت أو تزيلها. والبنود التي لا تمسّها تبقى كما وضعها العضو.',
  },

  // ─── Templates ─────────────────────────────────────────────────────────────
  templates: {
    titleMine: 'قوالبي',
    title: 'القوالب',
    newTemplate: '+ قالب جديد',
    saveThisCanon: '+ حفظ هذا القانون',
    saveNamePlaceholder: 'سمِّه، مثال: مؤمن جديد، الشباب، الصوم الكبير',
    saveAsTemplate: 'حفظ كقالب',
    saveHint: 'يحفظ البنود المفعَّلة الآن بقيمها، مع أي بنود خاصة.',
    emptyBuilder:
      'لا توجد قوالب بعد. فعِّل بنود القانون أدناه، ثم سمِّ القالب واحفظه، وبعدها تطبّقه بضغطة واحدة على قانون أي عضو.',
    emptyMember:
      'لا توجد قوالب بعد. أعِدَّها من تبويب «القانون الروحي»، أو اضغط «حفظ هذا القانون» لإعادة استخدامه.',

    openHint: 'مفتوح، اضغط للإغلاق',
    appliedHint: 'مطبَّق، اضغط للتراجع',
    customCount: {
      one: 'بند خاص واحد',
      two: 'بندان خاصان',
      few: '\u200F{n} بنود خاصة',
      many: '\u200F{n} بندًا خاصًا',
      other: '\u200F{n} بند خاص',
    },
    emptyTemplate: 'قالب فارغ',

    msgEditing: 'تعدِّل الآن القالب «{name}». اضغط عليه مرة أخرى لإغلاقه.',
    msgApplied: 'طُبِّق القالب «{name}». راجعه ثم اضغط «حفظ» لتحديده للعضو. اضغط عليه مرة أخرى للتراجع.',
    msgRemovedBuilder: 'أُزيل القالب «{name}»، وعادت شاشة الإعداد كما كانت.',
    msgRemovedCanon: 'أُزيل القالب «{name}»، وعاد القانون كما كان.',
    msgDetached: 'القالب «{name}» باقٍ كما هو. سمِّ القالب الجديد ثم اضغط «إنشاء القالب».',
    msgSaved: 'تم حفظ «{name}».',
    msgCreatedFrom: 'أُنشئ القالب «{name}»، وبقي «{from}» كما هو. شاشة الإعداد فارغة الآن.',
    msgCreated: 'أُنشئ القالب «{name}». شاشة الإعداد فارغة للقالب التالي.',
    msgRenamed: 'تم حفظ «{name}» (كان اسمه «{was}»).',
    msgTemplateSaved: 'تم حفظ القالب.',
    msgUpdated: 'تم تحديث «{name}».',
    errNothingOn: 'فعِّل بندًا واحدًا على الأقل من القانون أولًا.',
    errNameRequired: 'اكتب اسمًا للقالب.',
    copyName: 'نسخة من {name}',

    deleteTitle: 'حذف القالب',
    deleteBody: 'هل تريد حذف «{name}»؟ القوانين التي سبق تحديدها منه لن تتأثر.',

    nameLabel: 'اسم القالب',
    nameLabelNew: 'سمِّ هذا القالب',
    namePlaceholder: 'مثال: مؤمن جديد، الشباب، الصوم الكبير',
    newNameHint: 'الاسم الجديد يُنشئ قالبًا جديدًا، ويبقى «{name}» كما هو.',
    create: 'إنشاء القالب',
    createNamed: 'إنشاء «{name}»',
    saveOver: 'حفظ التغييرات في «{name}»',
    renameAndSaveOver: 'إعادة تسمية «{from}» إلى «{to}» وحفظ التغييرات فيه بدلًا من ذلك',
    keepAndSaveNew: 'إبقاء «{name}» كما هو وحفظ هذه التغييرات في قالب جديد',
  },

  // ─── Inside the category cards ─────────────────────────────────────────────
  cards: {
    bibleChapters: 'أصحاحات',
    bibleMinutes: 'دقائق',
    bookChapters: 'فصول',
    bookMinutes: 'دقائق',
    bookPlaceholder: 'عنوان الكتاب (مثال: السلم إلى الله)',

    specificDays: 'أيام محدّدة',
    timesPerWeek: 'عدد مرات في الأسبوع',
    countsHelp:
      'حدِّد معدّل حضور كل صلاة كنسية، وعدد المرات في كل فترة. يسجّل العضو كل مرة عند حضوره.',
    daysHelp: 'حدِّد الصلوات أو الخدمات لكل يوم من أيام الأسبوع. اضغط على اليوم لتعديله.',
    daySet: 'المحدَّد: {n}',
    dayNone: 'لا شيء',
    servicePlaceholder: 'الخدمة (مثال: افتقاد المرضى)',
    addCommitment: '+ إضافة التزام',
  },

  // ─── Custom components ─────────────────────────────────────────────────────
  custom: {
    title: 'بنود خاصة',
    note: 'إضافات بنص حر إلى قانون العضو. هي للقراءة فقط لديه، وأنت من يديرها.',
    noDay: 'لم يُختَر يوم، فسيظهر البند كل أيام الأسبوع.',
    placeholder: 'مثال: القراءة في بستان الرهبان',
  },

  // ─── Saving a member's canon ───────────────────────────────────────────────
  save: {
    error: 'تعذّر حفظ القانون. حاول مرة أخرى.',
    savedTo: '✓ تم الحفظ في قانون {name}',
    saveCanon: 'حفظ قانون {name} الروحي',
  },

  // ─── Servant: assign a practice to a student ───────────────────────────────
  servant: {
    studentFallback: 'المخدوم',
    title: 'تحديد قانون روحي',
    // Begins with the student's name, which may be in Latin letters: the
    // leading mark keeps the line right-to-left.
    subtitle: '\u200F{name} · من مخدومي مدارس الأحد',
    scopeButton: 'الصلاة والكتاب المقدس فقط  ⓘ',
    scopeTitle: 'لماذا الصلاة والكتاب المقدس فقط؟',
    scopeBody:
      'بصفتك خادمًا في مدارس الأحد، يمكنك أن تحدِّد لمخدوميك قوانين في الصلاة وقراءة الكتاب المقدس.\n\nأما الصوم والاعتراف والتدريبات الروحية المتقدمة فيحدِّدها أب الاعتراف.',
    scopeDismiss: 'فهمت',

    choosePractice: 'اختيار التدريب',
    groupPrayer: 'الصلاة',
    groupScripture: 'الكتاب المقدس',
    prayerPresets: [
      'صلاة الأجبية صباحًا',
      'صلاة الأجبية مساءً',
      'صلاة صباحية قصيرة (الصلاة الربانية + المجد للآب)',
      'صلاة من أجل الأسرة',
      'صلاة شكر قبل النوم',
    ],
    scripturePresets: [
      'قراءة الإنجيل (أصحاح واحد)',
      'قراءة المزامير (مزمور واحد)',
      'قراءة سفر الأمثال (أصحاح واحد)',
      'قراءة فقرة وكتابة تأمل واحد',
      'حفظ آية واحدة من الكتاب المقدس كل أسبوع',
    ],
    orCustom: '— أو اكتب تدريبًا خاصًا —',
    customPlaceholder: 'مثال: قراءة قصة من الكتاب المقدس كل مساء مع أحد الوالدين',

    frequency: 'المعدّل',
    freq: {
      Daily: 'يوميًا',
      '3x/week': 'ثلاث مرات أسبوعيًا',
      Weekly: 'أسبوعيًا',
      Custom: 'معدّل آخر',
    },
    customFreqPlaceholder: 'صِف المعدّل…',

    startDate: 'تاريخ البدء',
    // The date is sent to the server as typed, so the example keeps the form
    // the server reads.
    startDatePlaceholder: 'مثال: 8 يونيو 2026',
    startDateInvalid: 'اكتب تاريخ البداية بصيغة تاريخ، مثل 8 يونيو 2026.',
    saveFailed: 'تعذّر تكليف القانون الروحي. تحقق من اتصالك ثم حاول مرة أخرى.',

    noteTitle: 'كلمة تشجيع (اختياري)',
    notePlaceholder: 'اكتب كلمة تشجيع إلى {name}…',
    noteHint: 'تظهر للمخدوم في قسم القانون الروحي لديه.',

    assigned: '✓ تم التحديد لـ {name}',
    assign: 'تحديد القانون لـ {name}',
  },
};
