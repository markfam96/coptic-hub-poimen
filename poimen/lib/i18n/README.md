# Languages

Nepsis ships in English and Arabic. This folder holds every user-visible
string, the rules for adding one, and the glossary the Arabic follows.

## How it works

- `index.ts` decides the language once, when the JS starts: the saved choice,
  else Arabic if the device is in Arabic, else English. Changing it
  (`setLanguage`, used by `components/ui/LanguageSwitch.tsx`) saves and
  reloads the app, exactly like the Appearance setting.
- `S` is the dictionary for the session. `S.home.title` is a plain string.
  It is safe to read at module scope.
- `en/<area>.ts` is the source of truth. `ar/<area>.ts` must have the same
  keys; TypeScript fails the build if one is missing (`Localized<typeof En>`),
  and `dictionaries.test.ts` checks placeholders and plural forms.
- `lib/theme.ts` gives each font role an Arabic face and, inside `lazyThemed`,
  adjusts every StyleSheet for Arabic (no letter-spacing, no italics, larger
  small text, taller lines, and left/right mirrored on web).
- Reference conversion: `app/sign-in.tsx` with `en/auth.ts` and `ar/auth.ts`.

```tsx
import { S, fmt, plural, fmtDate, fmtTime, GLYPH, isRTL, ltrText } from '@/lib/i18n';

const T = S.prayer;                                   // module scope is fine
<Text>{T.title}</Text>
<Text>{fmt(T.greeting, { name })}</Text>              // 'Welcome, {name}'
<Text>{plural(T.requests, count)}</Text>              // { one: '{n} request', other: '{n} requests' }
<Text>{fmtDate(date, { month: 'short', day: 'numeric' })}</Text>
<Text>{GLYPH.back} {S.common.back}</Text>
```

## Rules for adding or converting text

1. **Every string a person can see or hear goes in the dictionary**: labels,
   buttons, placeholders, errors, empty states, alerts and confirmations,
   `accessibilityLabel`, notification text, demo data.
2. **English must not change.** Move the existing English into `en/` character
   for character (curly quotes, dashes, capitals, trailing spaces).
3. **One whole sentence per key.** Never glue translated fragments together;
   word order differs. Use placeholders: `'Since {date}'` with `fmt`.
   When a sentence has a differently styled run in the middle, give the parts
   keys that say so (`linkBefore`, `linkText`, `linkAfter`) and let the Arabic
   leave a part empty if its order differs.
4. **Counts use plural entries.** English: `{ one, other }`. Arabic: `one`,
   `two`, `few` (3–10), `many` (11–99), `other`, and `zero` where 0 reads
   differently. `{n}` is the number.
5. **Dates and times** go through `fmtDate` / `fmtTime` / `fmtNumber`, never
   `toLocaleDateString('en-US', …)`.
6. **Never translate a value the code stores, sends or compares**: enum and
   database values, storage keys, route names, ids, things matched with `===`.
   Translate the label shown for it, at the point of display. Leave console
   messages, thrown developer errors and code comments alone.
7. **Never translate scripture, Agpeya or liturgical prayers, or quotations
   from the Fathers, and never write them in Arabic from memory.** Leave that
   English where it is in the code, add `ltrText` to its Text style so it
   reads left-to-right, and list it in your report. Titles and names are not
   scripture (see the glossary: "The Creed" → «قانون الإيمان»).
   Arabic scripture and prayer text comes only from a published source, kept
   as data: the Agpeya from the Book of Agpeya (lib/psalms/*.ar.json, see
   scripts/agpeya-arabic/README.md) and the Gospel of the day from the
   Katameros service.
8. **Direction.** Rows mirror by themselves. In a `lazyThemed` StyleSheet,
   `marginLeft`, `paddingRight`, `left`, `textAlign: 'left'` and friends are
   mirrored for you — leave them. In an inline `style={{…}}` they are not:
   use `marginStart` / `marginEnd` / `paddingStart` / `paddingEnd` / `start` /
   `end`, or move the style into the StyleSheet. (On web those logical keys
   follow the `dir` the root layout sets, not `<html dir>`.) A horizontal
   ScrollView positioned by offset (a snap picker) is simplest kept
   left-to-right with `directionStyle('ltr')`. Do not type ‹ › ← → in JSX:
   use `GLYPH`, or put the arrow inside the translated string (Arabic "next"
   points left: `'متابعة ←'`).
9. **Modules with a `.test.ts` beside them stay import-free** (the tests run
   in plain Node). Do not import `@/lib/i18n` there. Give the function a
   `labels` parameter that defaults to the English it already had, and pass
   the translated labels from the screen. `npm test` must still pass.
10. **Keys** are camelCase and grouped by the part of the screen they belong
    to. Name them for what they say (`emptyTitle`, `deleteConfirmBody`), not
    for where they sit (`text3`).

## Arabic style

- Modern Standard Arabic, plain and warm, the register of a church bulletin:
  not stiff, not colloquial. Short sentences.
- Address the reader in the masculine singular, the convention in Arabic
  interfaces. Prefer wording that avoids gender where it costs nothing
  (verbal nouns for buttons: «حفظ», «إرسال», «تسجيل الدخول»).
- Arabic punctuation: «،» «؛» «؟». Quotation marks «…». Keep «…» for ellipsis.
- Western digits (0–9) everywhere.
- No ALL CAPS equivalent: an English `SAVE` is «حفظ».
- A string that begins with a Latin word or a number displays in the wrong
  order. Reword so Arabic comes first, or begin it with `‏`.
- Keep "Nepsis", email addresses, URLs and code samples in Latin script.
- Translate meaning, not words. Privacy and security statements must stay
  exactly as strong as the English: no softer, no stronger.

## Glossary

| English | Arabic |
|---|---|
| Father of Confession | أب الاعتراف |
| your Father of Confession | أب اعترافك |
| Confession | الاعتراف |
| Examination of conscience | محاسبة النفس |
| Repentance | التوبة |
| Absolution (prayer) | التحليل |
| Priest (role) | كاهن |
| Fr. (before a name) / Father (address) | أبونا |
| Servant | خادم |
| Sunday school | مدارس الأحد |
| Congregant / member (role) | عضو |
| a servant's student | مخدوم (pl. مخدومون) |
| a priest's member | ابن في الاعتراف / أبناء الاعتراف; "members" generally: الأعضاء |
| Church / parish | الكنيسة |
| Diocese | الإيبارشية |
| Canon / spiritual rule | القانون الروحي |
| rule item | بند (pl. بنود) |
| spiritual exercise | تدريب روحي (pl. تدريبات روحية) |
| Agpeya | الأجبية |
| Psalm / Psalms | مزمور / المزامير |
| Psalm 50 | المزمور 50 |
| Prime · First Hour | صلاة باكر |
| Terce · Third Hour | صلاة الساعة الثالثة |
| Sext · Sixth Hour | صلاة الساعة السادسة |
| None · Ninth Hour | صلاة الساعة التاسعة |
| Vespers · Eleventh Hour | صلاة الغروب |
| Compline · Twelfth Hour | صلاة النوم |
| Prayer of the Veil | صلاة الستار |
| Midnight Prayer | صلاة نصف الليل |
| First / Second / Third Watch | الخدمة الأولى / الثانية / الثالثة |
| Gospel | الإنجيل |
| Litanies | القطع |
| The Creed | قانون الإيمان |
| Trisagion | الثلاثة تقديسات |
| The Lord's Prayer | الصلاة الربانية |
| Thanksgiving Prayer | صلاة الشكر |
| Hail to You | السلام لكِ |
| Holy, Holy, Holy | قدوس قدوس قدوس |
| Gloria (Praise of the Angels) | تسبحة الملائكة |
| Conclusion of Every Hour | ختام كل ساعة |
| Divine Liturgy | القداس الإلهي |
| Communion | التناول |
| Vespers / Matins raising of incense | رفع بخور عشية / باكر |
| Midnight praises (Tasbeha) | التسبحة |
| Prostrations (metanoias) | ميطانيات |
| Jesus Prayer | صلاة يسوع |
| Bible reading | قراءة الكتاب المقدس |
| Spiritual reading | القراءة الروحية |
| Fasting | الصوم |
| Tithes / almsgiving | العشور / الصدقة |
| Service (ministry) | الخدمة |
| Great Lent | الصوم الكبير |
| Holy Week | أسبوع الآلام |
| Fast of Nineveh (Jonah's Fast) | صوم يونان |
| Apostles' Fast | صوم الرسل |
| St. Mary's Fast | صوم السيدة العذراء |
| Nativity Fast | صوم الميلاد |
| Wednesday and Friday fast | صوم الأربعاء والجمعة |
| Holy Fifty Days | الخماسين المقدسة |
| Nativity | عيد الميلاد المجيد |
| Theophany (Epiphany) | عيد الغطاس المجيد |
| Palm Sunday | أحد الشعانين |
| Resurrection (Pascha, Easter) | عيد القيامة المجيد |
| Ascension | عيد الصعود |
| Pentecost | عيد العنصرة |
| Nayrouz (Coptic New Year) | عيد النيروز |
| Feast of the Cross | عيد الصليب |
| Annunciation | عيد البشارة |
| Transfiguration | عيد التجلي |
| Entry of the Lord into Egypt | دخول السيد المسيح أرض مصر |
| Feast of the Apostles | عيد الرسل |
| Theotokos | والدة الإله |
| St. Mary | السيدة العذراء |
| Saint (m. / f.) | القديس / القديسة |
| Martyr | الشهيد |
| Pope (of Alexandria) | البابا |
| Synaxarium | السنكسار |
| Lectionary (Katameros) | القطمارس |
| Coptic months | توت، بابه، هاتور، كيهك، طوبه، أمشير، برمهات، برموده، بشنس، بؤونه، أبيب، مسرى، نسيء |
| Year of the Martyrs (A.M.) | للشهداء (ش) |
| Spiritual Vitals | المؤشرات الروحية |
| Pastoral Journey | المسيرة الرعوية |
| Quiet time | وقت الخلوة |
| Heart of Service | قلب الخدمة |
| Dashboard | لوحة المتابعة |
| Journal | المذكرات |
| journal entry | تدوينة |
| Notification | إشعار (pl. إشعارات) |
| Prayer request | طلب صلاة (pl. طلبات الصلاة) |
| Blessings (gratitude) | البركات |
| Appointment | موعد (pl. مواعيد) |
| Encounter (logged meeting) | لقاء (pl. لقاءات) |
| Pastoral visit | افتقاد |
| Pastoral note | ملاحظة رعوية |
| Reminder | تذكير (pl. تذكيرات) |
| Streak | أيام متتالية |
| Invite code | رمز الدعوة |
| Recovery PIN | رمز الاسترداد (PIN) |
| Face ID | بصمة الوجه (Face ID) |
| Encrypted / encryption | مشفّر / التشفير |
| Encryption key | مفتاح التشفير |
| Account | الحساب |
| Sign in / Sign out | تسجيل الدخول / تسجيل الخروج |
| Profile | الملف الشخصي |
| Settings | الإعدادات |
| Privacy | الخصوصية |
| Feedback | الملاحظات والاقتراحات |
| Demo | تجربة / عرض تجريبي |

## Not translated yet

- Short scripture quotations written into screens (for example 1 John 1:9 on
  the confession screen and the journal's fallback verse). The Agpeya psalms
  and prayers and the Gospel of the day are in Arabic from published sources.
- The admin dashboard and the roadmap screen (used only by the developer).
- Text that comes from outside the app: Supabase's account emails, push
  messages written by the server, and church names from the directory.
