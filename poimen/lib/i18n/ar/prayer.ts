import type { Localized } from '../core';
import type { prayer as En } from '../en/prayer';

export const prayer: Localized<typeof En> = {
  title: 'طلبات الصلاة',
  subtitle: 'أضف طلبات الصلاة وتابعها وسجّل ما استُجيب منها',

  categories: {
    health: 'الصحة',
    family: 'الأسرة',
    relationships: 'العلاقات',
    work: 'العمل / الدراسة',
    faith: 'مسيرة الإيمان',
    gratitude: 'الشكر',
    other: 'أخرى',
  },

  visibilityChips: {
    private: 'خاص',
    focOnly: 'أب الاعتراف',
    focAndServant: 'أب الاعتراف + الخادم',
    servantOnly: 'الخادم فقط',
  },
  visibility: {
    private: 'خاص — لي وحدي',
    focOnly: 'يراه أب اعترافك فقط',
    focAndServant: 'يراه أب اعترافك وخادم مدارس الأحد',
    servantOnly: 'خادم مدارس الأحد فقط',
  },

  requestFallback: 'طلب',
  markAnswered: '✓ تمت الاستجابة',
  delete: '✕ حذف',

  activeTitle: 'الحالية ({n})',
  answeredTitle: 'المستجابة ({n})',
  emptyTitle: 'لا توجد طلبات حالية',
  emptyBody: 'أضف أول طلب صلاة لك أدناه.',

  newRequest: 'طلب جديد',
  encryptionNote:
    'تُشفَّر تفاصيل طلب الصلاة على جهازك قبل تخزينها. لا يستطيع فك تشفيرها إلا جهاز المستلم المقصود — حتى Nepsis لا يستطيع قراءتها.',
  categoryLabel: 'الفئة',
  visibilityLabel: 'مَن يرى الطلب',
  detailsLabel: 'التفاصيل (اختياري)',
  detailsPlaceholder:
    'اكتب تفاصيل طلبك — يُشفَّر هذا النص ولا يستطيع قراءته إلا المستلم أو المستلمون الذين اخترتهم أعلاه.',
  submit: 'إرسال الطلب',
  submitError: 'تعذّر الإرسال. حاول مرة أخرى.',

  deleteRequestTitle: 'حذف الطلب',
  deleteRequestBody: 'هل تريد إزالة طلب الصلاة هذا؟',
  deleteAnsweredTitle: 'حذف',
  deleteAnsweredBody: 'هل تريد إزالة هذه الصلاة المستجابة؟',

  demo: {
    motherTopic: 'صحة والدتي',
    motherBody:
      'شُخّصت إصابة والدتي بمرض في القلب. أطلب صلوات أبونا بيشوي وإرشاده في كيفية مساندتها روحيًا.',
    fastTopic: 'قوة في الصوم',
    fastBody: 'أجد صعوبة في المواظبة خلال صوم الرسل. أطلب الصلاة من أجل الثبات.',
    jobTopic: 'الانتقال إلى عمل جديد',
    jobBody: 'أبدأ عملًا جديدًا الشهر القادم. أصلّي من أجل الحكمة والاتضاع وأن يرشد الله طريقي.',
    daughterTopic: 'ولادة ابنتنا بسلام',
    daughterNote: 'أنعم الله علينا بابنة في صحة جيدة. نشكره على استجابة الصلاة.',
  },
};
