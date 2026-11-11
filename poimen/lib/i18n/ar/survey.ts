import type { Localized } from '../core';
import type { survey as En } from '../en/survey';

export const survey: Localized<typeof En> = {
  notNow: 'ليس الآن',
  title: 'خمسة أسئلة',
  anonLead: 'إجاباتك مجهولة الهوية. ',
  anonBody: 'لا تُربط باسمك ولا بحسابك، ولا يستطيع أحد في كنيستك أن يراها، ولا حتى أب اعترافك. تخطَّ أي سؤال لا تريد الإجابة عنه.',

  questionOf: 'السؤال {n} من 5',

  q1: {
    title: 'ما معدّل استخدامك لتطبيق {app}؟',
    daily: 'يوميًا',
    severalTimesAWeek: 'عدة مرات في الأسبوع',
    aboutOnceAWeek: 'مرة في الأسبوع تقريبًا',
    rarely: 'نادرًا',
  },
  q2: {
    title: 'هل ساعدك {app} على الالتزام بقانونك الروحي بانتظام أكبر؟',
    yesNoticeably: 'نعم، بشكل ملحوظ',
    aLittle: 'قليلًا',
    noChange: 'لا تغيير',
    noCanon: 'لا أستخدم القانون الروحي',
  },
  q3: {
    title: 'أي جزء ستفتقده أكثر لو اختفى؟',
    canon: 'قانوني الروحي',
    confession: 'الاستعداد للاعتراف',
    psalms: 'المزامير',
    prayer: 'طلبات الصلاة',
    journal: 'المذكرات',
    appointments: 'المواعيد',
  },
  q4: {
    title: 'ما الشيء الواحد الذي تود إضافته أو تغييره؟',
    placeholder: 'شيء واحد فقط، هو الأهم عندك…',
  },
  q5: {
    title: 'هل هناك شيء تتجنب كتابته في التطبيق لأنك غير متأكد ممن يستطيع رؤيته؟',
    detailPlaceholder: 'ما الذي يمنعك؟',
  },

  sending: 'جارٍ الإرسال…',
  send: 'إرسال الإجابات',
  later: 'اسألني في وقت آخر',

  thanksTitle: 'شكرًا لك',
  thanksBody: 'إجاباتك تساعد على تحديد الخطوة التالية في {app}.',
};
