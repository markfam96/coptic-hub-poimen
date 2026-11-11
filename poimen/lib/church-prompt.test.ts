// Run: npm test
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { churchPromptVariant } from './church-prompt.ts';

const now = new Date('2026-11-10T12:00:00Z');
const daysAgo = (d: number) => new Date(now.getTime() - d * 86_400_000).toISOString();

test('nobody with a church, a dismissal or the demo is asked', () => {
  assert.equal(churchPromptVariant({ church_id: 'c1', church_name: 'X' }, false, false, now), 'none');
  assert.equal(churchPromptVariant({ church_id: null, church_name: null }, true, false, now), 'none');
  assert.equal(churchPromptVariant({ church_id: null, church_name: null }, false, true, now), 'none');
  assert.equal(churchPromptVariant(null, false, false, now), 'none');
});

test('no church at all → choose', () => {
  assert.equal(churchPromptVariant({ church_id: null, church_name: '' }, false, false, now), 'choose');
  assert.equal(churchPromptVariant({ church_id: null, church_name: '  ' }, false, false, now), 'choose');
});

test('a typed church is confirmed only after a week', () => {
  assert.equal(churchPromptVariant({ church_id: null, church_name: 'St. Mary, Leesburg', created_at: daysAgo(8) }, false, false, now), 'confirm');
  assert.equal(churchPromptVariant({ church_id: null, church_name: 'St. Mary, Leesburg', created_at: daysAgo(2) }, false, false, now), 'none');
  assert.equal(churchPromptVariant({ church_id: null, church_name: 'St. Mary, Leesburg', created_at: daysAgo(7) }, false, false, now), 'confirm');
  // Legacy rows with no created_at are the ones the admin "unassigned" row
  // has been counting for months: ask them.
  assert.equal(churchPromptVariant({ church_id: null, church_name: 'St. Mary' }, false, false, now), 'confirm');
});
