// Run: npm test
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { distanceKm, sortByDistance } from './geo.ts';

const fairfax = { latitude: 38.8304818, longitude: -77.357211 };
const arlington = { latitude: 38.8449272, longitude: -77.0844489 };
const westlake = { latitude: 41.462785, longitude: -81.9059449 };

test('distance between two nearby churches is about right', () => {
  const km = distanceKm(fairfax, arlington);
  assert.ok(km > 23 && km < 25, `got ${km}`);
  assert.equal(distanceKm(fairfax, fairfax), 0);
});

test('nearest church comes first', () => {
  const churches = [
    { name: 'Westlake', ...westlake },
    { name: 'Arlington', ...arlington },
    { name: 'Fairfax', ...fairfax },
  ];
  const here = { latitude: 38.85, longitude: -77.1 }; // near Arlington
  assert.deepEqual(sortByDistance(churches, here).map(c => c.name), ['Arlington', 'Fairfax', 'Westlake']);
});

test('churches without coordinates stay in the list, alphabetically, at the end', () => {
  const churches = [
    { name: 'Zeta', latitude: null, longitude: null },
    { name: 'Westlake', ...westlake },
    { name: 'Alpha', latitude: null, longitude: null },
  ];
  assert.deepEqual(sortByDistance(churches, fairfax).map(c => c.name), ['Westlake', 'Alpha', 'Zeta']);
});

test('does not change the list it was given', () => {
  const churches = [{ name: 'B', ...westlake }, { name: 'A', ...fairfax }];
  sortByDistance(churches, fairfax);
  assert.deepEqual(churches.map(c => c.name), ['B', 'A']);
});

import { rankByDistance } from './geo.ts';

test('rankByDistance carries the distance and keeps unplaced rows last', () => {
  const churches = [
    { name: 'Zeta', latitude: null, longitude: null },
    { name: 'Westlake', ...westlake },
    { name: 'Arlington', ...arlington },
    { name: 'Alpha', latitude: null, longitude: null },
  ];
  const ranked = rankByDistance(churches, fairfax);
  assert.deepEqual(ranked.map(r => r.item.name), ['Arlington', 'Westlake', 'Alpha', 'Zeta']);
  assert.ok(ranked[0].km! > 23 && ranked[0].km! < 25);
  assert.ok(ranked[1].km! > 400);
  assert.equal(ranked[2].km, null);
  assert.equal(ranked[3].km, null);
  assert.deepEqual(churches.map(c => c.name), ['Zeta', 'Westlake', 'Arlington', 'Alpha'], 'input not mutated');
});

test('rows on one shared centroid come out alphabetical', () => {
  const cairo = { latitude: 30.064741, longitude: 31.24951 };
  const churches = ['St. Mina', 'Archangel Michael', 'St. Mary', 'St. George'].map(name => ({ name, ...cairo }));
  const ranked = rankByDistance(churches, { latitude: 30.1, longitude: 31.3 });
  assert.deepEqual(ranked.map(r => r.item.name), ['Archangel Michael', 'St. George', 'St. Mary', 'St. Mina']);
  assert.ok(ranked.every(r => r.km === ranked[0].km));
});
