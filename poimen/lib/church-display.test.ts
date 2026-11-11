// lib/church-display.test.ts
// Run: npm test
// formatChurchAddress backs both the church picker's display AND its search,
// so what a member can see is exactly what they can type. It also has to keep
// showing churches entered before the structured columns existed. This file
// imports the real function (lib/church-display.ts is import-free), so the
// contract and the code can no longer drift apart.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import {
  formatChurchAddress, formatChurchLocality, countryName, COUNTRY_NAMES, displayNickname,
  formatDistance, distanceUnitFor, precisionLabel, churchSearchKey, matchesQuery,
} from './church-display.ts';

const fairfax = { name: 'St. Mark', address_line1: '11911 Braddock Rd', city: 'Fairfax', state: 'VA', zip: '22030', country: 'US' };

test('a structured address renders street, locality and nothing empty', () => {
  assert.equal(formatChurchAddress(fairfax), '11911 Braddock Rd · Fairfax, VA, 22030');
  assert.equal(formatChurchAddress({ address_line1: '1 Main St', address_line2: 'Unit 2', city: 'Akron', state: 'OH' }), '1 Main St, Unit 2 · Akron, OH');
});

test('the US is implied; every other country is named, not coded', () => {
  assert.equal(formatChurchAddress({ city: 'Shoubra', state: 'Cairo', country: 'EG' }), 'Shoubra, Cairo · Egypt');
  assert.equal(formatChurchAddress({ city: 'Toronto', state: 'ON', country: 'CA' }), 'Toronto, ON · Canada');
  assert.equal(formatChurchAddress({ city: 'Somewhere', country: 'XX' }), 'Somewhere · XX');
  assert.equal(formatChurchAddress({ city: 'Fairfax', country: 'us' }), 'Fairfax');
});

test('a legacy row falls back to its free text and an empty row renders empty', () => {
  assert.equal(formatChurchAddress({ address: '123 Main St, Columbus OH' }), '123 Main St, Columbus OH');
  assert.equal(formatChurchAddress({ address: 'old text', city: 'Fairfax' }), 'Fairfax');
  assert.equal(formatChurchAddress({}), '');
  assert.equal(formatChurchAddress(null), '');
  assert.equal(formatChurchAddress({ address: null, city: null, state: null }), '');
});

test('locality is the short line under a chosen church', () => {
  assert.equal(formatChurchLocality(fairfax), 'Fairfax, VA');
  assert.equal(formatChurchLocality({ city: 'Shoubra', state: 'Cairo', country: 'EG' }), 'Shoubra, Cairo · Egypt');
  assert.equal(formatChurchLocality({}), '');
});

test('country codes map to names and unknown codes echo', () => {
  assert.equal(countryName('EG'), 'Egypt');
  assert.equal(countryName('gb'), 'United Kingdom');
  assert.equal(countryName('ZZ'), 'ZZ');
  assert.equal(countryName(null), '');
  for (const code of Object.keys(COUNTRY_NAMES)) assert.match(code, /^[A-Z]{2}$/);
});

test('a nickname that only repeats the city is dropped', () => {
  assert.equal(displayNickname({ nickname: 'Bahtim', city: 'Shoubra El Kheima' }), 'Bahtim');
  assert.equal(displayNickname({ nickname: 'calgary', city: 'Calgary' }), null);
  assert.equal(displayNickname({ name: 'St. Mark Coptic Orthodox Church of Washington DC', nickname: 'Washington DC', city: 'Fairfax' }), null);
  assert.equal(displayNickname({ name: 'St. Mark Coptic Orthodox Church', nickname: 'Washington DC', city: 'Fairfax' }), 'Washington DC');
  assert.equal(displayNickname({ nickname: '  ', city: 'X' }), null);
  assert.equal(displayNickname(null), null);
});

test('distances read the way a person says them', () => {
  assert.equal(formatDistance(3.7, 'mi'), '2.3 mi');
  assert.equal(formatDistance(23.4, 'km'), '23 km');
  assert.equal(formatDistance(1931, 'km'), '1,931 km');
  assert.equal(formatDistance(0.05, 'mi'), '< 0.1 mi');
  assert.equal(formatDistance(3.7, 'mi', true), '~2.3 mi');
  assert.equal(formatDistance(0.05, 'mi', true), '< 0.1 mi');
});

test('the unit follows the locale region, then the nearest church, then km', () => {
  assert.equal(distanceUnitFor('en-US', null), 'mi');
  assert.equal(distanceUnitFor('en_US', null), 'mi');
  assert.equal(distanceUnitFor('en-GB', null), 'mi');
  assert.equal(distanceUnitFor('ar-EG', null), 'km');
  assert.equal(distanceUnitFor('en-Latn-US', null), 'mi');
  assert.equal(distanceUnitFor('en', null), 'km');
  assert.equal(distanceUnitFor('en', 'US'), 'mi');
  assert.equal(distanceUnitFor('en', 'GB'), 'mi');
  assert.equal(distanceUnitFor(undefined, 'AU'), 'km');
  assert.equal(distanceUnitFor(undefined, undefined), 'km');
});

test('centroid rows say where they are approximate', () => {
  assert.equal(precisionLabel({ geo_precision: 'city', city: 'Cairo' }), 'near Cairo');
  assert.equal(precisionLabel({ geo_precision: 'state', state: 'AZ', country: 'US' }), 'in Arizona');
  assert.equal(precisionLabel({ geo_precision: 'state', state: 'Friesland', country: 'NL' }), 'in Friesland');
  assert.equal(precisionLabel({ geo_precision: 'address', city: 'Cairo' }), null);
  assert.equal(precisionLabel({ geo_precision: 'street', city: 'Cairo' }), null);
  assert.equal(precisionLabel({ geo_precision: null, city: 'Cairo' }), null);
  assert.equal(precisionLabel({ geo_precision: 'city', city: '' }), null);
});

test('what is shown is what is searchable, every token must match, accents are ignored', () => {
  const bahtim = { name: 'St. Mary Coptic Orthodox Church', nickname: 'Bahtim', city: 'Shoubra El Kheima', state: 'Kalyoubia', country: 'EG' };
  const bigam = { ...bahtim, nickname: 'Bigam' };
  const quebec = { name: 'St. Mark', city: 'Montréal', state: 'QC', country: 'CA' };
  assert.ok(matchesQuery(churchSearchKey(bahtim), 'mary bahtim'));
  assert.ok(!matchesQuery(churchSearchKey(bigam), 'mary bahtim'));
  assert.ok(matchesQuery(churchSearchKey(bahtim), 'egypt'));
  assert.ok(matchesQuery(churchSearchKey(bahtim), 'kalyoubia'));
  assert.ok(matchesQuery(churchSearchKey(quebec), 'montreal'));
  assert.ok(matchesQuery(churchSearchKey(quebec), 'canada mark'));
  assert.ok(matchesQuery(churchSearchKey(quebec), '   '));
  assert.ok(matchesQuery(churchSearchKey(fairfax), formatChurchAddress(fairfax).split(' · ')[0]));
  assert.ok(matchesQuery(churchSearchKey(fairfax), '22030'));
  assert.ok(matchesQuery(churchSearchKey(fairfax), 'fairfax va'));
  assert.ok(matchesQuery(churchSearchKey({ name: 'St. Mary', address: '400 Broadway, Columbus OH' }), 'broadway'));
  assert.ok(!matchesQuery(churchSearchKey({ name: 'St. Mary', address: '400 Broadway, Columbus OH' }), 'toledo'));
  // Punctuation on either side is not a character to match on.
  const leesburg = { name: 'St. Timothy & St. Athanasius Coptic Orthodox Church', city: 'Leesburg', state: 'VA', country: 'US' };
  assert.ok(matchesQuery(churchSearchKey(leesburg), 'St. Timothy, Leesburg'));
  assert.ok(matchesQuery(churchSearchKey({ name: "St. Mary's Coptic Orthodox Church" }), "st mary's"));
  assert.ok(matchesQuery(churchSearchKey({ name: 'St. Mary Coptic Orthodox Church' }), "St. Mary's"));
});
