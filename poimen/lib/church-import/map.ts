// lib/church-import/map.ts
// Turns the Coptic Orthodox Directory's map feed (map_xml.php) into the seed
// migrations that Bishoy pastes into the SQL editor.
//
// Import-free so every mapping decision is covered by npm test. The output is
// pasted straight into production, where a wrong country code or an unescaped
// quote shows up as a failed paste, not as a review comment. The importer maps,
// it never guesses: anything it does not recognise throws, and
// scripts/import-churches.ts turns that into a non-zero exit with no file written.

export type Marker = Record<string, string>;

export type ChurchKind = 'church' | 'monastery';

// Exactly the columns the seed writes. The legacy free-text `address` is never
// written (readers fall back to it only when these are empty), and hidden_at is
// not here because the seed must never set or clear it.
export interface ChurchRow {
  source: 'nihov';
  source_id: string;
  kind: ChurchKind;
  name: string;
  nickname: string | null;
  address_line1: string | null;
  address_line2: string | null;
  city: string | null;
  state: string | null;
  zip: string | null;
  country: string;
  latitude: number;
  longitude: number;
  geo_precision: string | null;
}

export const SEED_COLUMNS = [
  'source', 'source_id', 'kind', 'name', 'nickname', 'address_line1', 'address_line2',
  'city', 'state', 'zip', 'country', 'latitude', 'longitude', 'geo_precision',
] as const;

// Limits the generator enforces so the files survive a copy-paste into the SQL
// editor: the largest file pasted so far (the baseline) is 41 KB, and the
// longest tuple measured in the feed is 228 characters.
export const MAX_TUPLE_CHARS = 300;
export const MAX_FILE_BYTES = 45 * 1024;
export const MIN_MARKERS = 1000;
export const SEED_FILE_COUNT = 4;

const PRECISIONS = new Set(['address', 'street', 'city', 'state']);

// ── Entities and parsing ─────────────────────────────────────

const NAMED_ENTITIES: Record<string, string> = { amp: '&', lt: '<', gt: '>', quot: '"', apos: "'" };

// The feed escapes "&" as &amp; and every non-ASCII letter as a numeric
// reference, so a bare "&" or an unknown name means the feed changed shape,
// and a guess would silently corrupt a parish name.
export function decodeEntities(s: string): string {
  return s.replace(/&(#[xX][0-9a-fA-F]+|#[0-9]+|[a-zA-Z]+);|&/g, (whole, body: string | undefined) => {
    if (body === undefined) throw new Error(`undecodable "&" in ${JSON.stringify(s)}`);
    if (body[0] === '#') {
      const hex = body[1] === 'x' || body[1] === 'X';
      const cp = parseInt(body.slice(hex ? 2 : 1), hex ? 16 : 10);
      if (!Number.isFinite(cp) || cp <= 0 || cp > 0x10ffff) throw new Error(`bad character reference ${whole} in ${JSON.stringify(s)}`);
      return String.fromCodePoint(cp);
    }
    const named = NAMED_ENTITIES[body];
    if (named === undefined) throw new Error(`unknown entity ${whole} in ${JSON.stringify(s)}`);
    return named;
  });
}

function countOccurrences(hay: string, needle: string): number {
  return hay.split(needle).length - 1;
}

// A deliberately narrow reader for one known shape — self-closing <marker …/>
// elements with double-quoted attributes — rather than an XML parser: there is
// nothing to depend on in an import-free module, and the shape check is the
// point. The parsed count must equal the number of "<marker " openings, so a
// marker the regex could not read fails the run instead of vanishing.
export function parseMarkers(xml: string): Marker[] {
  const expected = countOccurrences(xml, '<marker ');
  const out: Marker[] = [];
  const tag = /<marker\s+([^>]*?)\s*\/>/g;
  const attr = /([A-Za-z_][\w:.-]*)="([^"]*)"/g;
  let m: RegExpExecArray | null;
  while ((m = tag.exec(xml))) {
    const body = m[1];
    const marker: Marker = {};
    let a: RegExpExecArray | null;
    attr.lastIndex = 0;
    while ((a = attr.exec(body))) {
      if (a[2].includes('<')) throw new Error(`raw "<" in attribute ${a[1]} of marker ${marker.id ?? '?'}`);
      marker[a[1]] = decodeEntities(a[2]);
    }
    if (body.replace(attr, '').trim() !== '') throw new Error(`unreadable attributes in <marker ${body}/>`);
    out.push(marker);
  }
  if (out.length !== expected) {
    throw new Error(`parsed ${out.length} markers but the feed has ${expected} "<marker " openings`);
  }
  return out;
}

// The feed the site's own map loads is XML with exactly this root. Anything
// else (an HTML error page, a login wall, a truncated download) must stop the
// run before a single tuple is written. The marker floor catches a feed that
// silently lost most of its rows, which an upsert would not notice.
export function validateFeed(xml: string, markers: Marker[]): void {
  const body = xml.replace(/^﻿/, '').trimStart();
  if (!body.startsWith('<?xml') && !body.startsWith('<markers')) {
    throw new Error(`feed does not start with <?xml or <markers: ${JSON.stringify(body.slice(0, 40))}`);
  }
  if (markers.length < MIN_MARKERS) {
    throw new Error(`only ${markers.length} markers; expected at least ${MIN_MARKERS}`);
  }
}

// ── Codes ────────────────────────────────────────────────────

// The 59 display names the feed uses, mapped to the ISO-2 codes the app stores
// ('US' default since 20260907; Nominatim countrycodes in lib/geocode.ts).
// Explicit so that a 60th country fails the run and is added by a person.
export const COUNTRY_CODES: Record<string, string> = {
  'Australia': 'AU', 'Austria': 'AT', 'Belgium': 'BE', 'Bermuda': 'BM', 'Bolivia': 'BO', 'Brazil': 'BR',
  'Bulgaria': 'BG', 'Canada': 'CA', 'China': 'CN', "Cote d'Ivoire": 'CI', 'Cyprus': 'CY', 'Czechia': 'CZ',
  'Denmark': 'DK', 'Dominican Republic': 'DO', 'DR Congo': 'CD', 'Egypt': 'EG', 'Fiji': 'FJ', 'France': 'FR',
  'Germany': 'DE', 'Ghana': 'GH', 'Greece': 'GR', 'Hong Kong': 'HK', 'Hungary': 'HU', 'Ireland': 'IE',
  'Israel': 'IL', 'Italy': 'IT', 'Japan': 'JP', 'Kenya': 'KE', 'Kuwait': 'KW', 'Malaysia': 'MY',
  'Malta': 'MT', 'Mexico': 'MX', 'Namibia': 'NA', 'Netherlands': 'NL', 'New Zealand': 'NZ', 'Nigeria': 'NG',
  'Oman': 'OM', 'Paraguay': 'PY', 'Qatar': 'QA', 'Romania': 'RO', 'Saint Kitts and Nevis': 'KN',
  'Singapore': 'SG', 'South Africa': 'ZA', 'South Korea': 'KR', 'Spain': 'ES', 'Sudan': 'SD', 'Sweden': 'SE',
  'Switzerland': 'CH', 'Taiwan': 'TW', 'Tanzania': 'TZ', 'Thailand': 'TH', 'Togo': 'TG', 'Türkiye': 'TR',
  'Uganda': 'UG', 'United Arab Emirates': 'AE', 'United Kingdom': 'GB', 'USA': 'US', 'Zambia': 'ZM',
  'Zimbabwe': 'ZW',
};

// USPS, including the two non-states the feed and the app's reverse map use.
export const US_STATE_CODES: Record<string, string> = {
  'Alabama': 'AL', 'Alaska': 'AK', 'Arizona': 'AZ', 'Arkansas': 'AR', 'California': 'CA', 'Colorado': 'CO',
  'Connecticut': 'CT', 'Delaware': 'DE', 'District of Columbia': 'DC', 'Florida': 'FL', 'Georgia': 'GA',
  'Hawaii': 'HI', 'Idaho': 'ID', 'Illinois': 'IL', 'Indiana': 'IN', 'Iowa': 'IA', 'Kansas': 'KS',
  'Kentucky': 'KY', 'Louisiana': 'LA', 'Maine': 'ME', 'Maryland': 'MD', 'Massachusetts': 'MA', 'Michigan': 'MI',
  'Minnesota': 'MN', 'Mississippi': 'MS', 'Missouri': 'MO', 'Montana': 'MT', 'Nebraska': 'NE', 'Nevada': 'NV',
  'New Hampshire': 'NH', 'New Jersey': 'NJ', 'New Mexico': 'NM', 'New York': 'NY', 'North Carolina': 'NC',
  'North Dakota': 'ND', 'Ohio': 'OH', 'Oklahoma': 'OK', 'Oregon': 'OR', 'Pennsylvania': 'PA',
  'Rhode Island': 'RI', 'South Carolina': 'SC', 'South Dakota': 'SD', 'Tennessee': 'TN', 'Texas': 'TX',
  'Utah': 'UT', 'Vermont': 'VT', 'Virgin Islands': 'VI', 'Virginia': 'VA', 'Washington': 'WA',
  'West Virginia': 'WV', 'Wisconsin': 'WI', 'Wyoming': 'WY',
};

export const CA_PROVINCE_CODES: Record<string, string> = {
  'Alberta': 'AB', 'British Columbia': 'BC', 'Manitoba': 'MB', 'New Brunswick': 'NB',
  'Newfoundland and Labrador': 'NL', 'Nova Scotia': 'NS', 'Ontario': 'ON', 'Prince Edward Island': 'PE',
  'Québec': 'QC', 'Quebec': 'QC', 'Saskatchewan': 'SK', 'Northwest Territories': 'NT', 'Nunavut': 'NU',
  'Yukon': 'YT',
};

export const AU_STATE_CODES: Record<string, string> = {
  'New South Wales': 'NSW', 'Victoria': 'VIC', 'Queensland': 'QLD', 'South Australia': 'SA',
  'Western Australia': 'WA', 'Tasmania': 'TAS', 'Australian Capital Territory': 'ACT',
  'Northern Territory': 'NT',
};

function lookup(table: Record<string, string>, name: string, what: string): string {
  const code = table[name];
  if (code === undefined) throw new Error(`unknown ${what} ${JSON.stringify(name)}; add it to lib/church-import/map.ts`);
  return code;
}

export function countryCode(name: string): string {
  return lookup(COUNTRY_CODES, name, 'country');
}
export function usStateCode(name: string): string {
  return lookup(US_STATE_CODES, name, 'US state');
}
export function caProvinceCode(name: string): string {
  return lookup(CA_PROVINCE_CODES, name, 'Canadian province');
}
export function auStateCode(name: string): string {
  return lookup(AU_STATE_CODES, name, 'Australian state');
}

// ── Marker → row ─────────────────────────────────────────────

// Collapsing whitespace also removes the one tab in the feed (id 556's street),
// which would otherwise land in a pasted line and in a member's address.
function clean(v: string | undefined): string | null {
  const s = (v ?? '').replace(/\s+/g, ' ').trim();
  return s === '' ? null : s;
}

function parseCoordinate(raw: string | undefined, limit: number, what: string, id: string): number {
  const s = (raw ?? '').trim();
  const n = Number(s);
  if (!/^-?\d+(\.\d+)?$/.test(s) || !Number.isFinite(n) || Math.abs(n) > limit) {
    throw new Error(`marker ${id}: ${what} ${JSON.stringify(raw)} is not a coordinate`);
  }
  return n;
}

// Codes only where the app already uses them (the hand-entered VA/OH rows and
// the admin form's two-letter field) or where they are universal (AU). Every
// other country's region name is kept verbatim: there is nothing to match it
// against and "Cairo" or "Île-de-France" is what a member reads anyway.
function stateFor(country: string, state: string | null): string | null {
  if (state === null) return null;
  if (country === 'US') return usStateCode(state);
  if (country === 'CA') return caProvinceCode(state);
  if (country === 'AU') return auStateCode(state);
  return state;
}

// null means "not a parish": Colleges and the School are nobody's church, and
// Pope Shenouda III College sits 30 m from St. Mark Arncliffe, a confusable
// twin in a nearest-first list. Monasteries stay — monastics and some faithful
// belong to one.
export function toChurchRow(marker: Marker): ChurchRow | null {
  const id = clean(marker.id);
  if (id === null || !/^\d+$/.test(id)) throw new Error(`marker without a numeric id: ${JSON.stringify(marker)}`);
  const type = clean(marker.type);
  let kind: ChurchKind;
  if (type === 'Church') kind = 'church';
  else if (type === 'Monastery') kind = 'monastery';
  else if (type === 'College' || type === 'School') return null;
  else throw new Error(`marker ${id}: unknown type ${JSON.stringify(marker.type)}`);

  const name = clean(marker.name);
  if (name === null) throw new Error(`marker ${id}: no name`);
  const country = countryCode(clean(marker.country) ?? '');
  const precision = clean(marker.precision);
  if (precision !== null && !PRECISIONS.has(precision)) {
    throw new Error(`marker ${id}: unknown precision ${JSON.stringify(marker.precision)}`);
  }
  return {
    source: 'nihov',
    source_id: id,
    kind,
    name,
    nickname: clean(marker.nickname),
    address_line1: clean(marker.street),
    address_line2: clean(marker.street2),
    city: clean(marker.city),
    state: stateFor(country, clean(marker.state)),
    zip: clean(marker.zip),
    country,
    latitude: parseCoordinate(marker.latitude, 90, 'latitude', id),
    longitude: parseCoordinate(marker.longitude, 180, 'longitude', id),
    geo_precision: precision,
  };
}

// ── SQL ──────────────────────────────────────────────────────

// Only the quote is doubled. The feed has no backslashes, and
// standard_conforming_strings makes one literal anyway, so an escape here
// would be the first thing to go wrong in a paste. Coordinates are written
// with at most six decimals (what the feed carries) so a refresh that only
// re-rounds a number does not change a line.
export function sqlLiteral(v: string | number | null): string {
  if (v === null) return 'null';
  if (typeof v === 'number') {
    if (!Number.isFinite(v)) throw new Error(`non-finite number ${v}`);
    return String(Number(v.toFixed(6)));
  }
  return `'${v.replace(/'/g, "''")}'`;
}

export function renderTuple(row: ChurchRow): string {
  const line = `(${SEED_COLUMNS.map(col => sqlLiteral(row[col])).join(',')})`;
  if (line.length > MAX_TUPLE_CHARS) throw new Error(`tuple for ${row.source_id} is ${line.length} chars: ${line}`);
  if (line.includes('\\') || line.includes('$$') || /[(,]E'/.test(line)) {
    throw new Error(`tuple for ${row.source_id} contains a character the paste rules forbid: ${line}`);
  }
  return line;
}

export function chunkRows<T>(rows: T[], size: number): T[][] {
  if (!Number.isInteger(size) || size < 1) throw new Error(`bad chunk size ${size}`);
  const out: T[][] = [];
  for (let i = 0; i < rows.length; i += size) out.push(rows.slice(i, i + size));
  return out;
}

export function sortByNumericId(rows: ChurchRow[]): ChurchRow[] {
  return [...rows].sort((a, b) => Number(a.source_id) - Number(b.source_id));
}

// ── Twins ────────────────────────────────────────────────────

const EARTH_RADIUS_M = 6_371_000;

export function distanceMeters(a: { latitude: number; longitude: number }, b: { latitude: number; longitude: number }): number {
  const rad = (d: number) => (d * Math.PI) / 180;
  const dLat = rad(b.latitude - a.latitude);
  const dLng = rad(b.longitude - a.longitude);
  const h = Math.sin(dLat / 2) ** 2 + Math.cos(rad(a.latitude)) * Math.cos(rad(b.latitude)) * Math.sin(dLng / 2) ** 2;
  return 2 * EARTH_RADIUS_M * Math.asin(Math.sqrt(h));
}

export interface TwinPair { a: ChurchRow; b: ChurchRow; meters: number; sameName: boolean }

// Reported, never merged: Kingston 646/498 and Calgary 809/801 are a few metres
// apart and Beni Suef 1044/1045 share a name and city 700 m apart, yet each
// pair may well be two real parishes. The pairs go upstream through the
// directory's feedback form; a local merge would be undone by the next refresh.
//
// Distance only counts between two placed rows: 69 Cairo rows sit on one
// city centroid, and a centroid's distance to anything says nothing about the
// building. Same name + city is reported whatever the precision.
const placed = (r: ChurchRow) => r.geo_precision !== 'city' && r.geo_precision !== 'state';

export function nearPairs(rows: ChurchRow[], maxMeters: number): TwinPair[] {
  const out: TwinPair[] = [];
  for (let i = 0; i < rows.length; i++) {
    for (let j = i + 1; j < rows.length; j++) {
      const a = rows[i], b = rows[j];
      const sameName = a.name === b.name && a.city === b.city && a.country === b.country;
      const meters = distanceMeters(a, b);
      if ((meters < maxMeters && placed(a) && placed(b)) || sameName) out.push({ a, b, meters, sameName });
    }
  }
  return out.sort((x, y) => x.meters - y.meters);
}

// ── Seed files ───────────────────────────────────────────────

export interface SeedMeta {
  stamp: string;            // migration timestamp, e.g. 20261103020000
  fetchedOn: string;        // YYYY-MM-DD the feed was downloaded
  markerCount: number;      // every marker in the feed, imported or not
  sha256: string;           // of the raw feed, so a refresh diff can be traced to a download
  excluded: Record<string, number>; // marker type → count left out (College, School)
  twins?: TwinPair[];       // feed-internal pairs to name in the header
}

export const SCHEMA_MIGRATION = '20261103010000_church_directory_columns.sql';

const withCommas = (n: number) => n.toLocaleString('en-US');

function plural(n: number, word: string): string {
  return `${n} ${word}${n === 1 ? '' : 's'}`;
}

// Comment lines stay short enough to read in the SQL editor's paste box.
function wrapComment(text: string, width: number): string[] {
  const lines: string[] = [];
  let line = '';
  for (const word of text.split(' ')) {
    if (line && line.length + 1 + word.length > width) { lines.push(`-- ${line}`); line = word; }
    else line = line ? `${line} ${word}` : word;
  }
  if (line) lines.push(`-- ${line}`);
  return lines;
}

function header(n: number, total: number, rowCount: number, meta: SeedMeta): string {
  const excluded = Object.entries(meta.excluded).filter(([, c]) => c > 0);
  const leftOut = excluded.length
    ? `${excluded.map(([t, c]) => plural(c, t)).join(' and ')} left out.`
    : 'nothing left out.';
  const twins = (meta.twins ?? []).map(p => `${p.a.source_id}/${p.b.source_id} ${p.a.city ?? p.a.name}`);
  const twinLines = twins.length
    ? [`-- 'manual') and hidden_at are never touched. Feed-internal near-duplicates kept as-is`,
       `-- (report them upstream, never merge here):`,
       ...wrapComment(twins.join(', '), 90)]
    : [`-- 'manual') and hidden_at are never touched. No feed-internal near-duplicates in this run.`];
  return [
    `-- GENERATED by scripts/import-churches.ts — do not hand-edit; re-run the script to refresh.`,
    `-- File ${n} of ${total}. Paste ${SCHEMA_MIGRATION} first, then 1..${total} in order`,
    `-- (each file is independently re-runnable and its own migration version; order only`,
    `-- matters for the report at the end of file ${total}).`,
    `-- Source: Coptic Orthodox Directory, https://directory.nihov.org/report/map_xml.php,`,
    `-- fetched ${meta.fetchedOn} (${withCommas(meta.markerCount)} markers), sha256 of the feed:`,
    `-- ${meta.sha256}`,
    `-- Church + Monastery only = ${withCommas(rowCount)} rows; ${leftOut}`,
    `-- Terms (https://nihov.org/terms) allow reading, searching, linking and sharing and forbid`,
    `-- wholesale republication and harvesting contacts: only name, nickname, address parts,`,
    `-- coordinates, kind and precision are here.`,
    `-- Country is ISO-2; US/CA/AU states are postal codes; other states are the directory's names.`,
    `-- Imported rows are directory-owned: a refresh overwrites them. Manual rows (source =`,
    ...twinLines,
    ``,
    `do $$ begin`,
    `  if not exists (select 1 from pg_constraint where conname = 'churches_source_unique') then`,
    `    raise exception 'Apply ${SCHEMA_MIGRATION} before this seed file.';`,
    `  end if;`,
    `end $$;`,
    ``,
  ].join('\n');
}

function insertStatement(rows: ChurchRow[]): string {
  const updates = SEED_COLUMNS.filter(c => c !== 'source' && c !== 'source_id');
  return [
    `insert into public.churches`,
    `  (${SEED_COLUMNS.slice(0, 7).join(', ')},`,
    `   ${SEED_COLUMNS.slice(7).join(', ')})`,
    `values`,
    rows.map(r => `  ${renderTuple(r)}`).join(',\n'),
    `on conflict (source, source_id) do update set`,
    `  ${updates.slice(0, 3).map(c => `${c} = excluded.${c}`).join(', ')},`,
    `  ${updates.slice(3, 5).map(c => `${c} = excluded.${c}`).join(', ')},`,
    `  ${updates.slice(5, 9).map(c => `${c} = excluded.${c}`).join(', ')},`,
    `  ${updates.slice(9).map(c => `${c} = excluded.${c}`).join(', ')};`,
    ``,
  ].join('\n');
}

// Wrapped so no line in the paste runs to thousands of characters.
function idList(ids: string[], perLine: number): string {
  const lines: string[] = [];
  for (let i = 0; i < ids.length; i += perLine) {
    lines.push(`      ${ids.slice(i, i + perLine).map(id => `'${id}'`).join(',')}`);
  }
  return lines.join(',\n');
}

function tail(allRows: ChurchRow[]): string {
  return [
    `-- The denormalised name that the FOC card, link-to-foc and lookup_invite_code`,
    `-- read must follow a renamed parish, or members see a stale name. Intentional:`,
    `-- church_name tracks churches.name whenever church_id is set (the Profile`,
    `-- picker already overwrites it on select). updated_at is not touched.`,
    `update public.profiles p set church_name = c.name`,
    `  from public.churches c`,
    `  where p.church_id = c.id and p.church_name is distinct from c.name;`,
    ``,
    `-- Rows that were imported before but are not in this feed, and the counts.`,
    `-- A result set, not a notice: the SQL editor shows the last statement's rows`,
    `-- and discards notices. Nothing is hidden automatically; decide per row and`,
    `-- set hidden_at by hand.`,
    `select`,
    `  coalesce((`,
    `    select string_agg(source_id || ' ' || name, '; ' order by source_id::int)`,
    `    from public.churches`,
    `    where source = 'nihov' and hidden_at is null`,
    `      and source_id not in (`,
    idList(allRows.map(r => r.source_id), 20),
    `      )   -- every id in this run, one statement`,
    `  ), '(none)') as nihov_rows_no_longer_in_feed,`,
    `  (select count(*) from public.churches) as total,`,
    `  (select count(*) from public.churches where source = 'nihov') as from_directory,`,
    `  (select count(*) from public.churches where source = 'manual') as manual,`,
    `  (select count(*) from public.churches where hidden_at is not null) as hidden;`,
    ``,
  ].join('\n');
}

export interface SeedFile { name: string; sql: string }

const utf8 = (s: string) => new TextEncoder().encode(s).length;

// Cuts the sorted rows into n files of roughly equal size in BYTES, not rows:
// the last file also carries the tail (the profiles sync and the id list of
// the "no longer in the feed" notice), which is several KB on its own.
function splitByBytes(sorted: ChurchRow[], n: number, meta: SeedMeta): ChurchRow[][] {
  const lines = sorted.map(r => utf8(renderTuple(r)) + 4);     // "  " + ",\n"
  const overhead = utf8(header(1, n, sorted.length, meta)) + utf8(insertStatement([]));
  const total = lines.reduce((a, b) => a + b, 0) + n * overhead + utf8(tail(sorted));
  const target = total / n;
  const chunks: ChurchRow[][] = [];
  let from = 0;
  for (let i = 0; i < n - 1; i++) {
    let bytes = overhead;
    let to = from;
    while (to < sorted.length && (to === from || bytes + lines[to] <= target)) { bytes += lines[to]; to++; }
    chunks.push(sorted.slice(from, to));
    from = to;
  }
  chunks.push(sorted.slice(from));
  return chunks.filter(c => c.length > 0);
}

// As few files as will each fit a paste, starting at four, each independently
// idempotent. The cap is the size of the largest file the SQL editor has taken
// so far (the 41 KB baseline), not a guess at its limit, so when the feed
// grows the count grows rather than the cap. The last file also carries the
// profiles.church_name sync and the "no longer in the feed" notice, which need
// every row in place first — hence "paste in order".
export function renderSeedFiles(rows: ChurchRow[], meta: SeedMeta, minFiles = SEED_FILE_COUNT): SeedFile[] {
  if (rows.length === 0) throw new Error('no rows to seed');
  const ids = new Set<string>();
  for (const r of rows) {
    if (ids.has(r.source_id)) throw new Error(`duplicate source_id ${r.source_id}`);
    ids.add(r.source_id);
  }
  const sorted = sortByNumericId(rows);
  let largest = 0;
  for (let n = minFiles; n <= Math.max(minFiles, 24); n++) {
    const chunks = splitByBytes(sorted, n, meta);
    const total = chunks.length;
    const files = chunks.map((chunk, i) => {
      const k = i + 1;
      const sql = header(k, total, sorted.length, meta) + insertStatement(chunk) + (k === total ? `\n${tail(sorted)}` : '');
      if (sql.includes('\uFEFF')) throw new Error(`file ${k} contains a BOM`);
      // Each file is its own migration version (stamp + k): Supabase's
      // migration table keys on the prefix, and five files sharing one would
      // collide there even though the paste workflow would not notice.
      return { name: `${(BigInt(meta.stamp) + BigInt(k)).toString()}_seed_churches_from_directory_${k}of${total}.sql`, sql };
    });
    largest = Math.max(...files.map(f => utf8(f.sql)));
    if (largest <= MAX_FILE_BYTES) return files;
  }
  throw new Error(`even 24 files leave one at ${largest} bytes; the paste limit is ${MAX_FILE_BYTES}`);
}
