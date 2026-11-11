import type { Localized } from '../core';
import type { feedback as En } from '../en/feedback';

export const feedback: Localized<typeof En> = {
  title: 'إرسال الملاحظات والاقتراحات',

  categories: {
    bug: { label: 'شيء لا يعمل', hint: 'ماذا كنت تفعل عندما حدثت المشكلة؟' },
    idea: { label: 'فكرة', hint: 'ما الذي تود أن يفعله التطبيق؟' },
    other: { label: 'شيء آخر', hint: 'أي شيء تريد أن تخبرنا به.' },
  },

  kindLabel: 'ما نوع هذه الملاحظة؟',
  placeholder: 'اكتب قدر ما تشاء، كثيرًا أو قليلًا…',
  charactersLeft: {
    zero: 'لم يتبقَّ أي حرف',
    one: 'تبقّى حرف واحد',
    two: 'تبقّى حرفان',
    few: 'تبقّى {n} أحرف',
    many: 'تبقّى {n} حرفًا',
    other: 'تبقّى {n} حرف',
  },
  sending: 'جارٍ الإرسال…',

  thanksTitle: 'شكرًا لك',
  thanksBody: 'تم إرسال رسالتك. نقرأ كل ما يصلنا، وإن كنا لا نستطيع الرد دائمًا.',
  sendAnother: 'إرسال رسالة أخرى',

  whatGetsSent: {
    title: 'ما يُرسَل',
    bodyBefore: 'تصل رسالتك إلى القائمين على تطوير {app}. وهي',
    bodyStrong: ' لا تظهر لأب اعترافك',
    bodyAfter: ' ولا لخادمك ولا لأي شخص في كنيستك.',
    version: 'إصدار التطبيق · {value}',
    unknown: 'غير معروف',
    platform: 'المنصة · {value}',
    role: 'دورك · {value}',
    notSet: 'غير محدد',
    roles: {
      congregant: 'عضو',
      servant: 'خادم',
      priest: 'كاهن',
      admin: 'مشرف',
    },
    nothingElse: 'لا يُرفق أي شيء آخر: لا موقعك، ولا مذكراتك، ولا ما تكتبه في الاعتراف أو طلبات الصلاة.',
  },

  history: {
    title: 'ما أرسلته ({n})',
    statusSent: 'تم الإرسال',
    statusRead: 'تمت القراءة',
    statusResolved: 'تم الحل',
  },
};
