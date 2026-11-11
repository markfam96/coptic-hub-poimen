import type { Localized } from '../core';
import type { journal as En } from '../en/journal';

// A journal entry is «تدوينة» (pl. «تدوينات»), as in the confession screen.
export const journal: Localized<typeof En> = {
  title: 'المذكرات الروحية',
  subtitle: 'تأملات، وأسئلة للتأمل، ونمو روحي',

  untitled: 'بدون عنوان',

  labels: {
    titleOptional: 'العنوان (اختياري)',
    reflection: 'التأمل',
    scripture: 'آية لمست قلبي',
    prayerIntention: 'طلبتي في الصلاة',
  },

  unavailable: {
    lockedTitle: 'مذكراتك مقفلة',
    offlineTitle: 'تعذّر تحميل مذكراتك',
    lockedBody:
      'مذكراتك مشفّرة بمفتاحك، وهذا المفتاح غير موجود على هذا الجهاز بعد. استعده برمز الاسترداد (PIN) لتفتح تدويناتك. الحفظ متوقف مؤقتًا حتى لا يحلّ شيء محلّها.',
    offlineBody: 'تحقق من اتصالك بالإنترنت ثم حاول مرة أخرى. الحفظ متوقف مؤقتًا حتى لا يحلّ شيء محلّ تدويناتك.',
    tryAgain: 'حاول مرة أخرى',
    saveError: 'تعذّر حفظ آخر تغيير أجريته. تحقق من اتصالك بالإنترنت — ما زال التغيير ظاهرًا على هذه الشاشة.',
  },

  today: {
    title: 'تدوينة اليوم',
    titlePlaceholder: 'مثال: تأمل في الصوم',
    reflectionPlaceholder: 'ماذا يقول لك الله اليوم؟ على ماذا تشكره؟ وما الذي تجاهد فيه؟',
    // The English example quotes the verse; no scripture is written in Arabic
    // here, so the Arabic shows the form of the answer instead.
    scripturePlaceholder: 'مثال: مزمور 63: 1 — نص الآية…',
    intentionPlaceholder: 'ما الذي ترفعه إلى الله في صلاتك اليوم؟',
    flagForConfession: '📌  أريد أن أذكر هذا لأبونا في اعترافي القادم',
    save: 'حفظ التدوينة',
  },

  past: {
    title: 'التدوينات السابقة ({n})',
    emptyTitle: 'لا توجد تدوينات بعد',
    emptyBody: 'ستظهر هنا التدوينات التي تحفظها.',
    flagBadge: '📌 لاعترافك القادم',
  },

  detail: {
    back: 'المذكرات',
    flagged: '📌  محدَّدة لاعترافك القادم — اضغط لإزالة العلامة',
    flag: '📌  أريد أن أذكر هذا لأبونا في اعترافي القادم',
    deleteTitle: 'حذف التدوينة',
    deleteBody: 'هل تريد حذف هذه التدوينة من مذكراتك؟',
  },

  blessings: {
    title: 'البركات',
    titleCount: 'البركات ({n})',
    intro:
      'اكتب ما صنعه الله معك: صلاة استُجيبت، أو لمسة محبة، أو باب انفتح. وفي الأوقات الصعبة ارجع إليها واقرأها.',
    placeholder: 'مثال: نجحت عملية والدتي — أشكرك يا رب.',
    add: 'إضافة بركة',
    emptyTitle: 'لم يُسجَّل شيء بعد',
    emptyBody: 'كل بركة تضيفها تبقى هنا لتقرأها من جديد.',
    showFewer: 'عرض أقل ▴',
    showAll: 'عرض كل البركات ({n}) ▾',
    removeTitle: 'إزالة البركة',
    removeBody: 'هل تريد إزالتها من بركاتك؟',
  },

  prompt: {
    title: 'تأمل اليوم',
    fromGospel: 'من إنجيل اليوم',
    hideFull: 'إخفاء القراءة الكاملة ▴',
    readFull: 'قراءة الإنجيل كاملًا — {reference} ▾',
    gospelReflection:
      'تمهّل أمام هذه الكلمات من قراءات قداس اليوم. ماذا يقول لك الرب من خلالها؟ اجعل تدوينتك تبدأ من هنا.',
    fallbackRef: 'متى 26: 41',
    fallbackReflection:
      'تأمل في موقف مررت به هذا الأسبوع كانت فيه روحك راغبة وجسدك ضعيفًا. ماذا تعلّمت عن نفسك؟ وماذا تعلّمت عن نعمة الله؟',
  },

  demo: {
    fastTitle: 'تأمل في الصوم',
    fastReflection:
      'شعرت اليوم بامتنان يتعمّق في داخلي أثناء صلاة الأجبية. صلاة الساعة الثالثة كانت مختلفة — كنت أكثر حضورًا فيها.',
    fastIntention: 'أن يرافقني هذا السكون خلال يوم العمل.',
    gratitudeTitle: 'شكر',
    gratitudeReflection: 'أتأمل في أمانة الله معنا في صحة طفلنا. ظل المزمور 116 يتردد في ذهني.',
    confessionTitle: 'بعد الاعتراف',
    confessionReflection: 'أشعر بخفّة. أبدأ خطة قراءة المزامير لمدة 40 يومًا، والبداية بالمزمور 50.',
    blessingSleep: 'نام الطفل الليل كله لأول مرة — ونمنا نحن أيضًا.',
    blessingCall: 'اتصل أبونا ليطمئن عليّ فقط، في اليوم الذي كنت في أشد الحاجة فيه إلى ذلك.',
    blessingJob: 'جاءني عرض العمل بعد شهور من الانتظار. المجد لله.',
  },
};
