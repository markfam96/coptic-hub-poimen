// Run: npm test
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { unlistedNameValid, churchChoiceToFields, CHURCH_NAME_MAX } from './church-choice.ts';

test('an unlisted name needs two real characters', () => {
  assert.equal(unlistedNameValid('  a '), false);
  assert.equal(unlistedNameValid('St'), true);
  assert.equal(unlistedNameValid(''), false);
});

test('a listed church lands as its id and its own name', () => {
  assert.deepEqual(
    churchChoiceToFields({ kind: 'listed', church: { id: 'abc', name: 'St. Mark', city: 'Fairfax' } }),
    { church_id: 'abc', church_name: 'St. Mark' },
  );
});

test('an unlisted church lands as "name, city", trimmed and capped', () => {
  assert.deepEqual(
    churchChoiceToFields({ kind: 'unlisted', name: '  St. Mary ', city: ' Leesburg ' }),
    { church_id: null, church_name: 'St. Mary, Leesburg' },
  );
  assert.deepEqual(
    churchChoiceToFields({ kind: 'unlisted', name: 'St. Mary', city: '   ' }),
    { church_id: null, church_name: 'St. Mary' },
  );
  const long = churchChoiceToFields({ kind: 'unlisted', name: 'x'.repeat(200), city: 'y' });
  assert.equal(long.church_name.length, CHURCH_NAME_MAX);
});
