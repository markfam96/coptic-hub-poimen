// lib/church-list.ts
// The church list for the picker, on sign-up and in Profile.
//
// ~1,150 rows (≈ 80 KB gzipped) is too much to fetch every time the sheet
// opens and nothing to fetch once a day, so the list is cached on the device
// and served at once; a refresh runs behind it only when the copy is older
// than a day. A failed refresh keeps the stale rows: a member mid-sign-up
// with a flaky connection still gets a list, and the directory is never a
// dependency of creating an account.
//
// AsyncStorage directly, not userStorage: there is no user at sign-up and the
// list is public, so it is device-level like lib/dashboard-layout.ts.
import { useCallback, useEffect, useRef, useState } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { getChurches, type Church } from '@/lib/db';
import { CHURCH_CACHE_KEY, cacheIsFresh, parseChurchCache, serializeChurchCache } from '@/lib/church-list-cache';

export type ChurchListStatus = 'idle' | 'loading' | 'ready' | 'failed';

export interface ChurchListState {
  // null until the first load (from cache or network) finishes.
  churches: Church[] | null;
  status: ChurchListStatus;
  // Set whenever the last network attempt failed, even when stale rows are
  // still being shown — so a screen can say "list may be out of date".
  error: string | null;
  reload: () => void;
}

const LOAD_ERROR = "Couldn't load the church list. Check your connection and try again.";

async function readCache(): Promise<{ fetchedAt: number; rows: Church[] } | null> {
  try { return parseChurchCache<Church>(await AsyncStorage.getItem(CHURCH_CACHE_KEY)); } catch { return null; }
}

async function writeCache(rows: Church[]): Promise<void> {
  try { await AsyncStorage.setItem(CHURCH_CACHE_KEY, serializeChurchCache(rows, Date.now())); } catch {}
}

// `enabled` lets the sign-in screen hold the fetch until the member switches
// to "Create an account": someone signing in should not pay for a list they
// will never open. Once enabled it stays loaded for the component's life.
export function useChurchList(enabled: boolean): ChurchListState {
  const [churches, setChurches] = useState<Church[] | null>(null);
  const [status, setStatus] = useState<ChurchListStatus>('idle');
  const [error, setError] = useState<string | null>(null);
  const live = useRef(true);
  const started = useRef(false);
  const inFlight = useRef(false);

  useEffect(() => {
    live.current = true;
    return () => { live.current = false; };
  }, []);

  const load = useCallback(async (force: boolean) => {
    if (inFlight.current) return;
    inFlight.current = true;
    try {
      let haveRows = false;
      if (!force) {
        const cached = await readCache();
        if (!live.current) return;
        if (cached) {
          haveRows = true;
          setChurches(cached.rows);
          setStatus('ready');
          if (cacheIsFresh(cached.fetchedAt, Date.now())) return;
        }
      }
      // With cached rows on screen the refresh is invisible; only a first
      // load shows a spinner.
      if (!haveRows) setStatus(s => (s === 'ready' ? s : 'loading'));
      try {
        const rows = await getChurches();
        if (!live.current) return;
        setChurches(rows);
        setStatus('ready');
        setError(null);
        void writeCache(rows);
      } catch (e) {
        if (!live.current) return;
        setError(e instanceof Error && e.message ? e.message : LOAD_ERROR);
        // Stale rows beat no rows: the status stays 'ready' so the picker
        // keeps listing them; the error says the refresh did not happen.
        setStatus(s => (s === 'ready' ? s : 'failed'));
      }
    } finally {
      inFlight.current = false;
    }
  }, []);

  useEffect(() => {
    if (!enabled || started.current) return;
    started.current = true;
    void load(false);
  }, [enabled, load]);

  const reload = useCallback(() => {
    started.current = true;
    void load(true);
  }, [load]);

  return { churches, status, error, reload };
}
