// lib/church-list-cache.ts
// The shape and freshness rule of the on-device church list cache. The hook
// that uses it (lib/church-list.ts) imports React and AsyncStorage, which the
// test runner cannot resolve, so the decisions live here, import-free, and
// are covered by lib/church-list-cache.test.ts.

// Device-level, not per user: there is no user at sign-up and the list is
// public, so clearUserStorage rightly leaves it alone. Versioned so a change
// in row shape invalidates it instead of rendering half-filled rows.
export const CHURCH_CACHE_KEY = 'poimen.churches.v1';

// The list changes when Bishoy pastes a refreshed seed, which is a quarterly
// event, not a daily one; a day of staleness costs nothing a member notices.
export const CHURCH_CACHE_TTL_MS = 24 * 60 * 60 * 1000;

export interface ChurchCache<T> {
  fetchedAt: number;
  rows: T[];
}

export function cacheIsFresh(fetchedAt: number, now: number): boolean {
  if (!Number.isFinite(fetchedAt)) return false;
  // A clock set backwards makes fetchedAt lie in the future; treat that as
  // stale so one bad clock cannot pin a list forever.
  if (fetchedAt > now) return false;
  return now - fetchedAt < CHURCH_CACHE_TTL_MS;
}

// Anything that is not exactly what we wrote is treated as no cache. The
// row check is deliberately shallow — id and name are what every reader
// needs — because validating every column here would just duplicate the type.
export function parseChurchCache<T extends { id: string; name: string }>(raw: string | null | undefined): ChurchCache<T> | null {
  if (!raw) return null;
  let parsed: unknown;
  try { parsed = JSON.parse(raw); } catch { return null; }
  if (!parsed || typeof parsed !== 'object') return null;
  const { fetchedAt, rows } = parsed as { fetchedAt?: unknown; rows?: unknown };
  if (typeof fetchedAt !== 'number' || !Number.isFinite(fetchedAt)) return null;
  if (!Array.isArray(rows)) return null;
  const ok = rows.every(r => r && typeof r === 'object'
    && typeof (r as { id?: unknown }).id === 'string'
    && typeof (r as { name?: unknown }).name === 'string');
  if (!ok) return null;
  return { fetchedAt, rows: rows as T[] };
}

export function serializeChurchCache<T>(rows: T[], now: number): string {
  return JSON.stringify({ fetchedAt: now, rows } satisfies ChurchCache<T>);
}
