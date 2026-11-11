import type { Localized } from '../core';
import type { examination as En } from '../en/examination';

export const examination: Localized<typeof En> = {
  categories: {
    tongue: 'اللسان',
    thoughts: 'الأفكار',
    hearing: 'السمع',
    eyes: 'العينان',
    actions: 'الأفعال',
    neglectedPractices: 'الممارسات المُهمَلة',
    other: 'أخرى',
    towardGod: 'نحو الله',
    towardOthers: 'نحو الآخرين',
    towardSelf: 'نحو النفس',
    omissions: 'التقصير',
  },

  styles: {
    senses: 'بحسب الحواس',
    relational: 'نحو الله والآخرين',
  },

  freqLabel: { once: 'مرة واحدة', few: 'مرات قليلة', often: 'كثيرًا' },
  freqOption: { once: 'مرة واحدة', few: 'مرات قليلة', often: 'كثيرًا' },

  screen: {
    title: 'محاسبة النفس',
    noted: 'المحدَّد: {n}',
    itemsToConsider: {
      one: 'بند واحد للتأمل فيه',
      two: 'بندان للتأمل فيهما',
      few: '{n} بنود للتأمل فيها',
      many: '{n} بندًا للتأمل فيها',
      other: '{n} بند للتأمل فيها',
    },
    prev: '→ السابق',
    next: 'التالي ←',
    done: '✓ تم',
    progress: 'القسم {current} من {total}',
  },

  // ─── By the senses ─────────────────────────────────────────────────────────
  // `scripture` is a reference, not the verse. Book names are the ones the
  // Van Dyck Bible uses; chapter and verse numbers are unchanged from English.
  // Written «أمثال 12: 22» (a space after the colon), as in the other files.
  sins: {
    tongueLying: {
      name: 'الكذب',
      description: 'قول ما ليس حقًّا، ولو كان «كذبًا أبيض» لحماية نفسك أو غيرك.',
      scripture: 'أمثال 12: 22',
    },
    tongueGossip: {
      name: 'النميمة',
      description: 'نقل كلام عن الآخرين يسيء إلى سمعتهم، سواء كان صحيحًا أم غير صحيح.',
      scripture: 'أمثال 11: 13',
    },
    tongueJudging: {
      name: 'إدانة الآخرين',
      description: 'إدانة شخص آخر بالكلام، وافتراض الأسوأ فيه.',
      scripture: 'متى 7: 1',
    },
    tongueSwearing: {
      name: 'الحلف / الشتيمة',
      description: 'النطق باسم الرب باطلًا، أو الحلف بلا مبالاة، أو الكلام البذيء.',
      scripture: 'متى 5: 34',
    },
    tongueSlander: {
      name: 'الافتراء',
      description: 'تعمُّد قول أمور كاذبة للإساءة إلى سمعة أحد.',
      scripture: 'مزمور 101: 5',
    },
    tongueFlattery: {
      name: 'التملُّق',
      description: 'مديح غير صادق لكسب رضا الآخرين أو التلاعب بهم.',
      scripture: 'أمثال 26: 28',
    },
    tongueIdle: {
      name: 'الكلام البطّال',
      description: 'قضاء وقت طويل في أحاديث لا تأتي بثمر روحي.',
      scripture: 'متى 12: 36',
    },
    tongueContention: {
      name: 'الخصام والمشاحنة',
      description: 'الجدال والسعي إلى الغلبة بدلًا من المصالحة أو التفاهم.',
      scripture: 'أمثال 17: 14',
    },
    tongueBoasting: {
      name: 'الافتخار',
      description: 'المبالغة في ذكر إنجازاتك أو الحديث عن نفسك بتفاخر.',
      scripture: 'أمثال 27: 1',
    },

    thoughtsPride: {
      name: 'الكبرياء',
      description: 'رفع نفسك فوق الآخرين، والاعتقاد بأن مواهبك من ذاتك وحدها.',
      scripture: 'فيلبي 2: 3',
    },
    thoughtsEnvy: {
      name: 'الحسد',
      description: 'الاستياء من بركات الآخرين أو مواهبهم أو نجاحاتهم.',
      scripture: 'غلاطية 5: 26',
    },
    thoughtsLust: {
      name: 'أفكار الشهوة',
      description: 'الاسترسال في تخيلات جنسية غير طاهرة عن أي شخص خارج الزواج.',
      scripture: 'متى 5: 28',
    },
    thoughtsAnger: {
      name: 'إضمار الغضب',
      description: 'الاحتفاظ بالغضب أو الضغينة تجاه شخص آخر إلى ما بعد انقضاء اليوم.',
      scripture: 'أفسس 4: 26',
    },
    thoughtsGreed: {
      name: 'الطمع / اشتهاء ما للغير',
      description: 'اشتهاء ما يملكه الآخرون، والتعلُّق بالمال والممتلكات.',
      scripture: 'لوقا 12: 15',
    },
    thoughtsDespair: {
      name: 'اليأس وفقدان الرجاء',
      description: 'فقدان الثقة في رحمة الله، والبقاء في الظلمة بدلًا من الالتجاء إلى الصلاة.',
      scripture: 'مراثي إرميا 3: 22-23',
    },
    thoughtsVainglory: {
      name: 'المجد الباطل',
      description: 'طلب مديح الناس أو السمعة أو استحسانهم أكثر من طلب رضا الله.',
      scripture: 'يوحنا 5: 44',
    },
    thoughtsUnbelief: {
      name: 'الشك وعدم الإيمان',
      description: 'الاستسلام لأفكار تُضعف الإيمان: «هل يسمعني الله؟»، «هل يهتم بي؟»',
      scripture: 'عبرانيين 11: 6',
    },
    thoughtsJudgment: {
      name: 'الإدانة في القلب',
      description: 'إصدار أحكام في داخلك على سلوك الآخرين أو قداستهم أو قيمتهم.',
      scripture: 'رومية 2: 1',
    },

    hearingGossip: {
      name: 'الاستماع إلى النميمة',
      description: 'الإصغاء برضا إلى الافتراء أو الكلام السيئ عن الآخرين دون إيقافه.',
      scripture: 'أمثال 17: 4',
    },
    hearingBadMusic: {
      name: 'ملء الأذنين بما يضر',
      description: 'موسيقى أو برامج صوتية أو أحاديث تثير الشهوة أو الغضب أو محبة العالم.',
      scripture: 'فيلبي 4: 8',
    },
    hearingBlasphemy: {
      name: 'السكوت على التجديف',
      description: 'عدم الدفاع عن اسم الله أو عن الإيمان عندما يُستهزأ به في حضورك.',
      scripture: 'لاويين 24: 15',
    },
    hearingNeglectWord: {
      name: 'إهمال سماع كلمة الله',
      description: 'تجنُّب الكتاب المقدس أو العظات أو التعليم الروحي بلا سبب.',
      scripture: 'يعقوب 1: 22',
    },

    eyesPornography: {
      name: 'مشاهدة المواد الإباحية',
      description: 'النظر عمدًا إلى مواد جنسية صريحة.',
      scripture: 'أيوب 31: 1',
    },
    eyesImmodest: {
      name: 'النظر إلى صور غير محتشمة',
      description: 'إطالة النظر عمدًا إلى صور أو إعلانات أو أشخاص لإثارة الشهوة.',
      scripture: 'متى 5: 28',
    },
    eyesViolent: {
      name: 'متابعة محتوى عنيف أو مُهين',
      description: 'ترفيه يمجّد العنف أو القسوة أو امتهان كرامة الإنسان.',
      scripture: 'مزمور 101: 3',
    },
    eyesEnvyGaze: {
      name: 'النظرة الحاسدة',
      description: 'النظر إلى ممتلكات الآخرين أو مظهرهم أو حياتهم باشتهاء.',
      scripture: 'أمثال 23: 17',
    },
    eyesSocialMedia: {
      name: 'الإفراط في تصفُّح وسائل التواصل الاجتماعي',
      description: 'قضاء ساعات في متابعة محتوى يغذّي الغرور أو المقارنة بالآخرين، دون تفكير.',
      scripture: 'كولوسي 3: 2',
    },

    actionsTheft: {
      name: 'السرقة / عدم الأمانة',
      description: 'أخذ ما ليس لك، وعدم الأمانة في المعاملات المالية.',
      scripture: 'أفسس 4: 28',
    },
    actionsViolence: {
      name: 'الإيذاء الجسدي أو العنف',
      description: 'ضرب شخص آخر أو إيذاؤه جسديًا أو ترهيبه.',
      scripture: 'متى 26: 52',
    },
    actionsFornication: {
      name: 'الزنا',
      description: 'أي فعل جنسي خارج الزواج المقدس.',
      scripture: 'كورنثوس الأولى 6: 18',
    },
    actionsDrunkenness: {
      name: 'السُّكر / تعاطي المخدرات',
      description: 'تغييب وعيك بالخمر أو المخدرات أو غيرها من المواد.',
      scripture: 'أفسس 5: 18',
    },
    actionsGluttony: {
      name: 'الشراهة / كسر الصوم',
      description: 'الإفراط في الأكل، وكسر الأصوام المقررة بلا ضرورة.',
      scripture: 'أمثال 23: 20',
    },
    actionsDisobedience: {
      name: 'عدم طاعة الوالدين أو الآباء الكهنة',
      description: 'عصيان الوالدين أو أب اعترافك أو السلطة الروحية الشرعية.',
      scripture: 'خروج 20: 12',
    },
    actionsHarmSoul: {
      name: 'إعثار الآخرين',
      description: 'أن تكون بتصرفك سببًا في سقوط أخ أو أخت أضعف منك في الخطية.',
      scripture: 'متى 18: 6',
    },
    actionsWitchcraft: {
      name: 'الاشتراك في ممارسات السحر والعرافة',
      description: 'الأبراج أو قراءة الطالع أو السحر أو أي تعامل مع مواد تتصل بالسحر والشعوذة.',
      scripture: 'تثنية 18: 10',
    },

    neglectPrayer: {
      name: 'إهمال الصلاة اليومية',
      description: 'ترك صلوات الأجبية أو قانون صلاتك الخاص بلا حاجة مُلحّة.',
      scripture: 'تسالونيكي الأولى 5: 17',
    },
    neglectFasting: {
      name: 'كسر الصوم بلا ضرورة',
      description: 'أكل اللحوم أو الألبان في أيام الصوم المقررة عن رغبة لا عن حاجة.',
      scripture: 'متى 6: 16',
    },
    neglectCommunion: {
      name: 'الابتعاد عن التناول المقدس',
      description: 'الابتعاد عن سر الإفخارستيا فترات طويلة بلا سبب.',
      scripture: 'يوحنا 6: 53-54',
    },
    neglectTithe: {
      name: 'إهمال عمل الرحمة والصدقة',
      description: 'اكتناز المال والفقراء في احتياج، وعدم العطاء بسخاء.',
      scripture: 'متى 25: 42',
    },
    neglectForgiveness: {
      name: 'الامتناع عن الغفران',
      description: 'رفض المصالحة مع من أساء إليك.',
      scripture: 'متى 6: 15',
    },
    neglectLiturgy: {
      name: 'التغيُّب عن القداس الإلهي',
      description: 'تعمُّد التغيُّب عن قداس الأحد دون مرض أو ظرف طارئ حقيقي.',
      scripture: 'عبرانيين 10: 25',
    },
    neglectScripture: {
      name: 'إهمال قراءة الكتاب المقدس',
      description: 'مرور أيام كثيرة دون فتح الكتاب المقدس للقراءة الشخصية.',
      scripture: 'مزمور 119: 105',
    },
    neglectConfessionDelay: {
      name: 'تأجيل الاعتراف',
      description: 'تأجيل الاعتراف شهورًا مع علمك بوجود خطية جسيمة.',
      scripture: 'يوحنا الأولى 1: 9',
    },
  },

  // ─── Toward God & others ───────────────────────────────────────────────────
  relational: {
    godPrayers: {
      text: 'أهملتُ صلواتي اليومية (الأجبية) أو صلّيتها على عجل.',
      note: 'تأمّل في نوعية صلاتك، لا في مجرد أدائها.',
    },
    godLiturgy: { text: 'تشتّت ذهني أو غاب عني الخشوع أثناء حضوري القداس الإلهي.' },
    godFasts: {
      text: 'كسرتُ أصوام الكنيسة.',
      note: 'ويشمل ذلك روح الصوم: الصلاة والصدقة والابتعاد عن وسائل الترفيه.',
    },
    godScripture: { text: 'لم أقرأ الكتاب المقدس ولم أتأمل فيه بانتظام.' },
    godDoubt: { text: 'أضمرتُ شكًّا أو يأسًا أو عدم ثقة في عناية الله.' },
    godContent: { text: 'عرّضتُ نفسي لمحتوى يُضعف إيماني أو يُظلم ذهني.' },
    godThankful: { text: 'لم أشكر الله على عطاياه وبركاته.' },

    othersAnger: { text: 'أضمرتُ غضبًا أو مرارة أو عدم غفران تجاه أحد.' },
    othersSpeech: { text: 'تكلمتُ بالسوء عن الآخرين، أو نممتُ، أو أدنتُ أحدًا.' },
    othersHonesty: { text: 'لم أتعامل مع الآخرين بأمانة.' },
    othersGenerosity: { text: 'لم أبذل بسخاء من وقتي ومالي ومواهبي.' },
    othersNeedy: { text: 'أهملتُ المحتاجين من حولي.' },

    selfPurity: { text: 'استسلمتُ لأفكار أو أقوال أو أفعال غير طاهرة.' },
    selfHabit: { text: 'استعبدتني عادة أو إدمان.' },
    selfBody: { text: 'لم أعتنِ بجسدي العناية اللائقة به بوصفه هيكلًا للروح القدس.' },
    selfPride: { text: 'تكبّرتُ أو تفاخرتُ أو رفضتُ قبول التوبيخ.' },
    selfComparison: { text: 'قارنتُ نفسي بالآخرين بحسد أو احتقار.' },

    omitPrayForOthers: { text: 'أهملتُ الصلاة من أجل الآخرين: أسرتي أو أعدائي أو الراقدين.' },
    omitAlms: { text: 'قصّرتُ في تقديم الصدقة أو في مساعدة المحتاجين مع أن ذلك كان في استطاعتي.' },
    omitVisiting: { text: 'قصّرتُ في زيارة المرضى أو الوحيدين أو مَن هم في ضيقة.' },
    omitFamily: { text: 'قصّرتُ في إكرام شريك حياتي أو أولادي أو والديَّ كما يدعوني الله.' },
    omitGoodWorks: { text: 'تركتُ أعمالًا صالحة دون إتمام بسبب الكسل أو الخوف أو اللامبالاة.' },
    omitThanks: { text: 'أهملتُ شكر الله على مراحمه.' },
  },
};
