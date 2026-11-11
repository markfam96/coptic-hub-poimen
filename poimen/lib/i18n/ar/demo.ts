import type { Localized } from '../core';
import type { demo as En } from '../en/demo';

export const demo: Localized<typeof En> = {
  // ─── The servant's demo class ──────────────────────────────────────────────
  servant: {
    johnMark: {
      name: 'يوحنا مرقس',
      // Two initials with a zero-width non-joiner between them, as in
      // priest.ts: joined, «يم» would read as a word.
      initials: 'ي\u200Cم',
      canonMorningAgpeya: 'صلاة الأجبية صباحًا',
      canonGospel: 'قراءة الإنجيل (أصحاح واحد)',
      note:
        'مواظب على حضور مدارس الأحد. يغيب أحيانًا عن القداس بسبب تمرين كرة القدم. تحدّث عن شعوره بالبعد عن الإيمان، فاقترحتُ أن يبدأ بصلاة باكر من الأجبية لتكون له نقطة ثبات بسيطة. أتابع معه الأحد القادم لأعرف كيف تسير الأمور.',
      prayer: [
        'النجاح في امتحانات الرياضيات هذا الأسبوع',
        'جدته المريضة منذ فترة',
      ],
    },
    esther: {
      name: 'إستير ميخائيل',
      initials: 'إ\u200Cم',
      canonCompline: 'صلاة النوم',
      note:
        'متأملة ومتفاعلة، تطرح أسئلة عميقة عن الصوم والصلاة. والداها يشجعان نموها الروحي كثيرًا. ذكرت أنها قلقة من الانتقال إلى اجتماع الشباب في العام القادم. يُستحسن التواصل مع والديها.',
      prayer: [
        'السلام لوالديها اللذين يمرّان بفترة صعبة',
        'أن تفهم الإيمان بعمق أكبر',
      ],
    },
  },

  // ─── The demo database ─────────────────────────────────────────────────────
  db: {
    people: {
      frBishoy: 'أبونا بيشوي مرقس',
      frKyrillos: 'أبونا كيرلس عبد المسيح',
      mary: 'مريم نجيب',
      david: 'داود أسعد',
      michael: 'ميخائيل حنا',
      sara: 'سارة جرجس',
      peter: 'بطرس رزق',
      nadia: 'نادية حنين',
      mina: 'مينا عزيز',
    },
    churches: {
      stMary: 'كنيسة السيدة العذراء القبطية الأرثوذكسية',
      stMark: 'كنيسة القديس مرقس الرسول القبطية الأرثوذكسية',
    },
    occupations: {
      softwareEngineer: 'مهندس برمجيات',
      nurse: 'ممرضة',
      student: 'طالب',
      teacher: 'معلمة',
      accountant: 'محاسب',
    },

    encounters: {
      psalmPlan: 'حدّد أبونا بيشوي خطة قراءة في المزامير لمدة 40 يومًا.',
      visitAfterBirth: 'افتقاد بعد ولادة ابنتك، رُفعت فيه الصلوات ومُنحت البركة.',
      holyWeekConfession: 'اعتراف في أسبوع الآلام. إرشاد عن الصلاة العائلية.',
      jobWithCouples: 'مناقشة سفر أيوب مع اجتماع المتزوجين حديثًا.',
      fastingTalk: 'حديث عن الصوم وعن صوم الرسل القادم.',
      careerTalk: 'حديث للإرشاد في اختيار المسار المهني.',
      liturgyReminder: 'تذكير بالمواظبة على حضور قداس الأحد.',
      regularConfession: 'اعتراف منتظم. لوحظ نمو روحي.',
      familyCall: 'اتصال هاتفي للاطمئنان على أحوال الأسرة.',
    },

    canons: {
      agpeyaMorningPrayer: 'صلاة باكر من الأجبية',
      psalm50: 'قراءة المزمور 50',
      almsgiving: 'الصدقة',
      liturgyAttendance: 'حضور القداس الإلهي',
      eveningAgpeya: 'صلاة الأجبية مساءً',
      scriptureMeditation: 'التأمل في الكتاب المقدس',
      morningAgpeya: 'صلاة الأجبية صباحًا',
      fastingNineveh: 'الصوم (صوم يونان)',
      service: 'الخدمة',
    },
    reflectionPrompts: {
      phrase: 'دوّن عبارة واحدة بقيت في ذهنك.',
      verse: 'آية واحدة لمست قلبك اليوم.',
    },

    disciplines: {
      morningAgpeya: 'صلاة الأجبية صباحًا',
      bibleReading: 'قراءة الكتاب المقدس',
      vespers: 'رفع بخور عشية',
      divineLiturgy: 'القداس الإلهي',
      almsgiving: 'الصدقة',
      dayOfPrayer: 'يوم صلاة',
      eveningPrayer: 'صلاة المساء',
      dailyScripture: 'القراءة اليومية في الكتاب المقدس',
      sundayLiturgy: 'قداس الأحد',
      agpeyaThreeHours: 'الأجبية (ثلاث صلوات)',
      fasting: 'الصوم',
    },
    // The ones that begin with a number carry a leading mark so the line
    // stays right-to-left.
    streaks: {
      fiveDays: '\u200F5 أيام متتالية',
      twelveDays: '\u200F12 يومًا متتاليًا',
      twentyDays: '\u200F20 يومًا متتاليًا',
      threeThisMonth: 'هذا الشهر: 3 مرات',
      eightOfTenSundays: '\u200F8 من 10 آحاد',
      tenOfTenSundays: '\u200F10 من 10 آحاد',
      everyWedFri: 'كل أربعاء وجمعة',
    },

    journal: {
      psalm23: {
        title: 'تأمل في المزمور 23',
        // The English opens with the psalm's first words. The Arabic does not
        // quote the psalm: scripture is never written here from memory.
        reflection: 'تأملت في مزمور الراعي، ولاحظت كيف يجمع هذا المزمور بين العناية والسلام.',
        scripture: 'مزمور 23: 1',
        prayerIntention: 'من أجل الصبر مع أولادي.',
      },
      afterLiturgy: {
        title: 'بعد القداس الإلهي',
        reflection: 'تأثرت اليوم بذكصولوجية والدة الإله على غير توقّع.',
        scripture: 'لوقا 1: 46-55',
        prayerIntention: 'من أجل مريم نجيب وأسرتها.',
      },
      morningFast: {
        title: 'تأمل في صوم الصباح',
        reflection: 'وجدته أسهل هذا الأسبوع. طعام أقل ويقظة أكثر.',
        scripture: 'متى 6: 16',
        prayerIntention: 'من أجل القوة في صوم الرسل.',
      },
    },

    pastoralNotes: {
      michael:
        'ميخائيل ينمو بثبات. صار أبًا منذ وقت قريب، فلنصلِّ من أجله وهو يتعلّم مسؤوليات الحياة الأسرية. حُدِّدت له خطة مزامير لمدة 40 يومًا بعد اعتراف مايو. المتابعة في أغسطس.',
      peter:
        'بطرس يجد صعوبة في المواظبة على الحضور. هذا ثاني موعد يتغيّب عنه. يحتاج إلى متابعة لطيفة لكن حازمة. يُستحسن إشراك الخادم.',
    },
  },
};
