// lib/feasts.ts
// The Coptic liturgical calendar's feasts and fast openings, computed live.
//
// Three kinds of dates:
//  · Movable feasts (Palm Sunday, Resurrection, Ascension, Pentecost) and the
//    movable fast openings derive from each year's Pascha (lib/canon/fasting).
//  · Feasts fixed in the Coptic month of Thout shift with Nayrouz: 1 Thout is
//    Sept 11, but Sept 12 in Gregorian years ≡ 3 (mod 4) — the Coptic leap day
//    lands just before those new years.
//  · The remaining fixed feasts are anchored to Julian dates, whose Gregorian
//    equivalents are constant for 1900–2099 (e.g. Nativity = Julian Dec 25 =
//    Jan 7; the Church adjusts the Koiahk date after Coptic leap years so the
//    Gregorian day never moves).

import { orthodoxPascha, churchFastsForYear } from './canon/fasting';
import { S, fmt } from '@/lib/i18n';

const T = S.calendar.feasts;

export interface Feast {
  date: Date;
  title: string;
  desc: string;
  kind: 'major' | 'minor' | 'commemoration' | 'fast';
}

const at = (y: number, m: number, d: number) => new Date(y, m - 1, d, 12, 0, 0);
const offset = (base: Date, days: number) => {
  const x = new Date(base);
  x.setDate(x.getDate() + days);
  x.setHours(12, 0, 0, 0);
  return x;
};

// How each fasting season from lib/canon/fasting is announced on the calendar.
const FAST_OPENINGS: Record<string, { title: string; desc: string }> = S.calendar.fastOpenings;

// Every feast and fast opening in Gregorian year `y`.
export function feastsForYear(y: number): Feast[] {
  const list: Feast[] = [
    // ── Fixed (Julian-anchored, constant Gregorian dates 1900–2099) ──
    { date: at(y, 1, 7),   kind: 'major', title: T.nativity.title, desc: T.nativity.desc },
    { date: at(y, 1, 14),  kind: 'minor', title: T.circumcision.title, desc: T.circumcision.desc },
    { date: at(y, 1, 19),  kind: 'major', title: T.theophany.title, desc: T.theophany.desc },
    { date: at(y, 1, 21),  kind: 'minor', title: T.cana.title, desc: T.cana.desc },
    { date: at(y, 2, 15),  kind: 'minor', title: T.entranceTemple.title, desc: T.entranceTemple.desc },
    { date: at(y, 3, 19),  kind: 'commemoration', title: T.crossParemhat.title, desc: T.crossParemhat.desc },
    { date: at(y, 4, 7),   kind: 'major', title: T.annunciation.title, desc: T.annunciation.desc },
    { date: at(y, 6, 1),   kind: 'minor', title: T.entranceEgypt.title, desc: T.entranceEgypt.desc },
    { date: at(y, 6, 19),  kind: 'commemoration', title: T.archangelMichael.title, desc: T.archangelMichael.desc },
    { date: at(y, 7, 12),  kind: 'commemoration', title: T.apostles.title, desc: T.apostles.desc },
    { date: at(y, 8, 19),  kind: 'minor', title: T.transfiguration.title, desc: T.transfiguration.desc },
    { date: at(y, 8, 22),  kind: 'commemoration', title: T.assumption.title, desc: T.assumption.desc },
  ];

  // ── Fast openings ──
  // Dates come from lib/canon/fasting (the single source of truth for fasting
  // seasons); only the wording lives here.
  for (const f of churchFastsForYear(y)) {
    const copy = FAST_OPENINGS[f.name];
    const date = new Date(f.start);
    date.setHours(12, 0, 0, 0);
    list.push({ date, kind: 'fast', title: copy.title, desc: copy.desc });
  }

  // ── Thout feasts — shift with Nayrouz ──
  const nayrouzDay = y % 4 === 3 ? 12 : 11;
  const nayrouz = at(y, 9, nayrouzDay);
  list.push(
    { date: nayrouz, kind: 'commemoration', title: T.nayrouz.title, desc: fmt(T.nayrouz.desc, { year: y - 283 }) },
    { date: offset(nayrouz, 16), kind: 'commemoration', title: T.crossThout.title, desc: T.crossThout.desc },
  );

  // ── Movable — from this year's Pascha ──
  const pascha = orthodoxPascha(y);
  pascha.setHours(12, 0, 0, 0);
  list.push(
    { date: offset(pascha, -7),  kind: 'major', title: T.palmSunday.title, desc: T.palmSunday.desc },
    { date: pascha,              kind: 'major', title: T.resurrection.title, desc: T.resurrection.desc },
    { date: offset(pascha, 39),  kind: 'major', title: T.ascension.title, desc: T.ascension.desc },
    { date: offset(pascha, 49),  kind: 'major', title: T.pentecost.title, desc: T.pentecost.desc },
  );

  return list.sort((a, b) => a.date.getTime() - b.date.getTime());
}

// The feast (or fast opening) falling on `date`, if any. When more than one
// lands on the same day, the most significant wins (major > minor >
// commemoration > fast).
export function feastOn(date: Date): Feast | null {
  const matches = feastsForYear(date.getFullYear()).filter(f =>
    f.date.getFullYear() === date.getFullYear() &&
    f.date.getMonth() === date.getMonth() &&
    f.date.getDate() === date.getDate(),
  );
  if (!matches.length) return null;
  const rank: Record<Feast['kind'], number> = { major: 0, minor: 1, commemoration: 2, fast: 3 };
  matches.sort((a, b) => rank[a.kind] - rank[b.kind]);
  return matches[0];
}

// The next `count` entries on or after `from` (looks across the year boundary).
export function upcomingFeasts(from: Date, count = 4): Feast[] {
  const start = new Date(from);
  start.setHours(0, 0, 0, 0);
  const y = from.getFullYear();
  return [...feastsForYear(y), ...feastsForYear(y + 1)]
    .filter(f => f.date >= start)
    .slice(0, count);
}
