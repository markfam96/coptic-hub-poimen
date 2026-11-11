// The Arabic Agpeya text (agpeyaPsalms.ar.json / agpeyaPrayers.ar.json) must
// cover every item the English data has, and Psalm 118 must keep the same 22
// sections, because memorisation items are tracked per section ("118#3").
// Run: npm test

import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import path from 'node:path';

const here = path.dirname(fileURLToPath(import.meta.url));
const read = (f: string) => JSON.parse(readFileSync(path.join(here, f), 'utf8'));

const en = read('agpeyaPsalms.json').psalms as Record<string, { parts: string[] }>;
const ar = read('agpeyaPsalms.ar.json').psalms as Record<string, { parts: string[] }>;
const enP = read('agpeyaPrayers.json').prayers as Record<string, { parts: string[] }>;
const arP = read('agpeyaPrayers.ar.json').prayers as Record<string, { parts: string[] }>;

const ARABIC = /[ء-ي]/;
const LATIN = /[A-Za-z]/;

test('every psalm and prayer has Arabic text', () => {
  assert.deepEqual(Object.keys(en).filter(k => !ar[k]), []);
  assert.deepEqual(Object.keys(enP).filter(k => !arP[k]), []);
});

test('Psalm 118 keeps its 22 sections, each closing with the refrain', () => {
  assert.equal(ar['118'].parts.length, en['118'].parts.length);
  assert.equal(ar['118'].parts.length, 22);
  for (const p of ar['118'].parts.slice(0, 21)) assert.match(p, /المجد لك يا محب البشر\.?$/);
});

test('every other psalm is one part and ends with Alleluia', () => {
  for (const [k, v] of Object.entries(ar)) {
    if (k === '118') continue;
    assert.equal(v.parts.length, 1, `psalm ${k}`);
    assert.match(v.parts[0], /هلليلويا\.?$/, `psalm ${k}`);
  }
});

test('no part is empty, untranslated or carrying extraction debris', () => {
  const all = [...Object.values(ar), ...Object.values(arP)].flatMap(v => v.parts);
  for (const p of all) {
    assert.ok(p.trim().length > 0);
    assert.match(p, ARABIC);
    assert.doesNotMatch(p, LATIN, p.slice(0, 60));
    assert.doesNotMatch(p, /\s[,]/, p.slice(0, 60));
    assert.doesNotMatch(p, /\)\d+\(/, p.slice(0, 60));
  }
});
