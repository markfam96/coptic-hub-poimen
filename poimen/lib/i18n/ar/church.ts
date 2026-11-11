import type { Localized } from '../core';
import type { church as En } from '../en/church';

export const church: Localized<typeof En> = {
  field: {
    placeholder: 'اختر كنيستك…',
    loading: 'جارٍ تحميل الكنائس…',
    failed: 'تعذّر تحميل قائمة الكنائس. اضغط لإعادة المحاولة أو اكتب اسم كنيستك',
    notInDirectory: 'غير موجودة في الدليل بعد',
    // The city is typed by the member and is often in Latin letters, so the
    // Arabic comes first.
    notInDirectoryWithCity: 'غير موجودة في الدليل بعد · {city}',
  },

  picker: {
    title: 'اختيار الكنيسة',
    searchPlaceholder: 'ابحث بالاسم أو الاسم الشائع أو المدينة…',

    sortByNearest: '◎ الترتيب حسب الأقرب',
    locating: 'جارٍ البحث عن الكنائس القريبة منك…',
    sortedByNearest: 'مرتّبة حسب الأقرب · عرض الترتيب الأبجدي',
    switchUnit: 'تغيير وحدة المسافة',
    locationDenied: 'خدمة تحديد الموقع متوقفة لتطبيق Nepsis، لذلك تبقى القائمة بالترتيب الأبجدي. افتح الإعدادات ←',
    locationDeniedWeb: 'تحديد موقعك محظور لهذا الموقع الإلكتروني، لذلك تبقى القائمة بالترتيب الأبجدي. اسمح به من إعدادات الموقع في متصفحك، ثم اضغط «الترتيب حسب الأقرب» مرة أخرى.',
    locationUnavailable: 'تحديد الموقع غير متاح الآن، لذلك تبقى القائمة بالترتيب الأبجدي.',

    noMatch: 'لا توجد كنيسة تطابق «{query}». اضغط «كنيستي غير موجودة في القائمة» لإضافتها بالاسم.',
    empty: 'لم تُضَف أي كنيسة بعد.',
    listFailed: 'تعذّر تحميل قائمة الكنائس. تحقق من اتصالك بالإنترنت ثم حاول مرة أخرى.',

    notListed: 'كنيستي غير موجودة في القائمة',
    unlistedName: 'اسم الكنيسة',
    unlistedCity: 'المدينة (اختياري)',
    unlistedHint: 'سنحفظ الاسم الذي تكتبه.',
    unlistedSuggest: 'اقترح إضافة الكنيسة إلى الدليل ←',
    useThisName: 'استخدام هذا الاسم',

    directoryCredit: 'قائمة الكنائس من الدليل القبطي الأرثوذكسي · directory.nihov.org',
  },

  distance: {
    mi: 'ميل',
    km: 'كم',
    approx: 'نحو ',
    under: 'أقل من 0.1 {unit}',
  },

  precision: {
    near: 'قرب {city}',
    inState: 'في {state}',
  },
};
