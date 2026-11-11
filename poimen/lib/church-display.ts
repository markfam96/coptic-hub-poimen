// lib/church-display.ts
// How a church is shown and searched: address lines, nickname, distance, the
// unit a member expects, and the one search key the picker matches on.
//
// Import-free on purpose: lib/db/profiles.ts pulls in the Supabase client,
// which the test runner cannot resolve, so formatChurchAddress used to be
// reimplemented inside its own test and the two drifted apart. Everything
// here is imported by the real screens AND by lib/church-display.test.ts.

// The directory feeds the picker with 59 countries; the app stores ISO-2
// (the existing convention — 'US' default, and what Nominatim's countrycodes
// takes in lib/geocode.ts). Members read names, not codes, so the code is
// rendered through this table. An unknown code is shown as-is rather than
// hidden: a wrong label is better than a church with no country.
export const COUNTRY_NAMES: Record<string, string> = {
  AE: 'United Arab Emirates', AT: 'Austria', AU: 'Australia', BE: 'Belgium', BG: 'Bulgaria',
  BM: 'Bermuda', BO: 'Bolivia', BR: 'Brazil', CA: 'Canada', CD: 'DR Congo', CH: 'Switzerland',
  CI: "Côte d'Ivoire", CN: 'China', CY: 'Cyprus', CZ: 'Czechia', DE: 'Germany', DK: 'Denmark',
  DO: 'Dominican Republic', EG: 'Egypt', ES: 'Spain', ET: 'Ethiopia', FJ: 'Fiji', FR: 'France',
  GB: 'United Kingdom', GH: 'Ghana', GR: 'Greece', HK: 'Hong Kong', HU: 'Hungary', IE: 'Ireland',
  IL: 'Israel', IT: 'Italy', JO: 'Jordan', JP: 'Japan', KE: 'Kenya', KN: 'Saint Kitts and Nevis',
  KR: 'South Korea', KW: 'Kuwait', LB: 'Lebanon', LY: 'Libya', MT: 'Malta', MX: 'Mexico',
  MY: 'Malaysia', NA: 'Namibia', NG: 'Nigeria', NL: 'Netherlands', NZ: 'New Zealand', OM: 'Oman',
  PY: 'Paraguay', QA: 'Qatar', RO: 'Romania', SA: 'Saudi Arabia', SD: 'Sudan', SE: 'Sweden',
  SG: 'Singapore', TG: 'Togo', TH: 'Thailand', TR: 'Türkiye', TW: 'Taiwan', TZ: 'Tanzania',
  UG: 'Uganda', US: 'United States', ZA: 'South Africa', ZM: 'Zambia', ZW: 'Zimbabwe',
};

export function countryName(code: string | null | undefined): string {
  const c = (code ?? '').trim().toUpperCase();
  return COUNTRY_NAMES[c] ?? c;
}

// US rows store USPS codes (matching the hand-entered VA/OH rows and the
// admin form's two-letter field). Only the "in {state}" precision label needs
// the name back, so the reverse map lives here and nowhere else.
const US_STATE_NAMES: Record<string, string> = {
  AL: 'Alabama', AK: 'Alaska', AZ: 'Arizona', AR: 'Arkansas', CA: 'California', CO: 'Colorado',
  CT: 'Connecticut', DE: 'Delaware', DC: 'District of Columbia', FL: 'Florida', GA: 'Georgia',
  HI: 'Hawaii', ID: 'Idaho', IL: 'Illinois', IN: 'Indiana', IA: 'Iowa', KS: 'Kansas', KY: 'Kentucky',
  LA: 'Louisiana', ME: 'Maine', MD: 'Maryland', MA: 'Massachusetts', MI: 'Michigan', MN: 'Minnesota',
  MS: 'Mississippi', MO: 'Missouri', MT: 'Montana', NE: 'Nebraska', NV: 'Nevada', NH: 'New Hampshire',
  NJ: 'New Jersey', NM: 'New Mexico', NY: 'New York', NC: 'North Carolina', ND: 'North Dakota',
  OH: 'Ohio', OK: 'Oklahoma', OR: 'Oregon', PA: 'Pennsylvania', RI: 'Rhode Island', SC: 'South Carolina',
  SD: 'South Dakota', TN: 'Tennessee', TX: 'Texas', UT: 'Utah', VT: 'Vermont', VA: 'Virginia',
  WA: 'Washington', WV: 'West Virginia', WI: 'Wisconsin', WY: 'Wyoming', VI: 'Virgin Islands',
};

export interface ChurchLike {
  name?: string | null;
  nickname?: string | null;
  // Legacy free-text address, kept for rows entered before the structured
  // fields existed. Readers fall back to it.
  address?: string | null;
  address_line1?: string | null;
  address_line2?: string | null;
  city?: string | null;
  state?: string | null;
  zip?: string | null;
  country?: string | null;
  geo_precision?: string | null;
}

const clean = (v: string | null | undefined) => (v ?? '').trim();

// One line per address, whichever shape the row is in. Structured fields win;
// a row that predates them falls back to its free text. Used for display and
// for the picker's search, so what you see is what you can search on. The
// country is hidden for the US (the hand-entered rows and most members) and
// named for everyone else — "Shoubra, Cairo · Egypt", not "· EG".
export function formatChurchAddress(c: ChurchLike | null | undefined): string {
  if (!c) return '';
  const street = [clean(c.address_line1), clean(c.address_line2)].filter(Boolean).join(', ');
  const locality = [clean(c.city), clean(c.state), clean(c.zip)].filter(Boolean).join(', ');
  const country = clean(c.country).toUpperCase();
  const structured = [street, locality, country && country !== 'US' ? countryName(country) : '']
    .filter(Boolean).join(' · ');
  return structured || clean(c.address);
}

// The short form under a chosen church: city and state, with the country
// when it is not the US. Two parishes can share a name (STSA Leesburg and
// Arlington), and this is the line that tells them apart at a glance.
export function formatChurchLocality(c: ChurchLike | null | undefined): string {
  if (!c) return '';
  const locality = [clean(c.city), clean(c.state)].filter(Boolean).join(', ');
  const country = clean(c.country).toUpperCase();
  return [locality, country && country !== 'US' ? countryName(country) : ''].filter(Boolean).join(' · ');
}

// The directory's nickname is how locals tell twins apart ("St. Mary —
// Bahtim" vs "St. Mary — Bigam"). When it merely repeats the city, or the
// name already carries it ("St. Mark … of Washington DC" · Washington DC),
// it adds nothing to the row, so it is dropped.
export function displayNickname(c: ChurchLike | null | undefined): string | null {
  const nick = clean(c?.nickname);
  if (!nick) return null;
  const lower = nick.toLowerCase();
  if (lower === clean(c?.city).toLowerCase()) return null;
  if (clean(c?.name).toLowerCase().includes(lower)) return null;
  return nick;
}

// Coordinates the directory could only place at a city or state centroid
// must say so, or "0.3 mi" to the middle of Cairo reads as the church.
export function precisionLabel(c: ChurchLike | null | undefined): string | null {
  const p = clean(c?.geo_precision).toLowerCase();
  if (p === 'city') {
    const city = clean(c?.city);
    return city ? `near ${city}` : null;
  }
  if (p === 'state') {
    const raw = clean(c?.state);
    if (!raw) return null;
    const name = clean(c?.country).toUpperCase() === 'US' ? (US_STATE_NAMES[raw.toUpperCase()] ?? raw) : raw;
    return `in ${name}`;
  }
  return null;
}

export type DistanceUnit = 'mi' | 'km';

const KM_PER_MILE = 1.609344;

// Thousands separators by hand so the output is the same on every runtime —
// Hermes and the test runner do not agree on toLocaleString.
function groupThousands(n: number): string {
  return String(n).replace(/\B(?=(\d{3})+(?!\d))/g, ',');
}

// "2.3 mi" / "14 km" / "1,931 km"; below a tenth it says so rather than
// rounding to 0. The tilde marks a centroid, not a building.
export function formatDistance(km: number, unit: DistanceUnit, approximate = false): string {
  const value = unit === 'mi' ? km / KM_PER_MILE : km;
  const prefix = approximate ? '~' : '';
  if (value < 0.1) return `< 0.1 ${unit}`;
  if (value < 10) return `${prefix}${value.toFixed(1)} ${unit}`;
  return `${prefix}${groupThousands(Math.round(value))} ${unit}`;
}

// Countries that give road distances in miles.
const MILE_COUNTRIES = new Set(['US', 'GB', 'LR', 'MM']);

// The locale's region decides the unit; a locale with no region (Hermes can
// report a bare "en") falls back to the country of the nearest church, and
// then to kilometres. A wrong first guess costs one tap on the unit label.
export function distanceUnitFor(locale: string | null | undefined, fallbackCountry: string | null | undefined): DistanceUnit {
  const parts = (locale ?? '').replace(/_/g, '-').split('-').slice(1);
  const region = parts.find(p => /^[A-Za-z]{2}$/.test(p) || /^\d{3}$/.test(p));
  if (region) return MILE_COUNTRIES.has(region.toUpperCase()) ? 'mi' : 'km';
  const country = clean(fallbackCountry).toUpperCase();
  return country && MILE_COUNTRIES.has(country) ? 'mi' : 'km';
}

// Accents are dropped on both sides so "quebec" finds "Québec" and "turkiye"
// finds "Türkiye", and punctuation becomes a space so "St. Mary, Leesburg" —
// the exact string the typed-church path stores and the Home strip hands back
// as a query — still finds St. Mary. What is shown is what is searchable.
export function searchFold(s: string): string {
  return s.normalize('NFD').replace(/[̀-ͯ]/g, '').toLowerCase()
    .replace(/[^\p{L}\p{N}\s]+/gu, ' ');
}

// Built once per row, not once per keystroke: the picker holds ~1,150 rows.
// Everything a member might type to find a parish is in it — name, nickname,
// street, city, state, country code and country name.
export function churchSearchKey(c: ChurchLike): string {
  const country = clean(c.country).toUpperCase();
  return searchFold([
    clean(c.name), clean(c.nickname), clean(c.address_line1), clean(c.address_line2),
    clean(c.city), clean(c.state), clean(c.zip), country, country ? countryName(country) : '',
    clean(c.address),
  ].filter(Boolean).join(' '));
}

// Every whitespace-separated token must appear somewhere in the key, so
// "mary bahtim" narrows to one parish and "mark fairfax" to another.
export function matchesQuery(key: string, query: string): boolean {
  const tokens = searchFold(query).split(/\s+/).filter(Boolean);
  return tokens.every(t => key.includes(t));
}

export const CHURCH_DIRECTORY_URL = 'https://directory.nihov.org/';
export const CHURCH_DIRECTORY_SUGGEST_URL = 'https://directory.nihov.org/church/new';
export const CHURCH_DIRECTORY_CREDIT = 'Church list from the Coptic Orthodox Directory · directory.nihov.org';
