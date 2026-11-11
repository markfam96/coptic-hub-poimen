// lib/synaxarium.ts
// Upcoming saints' commemorations from the Coptic Synaxarium, computed live.
// Entries are defined by their COPTIC dates and converted to Gregorian by day
// arithmetic from Nayrouz (1 Thout = Sep 11, or Sep 12 in Gregorian years
// ≡ 3 mod 4). Because Coptic dates are Julian-locked and Gregorian and Julian
// leap days coincide for 1900–2099, plain day arithmetic from the correct
// Nayrouz stays accurate across the whole range — including the one-day shift
// that Sept–Feb dates carry after a Coptic leap year.

import { S, fmt } from '@/lib/i18n';

const T = S.calendar;

export interface Commemoration {
  date: Date;
  title: string;
  desc: string;
}

export const COPTIC_MONTHS = [
  'Thout', 'Paopi', 'Hathor', 'Koiahk', 'Tobi', 'Amshir',
  'Paremhat', 'Parmoute', 'Pashons', 'Paoni', 'Epip', 'Mesra', 'Nasie',
];

// Nayrouz (1 Thout) of the Coptic year that begins in Gregorian year `y`.
function nayrouz(y: number): Date {
  return new Date(y, 8, y % 4 === 3 ? 12 : 11, 12, 0, 0);
}

export interface CopticDate {
  year: number;       // Anno Martyrum (year of the Martyrs)
  month: number;      // 1-based (13 = Nasie, the epagomenal days)
  day: number;        // 1-based
  monthName: string;
}

// Convert a Gregorian date to its Coptic (Anno Martyrum) date by day arithmetic
// from the preceding Nayrouz. Twelve 30-day months plus the 5–6 epagomenal days
// of Nasie; accurate for 1900–2099 (Julian/Gregorian leap days coincide).
export function gregorianToCoptic(g: Date): CopticDate {
  const noon = new Date(g.getFullYear(), g.getMonth(), g.getDate(), 12, 0, 0);
  let y = g.getFullYear();
  let ny = nayrouz(y);
  if (noon < ny) { y -= 1; ny = nayrouz(y); }   // still in last Coptic year
  const dayDiff = Math.round((noon.getTime() - ny.getTime()) / 86400000);
  const month = Math.floor(dayDiff / 30) + 1;
  const day = (dayDiff % 30) + 1;
  return { year: y - 283, month, day, monthName: COPTIC_MONTHS[month - 1] };
}

const sameDay = (a: Date, b: Date) =>
  a.getFullYear() === b.getFullYear() && a.getMonth() === b.getMonth() && a.getDate() === b.getDate();

// The Synaxarium commemoration falling on `date`, if any (searches the two
// Coptic years that can overlap a Gregorian date). Returns the first match.
export function commemorationOn(date: Date): Commemoration | null {
  const y = date.getFullYear();
  const all = [...commemorationsForCopticYear(y - 1), ...commemorationsForCopticYear(y)];
  return all.find(c => sameDay(c.date, date)) ?? null;
}

// Gregorian date of Coptic month `m` (1-based), day `d`, for the Coptic year
// beginning in Gregorian year `nayrouzYear`.
export function copticToGregorian(nayrouzYear: number, m: number, d: number): Date {
  const date = nayrouz(nayrouzYear);
  date.setDate(date.getDate() + (m - 1) * 30 + (d - 1));
  return date;
}

// Annual commemorations — Coptic month/day per the Synaxarium.
const SAINTS: { m: number; d: number; key: keyof typeof T.saints }[] = [
  { m: 1,  d: 2,  key: 'johnBaptist' },
  { m: 2,  d: 22, key: 'luke' },
  { m: 3,  d: 8,  key: 'fourCreatures' },
  { m: 3,  d: 15, key: 'mina' },
  { m: 3,  d: 25, key: 'mercurius' },
  { m: 4,  d: 3,  key: 'maryEntranceTemple' },
  { m: 4,  d: 8,  key: 'barbara' },
  { m: 4,  d: 10, key: 'nicholas' },
  { m: 4,  d: 22, key: 'gabriel' },
  { m: 5,  d: 1,  key: 'stephen' },
  { m: 5,  d: 13, key: 'demiana' },
  { m: 5,  d: 22, key: 'anthony' },
  { m: 6,  d: 2,  key: 'paulHermit' },
  { m: 6,  d: 30, key: 'kyrillosVI' },
  { m: 7,  d: 8,  key: 'shenoudaIII' },
  { m: 7,  d: 24, key: 'zeitoun' },
  { m: 7,  d: 27, key: 'macarius' },
  { m: 8,  d: 23, key: 'george' },
  { m: 8,  d: 30, key: 'mark' },
  { m: 9,  d: 1,  key: 'maryNativity' },
  { m: 9,  d: 7,  key: 'athanasius' },
  { m: 9,  d: 14, key: 'pachomius' },
  { m: 10, d: 24, key: 'mosesStrong' },
  { m: 11, d: 7,  key: 'shenoudaArchimandrite' },
  { m: 11, d: 8,  key: 'bishoy' },
  { m: 11, d: 23, key: 'marina' },
  { m: 11, d: 24, key: 'abanoub' },
  { m: 12, d: 15, key: 'habibGirgis' },
  { m: 12, d: 24, key: 'taklaHaymanot' },
];

// All commemorations of the Coptic year beginning in `nayrouzYear`: the annual
// Synaxarium entries above plus the monthly commemorations of Archangel
// Michael (12th) and the Theotokos (21st). 21 Tobi is her Dormition; 12 Paoni
// is Michael's annual feast (listed with the feasts, so skipped here).
function commemorationsForCopticYear(nayrouzYear: number): Commemoration[] {
  const list: Commemoration[] = SAINTS.map(s => ({
    date: copticToGregorian(nayrouzYear, s.m, s.d),
    title: T.saints[s.key].title,
    desc: T.saints[s.key].desc,
  }));
  for (let m = 1; m <= 12; m++) {
    if (m !== 10) {
      list.push({
        date: copticToGregorian(nayrouzYear, m, 12),
        title: T.monthly.michaelTitle,
        desc: fmt(T.monthly.desc, { day: 12, month: T.copticMonths[m - 1] }),
      });
    }
    if (m === 5) {
      list.push({
        date: copticToGregorian(nayrouzYear, m, 21),
        title: T.monthly.dormitionTitle,
        desc: T.monthly.dormitionDesc,
      });
    } else {
      list.push({
        date: copticToGregorian(nayrouzYear, m, 21),
        title: T.monthly.maryTitle,
        desc: fmt(T.monthly.desc, { day: 21, month: T.copticMonths[m - 1] }),
      });
    }
  }
  return list.sort((a, b) => a.date.getTime() - b.date.getTime());
}

// The next `count` commemorations on or after `from`.
export function upcomingCommemorations(from: Date, count = 4): Commemoration[] {
  const start = new Date(from);
  start.setHours(0, 0, 0, 0);
  // The Coptic year that began last September plus the next two cover any
  // window that starts today.
  const base = from.getMonth() >= 8 ? from.getFullYear() : from.getFullYear() - 1;
  return [
    ...commemorationsForCopticYear(base),
    ...commemorationsForCopticYear(base + 1),
    ...commemorationsForCopticYear(base + 2),
  ]
    .filter(c => c.date >= start)
    .slice(0, count);
}
