// Run: npm test
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { cacheIsFresh, parseChurchCache, serializeChurchCache, CHURCH_CACHE_TTL_MS } from './church-list-cache.ts';

const NOW = Date.UTC(2026, 10, 3, 12, 0, 0);
const HOUR = 60 * 60 * 1000;

test('a list fetched an hour ago is served without a refresh', () => {
  assert.equal(cacheIsFresh(NOW - HOUR, NOW), true);
});

test('a list older than a day is refreshed', () => {
  assert.equal(cacheIsFresh(NOW - CHURCH_CACHE_TTL_MS, NOW), false);
  assert.equal(cacheIsFresh(NOW - CHURCH_CACHE_TTL_MS + 1, NOW), true);
});

test('a fetchedAt in the future (clock went backwards) counts as stale', () => {
  assert.equal(cacheIsFresh(NOW + HOUR, NOW), false);
  assert.equal(cacheIsFresh(NaN, NOW), false);
});

test('what we wrote round-trips', () => {
  const rows = [{ id: 'a', name: 'St. Mark', city: 'Fairfax' }, { id: 'b', name: 'St. Mary', city: null }];
  const parsed = parseChurchCache<typeof rows[number]>(serializeChurchCache(rows, NOW));
  assert.deepEqual(parsed, { fetchedAt: NOW, rows });
});

test('anything that is not our shape is no cache at all', () => {
  assert.equal(parseChurchCache(null), null);
  assert.equal(parseChurchCache(''), null);
  assert.equal(parseChurchCache('not json'), null);
  assert.equal(parseChurchCache('[]'), null);
  assert.equal(parseChurchCache('{"rows":[]}'), null);
  assert.equal(parseChurchCache('{"fetchedAt":"yesterday","rows":[]}'), null);
  assert.equal(parseChurchCache(JSON.stringify({ fetchedAt: NOW, rows: {} })), null);
  assert.equal(parseChurchCache(JSON.stringify({ fetchedAt: NOW, rows: [{ id: 1, name: 'x' }] })), null);
  assert.equal(parseChurchCache(JSON.stringify({ fetchedAt: NOW, rows: [{ id: 'a' }] })), null);
});

test('an empty list is a valid cache (a project with no churches is not an error)', () => {
  assert.deepEqual(parseChurchCache(JSON.stringify({ fetchedAt: NOW, rows: [] })), { fetchedAt: NOW, rows: [] });
});
