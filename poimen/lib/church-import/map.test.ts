// lib/church-import/map.test.ts
// Run: npm test
// The generator's output is pasted into production, so every decision it makes
// (which markers become rows, which code a country or state gets, how a quote
// is escaped, how the four files are cut) is pinned here. The raw feed is not
// committed; the fixtures below carry the real values of the markers the spec
// names (#125 Fairfax, #556 Seoul with its tab) and synthetic rows for volume.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import type { Marker, ChurchRow, SeedMeta } from './map';

// Loaded by URL, as scripts/import-churches.ts does: Node needs the .ts
// extension to find the module and tsc refuses it (TS5097), so a static
// import would add a typecheck error for every run of this file.
const {
  decodeEntities, parseMarkers, validateFeed, countryCode, usStateCode, caProvinceCode, auStateCode,
  toChurchRow, sqlLiteral, renderTuple, chunkRows, renderSeedFiles, nearPairs, distanceMeters,
  COUNTRY_CODES, CA_PROVINCE_CODES, AU_STATE_CODES, US_STATE_CODES, MAX_TUPLE_CHARS, MAX_FILE_BYTES,
}: typeof import('./map') = await import(new URL('./map.ts', import.meta.url).href);

const base: Marker = {
  id: '1', path: '/church/1', name: 'St. Mark Coptic Orthodox Church', nickname: '', street: '1 Main St', street2: '',
  city: 'Fairfax', state: 'Virginia', zip: '22030', country: 'USA', latitude: '38.8', longitude: '-77.3',
  type: 'Church', phone: '', website: '', precision: 'address', diocese_id: '2',
};
const marker = (over: Record<string, string>): Marker => ({ ...base, ...over });

const fairfax125: Marker = marker({
  id: '125', name: 'St. Mark Coptic Orthodox Church of Washington DC', nickname: 'Washington DC',
  street: '11911 Braddock Road', city: 'Fairfax', state: 'Virginia', zip: '22030', country: 'USA',
  latitude: '38.829762', longitude: '-77.358246', precision: 'address',
});
const seoul556: Marker = marker({
  id: '556', name: 'St. Mary Coptic Orthodox Church', street: '170-33 Donggyo-dong\t', city: 'Mapo-gu',
  state: 'Seoul', zip: '121-200', country: 'South Korea', latitude: '37.557045', longitude: '126.926712',
});

const tag = (attrs: Record<string, string>, close = '/>') =>
  `<marker ${Object.entries(attrs).map(([k, v]) => `${k}="${v}"`).join(' ')}${close}`;

test('entities: the feed\'s named and numeric forms decode; a bare & is refused', () => {
  assert.equal(decodeEntities('St. Peter &amp; St. Paul'), 'St. Peter & St. Paul');
  assert.equal(decodeEntities('&quot;Abu Sefein&quot;'), '"Abu Sefein"');
  assert.equal(decodeEntities('Stra&#xDF;e'), 'Straße');
  assert.equal(decodeEntities('Qu&#233;bec'), 'Québec');
  assert.equal(decodeEntities('Cote d&apos;Ivoire'), "Cote d'Ivoire");
  assert.equal(decodeEntities('&lt;b&gt;'), '<b>');
  assert.throws(() => decodeEntities('Peter & Paul'), /undecodable/);
  assert.throws(() => decodeEntities('&nbsp;'), /unknown entity/);
});

test('parseMarkers: any attribute order, with or without a space before />', () => {
  const xml = `<?xml version="1.0"?>\n<markers>${tag({ id: '1', name: 'A', type: 'Church' })}${tag({ type: 'Monastery', name: 'B &amp; C', id: '2' }, ' />')}</markers>`;
  const ms = parseMarkers(xml);
  assert.equal(ms.length, 2);
  assert.deepEqual(ms[0], { id: '1', name: 'A', type: 'Church' });
  assert.deepEqual(ms[1], { id: '2', name: 'B & C', type: 'Monastery' });
});

test('parseMarkers: a marker the reader could not parse fails the run instead of vanishing', () => {
  // The second opening never closes with "/>", so it parses as nothing.
  assert.throws(() => parseMarkers(`<markers>${tag({ id: '1' })}<marker id="2" name="x"></marker></markers>`), /parsed 1 markers but the feed has 2/);
  assert.throws(() => parseMarkers(`<markers><marker id="1" name="a<b"/></markers>`), /raw "<"/);
  assert.throws(() => parseMarkers(`<markers><marker id="1" junk/></markers>`), /unreadable attributes/);
});

test('parseMarkers: a three-marker fixture round-trips through toChurchRow', () => {
  const xml = `<?xml version="1.0"?><markers>${tag(fairfax125)}${tag(seoul556)}${tag(marker({ id: '9', type: 'College', name: 'Pope Shenouda III College' }))}</markers>`;
  const rows = parseMarkers(xml).map(toChurchRow);
  assert.equal(rows.length, 3);
  assert.equal(rows[0]?.source_id, '125');
  assert.equal(rows[1]?.address_line1, '170-33 Donggyo-dong');
  assert.equal(rows[2], null);
});

test('validateFeed: refuses a short feed and anything that is not the XML feed', () => {
  const ok = Array.from({ length: 1000 }, (_, i) => marker({ id: String(i + 1) }));
  assert.doesNotThrow(() => validateFeed('<?xml version="1.0"?><markers/>', ok));
  assert.doesNotThrow(() => validateFeed('﻿<markers/>', ok));
  assert.throws(() => validateFeed('<?xml version="1.0"?><markers/>', ok.slice(0, 999)), /only 999 markers/);
  assert.throws(() => validateFeed('<!DOCTYPE html><html>', ok), /does not start with/);
});

test('countries: all 59 feed names map to ISO-2 and nothing else is guessed', () => {
  assert.equal(Object.keys(COUNTRY_CODES).length, 59);
  for (const code of Object.values(COUNTRY_CODES)) assert.match(code, /^[A-Z]{2}$/);
  assert.equal(countryCode('USA'), 'US');
  assert.equal(countryCode('United Kingdom'), 'GB');
  assert.equal(countryCode('Egypt'), 'EG');
  assert.equal(countryCode('Türkiye'), 'TR');
  assert.equal(countryCode('DR Congo'), 'CD');
  assert.equal(countryCode("Cote d'Ivoire"), 'CI');
  assert.equal(countryCode('Czechia'), 'CZ');
  assert.equal(countryCode('South Korea'), 'KR');
  assert.equal(countryCode('Hong Kong'), 'HK');
  assert.equal(countryCode('Taiwan'), 'TW');
  assert.equal(countryCode('Bermuda'), 'BM');
  assert.equal(countryCode('Saint Kitts and Nevis'), 'KN');
  assert.equal(countryCode('United Arab Emirates'), 'AE');
  assert.throws(() => countryCode('Narnia'), /unknown country "Narnia"/);
  assert.throws(() => countryCode('usa'), /unknown country/);
});

test('states: USPS for the US, two letters for Canada, the usual codes for Australia', () => {
  assert.equal(Object.keys(US_STATE_CODES).length, 52);
  assert.equal(usStateCode('Virginia'), 'VA');
  assert.equal(usStateCode('Virgin Islands'), 'VI');
  assert.equal(usStateCode('District of Columbia'), 'DC');
  assert.equal(caProvinceCode('Québec'), 'QC');
  assert.equal(caProvinceCode('Newfoundland and Labrador'), 'NL');
  assert.deepEqual(new Set(Object.values(CA_PROVINCE_CODES)), new Set(['AB', 'BC', 'MB', 'NB', 'NL', 'NS', 'ON', 'PE', 'QC', 'SK', 'NT', 'NU', 'YT']));
  assert.equal(auStateCode('New South Wales'), 'NSW');
  assert.deepEqual(new Set(Object.values(AU_STATE_CODES)), new Set(['NSW', 'VIC', 'QLD', 'SA', 'WA', 'TAS', 'ACT', 'NT']));
  assert.throws(() => usStateCode('Ontario'), /unknown US state/);
  assert.throws(() => caProvinceCode('Virginia'), /unknown Canadian province/);
  assert.throws(() => auStateCode('Cairo'), /unknown Australian state/);
});

test('toChurchRow: the golden #125 row', () => {
  assert.deepEqual(toChurchRow(fairfax125), {
    source: 'nihov', source_id: '125', kind: 'church', name: 'St. Mark Coptic Orthodox Church of Washington DC',
    nickname: 'Washington DC', address_line1: '11911 Braddock Road', address_line2: null, city: 'Fairfax',
    state: 'VA', zip: '22030', country: 'US', latitude: 38.829762, longitude: -77.358246, geo_precision: 'address',
  });
});

test('toChurchRow: codes for US/CA/AU, verbatim elsewhere, unknown throws', () => {
  assert.equal(toChurchRow(marker({ country: 'USA', state: 'Virgin Islands' }))?.state, 'VI');
  assert.equal(toChurchRow(marker({ country: 'Canada', state: 'Québec' }))?.state, 'QC');
  assert.equal(toChurchRow(marker({ country: 'Australia', state: 'New South Wales' }))?.state, 'NSW');
  assert.equal(toChurchRow(marker({ country: 'Egypt', state: 'Cairo' }))?.state, 'Cairo');
  assert.equal(toChurchRow(marker({ country: 'France', state: 'Île-de-France' }))?.state, 'Île-de-France');
  assert.equal(toChurchRow(marker({ country: 'USA', state: '' }))?.state, null);
  assert.throws(() => toChurchRow(marker({ country: 'USA', state: 'Ontario' })), /unknown US state/);
  assert.throws(() => toChurchRow(marker({ country: 'Canada', state: 'Virginia' })), /unknown Canadian province/);
  assert.throws(() => toChurchRow(marker({ country: 'Australia', state: 'Cairo' })), /unknown Australian state/);
  assert.throws(() => toChurchRow(marker({ country: 'Atlantis' })), /unknown country/);
  assert.throws(() => toChurchRow(marker({ country: '' })), /unknown country/);
});

test('toChurchRow: kind, precision, blanks and the Seoul tab', () => {
  assert.equal(toChurchRow(marker({ type: 'Church' }))?.kind, 'church');
  assert.equal(toChurchRow(marker({ type: 'Monastery' }))?.kind, 'monastery');
  assert.equal(toChurchRow(marker({ type: 'College' })), null);
  assert.equal(toChurchRow(marker({ type: 'School' })), null);
  assert.throws(() => toChurchRow(marker({ type: 'Cathedral' })), /unknown type/);
  assert.equal(toChurchRow(marker({ precision: '' }))?.geo_precision, null);
  assert.equal(toChurchRow(marker({ precision: 'city' }))?.geo_precision, 'city');
  assert.throws(() => toChurchRow(marker({ precision: 'rooftop' })), /unknown precision/);
  const seoul = toChurchRow(seoul556);
  assert.equal(seoul?.address_line1, '170-33 Donggyo-dong');
  assert.equal(seoul?.state, 'Seoul');
  assert.equal(seoul?.country, 'KR');
  const blank = toChurchRow(marker({ nickname: '  ', street: '', street2: ' ', zip: '', city: 'A  B' }));
  assert.equal(blank?.nickname, null);
  assert.equal(blank?.address_line1, null);
  assert.equal(blank?.address_line2, null);
  assert.equal(blank?.zip, null);
  assert.equal(blank?.city, 'A B');
  assert.throws(() => toChurchRow(marker({ name: '' })), /no name/);
  assert.throws(() => toChurchRow(marker({ id: 'abc' })), /numeric id/);
});

test('toChurchRow: coordinates must be finite and on the globe', () => {
  assert.throws(() => toChurchRow(marker({ latitude: '91' })), /latitude/);
  assert.throws(() => toChurchRow(marker({ longitude: '-180.5' })), /longitude/);
  assert.throws(() => toChurchRow(marker({ latitude: '' })), /latitude/);
  assert.throws(() => toChurchRow(marker({ latitude: 'NaN' })), /latitude/);
  assert.throws(() => toChurchRow(marker({ latitude: '1e2' })), /latitude/);
  assert.equal(toChurchRow(marker({ latitude: '-45.881874' }))?.latitude, -45.881874);
});

test('sqlLiteral: quotes doubled, no backslash, null bare, numbers unquoted', () => {
  assert.equal(sqlLiteral("St. Moses The Strong's"), "'St. Moses The Strong''s'");
  assert.equal(sqlLiteral('a\\b'), "'a\\b'");
  assert.equal(sqlLiteral(null), 'null');
  assert.equal(sqlLiteral(38.829762), '38.829762');
  assert.equal(sqlLiteral(-77.3582461234), '-77.358246');
  assert.equal(sqlLiteral(30), '30');
  assert.throws(() => sqlLiteral(Number.NaN), /non-finite/);
});

test('renderTuple: 14 values, one line, the paste rules', () => {
  const row = toChurchRow(fairfax125)!;
  assert.equal(
    renderTuple(row),
    "('nihov','125','church','St. Mark Coptic Orthodox Church of Washington DC','Washington DC','11911 Braddock Road',null,'Fairfax','VA','22030','US',38.829762,-77.358246,'address')",
  );
  const quoted = toChurchRow(marker({ name: "St. Moses The Strong's", street: 'Peter & Paul Str. 1' }))!;
  assert.equal(renderTuple(quoted).includes("Strong''s"), true);
  assert.equal(renderTuple(quoted).includes('\\'), false);
  assert.throws(() => renderTuple({ ...row, name: 'x'.repeat(MAX_TUPLE_CHARS) }), /chars/);
  assert.throws(() => renderTuple({ ...row, name: 'a\\b' }), /forbid/);
  assert.throws(() => renderTuple({ ...row, name: 'a$$b' }), /forbid/);
});

test('chunkRows cuts evenly and keeps order', () => {
  assert.deepEqual(chunkRows([1, 2, 3, 4, 5], 2), [[1, 2], [3, 4], [5]]);
  assert.deepEqual(chunkRows([], 3), []);
  assert.throws(() => chunkRows([1], 0), /chunk size/);
});

test('nearPairs: metres apart or the same name in the same city, never merged', () => {
  const a = toChurchRow(marker({ id: '1', latitude: '44.2312', longitude: '-76.4860', city: 'Kingston', country: 'Canada', state: 'Ontario' }))!;
  const b = toChurchRow(marker({ id: '2', latitude: '44.2312', longitude: '-76.4861', city: 'Kingston', country: 'Canada', state: 'Ontario' }))!;
  const c = toChurchRow(marker({ id: '3', name: 'St. Mary', latitude: '29.07', longitude: '31.09', city: 'Beni Suef', country: 'Egypt', state: 'Beni Suef' }))!;
  const d = toChurchRow(marker({ id: '4', name: 'St. Mary', latitude: '29.076', longitude: '31.09', city: 'Beni Suef', country: 'Egypt', state: 'Beni Suef' }))!;
  const far = toChurchRow(marker({ id: '5', latitude: '30.0', longitude: '31.2', city: 'Cairo', country: 'Egypt', state: 'Cairo' }))!;
  const pairs = nearPairs([a, b, c, d, far], 300);
  assert.equal(pairs.length, 2);
  assert.equal(pairs[0].a.source_id, '1');
  assert.equal(pairs[0].b.source_id, '2');
  assert.ok(pairs[0].meters < 20);
  assert.equal(pairs[1].sameName, true);
  assert.ok(pairs[1].meters > 300 && pairs[1].meters < 1000);
  assert.ok(Math.abs(distanceMeters({ latitude: 0, longitude: 0 }, { latitude: 0, longitude: 1 }) - 111_195) < 50);
});

// 1,151 rows, like the real feed, with the real #125 among them.
function syntheticRows(): ChurchRow[] {
  const rows: ChurchRow[] = [];
  for (let i = 1; i <= 1170; i++) {
    if (rows.length === 1151) break;
    if (i === 125) { rows.push(toChurchRow(fairfax125)!); continue; }
    if (i % 100 === 0) continue;                           // gaps, like the feed's missing ids
    const eg = i % 3 === 0;
    rows.push(toChurchRow(marker({
      id: String(i),
      name: eg ? 'St. Mary Coptic Orthodox Church' : "St. Peter & St. Paul's Coptic Orthodox Church",
      nickname: eg ? 'Bahtim' : '',
      street: eg ? '' : `${i} Some Fairly Long Street Name`, city: eg ? 'Shoubra' : 'Springfield',
      state: eg ? 'Cairo' : 'Virginia', zip: eg ? '' : '22150', country: eg ? 'Egypt' : 'USA',
      latitude: eg ? '30.064741' : String(38 + i / 10000), longitude: eg ? '31.249510' : String(-77 - i / 10000),
      type: i % 13 === 0 ? 'Monastery' : 'Church', precision: eg ? 'city' : 'address',
    }))!);
  }
  return rows;
}

const meta: SeedMeta = {
  stamp: '20261103020000', fetchedOn: '2026-11-02', markerCount: 1158,
  sha256: 'c0ffee'.repeat(10) + 'abcd', excluded: { College: 6, School: 1 },
};

test('renderSeedFiles: as few files as fit the paste cap, one upsert each, guarded, no hidden_at, ordered by id', () => {
  const rows = syntheticRows();
  assert.equal(rows.length, 1151);
  const shuffled = [...rows].reverse();
  const files = renderSeedFiles(shuffled, meta);
  const total = files.length;
  // 1,151 real-length tuples are ~180 KB before headers, so four files cannot
  // each stay under 45 KB; the generator adds files rather than loosening the cap.
  assert.ok(total >= 5 && total <= 8, `expected 5–8 files, got ${total}`);
  assert.deepEqual(files.map(f => f.name), files.map((_, i) => `2026110302000${i + 1}_seed_churches_from_directory_${i + 1}of${total}.sql`));
  let tuples = 0;
  let lastId = 0;
  const last = total - 1;
  for (const [i, f] of files.entries()) {
    assert.equal((f.sql.match(/on conflict \(source, source_id\) do update/g) ?? []).length, 1);
    assert.equal((f.sql.match(/insert into public\.churches/g) ?? []).length, 1);
    assert.match(f.sql, /conname = 'churches_source_unique'/);
    assert.match(f.sql, new RegExp(`^-- File ${i + 1} of ${total}\\.`, 'm'));
    assert.match(f.sql, /1,158 markers\), sha256 of the feed:\n-- c0ffee/);
    assert.match(f.sql, /= 1,151 rows; 6 Colleges and 1 School left out\./);
    for (const l of f.sql.split('\n')) if (l.startsWith('--')) assert.ok(l.length <= 120, `comment line too long: ${l}`);
    // hidden_at is named in the header's prose and the last file's notice, never in the upsert.
    const upsert = /insert into public\.churches[\s\S]*?excluded\.geo_precision;/.exec(f.sql)![0];
    assert.equal(upsert.includes('hidden_at'), false);
    assert.equal(upsert.includes('address,'), false, 'legacy address column is never written');
    assert.equal(f.sql.includes('﻿'), false);
    assert.equal(f.sql.includes('\\'), false);
    assert.ok(new TextEncoder().encode(f.sql).length <= MAX_FILE_BYTES);
    const lines = f.sql.split('\n').filter(l => l.startsWith("  ('nihov',"));
    for (const l of lines) {
      const line = l.trim().replace(/,$/, '');
      assert.ok(line.length <= MAX_TUPLE_CHARS);
      assert.equal(line.split(/,(?=(?:[^']*'[^']*')*[^']*$)/).length, 14, `14 values in ${line}`);
      const id = Number(/^\('nihov','(\d+)'/.exec(line)![1]);
      assert.ok(id > lastId, `ids ascend across files (${id} after ${lastId})`);
      lastId = id;
    }
    tuples += lines.length;
    // $$ belongs to the do-blocks only, never to a tuple.
    for (const l of lines) assert.equal(l.includes('$$'), false);
  }
  assert.equal(tuples, 1151);
  const dataOnly = files.map(f => f.sql.replace(/do \$\$[\s\S]*?end \$\$;/g, ''));
  for (const d of dataOnly) assert.equal(d.includes('$$'), false);
});

test('renderSeedFiles: the golden #125 tuple, and the tail only in the last file', () => {
  const files = renderSeedFiles(syntheticRows(), meta);
  const last = files.length - 1;
  const golden = "  ('nihov','125','church','St. Mark Coptic Orthodox Church of Washington DC','Washington DC','11911 Braddock Road',null,'Fairfax','VA','22030','US',38.829762,-77.358246,'address'),";
  assert.equal(files[0].sql.includes(golden), true);
  for (const [i, f] of files.entries()) {
    assert.equal(f.sql.includes('update public.profiles p set church_name = c.name'), i === last);
    assert.equal(f.sql.includes('as nihov_rows_no_longer_in_feed'), i === last);
  }
  // The report is a result set (the SQL editor shows rows and drops notices).
  assert.equal(files[last].sql.includes('raise notice'), false);
  const notIn = /source_id not in \(([\s\S]*?)\)\s*-- every id in this run/.exec(files[last].sql);
  assert.ok(notIn);
  assert.equal(notIn![1].match(/'\d+'/g)!.length, 1151);
  assert.ok(notIn![1].includes("'125'"));
  const ids = notIn![1].match(/'(\d+)'/g)!.map(x => Number(x.slice(1, -1)));
  assert.equal(ids[ids.length - 1], Math.max(...syntheticRows().map(r => Number(r.source_id))));
  assert.deepEqual(ids, [...ids].sort((a, b) => a - b));
});

test('renderSeedFiles: a small feed is still cut into four files, never fewer', () => {
  const few = syntheticRows().slice(0, 40);
  const files = renderSeedFiles(few, meta);
  assert.equal(files.length, 4);
  const perFile = files.map(f => (f.sql.match(/^  \('nihov',/gm) ?? []).length);
  assert.equal(perFile.reduce((a, b) => a + b, 0), 40);
  // Balanced by bytes, so the last file (which carries the tail) takes fewer rows.
  assert.ok(perFile.every(n => n >= 1), JSON.stringify(perFile));
  assert.ok(perFile[3] <= perFile[0], JSON.stringify(perFile));
  for (const f of files) assert.ok(new TextEncoder().encode(f.sql).length <= MAX_FILE_BYTES);
});

test('renderSeedFiles: twins named in the header, duplicates refused, nothing to seed refused', () => {
  const rows = syntheticRows();
  const twins = nearPairs(rows.slice(0, 2), 1e9);
  const files = renderSeedFiles(rows, { ...meta, twins });
  assert.match(files[0].sql, /Feed-internal near-duplicates kept as-is\n-- \(report them upstream, never merge here\):\n-- 1\/2 Springfield\n/);
  assert.match(renderSeedFiles(rows, meta)[0].sql, /No feed-internal near-duplicates in this run\./);
  assert.throws(() => renderSeedFiles([rows[0], rows[0]], meta), /duplicate source_id/);
  assert.throws(() => renderSeedFiles([], meta), /no rows/);
});
