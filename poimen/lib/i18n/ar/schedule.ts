import type { Localized } from '../core';
import type { schedule as En } from '../en/schedule';

// The people who book are the priest's own flock: «أبناء الاعتراف».
// «الحجز عبر Calendly» is the button they see (appointments.calendly.title).
//
// A line that would begin with a number, or with a label the priest may have
// typed in English, begins with a right-to-left mark (\u200F) so it keeps its
// order. \u200E after "calendly.com/…" keeps the slash on the address.
export const schedule: Localized<typeof En> = {
  title: 'جدول المواعيد',
  memberFallback: 'عضو',

  // ─── Where members book ────────────────────────────────────────────────────
  mode: {
    title: 'طريقة حجز المواعيد',
    appTitle: 'من داخل هذا التطبيق',
    appSub: 'تحدِّد الأوقات المتاحة أدناه، فيطلب أبناء الاعتراف الأوقات المفتوحة وتؤكِّد أنت كل طلب.',
    calendlyTitle: 'عبر صفحتي على Calendly',
    calendlySub: 'يحجز أبناء الاعتراف من صفحتك على Calendly. لا شيء تحتاج إلى إدارته هنا؛ فصفحة Calendly هي المرجع الوحيد للمواعيد.',
    calendlyHint: 'الطلبات والمواعيد التي تمت من داخل التطبيق تبقى أدناه إلى أن تنتهي. ما يتوقف هو الطلبات الجديدة من داخل التطبيق فقط.',
    migrationMissing: 'قاعدة بيانات التطبيق ينقصها تحديث (scheduling_mode). طبِّق آخر ترحيل لقاعدة البيانات ثم حاول مرة أخرى.',
    saveFailed: 'تعذّر الحفظ: {error}',
  },

  // ─── The open / closed switch ──────────────────────────────────────────────
  master: {
    openTitle: '● حجز المواعيد مفتوح',
    closedTitle: '○ حجز المواعيد مغلق',
    openSub: 'يستطيع أبناء الاعتراف طلب الأوقات المتاحة. اضغط للإغلاق.',
    closedSub: 'لا يستطيع أبناء الاعتراف طلب مواعيد. اضغط للفتح.',
  },

  // ─── Requests waiting for an answer ────────────────────────────────────────
  requests: {
    title: 'الطلبات ({n})',
    empty: 'لا توجد طلبات في انتظار الرد.',
    note: '«{note}»',
    confirm: '✓ تأكيد',
    decline: '✕ اعتذار',
    changed: 'تغيّر هذا الطلب قبل أن تردّ عليه، وقد حُدِّثت القائمة.',
  },

  // ─── Confirmed appointments still ahead ────────────────────────────────────
  upcoming: {
    title: 'المواعيد القادمة ({n})',
    line: '\u200F{type} · {date} · {time}',
    cancel: 'إلغاء',
    cancelConfirmTitle: 'إلغاء الموعد',
    cancelConfirmBody: 'هل تريد إلغاء موعد «{type}» مع {name}؟',
    cancelConfirmAction: 'نعم، إلغاء الموعد',
    cancelFailed: 'تعذّر الإلغاء، وقد حُدِّثت القائمة.',
  },

  // ─── Appointment types ─────────────────────────────────────────────────────
  types: {
    title: 'أنواع المواعيد',
    empty: 'أضف أنواع المواعيد التي تقدّمها ومدة كل نوع.',
    on: 'مفعّل',
    off: 'متوقف',
    duration: {
      one: 'دقيقة واحدة',
      two: 'دقيقتان',
      few: '\u200F{n} دقائق',
      many: '\u200F{n} دقيقة',
      other: '\u200F{n} دقيقة',
    },
    newLabel: 'نوع جديد',
    newPlaceholder: 'مثال: إرشاد روحي',
    lengthLabel: 'المدة',
    durationShort: '\u200F{n} د',
    add: 'إضافة النوع',
    deleteConfirmTitle: 'حذف النوع',
    deleteConfirmBody: 'هل تريد حذف «{label}»؟ المواعيد الموجودة تحتفظ بتسميتها.',
  },

  // ─── Weekly availability ───────────────────────────────────────────────────
  weekly: {
    title: 'الأوقات المتاحة أسبوعيًا',
    empty: 'أضف فترات أسبوعية متكررة. تتكرر كل أسبوع إلى أن تحذفها.',
    windowLine: '\u200F{range} · {type}',
    newLabel: 'فترة جديدة',
    needType: 'أضف أولًا نوع موعد مفعّلًا في الأعلى.',
    start: 'البداية',
    end: 'النهاية',
    add: 'إضافة الفترة',
    errPickType: 'اختر نوع الموعد أولًا.',
    errEndBeforeStart: 'يجب أن يكون وقت النهاية بعد وقت البداية.',
    deleteConfirmTitle: 'حذف الفترة',
    deleteConfirmBody: 'هل تريد حذف فترة يوم {day}، {range}؟',
  },

  // ─── Single dates: closures and extra hours ────────────────────────────────
  days: {
    title: 'أيام الغياب والساعات الإضافية',
    intro: 'غيِّر تاريخًا واحدًا دون المساس بنظامك الأسبوعي. أغلق يومًا كاملًا أو جزءًا منه عند سفرك أو انشغالك، أو افتح ساعات إضافية في تاريخ لا يشمله نظامك الأسبوعي.',
    legend: {
      open: 'متاح',
      extra: 'ساعات إضافية',
      partial: 'مغلق جزئيًا',
      closed: 'مغلق',
    },
    noRecurring: 'لا توجد فترات متكررة في هذا اليوم من الأسبوع، فلا شيء يُغلق، لكن يمكنك فتح ساعات إضافية أدناه.',
    closedAllDay: 'مغلق طوال اليوم',
    closedRange: 'مغلق {range}',
    reopen: 'إعادة فتح هذا اليوم',
    closeWholeDay: 'إغلاق اليوم كله',
    orClosePart: 'أو إغلاق جزء منه',
    from: 'من',
    to: 'إلى',
    closeThisTime: 'إغلاق هذه الفترة',
    extraRange: '+ ساعات إضافية {range}',
    closedHint: 'هذا اليوم مغلق. أعِد فتحه لتضيف ساعات إضافية.',
    needTypeForExtra: 'أضف نوع موعد مفعّلًا في الأعلى لتفتح ساعات إضافية.',
    openExtraLabel: 'فتح ساعات إضافية',
    openThisTime: 'فتح هذه الفترة',
    errSave: 'تعذّر الحفظ. تحقق من اتصالك بالإنترنت ثم حاول مرة أخرى.',
    errAlreadyClosed: 'هذا اليوم مغلق كله بالفعل.',
    errNeedType: 'أضف أولًا نوع موعد مفعّلًا.',
    errClosedReopen: 'هذا اليوم مغلق. أعِد فتحه أولًا.',
  },

  // ─── The priest's Calendly link ────────────────────────────────────────────
  calendly: {
    title: 'رابط صفحتي على Calendly',
    intro: 'هكذا يحجز أبناء رعيتك مواعيدهم معك: يظهر لهم في تبويب «المواعيد» زر «الحجز عبر Calendly» الذي يفتح هذا الرابط.',
    noLink: 'لا يوجد رابط بعد. إلى أن تحفظ رابطًا، لا وسيلة لدى أبناء الاعتراف لحجز موعد معك.',
    placeholder: 'calendly.com/your-name',
    errInvalid: 'هذا لا يبدو رابط Calendly. يجب أن يبدأ بـ calendly.com/…\u200E',
    saved: 'تم الحفظ. يظهر الآن لأبناء رعيتك خيار «الحجز عبر Calendly».',
    removeConfirmTitle: 'إزالة رابط Calendly',
    removeConfirmBody: 'لن يظهر خيار «الحجز عبر Calendly» لأبناء الاعتراف بعد الآن. أما حسابك على Calendly نفسه فلا يتأثر.',
    removed: 'تمت إزالة رابط Calendly.',
    update: 'تحديث الرابط',
    save: 'حفظ الرابط',
    open: 'فتح صفحتي على Calendly ↖',
  },

  // ─── Writing confirmed bookings to the phone's calendar ────────────────────
  sync: {
    title: 'إضافة الحجوزات إلى تقويمك',
    intro: 'عندما تؤكِّد موعدًا هنا، يضيفه Nepsis إلى تقويم تختاره على هذا الهاتف، فيظهر مع بقية ارتباطات أسبوعك ومعه التذكيرات. وكل ما يقرأ ذلك التقويم (صفحة Calendly تحتفظ بها لأعمال أخرى، أو تقويم مشترك للكنيسة) يرى الوقت محجوزًا. وإلغاء الموعد هنا يحذف الحدث من التقويم.',
    webOnly: 'متاح في تطبيق الهاتف، فتقاويم هذا الجهاز لا يمكن الوصول إليها من المتصفح.',
    demo: 'وضع العرض التجريبي. سجِّل الدخول لتربط تقويمك الفعلي.',
    writingTo: '⇄ تُكتب الحجوزات في «{title}»',
    calendarFallback: 'التقويم',
    turnOff: 'إيقاف',
    warning: '⚠ {message}',
    permissionLost: 'أُوقف إذن الوصول إلى التقويم من الإعدادات، فالحجوزات لا تُكتب الآن، وقد يقع حجز مزدوج عبر Calendly. اسمح لتطبيق Nepsis بالوصول إلى التقويم لإصلاح ذلك.',
    writeFailed: {
      one: 'تعذّرت كتابة حجز واحد في التقويم. تأكد أن التقويم ما زال موجودًا ثم حاول مرة أخرى.',
      two: 'تعذّرت كتابة حجزين في التقويم. تأكد أن التقويم ما زال موجودًا ثم حاول مرة أخرى.',
      few: 'تعذّرت كتابة {n} حجوزات في التقويم. تأكد أن التقويم ما زال موجودًا ثم حاول مرة أخرى.',
      many: 'تعذّرت كتابة {n} حجزًا في التقويم. تأكد أن التقويم ما زال موجودًا ثم حاول مرة أخرى.',
      other: 'تعذّرت كتابة {n} حجز في التقويم. تأكد أن التقويم ما زال موجودًا ثم حاول مرة أخرى.',
    },
    denied: 'رُفض إذن الوصول إلى التقويم. اسمح به من الإعدادات ← Nepsis لتستخدم هذه الميزة.',
    readError: 'تعذّرت قراءة تقاويم هذا الجهاز. حاول مرة أخرى.',
    noCalendars: 'لا توجد على هذا الجهاز تقاويم يمكن الكتابة فيها.',
    turnedOnAdded: {
      one: 'تم التفعيل. أُضيف موعد قادم واحد إلى «{title}».',
      two: 'تم التفعيل. أُضيف موعدان قادمان إلى «{title}».',
      few: 'تم التفعيل. أُضيفت {n} مواعيد قادمة إلى «{title}».',
      many: 'تم التفعيل. أُضيف {n} موعدًا قادمًا إلى «{title}».',
      other: 'تم التفعيل. أُضيف {n} موعد قادم إلى «{title}».',
    },
    turnedOn: 'تم التفعيل. تُكتب الحجوزات المؤكَّدة في «{title}».',
    turnedOff: 'تم الإيقاف. الأحداث الموجودة في التقويم تُركت كما هي.',
    close: 'إغلاق',
    change: 'تغيير التقويم',
    choose: 'اختيار تقويم',
  },

  // ─── Demo mode ─────────────────────────────────────────────────────────────
  demo: {
    typeMeeting: 'اجتماع',
    requestNote: 'أودّ أن أعترف قبل العيد.',
    closureNote: 'سفر',
    names: {
      pb: 'بطرس رزق',
      sg: 'سارة جرجس',
      mh: 'ميخائيل حنا',
      mm: 'مريم ميخائيل',
    },
  },
};
