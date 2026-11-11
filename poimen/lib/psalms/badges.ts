// lib/psalms/badges.ts
// Milestone badges for Psalm memorization, derived entirely from data already
// tracked by store.ts (streak, cards, recite) — no separate storage or schema.
// Purely a presentational layer: recomputed fresh from the current state every
// time the Psalms screen renders, so a badge can never drift out of sync with
// the underlying progress it celebrates.

import { PartCard, ReciteCard, Streak, masteredItemsCount } from './store';
import { S } from '@/lib/i18n';

const T = S.psalms.badges;

export interface Badge {
  id: string;
  label: string;
  description: string;
  icon: string;
  earned: boolean;
  // Present (and < 1) only for unearned badges with a countable target, so the
  // UI can show "3 / 5" progress instead of just locked/unlocked.
  progress?: { current: number; target: number };
}

interface BadgeInputs {
  selection: string[];
  cards: Record<string, PartCard>;
  recite: Record<string, ReciteCard>;
  streak: Streak;
}

export function computeBadges({ selection, cards, recite, streak }: BadgeInputs): Badge[] {
  const masteredItems = masteredItemsCount(selection, cards);
  const recitedOnce = Object.values(recite).some(r => r.reps > 0);
  const best = streak.longest;

  const badges: Badge[] = [
    {
      id: 'first-fruits',
      label: T.firstFruits.label,
      description: T.firstFruits.description,
      icon: '🌱',
      earned: masteredItems >= 1,
      progress: { current: Math.min(masteredItems, 1), target: 1 },
    },
    {
      id: 'first-recitation',
      label: T.firstRecitation.label,
      description: T.firstRecitation.description,
      icon: '📖',
      earned: recitedOnce,
    },
    {
      id: 'week',
      label: T.week.label,
      description: T.week.description,
      icon: '🔥',
      earned: best >= 7,
      progress: { current: Math.min(best, 7), target: 7 },
    },
    {
      id: 'month',
      label: T.month.label,
      description: T.month.description,
      icon: '🕯️',
      earned: best >= 30,
      progress: { current: Math.min(best, 30), target: 30 },
    },
    {
      id: 'hundred',
      label: T.hundred.label,
      description: T.hundred.description,
      icon: '👑',
      earned: best >= 100,
      progress: { current: Math.min(best, 100), target: 100 },
    },
    {
      id: 'five',
      label: T.five.label,
      description: T.five.description,
      icon: '🏆',
      earned: masteredItems >= 5,
      progress: { current: Math.min(masteredItems, 5), target: 5 },
    },
    {
      id: 'twenty',
      label: T.twenty.label,
      description: T.twenty.description,
      icon: '✦',
      earned: masteredItems >= 20,
      progress: { current: Math.min(masteredItems, 20), target: 20 },
    },
  ];

  return badges;
}
