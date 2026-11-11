import type { Localized } from '../core';
import type { priest as En } from '../en/priest';

// «أبناء الاعتراف» is the priest's own flock; one of them, wherever the text
// cannot know whether it is a man or a woman, is «العضو».
//
// A line that would begin with a number begins with a right-to-left mark
// (\u200F) so the number stays where it is read.
export const priest: Localized<typeof En> = {
  // ─── Drawer ────────────────────────────────────────────────────────────────
  nav: {
    flock: 'الرعية',
    schedule: 'جدول المواعيد',
    member: 'العضو',
    canon: 'القانون الروحي',
    encounter: 'تسجيل لقاء',
  },

  shared: {
    myFlock: 'رعيتي',
    unknownMember: 'غير معروف',
    visitRequested: '◎ طلب افتقاد',
    dot: ' · ',
    listSeparator: '، ',
  },

  // ─── Flock list ────────────────────────────────────────────────────────────
  flock: {
    subtitle: '{date} · {name}',
    myView: 'صفحتي الشخصية',
    memberCount: {
      zero: 'لا يوجد أبناء اعتراف',
      one: 'ابن واحد في الاعتراف',
      two: 'ابنان في الاعتراف',
      few: '\u200F{n} أبناء في الاعتراف',
      many: '\u200F{n} ابنًا في الاعتراف',
      other: '\u200F{n} ابن في الاعتراف',
    },
    overdueCount: 'متأخرون عن الاعتراف: {n}',
    visitRequestCount: {
      one: 'طلب افتقاد واحد',
      two: 'طلبا افتقاد',
      few: '\u200F{n} طلبات افتقاد',
      many: '\u200F{n} طلب افتقاد',
      other: '\u200F{n} طلب افتقاد',
    },
    searchPlaceholder: 'ابحث في أبناء الاعتراف…',
    filters: {
      all: 'الكل',
      due: 'حان الموعد',
      overdue: 'متأخر',
      flagged: 'للمتابعة',
    },
    status: {
      recent: '✓ اعتراف حديث',
      due: '⚠ حان الموعد',
      overdue: '⚠ متأخر',
    },
    listTitle: 'أبناء الاعتراف ({n})',
    emptyTitle: 'لا يوجد أبناء اعتراف بعد',
    emptyBody: 'سيظهر هنا الأعضاء الذين يختارونك أبًا لاعترافهم.',
    noMatchTitle: 'لا يوجد أعضاء يطابقون هذه التصفية',
    noMatchBody: 'جرّب تصفية أخرى.',
    daysAgo: {
      zero: 'اليوم',
      one: 'منذ يوم واحد',
      two: 'منذ يومين',
      few: 'منذ {n} أيام',
      many: 'منذ {n} يومًا',
      other: 'منذ {n} يوم',
    },
    noRecord: 'لا يوجد سجل',
    flagged: '⚑ بحاجة إلى متابعة',

    sheetDaysSince: {
      zero: 'آخر اعتراف: اليوم',
      one: 'مضى على الاعتراف يوم واحد',
      two: 'مضى على الاعتراف يومان',
      few: 'مضى على الاعتراف {n} أيام',
      many: 'مضى على الاعتراف {n} يومًا',
      other: 'مضى على الاعتراف {n} يوم',
    },
    sheetNoConfession: 'لا يوجد اعتراف مسجَّل',
    logEncounter: 'تسجيل لقاء',
    assignCanon: 'تحديد قانون روحي',
    viewProfile: 'عرض الملف الشخصي',
  },

  // ─── One member ────────────────────────────────────────────────────────────
  member: {
    nameFallback: 'عضو',
    contactFallback: 'بيانات الاتصال',
    // The demo stages already say «مرحلة …».
    heroStage: '{stage}',
    heroJoined: 'تاريخ الانضمام: {date}',
    // The priest is reading about someone else, whose gender the app does not
    // know, so both forms are given (as on the member's own profile).
    lifeStages: {
      single: 'أعزب / عزباء',
      engaged: 'خاطب / مخطوبة',
      married: 'متزوج / متزوجة',
      widowed: 'أرمل / أرملة',
      divorced: 'مطلّق / مطلّقة',
    },
    children: {
      one: 'ابن واحد',
      two: 'ابنان',
      few: '\u200F{n} أبناء',
      many: '\u200F{n} ابنًا',
      other: '\u200F{n} ابن',
    },
    childrenWithAges: {
      one: 'ابن واحد (العمر تقريبًا: {ages})',
      two: 'ابنان (الأعمار تقريبًا: {ages})',
      few: '\u200F{n} أبناء (الأعمار تقريبًا: {ages})',
      many: '\u200F{n} ابنًا (الأعمار تقريبًا: {ages})',
      other: '\u200F{n} ابن (الأعمار تقريبًا: {ages})',
    },
    // «تقريبًا» is already said once for the whole list.
    childAge: '{age}',
    flagNote: '⚑ {note}',

    photoYours: 'الصورة التي أضفتها لهذا العضو (لا يراها أحد غيرك)',
    photoNone: 'لا توجد صورة شخصية. أضف صورة (لا يراها أحد غيرك)',
    photoCamera: '◉ الكاميرا',
    photoChange: '▤ تغيير',
    photoUpload: '▤ رفع صورة',
    photoRemove: '✕ إزالة',
    photoRemoveTitle: 'إزالة الصورة',
    photoRemoveBody: 'هل تريد إزالة الصورة التي أضفتها لهذا العضو؟',
    errUpload: 'تعذّر رفع الصورة: {error}',
    errSave: 'تعذّر الحفظ: {error}',
    errRemove: 'تعذّرت الإزالة: {error}',

    statSinceConfession: 'منذ الاعتراف',
    statCanons: 'بنود القانون',
    statRequests: 'طلبات الصلاة',
    statDays: {
      zero: 'اليوم',
      one: 'يوم واحد',
      two: 'يومان',
      few: '\u200F{n} أيام',
      many: '\u200F{n} يومًا',
      other: '\u200F{n} يوم',
    },
    lastVisit: 'آخر افتقاد',
    lastVisitNone: 'لم يُسجَّل افتقاد',
    logEncounter: 'تسجيل لقاء',

    tabs: {
      overview: 'نظرة عامة',
      canon: 'القانون',
      prayer: 'الصلاة',
      notes: 'الملاحظات',
    },

    vitalsTitle: 'المؤشرات الروحية',
    vitalsEmpty: 'لم يشارك العضو أي مؤشرات بعد.',
    vitalNotShared: '{label} (غير مشارَك)',
    // «ي» for «يوم»: the column is too narrow for the word.
    vitalDays: '\u200F{n} ي',

    psalmTitle: 'حفظ المزامير',
    psalmEmpty: 'لم يشارك العضو تقدّمه في حفظ المزامير بعد.',
    psalmStreak: 'أيام متتالية',
    psalmBest: 'أطول مدة متتالية',
    psalmMemorized: 'تم حفظها',

    confessionTitle: 'سجل الاعترافات',
    confessionPrivacy: '✦ التواريخ والنوع فقط. لا يُخزَّن المضمون أبدًا.',
    confessionEmpty: 'لا يوجد سجل اعترافات بعد.',
    holyConfession: 'سر الاعتراف المقدس',
    selfReported: 'سجّله العضو بنفسه',

    currentCanonTitle: 'القانون الروحي الحالي',
    currentCanonEmpty: 'لم تتم مزامنة قانون شخصي بعد.',
    assignedByYou: '  ·  حدّدته أنت',
    currentCanonHint:
      'هذا قانون العضو نفسه. افتح المحرر أدناه لتعديله. البنود التي تحدّدها أنت تصبح للقراءة فقط لدى العضو حتى اعترافه القادم.',
    assignedCanonTitle: 'القانون المحدَّد',
    assignedCanonEmpty: 'لم يُحدَّد قانون بعد.',
    canonSince: '\u200F{frequency} · منذ {date}',
    canonThisWeek: 'هذا الأسبوع: {done}/{total}',
    assignCanon: 'تحديد قانون روحي',

    rule: {
      prostrations: 'الميطانيات',
      quiet: 'وقت الخلوة',
      fasting: 'الصوم',
      bible: 'الكتاب المقدس',
      book: 'الكتاب الروحي',
      confession: 'الاعتراف',
      agpeyaHours: 'صلوات الأجبية',
      services: 'الصلوات الكنسية',
      heartOfService: 'قلب الخدمة',

      prostrationsDaily: {
        one: 'ميطانية واحدة يوميًا',
        two: 'ميطانيتان يوميًا',
        few: '\u200F{n} ميطانيات يوميًا',
        many: '\u200F{n} ميطانية يوميًا',
        other: '\u200F{n} ميطانية يوميًا',
      },
      quietDaily: {
        one: 'دقيقة واحدة يوميًا',
        two: 'دقيقتان يوميًا',
        few: '\u200F{n} دقائق يوميًا',
        many: '\u200F{n} دقيقة يوميًا',
        other: '\u200F{n} دقيقة يوميًا',
      },
      fastUntil: 'حتى {time} في أيام الصوم',
      bibleChapters: {
        one: 'أصحاح واحد يوميًا',
        two: 'أصحاحان يوميًا',
        few: '\u200F{n} أصحاحات يوميًا',
        many: '\u200F{n} أصحاحًا يوميًا',
        other: '\u200F{n} أصحاح يوميًا',
      },
      bibleMinutes: {
        one: 'دقيقة واحدة يوميًا',
        two: 'دقيقتان يوميًا',
        few: '\u200F{n} دقائق يوميًا',
        many: '\u200F{n} دقيقة يوميًا',
        other: '\u200F{n} دقيقة يوميًا',
      },
      bookChapters: {
        one: '\u200F{title} — فصل واحد',
        two: '\u200F{title} — فصلان',
        few: '\u200F{title} — {n} فصول',
        many: '\u200F{title} — {n} فصلًا',
        other: '\u200F{title} — {n} فصل',
      },
      bookMinutes: {
        one: '\u200F{title} — دقيقة واحدة',
        two: '\u200F{title} — دقيقتان',
        few: '\u200F{title} — {n} دقائق',
        many: '\u200F{title} — {n} دقيقة',
        other: '\u200F{title} — {n} دقيقة',
      },
      bookUntitled: 'بدون عنوان',
      dayLine: '{day} · {items}',
      servicePer: {
        Weekly: '{service} · {n}× في الأسبوع',
        'Every 2 weeks': '{service} · {n}× كل أسبوعين',
        Monthly: '{service} · {n}× في الشهر',
        'Every 2 months': '{service} · {n}× كل شهرين',
        Quarterly: '{service} · {n}× كل 3 أشهر',
      },
      serving: '\u200F{text} ({freq})',
    },

    prayerTitle: 'طلبات الصلاة',
    prayerPrivacy: '✦ الطلبات التي شاركها العضو مع أب الاعتراف فقط، أو مع أب الاعتراف وخادم مدارس الأحد معًا.',
    prayerEmpty: 'لا توجد طلبات مشارَكة مع أب الاعتراف.',
    prayerCategories: {
      health: 'الصحة',
      family: 'الأسرة',
      relationships: 'العلاقات',
      work: 'العمل / الدراسة',
      faith: 'مسيرة الإيمان',
      gratitude: 'الشكر',
      other: 'أخرى',
    },

    notesTitle: 'ملاحظات رعوية (خاصة)',
    notesPrivacy: '✦ ملاحظاتك الخاصة. لا تظهر للعضو أبدًا.',
    notesEmpty: 'لا توجد ملاحظات بعد. أضف أول ملاحظة أدناه.',
    noteEdited: '\u200F{date}  (معدَّلة)',
    encounterNoteHeading: '{type} · {date}',
    encounterTypes: {
      confession: 'اعتراف',
      counseling: 'إرشاد',
      advice: 'مشورة',
      visit: 'افتقاد',
      phone: 'مكالمة',
      group: 'لقاء جماعي',
    },
    noteSaving: 'جارٍ الحفظ…',
    noteSave: 'حفظ',
    noteCancel: 'إلغاء',
    notePlaceholder: 'أضف ملاحظة رعوية…',
    noteAdd: 'إضافة ملاحظة',
    noteSaveFailed: 'تعذّر الحفظ. حاول مرة أخرى.',

    sheet: {
      assignCanon: 'تحديد قانون روحي',
      assignCanonSub: 'أضف تدريبًا روحيًا',
      assignAction: 'تحديد',
      phone: 'الهاتف',
      phoneAction: 'اتصال',
      email: 'البريد الإلكتروني',
      emailAction: 'مراسلة',
      address: 'العنوان',
      addressAction: 'الخريطة',
      empty: 'لا توجد بيانات اتصال مسجَّلة بعد.\nيمكن للعضو إضافتها من إعدادات ملفه الشخصي.',
      close: 'إغلاق',
    },
  },

  // ─── Encounter log ─────────────────────────────────────────────────────────
  encounter: {
    title: 'تسجيل لقاء رعوي',
    memberCard: 'العضو',
    memberSearchPlaceholder: 'ابحث عن عضو…',
    typeCard: 'نوع اللقاء',
    types: {
      confession: { label: 'سر الاعتراف المقدس', desc: 'ممارسة سر الاعتراف' },
      counseling: { label: 'جلسة إرشاد', desc: 'إرشاد رعوي وجهًا لوجه' },
      advice: { label: 'مشورة روحية', desc: 'توجيه موجز أو إجابة عن سؤال' },
      visit: { label: 'افتقاد', desc: 'زيارة في المنزل أو المستشفى' },
      phone: { label: 'مكالمة هاتفية أو مرئية', desc: 'متابعة عن بُعد' },
      group: { label: 'لقاء جماعي', desc: 'خلوة أو دراسة جماعية أو ما شابه' },
    },
    dateCard: 'التاريخ',
    datePlaceholder: 'مثال: 7 يونيو 2026',
    memberNoteCard: 'ملاحظة للعضو (تظهر في مسيرته الرعوية)',
    memberNotePlaceholder: 'مثال: تحدثنا عن أهمية صلوات الأجبية في تنظيم حياة الصلاة…',
    memberNoteHint: 'تظهر هذه الملاحظة للعضو في قسم «المسيرة الرعوية».',
    privateNoteCard: 'ملاحظات رعوية خاصة (لأب الاعتراف فقط)',
    privateNoteBanner: '✦ لا تظهر للعضو أبدًا.',
    privateNotePlaceholder: 'ملاحظاتك الخاصة وانطباعاتك الرعوية…',
    followUpCard: 'تحديد موعد للمتابعة (اختياري)',
    followUpPlaceholder: 'مثال: 29 يونيو 2026',
    followUpHint: 'تاريخ تذكير يظهر في صفحة «رعيتي». اترك الخانة فارغة إن لم يكن هناك موعد.',
    sealTitle: '✝︎ سرّية الاعتراف',
    sealBody:
      'مضمون الاعتراف مصون بسرّيته المقدسة. لا يُسجَّل سوى التاريخ ونوع اللقاء. ولا يُخزَّن ولا يُرسَل أي شيء من محاسبة النفس الخاصة بالعضو.',
    save: 'تسجيل اللقاء',
    saved: '✓ تم تسجيل اللقاء',

    errSelectMember: 'اختر عضوًا من القائمة أولًا.',
    errDemo: 'أنت في العرض التجريبي. سجّل الدخول بحساب حقيقي لحفظ اللقاءات.',
    errDate: 'التاريخ غير صحيح. استخدم صيغة مثل «7 يونيو 2026»',
    errFollowUp: 'أدخل تاريخًا مثل «29 يونيو 2026»، أو اترك الخانة فارغة.',
    errSave: 'تعذّر الحفظ: {error}',
  },

  // ─── Demo mode: a fictional flock ──────────────────────────────────────────
  demo: {
    names: {
      mh: 'ميخائيل حنا',
      sg: 'سارة جرجس',
      pb: 'بطرس رزق',
      mm: 'مريم ميخائيل',
      ag: 'أندراوس جورج',
      cn: 'كريستين نجيب',
    },
    // Two initials with a zero-width non-joiner between them, so they stay
    // two separate letters instead of joining into a word.
    initials: {
      mh: 'م\u200Cح',
      sg: 'س\u200Cج',
      pb: 'ب\u200Cر',
      mm: 'م\u200Cم',
      ag: 'أ\u200Cج',
      cn: 'ك\u200Cن',
    },
    stages: {
      growing: 'مرحلة النمو',
      mature: 'مرحلة النضج',
      new: 'مرحلة البداية',
      seeking: 'مرحلة البحث',
      multiplying: 'مرحلة الإثمار',
    },
    flockNotes: {
      mh: 'رُزق بمولود حديثًا — تم الافتقاد في 4 مايو.',
      pb: 'للمتابعة: تغيّب عن موعدَي متابعة.',
      ag: 'جديد في الكنيسة — يحتاج إلى لقاء أول.',
    },
    flagNotes: {
      pb: 'تغيّب عن موعدَي متابعة.',
      ag: 'جديد في الكنيسة — يحتاج إلى لقاء أول.',
    },
    spouses: {
      mh: 'نادية حنا',
      pb: 'ماريا رزق',
      mm: 'فادي ميخائيل',
      cn: 'مينا نجيب',
    },
    children: {
      mh: ['كيرلس'],
      pb: ['أنطونيوس', 'مريم'],
      mm: ['بيشوي', 'إيريني'],
      cn: ['فيرينا', 'مرقس', 'إيريني'],
    },
    introMeeting: 'لقاء تعارف',
    confessionNotes: {
      mh: [
        'تحدثنا عن مخاوف الأبوّة الجديدة. شجّعته على صلاة الأجبية يوميًا.',
        'استعداد روحي قبل ولادة الطفل.',
      ],
      sg: [
        'تحدثنا عن تمييز الدعوة. شجّعتها على المواظبة على الصلاة والصبر.',
        'استعداد للصوم الكبير.',
        'خطة روحية لبداية العام.',
      ],
      pb: [
        'وضعنا أهدافًا روحية.',
        'تعرّف كل منا على الآخر.',
      ],
      mm: [
        'ركّزنا على إثراء الحياة الزوجية. صلّينا معًا بحضور فادي.',
        'استعداد للصوم الكبير. تحدّثنا عن قلقها بشأن الطفل الثاني.',
      ],
      cn: [
        'قوية روحيًا. تحدثنا عن قيادتها لاجتماع درس الكتاب المقدس للسيدات.',
        'تأملات الصوم الكبير — عن الشكر والخدمة.',
        'استعداد لصوم الميلاد.',
      ],
    },
    prayerTopics: {
      mh: [
        'شكر على المولود الجديد — صلوات شكر',
        'حكمة في الأبوّة الجديدة',
      ],
      sg: ['تمييز الدعوة — الرهبنة أم الزواج'],
      pb: [
        'تغيير العمل — شعور بالتيه',
        'مصالحة عائلية مع أخيه',
      ],
      mm: [
        'سلام في الحياة الزوجية — صعوبات في التواصل',
        'شفاء حماتها',
      ],
      ag: ['بحث عن المعنى — شعور بالفراغ في العمل'],
      cn: ['إرشاد في انتقال فيرينا إلى مدرسة جديدة'],
    },
    canons: {
      morningAgpeya: 'صلاة الأجبية صباحًا',
      psalmReading: 'قراءة المزامير (مزمور واحد)',
      completeAgpeya: 'الأجبية كاملة (الصلوات السبع كلها)',
      bibleTwo: 'قراءة الكتاب المقدس (أصحاحان)',
      gospelOne: 'قراءة الإنجيل (أصحاح واحد)',
      eveningPrayer: 'صلاة المساء (صلاة النوم)',
      bibleOne: 'قراءة الكتاب المقدس (أصحاح واحد)',
      midnightPraise: 'تسبحة نصف الليل',
      bibleThree: 'قراءة الكتاب المقدس (3 أصحاحات)',
    },
    notes: {
      mh: 'ينمو جيدًا منذ ولادة كيرلس. كان افتقاد 4 مايو مثمرًا. أتابع معه المواظبة على صلاة الأجبية — اقترحتُ أن يصلّي الزوجان معًا بعد أن ينام الطفل.',
      sg: 'ناضجة روحيًا ومواظِبة. تمرّ حاليًا بفترة تمييز للدعوة. تحتاج إلى إرشاد لطيف لا إلى ضغط. أنصحها بقراءة ما كتبه أبونا متى المسكين عن الدعوة الرهبانية.',
      pb: 'يحتاج إلى متابعة منتظمة. أبدى رغبة في تعميق إيمانه لكنه يجد صعوبة في المواظبة. اقترحتُ عليه شريكًا للمتابعة من اجتماع الشباب.',
      mm: 'نمو منتظم. يحضر فادي ومريم معًا، وهذا مشجّع. يُستحسن دعوتهما لقيادة مجموعة صغيرة للمتزوجين حديثًا — فلديهما النضج الكافي لذلك.',
      ag: 'لم يعترف للمرة الأولى بعد. انتقل من شيكاغو في يناير. يحضر قداس الأحد بغير انتظام. يحتاج إلى دعوة شخصية دافئة — يُستحسن الاتصال به هاتفيًا هذا الأسبوع قبل الأحد.',
      cn: 'من أقوى أعضاء الرعية. ترعى روحيًا شابتين أصغر منها سنًّا. يُستحسن تكليفها رسميًا بقيادة مجموعة النمو الروحي للسيدات.',
    },
  },
};
