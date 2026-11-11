// lib/i18n/index.ts
// The app's language, decided once when the JS starts.
//
// Like the palette (lib/theme.ts), the language is fixed for the life of the
// JS: screen modules read `S`, `fonts` and layout direction as they load, so a
// change is saved and the app reloads. Unlike the palette it is read
// SYNCHRONOUSLY, here, before any other module can ask for a string:
// expo-router evaluates every route module at startup, and a table built at
// module scope (`const TABS = [{ label: S.home.title }]`) would otherwise
// freeze in English on native while AsyncStorage was still being read. Web
// reads localStorage; native reads expo-secure-store's synchronous getter,
// which is already in the binary.
//
// With no saved choice the device language decides: Arabic devices open in
// Arabic, everything else in English.
//
// What is NOT translated: scripture and the Agpeya's prayers. Those are shown
// in the English the app already carries until an Arabic text from a named
// source is added; the app never generates scripture.

import { I18nManager, NativeModules, Platform, type TextStyle, type ViewStyle } from 'react-native';
import * as SecureStore from 'expo-secure-store';
import { en } from './en';
import { ar } from './ar';
import {
  fmt, pluralFor, westernDigits, langFromLocale, parseLang,
  type Lang, type Localized, type PluralForms,
} from './core';
import { reloadApp } from '../reload';

export { fmt };
export type { Lang, PluralForms };
export type Strings = Localized<typeof en>;

const LANG_KEY = 'poimen.lang';
const RELOAD_KEY = 'poimen.lang.directionReload';

function readStoredLang(): Lang | null {
  try {
    if (Platform.OS === 'web') {
      return typeof localStorage === 'undefined' ? null : parseLang(localStorage.getItem(LANG_KEY));
    }
    return parseLang(SecureStore.getItem(LANG_KEY));
  } catch { return null; }
}

// iOS reports through Intl only the languages the app bundle declares
// (CFBundleLocalizations in app.json, which needs a native build). The
// device's own ordered list in AppleLanguages is read first, so a phone set to
// Arabic is recognised on a binary built before that declaration too.
function deviceLocale(): string | undefined {
  try {
    if (Platform.OS === 'web' && typeof navigator !== 'undefined' && navigator.language) return navigator.language;
    if (Platform.OS === 'ios') {
      const first = NativeModules.SettingsManager?.settings?.AppleLanguages?.[0];
      if (typeof first === 'string' && first) return first;
    }
    return Intl.DateTimeFormat().resolvedOptions().locale;
  } catch { return undefined; }
}

export const lang: Lang = readStoredLang() ?? langFromLocale(deviceLocale());
export const isRTL = lang === 'ar';

// The strings for this session. Plain object, typed from the English files.
export const S: Strings = lang === 'ar' ? ar : en;

// Each language's own name for itself, for the switch.
export const LANGUAGE_NAMES: Record<Lang, string> = { en: 'English', ar: 'العربية' };

// ─── Layout direction ────────────────────────────────────────────────────────
// Web: `dir` on <html>, which every element (including modal portals) inherits.
// Native: React Native's own switch, which only takes effect on the next start
// of the app — so a mismatch found here is corrected and the app reloads once
// (settleLayoutDirection below). The root view also sets `direction`, which
// lays rows out correctly even in the one session before that reload lands.

let directionPending = false;

if (Platform.OS === 'web') {
  if (typeof document !== 'undefined') {
    document.documentElement.lang = lang;
    document.documentElement.dir = isRTL ? 'rtl' : 'ltr';
  }
} else {
  try {
    if (I18nManager.isRTL !== isRTL) {
      I18nManager.allowRTL(isRTL);
      I18nManager.forceRTL(isRTL);
      directionPending = true;
    } else {
      SecureStore.deleteItemAsync(RELOAD_KEY).catch(() => {});
    }
  } catch {}
}

// A view-level direction override. Native lays out with `direction`;
// react-native-web rejects that key and spells the same CSS `writingDirection`.
export function directionStyle(dir: 'ltr' | 'rtl'): ViewStyle {
  return Platform.OS === 'web' ? ({ writingDirection: dir } as ViewStyle) : { direction: dir };
}

// On web the page's own `dir` already covers the whole tree.
export const rootDirectionStyle: ViewStyle = Platform.OS === 'web'
  ? { flex: 1 }
  : { flex: 1, ...directionStyle(isRTL ? 'rtl' : 'ltr') };

// True on the launch that settleLayoutDirection will restart (the native
// direction does not match the language yet). Things that should happen once
// per opening of the app, such as the Face ID prompt, wait for the restart.
export function willReloadForDirection(): boolean {
  if (!directionPending) return false;
  try { return SecureStore.getItem(RELOAD_KEY) !== lang; } catch { return false; }
}

// Called once by the root layout. Reloads at most once per language, so a
// platform that only applies the direction on a cold start cannot loop.
export async function settleLayoutDirection(): Promise<void> {
  if (!directionPending) return;
  directionPending = false;
  try {
    if (SecureStore.getItem(RELOAD_KEY) === lang) return;
    SecureStore.setItem(RELOAD_KEY, lang);
  } catch { return; }
  await reloadApp();
}

// Saves the choice and restarts the JS. Resolves:
//  · true      — reloading (or nothing to change);
//  · false     — saved, but the app could not reload itself: ask the person
//                to reopen it;
//  · 'failed'  — the choice could not be saved: nothing changed.
export async function setLanguage(next: Lang): Promise<boolean | 'failed'> {
  if (next === lang) return true;
  try {
    if (Platform.OS === 'web') localStorage.setItem(LANG_KEY, next);
    else {
      SecureStore.setItem(LANG_KEY, next);
      I18nManager.allowRTL(next === 'ar');
      I18nManager.forceRTL(next === 'ar');
      SecureStore.setItem(RELOAD_KEY, next);
    }
  } catch { return 'failed'; }
  return reloadApp();
}

// ─── Formatting ──────────────────────────────────────────────────────────────

export function plural(forms: PluralForms, n: number, vars?: Record<string, string | number>): string {
  return pluralFor(lang, forms, n, vars);
}

// Egyptian Arabic names the Gregorian months يناير, فبراير … which is what a
// Coptic congregation reads; digits are kept Western to match the rest of the UI.
const DATE_LOCALE = lang === 'ar' ? 'ar-EG' : 'en-US';

export function fmtDate(d: Date, opts?: Intl.DateTimeFormatOptions): string {
  try { return westernDigits(d.toLocaleDateString(DATE_LOCALE, opts)); }
  catch { return d.toLocaleDateString(undefined, opts); }
}

export function fmtTime(d: Date, opts: Intl.DateTimeFormatOptions = { hour: 'numeric', minute: '2-digit' }): string {
  try { return westernDigits(d.toLocaleTimeString(DATE_LOCALE, opts)); }
  catch { return d.toLocaleTimeString(undefined, opts); }
}

export function fmtNumber(n: number): string {
  try { return westernDigits(n.toLocaleString(DATE_LOCALE)); } catch { return String(n); }
}

// ─── Direction-aware glyphs and styles ───────────────────────────────────────

// "Back" points to where the previous screen is, which is the right-hand side
// in Arabic. Use these instead of typing ‹ › ← → in a screen.
// The chevrons are "mirrored" characters: inside a right-to-left run a
// renderer draws ‹ as › and the reverse. So the Arabic ones are wrapped in a
// left-to-right isolate (U+2066 … U+2069), which keeps each drawn exactly as
// written without changing the direction of the label around it.
export const GLYPH = isRTL
  ? { back: '\u2066›\u2069', forward: '\u2066‹\u2069', arrowBack: '→', arrowForward: '←' }
  : { back: '‹', forward: '›', arrowBack: '←', arrowForward: '→' };

// For a block that stays in English inside the Arabic UI (scripture, Agpeya
// text): left-to-right and flush left. On native "right" is the value that
// lands on the left once React Native mirrors alignment for RTL.
export const ltrText: TextStyle = !isRTL
  ? {}
  : Platform.OS === 'web'
    ? { writingDirection: 'ltr', textAlign: 'left' }
    : { writingDirection: 'ltr', textAlign: 'right' };
