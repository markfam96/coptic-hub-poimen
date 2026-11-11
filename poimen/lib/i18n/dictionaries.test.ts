// The two dictionaries must describe the same app: the same keys, the same
// placeholders in each sentence, and plural entries that carry the forms
// their language needs. TypeScript checks the keys of each Arabic file when
// the app is built; this also runs where the build does not (npm test) and
// checks what types cannot see.

import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readdirSync } from 'node:fs';
import { fileURLToPath, pathToFileURL } from 'node:url';
import path from 'node:path';
import { fmt, pluralCategory, pluralFor, westernDigits, langFromLocale, parseLang, placeholders } from './core.ts';

const here = path.dirname(fileURLToPath(import.meta.url));
const PLURAL_KEYS = ['zero', 'one', 'two', 'few', 'many', 'other'];

const isPlural = (v: unknown): v is Record<string, string> =>
  typeof v === 'object' && v !== null && !Array.isArray(v)
  && Object.keys(v).length > 0
  && Object.keys(v).every(k => PLURAL_KEYS.includes(k))
  && 'one' in (v as object) && 'other' in (v as object);

async function load(lang: 'en' | 'ar'): Promise<Record<string, unknown>> {
  const dir = path.join(here, lang);
  const out: Record<string, unknown> = {};
  for (const file of readdirSync(dir).filter(f => f.endsWith('.ts') && f !== 'index.ts').sort()) {
    const name = file.replace(/\.ts$/, '');
    const mod = await import(pathToFileURL(path.join(dir, file)).href);
    assert.ok(name in mod, `${lang}/${file} must export "${name}"`);
    out[name] = mod[name];
  }
  return out;
}

// Flattens to "area.section.key" → leaf, where a leaf is a string or a
// plural entry.
function flatten(node: unknown, prefix: string, into: Map<string, unknown>): Map<string, unknown> {
  if (typeof node === 'string' || isPlural(node)) { into.set(prefix, node); return into; }
  if (Array.isArray(node)) { node.forEach((v, i) => flatten(v, `${prefix}[${i}]`, into)); return into; }
  assert.equal(typeof node, 'object', `${prefix} must be a string, a plural entry, an array or an object`);
  for (const [k, v] of Object.entries(node as object)) flatten(v, prefix ? `${prefix}.${k}` : k, into);
  return into;
}

const en = flatten(await load('en'), '', new Map());
const ar = flatten(await load('ar'), '', new Map());

test('both languages have exactly the same keys', () => {
  const missing = [...en.keys()].filter(k => !ar.has(k));
  const extra = [...ar.keys()].filter(k => !en.has(k));
  assert.deepEqual(missing, [], 'in English but not Arabic');
  assert.deepEqual(extra, [], 'in Arabic but not English');
});

test('a key is a sentence in both languages or a plural in both', () => {
  const mismatched = [...en.keys()].filter(k => ar.has(k) && isPlural(en.get(k)) !== isPlural(ar.get(k)));
  assert.deepEqual(mismatched, []);
});

test('every sentence uses the same placeholders in both languages', () => {
  const bad: string[] = [];
  for (const [key, e] of en) {
    const a = ar.get(key);
    if (typeof e !== 'string' || typeof a !== 'string') continue;
    if (placeholders(e).join() !== placeholders(a).join()) bad.push(`${key}: en {${placeholders(e)}} ar {${placeholders(a)}}`);
  }
  assert.deepEqual(bad, []);
});

test('plural entries carry the forms their language needs', () => {
  const bad: string[] = [];
  for (const [key, e] of en) {
    const a = ar.get(key);
    if (!isPlural(e) || !isPlural(a)) continue;
    for (const form of ['one', 'two', 'few', 'many', 'other']) if (!a[form]) bad.push(`${key}: Arabic lacks "${form}"`);
    // Every placeholder the English forms use must be reachable in Arabic.
    // {n} may be dropped where the word itself says the number (يومان).
    const need = new Set(Object.values(e).flatMap(placeholders).filter(p => p !== 'n'));
    for (const [form, text] of Object.entries(a)) {
      for (const p of need) if (!placeholders(text).includes(p)) bad.push(`${key}.${form}: Arabic lacks {${p}}`);
    }
  }
  assert.deepEqual(bad, []);
});

test('no Arabic entry is left empty unless the English one is', () => {
  const empty: string[] = [];
  for (const [key, e] of en) {
    const a = ar.get(key);
    // "…Before" / "…After" parts of a split sentence may be empty in one
    // language when the word order differs.
    if (/(Before|After|Prefix|Suffix)$/.test(key)) continue;
    if (typeof e === 'string' && typeof a === 'string' && e.trim() !== '' && a.trim() === '') empty.push(key);
  }
  assert.deepEqual(empty, []);
});

test('fmt fills placeholders and leaves unknown ones visible', () => {
  assert.equal(fmt('Since {date}', { date: 'May 3' }), 'Since May 3');
  assert.equal(fmt('{a} and {b}', { a: 1 }), '1 and {b}');
  assert.equal(fmt('plain'), 'plain');
});

test('Arabic plural categories follow CLDR', () => {
  const cat = (n: number) => pluralCategory('ar', n);
  assert.equal(cat(0), 'zero');
  assert.equal(cat(1), 'one');
  assert.equal(cat(2), 'two');
  assert.deepEqual([3, 10, 103, 110].map(cat), ['few', 'few', 'few', 'few']);
  assert.deepEqual([11, 99, 111, 199].map(cat), ['many', 'many', 'many', 'many']);
  assert.deepEqual([100, 101, 102, 200].map(cat), ['other', 'other', 'other', 'other']);
  assert.equal(cat(1.5), 'other');
  assert.equal(pluralCategory('en', 1), 'one');
  assert.equal(pluralCategory('en', 0), 'other');
});

test('a missing plural form falls back to "other"', () => {
  assert.equal(pluralFor('ar', { one: 'يوم واحد', other: '{n} يوم' }, 5), '5 يوم');
  assert.equal(pluralFor('en', { one: '{n} day', other: '{n} days' }, 1), '1 day');
  assert.equal(pluralFor('en', { one: '{n} of {total}', other: '{n} of {total}' }, 3, { total: 9 }), '3 of 9');
});

test('dates are shown with Western digits', () => {
  assert.equal(westernDigits('٣ نوفمبر ٢٠٢٦'), '3 نوفمبر 2026');
  assert.equal(westernDigits('3 Nov'), '3 Nov');
});

test('only an Arabic device language switches the default', () => {
  assert.equal(langFromLocale('ar-EG'), 'ar');
  assert.equal(langFromLocale('ar'), 'ar');
  assert.equal(langFromLocale('AR_sa'), 'ar');
  assert.equal(langFromLocale('en-US'), 'en');
  assert.equal(langFromLocale('arn-CL'), 'en');
  assert.equal(langFromLocale(undefined), 'en');
  assert.equal(parseLang('ar'), 'ar');
  assert.equal(parseLang('fr'), null);
});
