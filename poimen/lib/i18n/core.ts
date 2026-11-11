// lib/i18n/core.ts
// The parts of translation that need no React Native: the language type, the
// shape every dictionary must have, placeholder filling and plural selection.
// Import-free on purpose, so `npm test` (plain Node) can load it and every
// dictionary file next to it.

export type Lang = 'en' | 'ar';

export const LANGS: readonly Lang[] = ['en', 'ar'];

// One entry per plural category. English uses `one` and `other`. Arabic uses
// all six: 0 · 1 · 2 · 3–10 · 11–99 · everything else. A category that is
// missing falls back to `other`.
export interface PluralForms {
  zero?: string;
  one?: string;
  two?: string;
  few?: string;
  many?: string;
  other: string;
}

type PluralKey = keyof PluralForms;

// The type an Arabic dictionary file must satisfy, derived from its English
// twin: same keys, strings stay strings, and a plural entry (an object whose
// only keys are plural categories and which has `one`) may carry any of the
// six categories. A category map that merely happens to contain `other`
// (Health / Family / Other) has keys outside the plural set and is recursed
// into like any other object.
export type Localized<T> =
  T extends string ? string
  : T extends readonly (infer U)[] ? readonly Localized<U>[]
  : [keyof T] extends [PluralKey]
    ? ('one' extends keyof T ? PluralForms : { [K in keyof T]: Localized<T[K]> })
    : { [K in keyof T]: Localized<T[K]> };

// Fills {name} placeholders. A placeholder with no value is left as written,
// which makes a missed variable visible instead of printing "undefined".
export function fmt(template: string, vars?: Record<string, string | number>): string {
  if (!vars) return template;
  return template.replace(/\{(\w+)\}/g, (whole, key: string) =>
    Object.prototype.hasOwnProperty.call(vars, key) ? String(vars[key]) : whole);
}

// CLDR plural categories for the two languages the app ships.
export function pluralCategory(lang: Lang, n: number): PluralKey {
  if (lang === 'ar') {
    if (!Number.isInteger(n) || n < 0) return 'other';
    if (n === 0) return 'zero';
    if (n === 1) return 'one';
    if (n === 2) return 'two';
    const mod = n % 100;
    if (mod >= 3 && mod <= 10) return 'few';
    if (mod >= 11) return 'many';
    return 'other';
  }
  return n === 1 ? 'one' : 'other';
}

// Picks the form for `n` and fills {n} plus any other placeholders.
export function pluralFor(
  lang: Lang,
  forms: PluralForms,
  n: number,
  vars?: Record<string, string | number>,
): string {
  const form = forms[pluralCategory(lang, n)] ?? forms.other;
  return fmt(form, { n, ...vars });
}

// Hermes and browsers print Arabic dates with Eastern Arabic digits (٠١٢…).
// The app shows psalm numbers, times and counts in Western digits everywhere,
// so dates are normalised to match rather than mixing two digit sets on one
// screen.
const EASTERN = '٠١٢٣٤٥٦٧٨٩';
export function westernDigits(s: string): string {
  return s.replace(/[٠-٩]/g, d => String(EASTERN.indexOf(d)));
}

// The first language the device asks for decides the default; only Arabic
// switches the app away from English.
export function langFromLocale(locale: string | null | undefined): Lang {
  return typeof locale === 'string' && /^ar(\b|[-_])/i.test(locale) ? 'ar' : 'en';
}

export function parseLang(raw: unknown): Lang | null {
  return raw === 'en' || raw === 'ar' ? raw : null;
}

// Every placeholder name used in a template, sorted — the dictionary test
// compares these between the two languages.
export function placeholders(template: string): string[] {
  return [...new Set([...template.matchAll(/\{(\w+)\}/g)].map(m => m[1]))].sort();
}
