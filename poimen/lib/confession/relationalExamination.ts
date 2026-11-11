// lib/confession/relationalExamination.ts
// Nepsis's ORIGINAL examination of conscience (Bishoy's content, preserved
// verbatim from the upstream app): introspective questions organized by
// relationship — Toward God, Toward Others, Toward Self, Omissions. Offered
// alongside the Nepsis senses-based sin catalogue; the user picks their
// preferred style on the Examination screen. Checks from both styles live in
// the same encrypted exam store (the id namespaces don't collide) and merge
// together in the confession notes.

import { S } from '@/lib/i18n';

export type RelationalCategory = 'toward_god' | 'toward_others' | 'toward_self' | 'omissions';

export interface RelationalQuestion {
  id: string;
  category: RelationalCategory;
  text: string;
  note?: string;
}

export const RELATIONAL_CATEGORIES: RelationalCategory[] = [
  'toward_god', 'toward_others', 'toward_self', 'omissions',
];

// The ids and categories are what is stored; the questions themselves come
// from the dictionary (lib/i18n/en/examination.ts) in the app's language.
const Q = S.examination.relational;

export const RELATIONAL_EXAMINATION: RelationalQuestion[] = [
  // ── Toward God ──
  { id: 'rel_god_1', category: 'toward_god', text: Q.godPrayers.text, note: Q.godPrayers.note },
  { id: 'rel_god_2', category: 'toward_god', text: Q.godLiturgy.text },
  { id: 'rel_god_3', category: 'toward_god', text: Q.godFasts.text, note: Q.godFasts.note },
  { id: 'rel_god_4', category: 'toward_god', text: Q.godScripture.text },
  { id: 'rel_god_5', category: 'toward_god', text: Q.godDoubt.text },
  { id: 'rel_god_6', category: 'toward_god', text: Q.godContent.text },
  { id: 'rel_god_7', category: 'toward_god', text: Q.godThankful.text },

  // ── Toward Others ──
  { id: 'rel_oth_1', category: 'toward_others', text: Q.othersAnger.text },
  { id: 'rel_oth_2', category: 'toward_others', text: Q.othersSpeech.text },
  { id: 'rel_oth_3', category: 'toward_others', text: Q.othersHonesty.text },
  { id: 'rel_oth_4', category: 'toward_others', text: Q.othersGenerosity.text },
  { id: 'rel_oth_5', category: 'toward_others', text: Q.othersNeedy.text },

  // ── Toward Self ──
  { id: 'rel_self_1', category: 'toward_self', text: Q.selfPurity.text },
  { id: 'rel_self_2', category: 'toward_self', text: Q.selfHabit.text },
  { id: 'rel_self_3', category: 'toward_self', text: Q.selfBody.text },
  { id: 'rel_self_4', category: 'toward_self', text: Q.selfPride.text },
  { id: 'rel_self_5', category: 'toward_self', text: Q.selfComparison.text },

  // ── Omissions ──
  { id: 'rel_om_1', category: 'omissions', text: Q.omitPrayForOthers.text },
  { id: 'rel_om_2', category: 'omissions', text: Q.omitAlms.text },
  { id: 'rel_om_3', category: 'omissions', text: Q.omitVisiting.text },
  { id: 'rel_om_4', category: 'omissions', text: Q.omitFamily.text },
  { id: 'rel_om_5', category: 'omissions', text: Q.omitGoodWorks.text },
  { id: 'rel_om_6', category: 'omissions', text: Q.omitThanks.text },
];
