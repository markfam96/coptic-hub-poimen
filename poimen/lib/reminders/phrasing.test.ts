// lib/reminders/phrasing.test.ts
// A notification is read on a lock screen, once, by someone who did not ask for
// it at that moment. There is no screen to check it against and no way to fix a
// sentence after the phone has already said it — so the sentence is tested.

import { test } from 'node:test';
import assert from 'node:assert/strict';
import { cleanLabel, describeItems, type ListWords } from './phrasing.ts';
import { pluralFor } from '../i18n/core.ts';
import { reminders as enReminders } from '../i18n/en/reminders.ts';
import { reminders as arReminders } from '../i18n/ar/reminders.ts';

// ─── cleanLabel ───────────────────────────────────────────────────────────────

test('the weekly-count suffix is dropped', () => {
  assert.equal(cleanLabel('Attend Vespers — 1 of 2 this week'), 'Attend Vespers');
});

test('a frequency and weekday suffix is dropped', () => {
  assert.equal(cleanLabel('Visit the sick · Mon, Wed'), 'Visit the sick');
});

test('a label with nothing to strip is left alone', () => {
  assert.equal(cleanLabel('Pray the Sixth Hour'), 'Pray the Sixth Hour');
});

// ─── describeItems ────────────────────────────────────────────────────────────

test('one item is its own sentence', () => {
  assert.equal(describeItems(['Pray the Sixth Hour']), 'Pray the Sixth Hour.');
});

test('two items are joined, and the second loses its capital', () => {
  assert.equal(
    describeItems(['Pray the Sixth Hour', 'Attend Vespers']),
    'Pray the Sixth Hour and attend Vespers.',
  );
});

test('three or more name two and count the rest', () => {
  assert.equal(
    describeItems(['Pray the Sixth Hour', 'Attend Vespers', 'Read 3 chapters', 'Keep the fast']),
    'Pray the Sixth Hour, attend Vespers, and 2 more.',
  );
});

test('the count is of what is left unnamed, not of everything', () => {
  assert.equal(describeItems(['A', 'Bb', 'Cc']), 'A, bb, and 1 more.');
});

// A priest's free-text component arrives verbatim and may be anything at all.
test('an all-caps label keeps its capitals mid-sentence', () => {
  assert.equal(
    describeItems(['Pray the Sixth Hour', 'PRAY FOR YOUR FAMILY']),
    'Pray the Sixth Hour and PRAY FOR YOUR FAMILY.',
  );
});

test('an already-lowercase label is not disturbed', () => {
  assert.equal(
    describeItems(['Pray the Sixth Hour', 'read a psalm']),
    'Pray the Sixth Hour and read a psalm.',
  );
});

test('an empty list produces nothing rather than a stray full stop', () => {
  assert.equal(describeItems([]), '');
});

// ─── The app's own languages ─────────────────────────────────────────────────
// content.ts hands describeItems the sentences from the dictionary. These are
// built the same way, from the same entries, so what is checked here is the
// text a phone will actually show.

const wordsFor = (lang: 'en' | 'ar'): ListWords => {
  const N = (lang === 'ar' ? arReminders : enReminders).notification;
  return {
    one: N.listOne,
    two: N.listTwo,
    more: n => pluralFor(lang, N.listMore, n),
    lowerLater: lang === 'en',
  };
};
const EN = wordsFor('en');
const AR = wordsFor('ar');

// `n` labels: two real ones, then fillers that are never named.
const arabicLabels = (n: number) =>
  ['صلاة باكر', 'حضور القداس الإلهي', ...Array.from({ length: n - 2 }, () => 'بند')];

test('the English dictionary says exactly what the built-in English says', () => {
  const labels = ['Pray the Sixth Hour', 'Attend Vespers', 'Read 3 chapters', 'Keep the fast', 'Visit the sick'];
  for (let n = 0; n <= labels.length; n++) {
    assert.equal(describeItems(labels.slice(0, n), EN), describeItems(labels.slice(0, n)));
  }
});

test('Arabic: the weekly-count suffix is dropped', () => {
  assert.equal(cleanLabel('حضور رفع بخور عشية — 1 من 2 هذا الأسبوع'), 'حضور رفع بخور عشية');
});

test('Arabic: the detail after the name of the item is dropped', () => {
  assert.equal(cleanLabel('قراءة الكتاب المقدس — 3 أصحاحات'), 'قراءة الكتاب المقدس');
});

test('Arabic: a frequency and weekday suffix is dropped', () => {
  assert.equal(cleanLabel('زيارة المرضى · أسبوعيًا · الاثنين'), 'زيارة المرضى');
});

test('Arabic: one item is its own sentence', () => {
  assert.equal(describeItems(['صلاة الساعة السادسة'], AR), 'صلاة الساعة السادسة.');
});

test('Arabic: two items are joined with «و» attached to the second', () => {
  assert.equal(describeItems(['صلاة باكر', 'المزمور 50'], AR), 'صلاة باكر والمزمور 50.');
});

test('Arabic: one item left unnamed is «بند آخر», without a digit', () => {
  assert.equal(describeItems(arabicLabels(3), AR), 'صلاة باكر، وحضور القداس الإلهي، وبند آخر.');
});

test('Arabic: two left unnamed take the dual', () => {
  assert.equal(describeItems(arabicLabels(4), AR), 'صلاة باكر، وحضور القداس الإلهي، وبندان آخران.');
});

test('Arabic: three to ten left unnamed take the plural', () => {
  assert.equal(describeItems(arabicLabels(5), AR), 'صلاة باكر، وحضور القداس الإلهي، و3 بنود أخرى.');
  assert.equal(describeItems(arabicLabels(12), AR), 'صلاة باكر، وحضور القداس الإلهي، و10 بنود أخرى.');
});

test('Arabic: eleven and more left unnamed take the singular accusative', () => {
  assert.equal(describeItems(arabicLabels(13), AR), 'صلاة باكر، وحضور القداس الإلهي، و11 بندًا آخر.');
});

test('Arabic: a round hundred left unnamed takes the plain singular', () => {
  assert.equal(describeItems(arabicLabels(102), AR), 'صلاة باكر، وحضور القداس الإلهي، و100 بند آخر.');
});

test('Arabic: the count is of what is left unnamed, not of everything', () => {
  assert.ok(!describeItems(arabicLabels(5), AR).includes('5'));
});

// A priest may write his own item in English inside an Arabic rule.
test('Arabic: a Latin label is left exactly as it was written', () => {
  assert.equal(
    describeItems(['صلاة باكر', 'Pray for your family'], AR),
    'صلاة باكر وPray for your family.',
  );
});

test('Arabic: no English is left in any form of the sentence', () => {
  for (const n of [1, 2, 3, 4, 5, 13, 102]) {
    assert.doesNotMatch(describeItems(arabicLabels(Math.max(n, 2)).slice(0, n), AR), /[A-Za-z]/);
  }
});

test('Arabic: an empty list produces nothing rather than a stray full stop', () => {
  assert.equal(describeItems([], AR), '');
});
