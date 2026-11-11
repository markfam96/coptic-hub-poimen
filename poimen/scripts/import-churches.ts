// scripts/import-churches.ts
// Turns a saved copy of the Coptic Orthodox Directory's map feed into the
// seed migrations (as many files as fit the paste cap). Never fetches: the feed
// is downloaded by a person (the terms ask for a considerate human and the git
// diff is the safety net), checked here, and written as SQL that Bishoy pastes.
//
//   cd poimen
//   curl -A 'Nepsis church import (+https://directory.nihov.org/feedback)' \
//        -o map_xml.xml https://directory.nihov.org/report/map_xml.php
//   npm run import:churches -- --in map_xml.xml --out-dir supabase/migrations --stamp 20261103020000
//
// Keep the SAME --stamp on a refresh: the generated files are replaced in
// place (every *_seed_churches_from_directory_*of*.sql in --out-dir is removed
// first), so git shows what changed in the directory instead of five new files.
// map_xml.xml is gitignored; the headers carry its date, count and SHA-256.
//
// Options: --in <file> --out-dir <dir> --stamp <YYYYMMDDHHMMSS> [--fetched <YYYY-MM-DD>]
// --fetched defaults to the input file's modification date. Exit code 1 means
// the feed was refused and nothing was written; 2 is a usage error.
// Deferred: a --manual <csv> report matching hand-entered rows to directory
// rows within 150 m (the spec's idea); the three live matches were done by
// hand and adopted by id in 20261103010000.
//
// All decisions live in lib/church-import/map.ts so npm test covers them; this
// file only reads, writes and reports.

import { mkdirSync, readFileSync, readdirSync, statSync, unlinkSync, writeFileSync } from 'node:fs';
import { createHash } from 'node:crypto';
import { join } from 'node:path';

// Node runs this file with its types stripped and resolves the import path
// literally, so it needs the .ts extension — which tsc rejects (TS5097) unless
// allowImportingTsExtensions is on. Importing by URL keeps both happy and the
// typecheck error count where it is.
type MapModule = typeof import('../lib/church-import/map');
import type { ChurchRow } from '../lib/church-import/map';

function arg(argv: string[], name: string): string | undefined {
  const i = argv.indexOf(name);
  return i === -1 ? undefined : argv[i + 1];
}

function usage(msg: string): never {
  console.error(`import-churches: ${msg}`);
  console.error('usage: --in <map_xml.xml> --out-dir <dir> --stamp <YYYYMMDDHHMMSS> [--fetched <YYYY-MM-DD>]');
  process.exit(2);
}

function localDate(d: Date): string {
  const p = (n: number) => String(n).padStart(2, '0');
  return `${d.getFullYear()}-${p(d.getMonth() + 1)}-${p(d.getDate())}`;
}

const fmt = (n: number) => n.toLocaleString('en-US');

async function main(): Promise<void> {
  const map: MapModule = await import(new URL('../lib/church-import/map.ts', import.meta.url).href);
  const argv = process.argv.slice(2);
  const input = arg(argv, '--in') ?? usage('--in is required');
  const outDir = arg(argv, '--out-dir') ?? usage('--out-dir is required');
  const stamp = arg(argv, '--stamp') ?? usage('--stamp is required');
  if (!/^\d{14}$/.test(stamp)) usage(`--stamp must be 14 digits, got ${JSON.stringify(stamp)}`);
  const fetchedOn = arg(argv, '--fetched') ?? localDate(statSync(input).mtime);
  if (!/^\d{4}-\d{2}-\d{2}$/.test(fetchedOn)) usage(`--fetched must be YYYY-MM-DD, got ${JSON.stringify(fetchedOn)}`);

  const raw = readFileSync(input);
  const sha256 = createHash('sha256').update(raw).digest('hex');
  const xml = raw.toString('utf8');

  // Everything below throws on the first thing it does not recognise; the
  // catch at the bottom turns that into exit 1 with no file written.
  const markers = map.parseMarkers(xml);
  map.validateFeed(xml, markers);

  const rows: ChurchRow[] = [];
  const excluded: { id: string; type: string; name: string }[] = [];
  const excludedByType: Record<string, number> = {};
  for (const m of markers) {
    const row = map.toChurchRow(m);
    if (row) rows.push(row);
    else {
      excluded.push({ id: m.id, type: m.type, name: m.name });
      excludedByType[m.type] = (excludedByType[m.type] ?? 0) + 1;
    }
  }

  const twins = map.nearPairs(rows, 300);
  const files = map.renderSeedFiles(rows, { stamp, fetchedOn, markerCount: markers.length, sha256, excluded: excludedByType, twins });

  mkdirSync(outDir, { recursive: true });
  // The generator owns these files: a refresh that changed the split would
  // otherwise leave a stale "last" file with an outdated id list behind.
  for (const old of readdirSync(outDir)) {
    if (/_seed_churches_from_directory_\d+of\d+\.sql$/.test(old)) unlinkSync(join(outDir, old));
  }
  for (const f of files) writeFileSync(join(outDir, f.name), f.sql, 'utf8');

  // The report is what gets pasted into the PR description: it is how a
  // reviewer sees a 60th country, a new twin, or a College that became a
  // Church without opening a 45 KB SQL file.
  console.log(`feed: ${input}`);
  console.log(`  sha256 ${sha256}`);
  console.log(`  fetched ${fetchedOn}, ${fmt(markers.length)} markers, ${fmt(rows.length)} rows imported, ${excluded.length} left out`);
  console.log('');
  console.log('files:');
  for (const f of files) {
    const bytes = Buffer.byteLength(f.sql, 'utf8');
    const tuples = (f.sql.match(/^  \('nihov',/gm) ?? []).length;
    console.log(`  ${join(outDir, f.name)}  ${fmt(tuples)} tuples, ${fmt(bytes)} bytes`);
  }

  const byKind = new Map<string, number>();
  const byCountry = new Map<string, number>();
  for (const r of rows) {
    byKind.set(r.kind, (byKind.get(r.kind) ?? 0) + 1);
    byCountry.set(r.country, (byCountry.get(r.country) ?? 0) + 1);
  }
  console.log('');
  console.log('by kind:');
  for (const [k, n] of [...byKind].sort((a, b) => b[1] - a[1])) console.log(`  ${k.padEnd(10)} ${fmt(n)}`);
  console.log('');
  console.log(`by country (${byCountry.size}):`);
  const countries = [...byCountry].sort((a, b) => b[1] - a[1] || a[0].localeCompare(b[0]));
  for (let i = 0; i < countries.length; i += 6) {
    console.log(`  ${countries.slice(i, i + 6).map(([c, n]) => `${c} ${String(n).padStart(3)}`).join('   ')}`);
  }
  console.log('');
  console.log(`excluded (${excluded.length}):`);
  for (const e of excluded) console.log(`  #${e.id} ${e.type}: ${e.name}`);
  console.log('');
  console.log(`feed-internal twins (< 300 m apart, or same name + city), kept as-is — report upstream, never merge (${twins.length}):`);
  for (const p of twins) {
    const why = p.sameName && p.meters >= 300 ? 'same name + city' : `${Math.round(p.meters)} m`;
    console.log(`  #${p.a.source_id} / #${p.b.source_id}  ${why}  ${p.a.name}${p.a.nickname ? ` (${p.a.nickname})` : ''} / ${p.b.name}${p.b.nickname ? ` (${p.b.nickname})` : ''}, ${p.a.city ?? '?'}, ${p.a.country}`);
  }
}

main().catch((err: unknown) => {
  console.error(`import-churches: refused — ${err instanceof Error ? err.message : String(err)}`);
  console.error('nothing was written.');
  process.exit(1);
});
