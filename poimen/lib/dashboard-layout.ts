import AsyncStorage from '@react-native-async-storage/async-storage';
import { S } from '@/lib/i18n';

// The top "vital tile" pair (confession + canon) is always shown — like Activity Rings in Apple Fitness.
// The sections below are fully customizable.

export type SectionId = 'vitals' | 'journey' | 'feasts' | 'foc';

export interface SectionDef {
  label: string;
  icon: string;
}

// The names live in the dictionary (home.customize.sections), keyed by id.
const LABELS = S.home.customize.sections;

export const SECTION_DEFS: Record<SectionId, SectionDef> = {
  vitals:  { label: LABELS.vitals,  icon: '◉' },
  journey: { label: LABELS.journey, icon: '◎' },
  feasts:  { label: LABELS.feasts,  icon: '⊕' },
  foc:     { label: LABELS.foc,     icon: '◈' },
};

export const DEFAULT_SECTIONS: SectionId[] = ['vitals', 'journey', 'feasts', 'foc'];

const STORAGE_KEY = 'poimen_dashboard_sections_v1';

export async function loadSections(): Promise<SectionId[]> {
  try {
    const raw = await AsyncStorage.getItem(STORAGE_KEY);
    if (!raw) return DEFAULT_SECTIONS;
    const parsed = JSON.parse(raw) as SectionId[];
    const valid = parsed.filter(id => id in SECTION_DEFS);
    return valid.length ? valid : DEFAULT_SECTIONS;
  } catch {
    return DEFAULT_SECTIONS;
  }
}

export async function saveSections(ids: SectionId[]): Promise<void> {
  try {
    await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(ids));
  } catch {}
}
