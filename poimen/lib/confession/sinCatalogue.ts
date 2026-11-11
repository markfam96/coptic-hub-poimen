// src/data/sinCatalogue.ts
// Full examination of conscience catalogue — six categories, Oriental Orthodox tradition.

import type { SinItem } from './types';
import { S } from '@/lib/i18n';

// The ids and categories below are what is stored; the wording comes from the
// dictionary (lib/i18n/en/examination.ts) and follows the app's language.
const L = S.examination.sins;
const C = S.examination.categories;

export const SIN_CATALOGUE: SinItem[] = [
  // ─── Tongue ───────────────────────────────────────────────────────────────────
  {
    id: 'tongue_lying',
    category: 'tongue',
    name: L.tongueLying.name,
    description: L.tongueLying.description,
    scripture: L.tongueLying.scripture,
  },
  {
    id: 'tongue_gossip',
    category: 'tongue',
    name: L.tongueGossip.name,
    description: L.tongueGossip.description,
    scripture: L.tongueGossip.scripture,
  },
  {
    id: 'tongue_judging',
    category: 'tongue',
    name: L.tongueJudging.name,
    description: L.tongueJudging.description,
    scripture: L.tongueJudging.scripture,
  },
  {
    id: 'tongue_swearing',
    category: 'tongue',
    name: L.tongueSwearing.name,
    description: L.tongueSwearing.description,
    scripture: L.tongueSwearing.scripture,
  },
  {
    id: 'tongue_slander',
    category: 'tongue',
    name: L.tongueSlander.name,
    description: L.tongueSlander.description,
    scripture: L.tongueSlander.scripture,
  },
  {
    id: 'tongue_flattery',
    category: 'tongue',
    name: L.tongueFlattery.name,
    description: L.tongueFlattery.description,
    scripture: L.tongueFlattery.scripture,
  },
  {
    id: 'tongue_idle',
    category: 'tongue',
    name: L.tongueIdle.name,
    description: L.tongueIdle.description,
    scripture: L.tongueIdle.scripture,
  },
  {
    id: 'tongue_contention',
    category: 'tongue',
    name: L.tongueContention.name,
    description: L.tongueContention.description,
    scripture: L.tongueContention.scripture,
  },
  {
    id: 'tongue_boasting',
    category: 'tongue',
    name: L.tongueBoasting.name,
    description: L.tongueBoasting.description,
    scripture: L.tongueBoasting.scripture,
  },

  // ─── Thoughts ─────────────────────────────────────────────────────────────────
  {
    id: 'thoughts_pride',
    category: 'thoughts',
    name: L.thoughtsPride.name,
    description: L.thoughtsPride.description,
    scripture: L.thoughtsPride.scripture,
  },
  {
    id: 'thoughts_envy',
    category: 'thoughts',
    name: L.thoughtsEnvy.name,
    description: L.thoughtsEnvy.description,
    scripture: L.thoughtsEnvy.scripture,
  },
  {
    id: 'thoughts_lust',
    category: 'thoughts',
    name: L.thoughtsLust.name,
    description: L.thoughtsLust.description,
    scripture: L.thoughtsLust.scripture,
  },
  {
    id: 'thoughts_anger',
    category: 'thoughts',
    name: L.thoughtsAnger.name,
    description: L.thoughtsAnger.description,
    scripture: L.thoughtsAnger.scripture,
  },
  {
    id: 'thoughts_greed',
    category: 'thoughts',
    name: L.thoughtsGreed.name,
    description: L.thoughtsGreed.description,
    scripture: L.thoughtsGreed.scripture,
  },
  {
    id: 'thoughts_despair',
    category: 'thoughts',
    name: L.thoughtsDespair.name,
    description: L.thoughtsDespair.description,
    scripture: L.thoughtsDespair.scripture,
  },
  {
    id: 'thoughts_vainglory',
    category: 'thoughts',
    name: L.thoughtsVainglory.name,
    description: L.thoughtsVainglory.description,
    scripture: L.thoughtsVainglory.scripture,
  },
  {
    id: 'thoughts_unbelief',
    category: 'thoughts',
    name: L.thoughtsUnbelief.name,
    description: L.thoughtsUnbelief.description,
    scripture: L.thoughtsUnbelief.scripture,
  },
  {
    id: 'thoughts_judgment',
    category: 'thoughts',
    name: L.thoughtsJudgment.name,
    description: L.thoughtsJudgment.description,
    scripture: L.thoughtsJudgment.scripture,
  },

  // ─── Hearing ──────────────────────────────────────────────────────────────────
  {
    id: 'hearing_gossip',
    category: 'hearing',
    name: L.hearingGossip.name,
    description: L.hearingGossip.description,
    scripture: L.hearingGossip.scripture,
  },
  {
    id: 'hearing_bad_music',
    category: 'hearing',
    name: L.hearingBadMusic.name,
    description: L.hearingBadMusic.description,
    scripture: L.hearingBadMusic.scripture,
  },
  {
    id: 'hearing_blasphemy',
    category: 'hearing',
    name: L.hearingBlasphemy.name,
    description: L.hearingBlasphemy.description,
    scripture: L.hearingBlasphemy.scripture,
  },
  {
    id: 'hearing_neglect_word',
    category: 'hearing',
    name: L.hearingNeglectWord.name,
    description: L.hearingNeglectWord.description,
    scripture: L.hearingNeglectWord.scripture,
  },

  // ─── Eyes ─────────────────────────────────────────────────────────────────────
  {
    id: 'eyes_pornography',
    category: 'eyes',
    name: L.eyesPornography.name,
    description: L.eyesPornography.description,
    scripture: L.eyesPornography.scripture,
  },
  {
    id: 'eyes_immodest',
    category: 'eyes',
    name: L.eyesImmodest.name,
    description: L.eyesImmodest.description,
    scripture: L.eyesImmodest.scripture,
  },
  {
    id: 'eyes_violent',
    category: 'eyes',
    name: L.eyesViolent.name,
    description: L.eyesViolent.description,
    scripture: L.eyesViolent.scripture,
  },
  {
    id: 'eyes_envy_gaze',
    category: 'eyes',
    name: L.eyesEnvyGaze.name,
    description: L.eyesEnvyGaze.description,
    scripture: L.eyesEnvyGaze.scripture,
  },
  {
    id: 'eyes_social_media',
    category: 'eyes',
    name: L.eyesSocialMedia.name,
    description: L.eyesSocialMedia.description,
    scripture: L.eyesSocialMedia.scripture,
  },

  // ─── Actions ──────────────────────────────────────────────────────────────────
  {
    id: 'actions_theft',
    category: 'actions',
    name: L.actionsTheft.name,
    description: L.actionsTheft.description,
    scripture: L.actionsTheft.scripture,
  },
  {
    id: 'actions_violence',
    category: 'actions',
    name: L.actionsViolence.name,
    description: L.actionsViolence.description,
    scripture: L.actionsViolence.scripture,
  },
  {
    id: 'actions_fornication',
    category: 'actions',
    name: L.actionsFornication.name,
    description: L.actionsFornication.description,
    scripture: L.actionsFornication.scripture,
  },
  {
    id: 'actions_drunkenness',
    category: 'actions',
    name: L.actionsDrunkenness.name,
    description: L.actionsDrunkenness.description,
    scripture: L.actionsDrunkenness.scripture,
  },
  {
    id: 'actions_gluttony',
    category: 'actions',
    name: L.actionsGluttony.name,
    description: L.actionsGluttony.description,
    scripture: L.actionsGluttony.scripture,
  },
  {
    id: 'actions_disobedience',
    category: 'actions',
    name: L.actionsDisobedience.name,
    description: L.actionsDisobedience.description,
    scripture: L.actionsDisobedience.scripture,
  },
  {
    id: 'actions_harm_soul',
    category: 'actions',
    name: L.actionsHarmSoul.name,
    description: L.actionsHarmSoul.description,
    scripture: L.actionsHarmSoul.scripture,
  },
  {
    id: 'actions_witchcraft',
    category: 'actions',
    name: L.actionsWitchcraft.name,
    description: L.actionsWitchcraft.description,
    scripture: L.actionsWitchcraft.scripture,
  },

  // ─── Neglected practices ───────────────────────────────────────────────────────
  {
    id: 'neglect_prayer',
    category: 'neglected_practices',
    name: L.neglectPrayer.name,
    description: L.neglectPrayer.description,
    scripture: L.neglectPrayer.scripture,
  },
  {
    id: 'neglect_fasting',
    category: 'neglected_practices',
    name: L.neglectFasting.name,
    description: L.neglectFasting.description,
    scripture: L.neglectFasting.scripture,
  },
  {
    id: 'neglect_communion',
    category: 'neglected_practices',
    name: L.neglectCommunion.name,
    description: L.neglectCommunion.description,
    scripture: L.neglectCommunion.scripture,
  },
  {
    id: 'neglect_tithe',
    category: 'neglected_practices',
    name: L.neglectTithe.name,
    description: L.neglectTithe.description,
    scripture: L.neglectTithe.scripture,
  },
  {
    id: 'neglect_forgiveness',
    category: 'neglected_practices',
    name: L.neglectForgiveness.name,
    description: L.neglectForgiveness.description,
    scripture: L.neglectForgiveness.scripture,
  },
  {
    id: 'neglect_liturgy',
    category: 'neglected_practices',
    name: L.neglectLiturgy.name,
    description: L.neglectLiturgy.description,
    scripture: L.neglectLiturgy.scripture,
  },
  {
    id: 'neglect_scripture',
    category: 'neglected_practices',
    name: L.neglectScripture.name,
    description: L.neglectScripture.description,
    scripture: L.neglectScripture.scripture,
  },
  {
    id: 'neglect_confession_delay',
    category: 'neglected_practices',
    name: L.neglectConfessionDelay.name,
    description: L.neglectConfessionDelay.description,
    scripture: L.neglectConfessionDelay.scripture,
  },
];

export const CATEGORY_META: Record<
  string,
  { label: string; icon: string; color: string; colorLight: string }
> = {
  tongue: {
    label:      C.tongue,
    icon:       '🗣',
    color:      '#7A1F2B',
    colorLight: '#F7E4E2',
  },
  thoughts: {
    label:      C.thoughts,
    icon:       '💭',
    color:      '#1F4E8C',
    colorLight: '#E6EEF7',
  },
  hearing: {
    label:      C.hearing,
    icon:       '👂',
    color:      '#8A6516',
    colorLight: '#FBEFD6',
  },
  eyes: {
    label:      C.eyes,
    icon:       '👁',
    color:      '#1D7A5C',
    colorLight: '#E3F0E8',
  },
  actions: {
    label:      C.actions,
    icon:       '🤲',
    color:      '#6A3D8F',
    colorLight: '#EEE7F5',
  },
  neglected_practices: {
    label:      C.neglectedPractices,
    icon:       '📿',
    color:      '#6E6253',
    colorLight: '#F2E9D5',
  },
};
