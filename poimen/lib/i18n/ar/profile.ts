import type { Localized } from '../core';
import type { profile as En } from '../en/profile';

export const profile: Localized<typeof En> = {
  back: 'الرئيسية',

  photo: {
    camera: '◉ الكاميرا',
    change: '▤ تغيير الصورة',
    add: '▤ إضافة صورة',
    remove: '✕ إزالة',
    uploadFailed: 'تعذّر رفع الصورة: {error}',
    saveFailed: 'تعذّر الحفظ: {error}',
    removeTitle: 'إزالة الصورة',
    removeBody: 'هل تريد إزالة صورة ملفك الشخصي؟',
  },

  savedBadge: '✓ تم الحفظ',
  saveFailed: 'تعذّر الحفظ. حاول مرة أخرى.',
  saveChildrenFailed: 'تعذّر حفظ بيانات الأبناء. حاول مرة أخرى.',
  sharedWithFocOnly: 'تُشارَك مع أب اعترافك فقط.',

  account: {
    title: 'بيانات الحساب',
    fullName: 'الاسم الكامل',
    fullNamePlaceholder: 'اسمك',
    email: 'البريد الإلكتروني',
    emailHint: 'لا يمكن تغيير البريد الإلكتروني من هنا. تواصل مع الدعم.',
    church: 'الكنيسة',
    churchPlaceholder: 'اختر كنيستك…',
    save: 'حفظ التغييرات',
  },

  contact: {
    title: 'بيانات الاتصال للافتقاد',
    phone: 'الهاتف',
    // Begins with a left-to-right mark so the sample number keeps its order.
    phonePlaceholder: '\u200E(555) 000-0000',
    email: 'البريد الإلكتروني للتواصل',
    emailPlaceholder: 'preferred@email.com',
    address: 'العنوان',
    street: 'عنوان الشارع',
    line2: 'الشقة، الجناح، إلخ (اختياري)',
    city: 'المدينة',
    // Short on purpose: these two boxes are a quarter of the row each.
    state: 'ولاية',
    zip: 'الرمز',
    country: 'الدولة (US)',
    save: 'حفظ بيانات الاتصال',
  },

  family: {
    title: 'الحالة الاجتماعية والأسرة',
    lifeStage: 'الحالة الاجتماعية',
    // The person is describing themselves, so both genders are given.
    stages: {
      single: 'أعزب / عزباء',
      engaged: 'خاطب / مخطوبة',
      married: 'متزوج / متزوجة',
      widowed: 'أرمل / أرملة',
      divorced: 'مطلّق / مطلّقة',
    },
    spouseName: 'اسم شريك الحياة',
    spousePlaceholder: 'الاسم الكامل',
    children: 'الأبناء',
    noChildren: 'لم يُضف أي أبناء بعد.',
    childMeta: {
      zero: 'مواليد {year} · أقل من سنة',
      one: 'مواليد {year} · نحو سنة واحدة',
      two: 'مواليد {year} · نحو سنتين',
      few: 'مواليد {year} · نحو {n} سنوات',
      many: 'مواليد {year} · نحو {n} سنة',
      other: 'مواليد {year} · نحو {n} سنة',
    },
    childName: 'الاسم',
    childYear: 'السنة',
    addChild: 'إضافة',
    save: 'حفظ بيانات الأسرة',
  },

  appearance: {
    title: 'المظهر',
    dark: 'الوضع الداكن',
    light: 'الوضع الفاتح',
    note: 'الوضع الداكن بلونَي Nepsis: الكحلي والذهبي؛ والوضع الفاتح بألوان بيزنطية مشرقة: لون الرَّق الدافئ، والحبر البنّي الداكن، والقرمزي الطقسي. يُعاد تحميل التطبيق عند التبديل.',
    savedTitle: 'تم حفظ المظهر',
    savedBody: 'أغلق التطبيق وافتحه من جديد لتطبيق المظهر الجديد.',
  },

  language: {
    title: 'اللغة',
    note: 'يُعاد تحميل التطبيق عند التبديل.',
  },

  privacy: {
    readPolicy: 'اقرأ سياسة الخصوصية كاملة ←',
  },

  reminders: {
    title: 'التذكيرات',
    body: 'تذكير بقانونك الروحي ومزاميرك في الوقت الذي تختاره. يكتبه هذا الهاتف نفسه ولا يُرسَل إليه؛ فلا يغادر الجهازَ أي شيء عن قانونك من أجل ذلك.',
    button: 'إعداد التذكيرات',
  },

  feedback: {
    title: 'الملاحظات والاقتراحات',
    body: 'هل وجدت عطلًا، أو لديك فكرة للتطبيق؟ أخبرنا مباشرة. تصل رسالتك إلى القائمين على تطوير Nepsis، لا إلى أب اعترافك ولا إلى كنيستك.',
    button: 'إرسال ملاحظة أو اقتراح',
  },

  invite: {
    title: 'رمز الدعوة الخاص بك',
    sharePriest: 'شارك هذا الرمز مع أبنائك في الاعتراف ليتمكنوا من الارتباط بك من تطبيقهم.',
    shareServant: 'شارك هذا الرمز مع مخدوميك ليتمكنوا من الارتباط بك من تطبيقهم.',
  },

  foc: {
    title: 'أب الاعتراف',
    linked: '✓ مرتبط',
    shareVitals: 'مشاركة مؤشراتي الروحية مع أب اعترافي',
    shareVitalsHint: 'يسمح لأب اعترافك برؤية مؤشراتك الروحية',
    link: 'الارتباط بأب الاعتراف',
  },

  servant: {
    title: 'خادم مدارس الأحد',
    linked: '✓ مرتبط',
    link: 'الارتباط بخادم مدارس الأحد',
  },

  tutorial: 'عرض الجولة التعريفية بالتطبيق',

  faceId: {
    label: 'القفل ببصمة الوجه (Face ID)',
    hint: 'يطلب بصمة الوجه (Face ID) لفتح التطبيق',
  },

  demo: {
    label: 'العرض التجريبي',
    hint: 'يعرض بيانات نموذجية، دون الحاجة إلى Supabase',
  },

  signOut: {
    button: 'تسجيل الخروج',
    confirmTitle: 'تسجيل الخروج',
    confirmBody: 'هل تريد تسجيل الخروج؟',
    confirmButton: 'تسجيل الخروج',
  },

  deleteAccount: 'حذف حسابي',
};
