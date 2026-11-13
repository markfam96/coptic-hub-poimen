import type { Localized } from '../core';
import type { shell as En } from '../en/shell';

export const shell: Localized<typeof En> = {
  drawer: {
    tagline: 'رعاية رعوية متأصلة في التقليد الكنسي',
    home: 'الرئيسية',
    confession: 'الاعتراف',
    appointments: 'المواعيد',
    journal: 'المذكرات',
    prayer: 'الصلاة',
    psalms: 'المزامير',
    canon: 'القانون الروحي',
  },

  header: {
    profile: 'الملف الشخصي',
    home: 'الرئيسية',
  },

  notFound: {
    title: 'الصفحة غير موجودة',
    body: 'هذا الرابط لا يؤدي إلى أي مكان في Nepsis.',
    goHome: 'العودة إلى الرئيسية',
  },

  portals: {
    title: 'البوابات',
    subtitle: 'الواجهات الثلاث لنظام الرعاية الرعوية.',
    yourRole: 'دورك',

    congregantSubtitle: 'واجهتك الشخصية',
    congregantDesc: 'لوحة المتابعة · الاستعداد للاعتراف · القانون الروحي · المذكرات · طلبات الصلاة',
    priestSubtitle: 'بوابة أب الاعتراف',
    priestDesc: 'قائمة أبناء الاعتراف · سجل اللقاءات الرعوية · تحديد القانون الروحي · الملاحظات الرعوية',
    servantSubtitle: 'بوابة خادم مدارس الأحد',
    servantDesc: 'قائمة المخدومين · بيانات المخدوم · تحديد قوانين الصلاة وقراءة الكتاب المقدس',

    adminTitle: 'نظرة عامة للمشرف',
    adminSubtitle: 'جميع المستخدمين بحسب الدور',
    adminDesc: 'عرض جميع الأعضاء والكهنة والخدام المسجلين في النظام.',
  },
};
