// lib/theme.ts
// Two palettes, one set of token names:
//  · dark  — Nepsis's original midnight navy + gold.
//  · light — the Nepsis "bright Byzantine" scheme: parchment canvas, sepia
//    ink, warm-white cards, liturgical crimson as the primary accent.
// `colors` is a MUTABLE object: applyTheme() swaps every token in place. The
// root layout applies the persisted mode before any route module loads, so
// screen-level StyleSheets (created lazily on first require) pick up the
// right palette. Switching themes therefore requires an app reload — the
// Appearance setting in Profile handles that.
//
// Token role notes that make the light mapping work:
//  · `navy` is both the page background and the text color used on `gold`
//    buttons — in light mode it becomes parchment, which reads correctly on
//    the crimson primary.
//  · `cream` is the primary text color (sepia ink in light mode).

import AsyncStorage from '@react-native-async-storage/async-storage';
import { Platform } from 'react-native';
import { isRTL } from './i18n';

export type ThemeMode = 'dark' | 'light';

const DARK = {
  navy: '#0f1f3d',
  navyMid: '#162847',
  navyDark: 'rgba(10,16,30,0.97)',
  gold: '#c9a84c',
  goldLight: '#e2c97e',
  goldDim: 'rgba(201,168,76,0.15)',
  cream: '#f5f0e8',
  creamDim: 'rgba(245,240,232,0.06)',
  muted: 'rgba(245,240,232,0.58)',
  cardBg: 'rgba(22,40,71,0.85)',
  border: 'rgba(201,168,76,0.2)',
  green: '#5dca87',
  greenBg: 'rgba(39,174,96,0.15)',
  greenCanvas: '#0A2A22',                // full-screen green ground (confession complete)
  yellow: '#f5c842',
  yellowBg: 'rgba(243,156,18,0.15)',
  red: '#e07070',
  redBg: 'rgba(192,57,43,0.12)',
  blue: '#7fc4e8',
  blueBg: 'rgba(41,128,185,0.15)',
  purple: '#c9a0dc',
  // Surfaces & text tiers shared by list rows, panels, and inputs.
  surface: '#0d182e',                    // opaque row/card surface
  panel: 'rgba(10,16,30,0.6)',           // recessed panels & inputs
  textSecond: 'rgba(245,240,232,0.75)',  // secondary text
  faint: 'rgba(245,240,232,0.3)',        // placeholders, faint hairlines
};

const LIGHT: typeof DARK = {
  navy: '#FAF4E8',          // parchment canvas
  navyMid: '#F2E9D5',       // deeper parchment
  navyDark: 'rgba(255,253,247,0.98)',
  gold: '#7A1F2B',          // liturgical crimson — primary accent
  goldLight: '#5C1620',     // deep crimson emphasis
  goldDim: 'rgba(122,31,43,0.10)',
  cream: '#2B2118',         // sepia ink
  creamDim: 'rgba(43,33,24,0.05)',
  muted: '#6E6253',         // muted sepia
  cardBg: '#FFFDF7',        // warm white card
  border: 'rgba(122,31,43,0.14)',
  green: '#1D7A5C',
  greenBg: '#E3F0E8',
  greenCanvas: '#E3F0E8',   // pale mint — sepia ink and crimson stay legible on it
  yellow: '#8A6516',
  yellowBg: '#FBEFD6',
  red: '#7A1F2B',
  redBg: '#F7E4E2',
  blue: '#1F3A63',
  blueBg: 'rgba(31,58,99,0.10)',
  purple: '#5C1620',
  surface: '#FFFDF7',
  panel: '#F2E9D5',
  textSecond: '#6E6253',
  faint: 'rgba(43,33,24,0.35)',
};

export const colors: typeof DARK = { ...DARK };

export function applyTheme(mode: ThemeMode): void {
  Object.assign(colors, mode === 'light' ? LIGHT : DARK);
}

const MODE_KEY = 'poimen.theme';

// Web: localStorage is synchronous, so the persisted theme can be applied at
// module init — before ANY consumer of `colors` evaluates. (On native the
// root layout awaits AsyncStorage and applies the theme before first render;
// lazyThemed below is what makes that stick.)
if (typeof window !== 'undefined' && typeof localStorage !== 'undefined') {
  try { if (localStorage.getItem(MODE_KEY) === 'light') Object.assign(colors, LIGHT); } catch {}
}

// Defers building a color-dependent object (StyleSheet tables, demo data,
// domain metadata) until its first property access. expo-router evaluates
// every route module at startup to build the route tree — before the stored
// theme mode has been read on native — so anything that captures `colors` at
// module scope would freeze the dark palette. Wrapped in lazyThemed, the
// object is built on first render, after applyTheme() has run.
export function lazyThemed<T extends object>(factory: () => T): T {
  let cached: T | undefined;
  const resolve = () => (cached ??= localizeStyles(factory()));
  return new Proxy({} as T, {
    get: (_, p) => (resolve() as any)[p],
    has: (_, p) => p in (resolve() as any),
    ownKeys: () => Reflect.ownKeys(resolve() as any),
    getOwnPropertyDescriptor: (_, p) => {
      const d = Object.getOwnPropertyDescriptor(resolve() as any, p);
      if (d) d.configurable = true;
      return d;
    },
    getPrototypeOf: () => Object.getPrototypeOf(resolve() as any),
  }) as T;
}

// ─── Arabic adjustments to a style table ─────────────────────────────────────
// Every screen builds its StyleSheet through lazyThemed, so the rules that
// Arabic script needs are applied here, once, instead of at 180 call sites:
//
//  · letterSpacing → 0. Tracking pulls joined Arabic letters apart.
//  · italic → normal. Arabic has no italic; a synthesised slant leans the
//    wrong way.
//  · Small text is set a little larger: Arabic letterforms are denser than
//    Latin ones and 10–12px, which Lato carries well, is hard to read.
//  · A fixed width on a text style becomes a minimum width, for the same
//    reason: the Arabic for a short value is often longer.
//  · lineHeight is raised where it was set tight for Latin, because the
//    Arabic faces stand taller and carry marks above and below the line.
//  · On web only, left/right are mirrored (margins, padding, borders, corner
//    radii, offsets, textAlign). React Native does this itself on native when
//    the layout is right-to-left; react-native-web does not.
//
// A style without these keys is returned untouched, and so is every table
// when the app is in English. Inline styles are not seen here: write those
// with marginStart / paddingEnd / start / end so they need no mirroring.

const MIRROR: Record<string, string> = {
  marginLeft: 'marginRight', marginRight: 'marginLeft',
  paddingLeft: 'paddingRight', paddingRight: 'paddingLeft',
  left: 'right', right: 'left',
  borderLeftWidth: 'borderRightWidth', borderRightWidth: 'borderLeftWidth',
  borderLeftColor: 'borderRightColor', borderRightColor: 'borderLeftColor',
  borderTopLeftRadius: 'borderTopRightRadius', borderTopRightRadius: 'borderTopLeftRadius',
  borderBottomLeftRadius: 'borderBottomRightRadius', borderBottomRightRadius: 'borderBottomLeftRadius',
};

const ARABIC_MIN_LINE_HEIGHT = 1.6;

// +2 up to 13px, +1 up to 18px, display sizes unchanged.
export function arabicFontSize(size: number): number {
  if (size <= 13) return size + 2;
  if (size <= 18) return size + 1;
  return size;
}

const isPlainObject = (v: unknown): v is Record<string, unknown> =>
  typeof v === 'object' && v !== null && Object.getPrototypeOf(v) === Object.prototype;

export function localizeStyle<S extends object>(style: S): S {
  if (!isRTL || !isPlainObject(style)) return style;
  const src = style as Record<string, unknown>;
  const mirror = Platform.OS === 'web';
  let out: Record<string, unknown> | null = null;
  const set = (k: string, v: unknown) => { (out ??= { ...src })[k] = v; };

  if (typeof src.letterSpacing === 'number' && src.letterSpacing !== 0) set('letterSpacing', 0);
  if (src.fontStyle === 'italic') set('fontStyle', 'normal');
  if (typeof src.fontSize === 'number' && typeof src.fontFamily === 'string') {
    // A text box sized for "47d" or "20%" cannot hold «47 يومًا» at the larger
    // size: a fixed width becomes a minimum, so the value grows instead of
    // wrapping onto a second line.
    if (typeof src.width === 'number' && src.minWidth === undefined) {
      set('minWidth', src.width);
      delete out!.width;
    }
    const size = arabicFontSize(src.fontSize);
    if (size !== src.fontSize) set('fontSize', size);
    if (typeof src.lineHeight === 'number') {
      const min = Math.round(size * ARABIC_MIN_LINE_HEIGHT);
      if (src.lineHeight < min) set('lineHeight', min);
    }
  }
  if (mirror) {
    if (src.textAlign === 'left') set('textAlign', 'right');
    else if (src.textAlign === 'right') set('textAlign', 'left');
    for (const key of Object.keys(src)) {
      const twin = MIRROR[key];
      if (!twin) continue;
      // Take both values from the ORIGINAL so a pair swaps cleanly.
      set(twin, src[key]);
      if (!(twin in src)) delete out![key];
    }
  }
  return (out ?? src) as S;
}

function localizeStyles<T extends object>(table: T): T {
  if (!isRTL || !isPlainObject(table)) return table;
  let out: Record<string, unknown> | null = null;
  for (const key of Object.keys(table)) {
    const style = (table as Record<string, unknown>)[key];
    if (!isPlainObject(style)) continue;
    const next = localizeStyle(style);
    if (next !== style) (out ??= { ...(table as Record<string, unknown>) })[key] = next;
  }
  return (out ?? table) as T;
}

export async function loadThemeMode(): Promise<ThemeMode> {
  try {
    const raw = await AsyncStorage.getItem(MODE_KEY);
    return raw === 'light' ? 'light' : 'dark';
  } catch { return 'dark'; }
}

export async function saveThemeMode(mode: ThemeMode): Promise<void> {
  try { await AsyncStorage.setItem(MODE_KEY, mode); } catch {}
}

// One set of font roles, two scripts. Screens ask for a role (`fonts.latoBold`)
// and get the face for the app's language, so no screen names a font file.
//  · Cormorant Garamond ↔ Amiri: the display serif and a classical naskh.
//  · Lato ↔ IBM Plex Sans Arabic: the text sans. Arabic is hard to read in a
//    light weight at 11–12px, so each role sits one weight heavier than its
//    Latin twin.
// The Arabic faces are loaded by the root layout only when the app is in
// Arabic. Both include Latin letters and digits, so names and numbers inside
// Arabic text come from the same face.
const LATIN_FONTS = {
  cormorant: 'CormorantGaramond_400Regular',
  cormorantMedium: 'CormorantGaramond_500Medium',
  cormorantLight: 'CormorantGaramond_300Light',
  cormorantItalic: 'CormorantGaramond_400Regular_Italic',
  lato: 'Lato_400Regular',
  latoLight: 'Lato_300Light',
  latoBold: 'Lato_700Bold',
};

const ARABIC_FONTS: typeof LATIN_FONTS = {
  cormorant: 'Amiri_400Regular',
  cormorantMedium: 'Amiri_700Bold',
  cormorantLight: 'Amiri_400Regular',
  cormorantItalic: 'Amiri_400Regular',
  lato: 'IBMPlexSansArabic_500Medium',
  latoLight: 'IBMPlexSansArabic_400Regular',
  latoBold: 'IBMPlexSansArabic_700Bold',
};

export const fonts: Readonly<typeof LATIN_FONTS> = isRTL ? ARABIC_FONTS : LATIN_FONTS;
