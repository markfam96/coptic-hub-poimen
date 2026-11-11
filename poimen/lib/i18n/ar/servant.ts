import type { Localized } from '../core';
import type { servant as En } from '../en/servant';

export const servant: Localized<typeof En> = {
  drawer: {
    tagline: 'خادم الفصل',
    students: 'المخدومون',
    student: 'المخدوم',
    canon: 'القانون الروحي',
  },

  // ─── The class list ────────────────────────────────────────────────────────
  list: {
    title: 'مخدومو فصلي',
    // The same words as the priest's button (priest.ts).
    myView: 'صفحتي الشخصية',

    studentCount: {
      zero: 'لا يوجد مخدومون',
      one: 'مخدوم واحد',
      two: 'مخدومان',
      few: '\u200F{n} مخدومين',
      many: '\u200F{n} مخدومًا',
      other: '\u200F{n} مخدوم',
    },
    withActiveCanon: {
      one: 'واحد لديه قانون سارٍ',
      two: 'اثنان لديهما قانون سارٍ',
      few: '{n} لديهم قانون سارٍ',
      many: '{n} لديهم قانون سارٍ',
      other: '{n} لديهم قانون سارٍ',
    },

    searchPlaceholder: 'ابحث عن مخدوم…',
    cardTitle: 'المخدومون ({n})',

    emptyTitle: 'لا يوجد مخدومون بعد',
    emptyBody: 'سيظهر هنا المخدومون الذين يختارونك خادمًا لهم.',
    noMatchesTitle: 'لا توجد نتائج مطابقة',
    noMatchesBody: 'جرّب كلمة بحث أخرى.',

    unknownName: 'غير معروف',
    canonCount: {
      zero: 'لا يوجد قانون',
      one: 'قانون واحد',
      two: 'قانونان',
      few: '\u200F{n} قوانين',
      many: '\u200F{n} قانونًا',
      other: '\u200F{n} قانون',
    },
    // Worded as a noun so it reads the same for a boy or a girl.
    lastActive: 'آخر نشاط {when}',

    scopeNote:
      '✦ بصفتك خادمًا في مدارس الأحد، يمكنك أن تحدِّد لمخدوميك قوانين في قراءة الكتاب المقدس والصلاة. أما سجلات الاعتراف والإرشاد فيتولاها أب الاعتراف.',
  },

  // ─── One student ───────────────────────────────────────────────────────────
  student: {
    back: 'مخدومو فصلي',
    nameFallback: 'المخدوم',
    role: 'مخدوم في مدارس الأحد',

    photo: {
      yours: 'الصورة التي أضفتها لهذا المخدوم (لا يراها أحد غيرك)',
      none: 'لا توجد صورة شخصية. أضف صورة (لا يراها أحد غيرك)',
      camera: '◉ الكاميرا',
      change: '▤ تغيير',
      upload: '▤ رفع صورة',
      remove: '✕ إزالة',
      uploadFailed: 'تعذّر رفع الصورة: {error}',
      saveFailed: 'تعذّر الحفظ: {error}',
      removeFailed: 'تعذّرت الإزالة: {error}',
      removeTitle: 'إزالة الصورة',
      removeBody: 'هل تريد إزالة الصورة التي أضفتها لهذا المخدوم؟',
    },

    tabs: {
      canons: 'القوانين',
      psalms: 'المزامير',
      notes: 'ملاحظاتي',
      prayer: 'الصلاة',
    },

    canons: {
      assign: '+ تحديد قانون',
      cardTitle: 'القوانين المحدَّدة ({n})',
      emptyTitle: 'لم يُحدَّد أي قانون بعد',
      emptyBody: 'حدِّد قراءة في الكتاب المقدس أو تدريبًا في الصلاة للبدء.',
      // The frequency may be one the servant typed in Latin letters: the
      // leading mark keeps the line right-to-left.
      meta: '\u200F{frequency} · منذ {date}',
      thisWeek: 'هذا الأسبوع: {done}/{total}',
    },

    psalms: {
      cardTitle: 'حفظ المزامير',
      emptyTitle: 'لا يوجد تقدّم مشارَك',
      // Passive, so it reads the same for a boy or a girl.
      emptyBody: 'لم يُشارَك تقدّم {name} في حفظ المزامير بعد.',
      // A caption under the number, so the number itself is not repeated.
      dayStreak: {
        zero: 'أيام متتالية',
        one: 'يوم',
        two: 'يومان متتاليان',
        few: 'أيام متتالية',
        many: 'يومًا متتاليًا',
        other: 'يوم متتالٍ',
      },
      bestStreak: 'أطول مدة متتالية',
      memorized: 'تم حفظها',
    },

    notes: {
      cardTitle: 'ملاحظاتي',
      privacy: '✦ خاصة بك، لا يراها المخدوم ولا أب اعترافه.',
      empty: 'لا توجد ملاحظات بعد. أضف أول ملاحظة أدناه.',
      dateEdited: '\u200F{date}  (معدَّلة)',
      saving: 'جارٍ الحفظ…',
      save: 'حفظ',
      cancel: 'إلغاء',
      placeholder: 'أضف ملاحظة عن لقاء أو مكالمة اليوم…',
      add: 'إضافة ملاحظة',
      saveFailed: 'تعذّر الحفظ. حاول مرة أخرى.',
    },

    prayer: {
      cardTitle: 'طلبات الصلاة',
      sharedNote: '✦ طلبات صلاة من {name}، تمّت مشاركتها صراحةً مع خادم مدارس الأحد.',
      emptyTitle: 'لا توجد طلبات مشارَكة',
      emptyBody: 'لم تصلك بعد أي طلبات صلاة من {name}.',
      categories: {
        health: 'الصحة',
        family: 'الأسرة',
        relationships: 'العلاقات',
        work: 'العمل / الدراسة',
        faith: 'مسيرة الإيمان',
        gratitude: 'الشكر',
        other: 'أخرى',
      },
    },

    scopeNote:
      '✦ يمكنك رؤية التقدّم في القانون الروحي وفي حفظ المزامير الذي يختار مخدوموك مشاركته. أما سجل الاعتراف والإرشاد الرعوي فلا يطّلع عليهما إلا أب اعترافهم.',
  },

  // ─── Messages from the data layer ──────────────────────────────────────────
  data: {
    writeFirst: 'اكتب شيئًا أولًا.',
    sendFailed: 'تعذّر الإرسال الآن. حاول مرة أخرى.',
    emptyImage: 'الصورة فارغة',
  },
};
