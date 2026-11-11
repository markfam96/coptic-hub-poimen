// lib/canon/describe.ts
// How an assigned category is summed up in one line.
//
// An assignment's or template's `component` is saved data: the English line
// the canon editor wrote ("Prostrations — 30 metanias"), sent to the server and
// read back on other screens. It stays English whatever language the priest
// works in. To show it in the app's language, the line is rebuilt from the
// category and payload saved beside it, but only when the stored text is
// exactly what the editor would have written; anything else (hand-edited, an
// older format, free text) is shown as stored.

import { S, fmt, plural } from '@/lib/i18n';
import { freqLabel, fastUntilLabel } from '@/lib/canon/rule-store';
import { AssignedCategory, CATEGORY_LABEL } from '@/lib/canon/assigned';

const T = S.canonEditor;

// How a category's one-line summary is worded. SHOWN is what the screen
// displays, in the app's language. STORED is the English written into an
// assignment's or a template's `component`: that is saved data, sent to the
// server and read back on other screens, so it stays exactly as it has always
// been, whatever language the priest works in.
export interface SummaryWords {
  prostrations: (n: number) => string;
  quiet: (n: number) => string;
  fasting: (until: string) => string;
  reading: (amount: number, mode: string) => string;
  book: string;
  confession: (frequency: string) => string;
  hourDays: (n: number) => string;
  perPeriod: (n: number) => string;
  serviceDays: (n: number) => string;
  commitments: (n: number) => string;
}

export const STORED: SummaryWords = {
  prostrations: n => `${n} metanias`,
  quiet: n => `${n} min`,
  fasting: until => `until ${until}`,
  reading: (amount, mode) => `${amount} ${mode}`,
  book: 'a spiritual book',
  confession: frequency => frequency,
  hourDays: n => `${n} hour-days`,
  perPeriod: n => `${n}× / period`,
  serviceDays: n => `${n} service-days`,
  commitments: n => `${n} commitments`,
};

export const SHOWN: SummaryWords = {
  prostrations: n => plural(T.summary.prostrations, n),
  quiet: n => plural(T.summary.quiet, n),
  fasting: until => fmt(T.summary.fastUntil, { time: fastUntilLabel(until) }),
  reading: (amount, mode) => plural(mode === 'minutes' ? T.summary.minutes : T.summary.chapters, amount),
  book: T.summary.bookFallback,
  confession: freqLabel,
  hourDays: n => plural(T.summary.hourDays, n),
  perPeriod: n => plural(T.summary.perPeriod, n),
  serviceDays: n => plural(T.summary.serviceDays, n),
  commitments: n => plural(T.summary.commitments, n),
};

// One category's summary, read from the payload that is saved for it (see
// buildPayload). A template keeps the same payloads, so its row can be
// described from them too.
export function summarizePayload(cat: AssignedCategory, p: any, words: SummaryWords): string {
  const perDay = (): any[][] => Object.values(p?.days ?? {}).filter(Array.isArray) as any[][];
  switch (cat) {
    case 'prostrations':     return words.prostrations(p?.count);
    case 'quiet':            return words.quiet(p?.minutes);
    case 'fasting':          return words.fasting(p?.until);
    case 'bible':            return words.reading(p?.amount, p?.mode);
    case 'book':             return p?.title || words.book;
    case 'confession':       return words.confession(p?.frequency);
    case 'agpeya_hours':     return words.hourDays(perDay().reduce((n, d) => n + d.length, 0));
    case 'services':         return p?.mode === 'counts'
                               ? words.perPeriod(Object.values(p?.counts ?? {}).reduce((n: number, c: any) => n + c?.n, 0))
                               : words.serviceDays(perDay().reduce((n, d) => n + d.length, 0));
    case 'heart_of_service': return words.commitments(perDay().reduce((n, d) => n + d.filter(x => String(x?.text ?? '').trim()).length, 0));
    default:                 return '';
  }
}

// The stored English line for a category, as the editor writes it.
export function storedComponent(cat: AssignedCategory, payload: any): string {
  return `${CATEGORY_LABEL[cat]} — ${summarizePayload(cat, payload, STORED)}`;
}

// The line to show for a saved assignment or template part.
export function describeAssigned(component: string | null | undefined, category?: string | null, payload?: any): string {
  const text = component ?? '';
  const cat = category as AssignedCategory | null | undefined;
  if (!cat || !(cat in CATEGORY_LABEL)) return text;
  if (text !== storedComponent(cat, payload)) return text;
  return fmt(T.summary.part, { category: T.categories[cat], summary: summarizePayload(cat, payload, SHOWN) });
}
