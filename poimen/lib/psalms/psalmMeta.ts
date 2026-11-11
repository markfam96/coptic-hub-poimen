// src/data/psalmMeta.ts
// A primary "type" for each Psalm so the user knows its character — repentance,
// praise, thanksgiving, etc. Uses LXX (Septuagint) numbering to match the
// Brenton text and Orthodox liturgical usage. Classifications are approximate,
// following the broad consensus of the psalm genres.

import { S } from '@/lib/i18n';

// The labels and blurbs are shown text and come from the dictionary
// (lib/i18n/*/psalms.ts); the keys and colours stay here.
const K = S.psalms.kinds;
const C = S.psalms.categories;

export type PsalmCategory =
  | 'repentance'
  | 'praise'
  | 'thanksgiving'
  | 'trust'
  | 'supplication'
  | 'wisdom'
  | 'messianic'
  | 'ascents';

export interface CategoryMeta {
  label: string;
  color: string;
  blurb: string;
}

// Kinds for the non-psalm Agpeya items (Gospels, litanies, absolutions, and
// the fixed prayers of the hours), with the same tag/blurb treatment.
export type PrayerKind = 'gospel' | 'litany' | 'absolution' | 'prayer' | 'creed' | 'epistle';

export const PRAYER_KIND_META: Record<PrayerKind, CategoryMeta> = {
  gospel:     { label: K.gospel.label,     color: '#A8842C', blurb: K.gospel.blurb },
  litany:     { label: K.litany.label,     color: '#1F4E8C', blurb: K.litany.blurb },
  absolution: { label: K.absolution.label, color: '#1D7A5C', blurb: K.absolution.blurb },
  prayer:     { label: K.prayer.label,     color: '#6A3D8F', blurb: K.prayer.blurb },
  creed:      { label: K.creed.label,      color: '#7A1F2B', blurb: K.creed.blurb },
  epistle:    { label: K.epistle.label,    color: '#993C1D', blurb: K.epistle.blurb },
};

export const CATEGORY_META: Record<PsalmCategory, CategoryMeta> = {
  repentance:   { label: C.repentance.label,   color: '#7A1F2B', blurb: C.repentance.blurb },
  praise:       { label: C.praise.label,       color: '#A8842C', blurb: C.praise.blurb },
  thanksgiving: { label: C.thanksgiving.label, color: '#1D7A5C', blurb: C.thanksgiving.blurb },
  trust:        { label: C.trust.label,        color: '#1F4E8C', blurb: C.trust.blurb },
  supplication: { label: C.supplication.label, color: '#6A3D8F', blurb: C.supplication.blurb },
  wisdom:       { label: C.wisdom.label,       color: '#8A6516', blurb: C.wisdom.blurb },
  messianic:    { label: C.messianic.label,    color: '#993C1D', blurb: C.messianic.blurb },
  ascents:      { label: C.ascents.label,      color: '#2C6E6E', blurb: C.ascents.blurb },
};

const range = (a: number, b: number) => Array.from({ length: b - a + 1 }, (_, i) => a + i);

// Priority order — first match wins (LXX numbering).
const SETS: [PsalmCategory, number[]][] = [
  ['repentance',   [6, 31, 37, 50, 101, 129, 142]],
  ['ascents',      range(119, 133)],
  ['messianic',    [2, 17, 19, 20, 44, 71, 88, 109, 131, 143]],
  ['wisdom',       [1, 36, 48, 72, 111, 118, 126, 127, 138]],
  ['thanksgiving', [29, 32, 33, 65, 66, 91, 95, 96, 99, 106, 114, 137]],
  ['praise',       [8, 18, 28, 46, 67, 76, 80, 92, 97, 98, 102, 103, 104, 110, 112, 113, 116, 117, 134, 135, 144, 145, 146, 147, 148, 149, 150]],
  ['trust',        [3, 4, 10, 15, 22, 26, 53, 61, 62, 90, 120, 123, 124, 130]],
];

const CLASSIFICATION: Record<number, PsalmCategory> = {};
for (const [cat, nums] of SETS) {
  for (const n of nums) {
    if (!(n in CLASSIFICATION)) CLASSIFICATION[n] = cat;
  }
}

export function classify(psalm: number): PsalmCategory {
  return CLASSIFICATION[psalm] ?? 'supplication';
}
