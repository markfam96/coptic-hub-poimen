// lib/church-prompt.ts
// Whether Home should ask a member about their church, and which way.
//
// Accounts created before the sign-up step have church_id null and, at
// best, a church_name they typed by hand. They are asked once — not nagged,
// and never auto-matched to a directory row, because guessing someone's
// parish is not ours to do. Import-free so the rule is tested
// (lib/church-prompt.test.ts); the dismissal flag itself lives in
// lib/church-prompt-store.ts.

export type ChurchPromptVariant = 'none' | 'choose' | 'confirm';

export interface ChurchPromptProfile {
  church_id: string | null;
  church_name: string | null;
  created_at?: string | null;
}

// A member who just typed an unlisted church at sign-up is not asked on
// their first Home whether it is in the directory; after a week they are.
export const CONFIRM_AFTER_DAYS = 7;

export function churchPromptVariant(
  profile: ChurchPromptProfile | null | undefined,
  dismissed: boolean,
  demoMode: boolean,
  now: Date,
): ChurchPromptVariant {
  if (!profile || dismissed || demoMode) return 'none';
  if (profile.church_id) return 'none';
  const typed = (profile.church_name ?? '').trim();
  if (!typed) return 'choose';
  const created = profile.created_at ? Date.parse(profile.created_at) : NaN;
  if (Number.isNaN(created)) return 'confirm';
  const ageDays = (now.getTime() - created) / 86_400_000;
  return ageDays >= CONFIRM_AFTER_DAYS ? 'confirm' : 'none';
}
