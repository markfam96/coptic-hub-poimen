import type { Localized } from '../core';
import type { appointments as En } from '../en/appointments';

export const appointments: Localized<typeof En> = {
  title: 'المواعيد',

  status: {
    requested: 'في انتظار التأكيد',
    confirmed: 'مؤكَّد',
    declined: 'تم الاعتذار عنه',
    cancelled: 'ملغى',
  },

  dateTime: '{date} · {time}',

  mine: {
    title: 'مواعيدي',
    cancel: 'إلغاء',
    cancelConfirmTitle: 'إلغاء الموعد',
    cancelConfirmBody: 'هل تريد إلغاء موعد «{type}» يوم {date}؟',
    cancelConfirmAction: 'نعم، إلغاء الموعد',
  },

  request: {
    title: 'طلب موعد',
    duration: {
      one: 'المدة دقيقة واحدة · مع {name}',
      two: 'المدة دقيقتان · مع {name}',
      few: 'المدة {n} دقائق · مع {name}',
      many: 'المدة {n} دقيقة · مع {name}',
      other: 'المدة {n} دقيقة · مع {name}',
    },
    noteLabel: 'ملاحظة (اختيارية)',
    notePlaceholder: 'أي شيء تودّ أن يعرفه أب اعترافك قبل الموعد.',
    send: 'إرسال الطلب',
    hint: 'سيؤكّد {name} طلبك أو يعتذر عنه.',
  },

  empty: {
    noFoc: 'اربط حسابك بأب اعتراف من الشاشة الرئيسية لتتمكن من طلب المواعيد.',
    calendlyNoLink: 'يستقبل {name} الحجوزات خارج التطبيق حاليًا؛ تواصل معه مباشرة لتحديد موعد.',
    notConsented: 'أكِّد المشاركة مع {name} لتتمكن من طلب المواعيد.',
    closed: 'لا يستقبل {name} طلبات المواعيد حاليًا. عاود المحاولة لاحقًا.',
    noSlots: 'لا توجد أوقات متاحة خلال سنة من الآن. عاود المحاولة لاحقًا.',
  },

  calendly: {
    title: 'الحجز عبر Calendly',
    sub: 'ينظّم {name} مواعيده عبر Calendly، ويُفتح في متصفحك.',
  },

  slotMeta: '\u200F{type} · {n} د',

  // «زيار» is the stem shared by «زيارة» and «زيارات».
  focusKeywords: {
    confession: 'اعتراف',
    visit: 'افتقاد|زيار',
  },

  errors: {
    notLinked: 'يجب أن يكون حسابك مرتبطًا بأب اعتراف.',
    typeUnavailable: 'هذا النوع من المواعيد غير متاح.',
    closed: 'حجز المواعيد مغلق حاليًا.',
    pastTime: 'اختر وقتًا لم يحن بعد.',
    taken: 'حُجز هذا الوقت للتو. اختر وقتًا آخر.',
  },

  time: {
    midnight: 'منتصف الليل',
    am: '{time} ص',
    pm: '{time} م',
    range: '{start} – {end}',
  },
  weekdays: ['الأحد', 'الاثنين', 'الثلاثاء', 'الأربعاء', 'الخميس', 'الجمعة', 'السبت'],
  weekdaysShort: ['أحد', 'اثنين', 'ثلاثاء', 'أربعاء', 'خميس', 'جمعة', 'سبت'],
  weekdayInitials: ['ح', 'ن', 'ث', 'ر', 'خ', 'ج', 'س'],

  calendarEvent: {
    title: '{type} — {member}',
    notes: 'تم الحجز عبر Nepsis. هذا الحدث يحجز الوقت على Calendly وفي أي تطبيق آخر يقرأ هذا التقويم.',
  },

  demo: {
    focName: 'أبونا بيشوي',
    typeConfession: 'سر الاعتراف المقدس',
    typeVisit: 'افتقاد منزلي',
  },
};
