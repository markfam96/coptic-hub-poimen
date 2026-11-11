// lib/church-choice.ts
// What a member chose in the church picker, and how it lands on the profile.
//
// Import-free so the mapping is tested: lib/church-choice.test.ts.

export interface ChosenChurch {
  id: string;
  name: string;
  nickname?: string | null;
  city?: string | null;
  state?: string | null;
  country?: string | null;
}

export type ChurchChoice =
  | { kind: 'listed'; church: ChosenChurch }
  // The roadmap wants "a request to add the parish", not a skipped field, so
  // an unlisted choice always carries a typed name; the city is optional.
  | { kind: 'unlisted'; name: string; city: string };

// A name of fewer than two characters is a slip, not a parish.
export function unlistedNameValid(name: string): boolean {
  return name.trim().length >= 2;
}

// profiles.church_name is read by the FOC card, link-to-foc and the invite
// lookup, so it is filled for both kinds: the row's own name for a listed
// church, and "name, city" for a typed one. The server caps church_name the
// same way (handle_new_user, 120 chars), so the two cannot disagree.
export const CHURCH_NAME_MAX = 120;

export function churchChoiceToFields(c: ChurchChoice): { church_id: string | null; church_name: string } {
  if (c.kind === 'listed') return { church_id: c.church.id, church_name: c.church.name };
  const name = c.name.trim();
  const city = c.city.trim();
  const joined = city ? `${name}, ${city}` : name;
  return { church_id: null, church_name: joined.slice(0, CHURCH_NAME_MAX).trim() };
}
