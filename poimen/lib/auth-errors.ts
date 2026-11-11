// lib/auth-errors.ts
// Recognises the account errors the server words in English, so a screen in
// another language can show its own sentence for them (see localizeAuthError
// in lib/auth.tsx). This file only names WHICH error a message is; the words
// shown live in lib/i18n/<lang>/auth.ts under `errors`, one entry per key
// below. Import-free on purpose, like lib/i18n/core.ts, so plain Node can
// load it.
//
// Anything not recognised returns null and the caller shows the message as it
// came: an untranslated error is better than a wrong one.

export type AuthErrorKey =
  | 'invalidCredentials'
  | 'emailNotConfirmed'
  | 'userExists'
  | 'passwordTooShort'
  | 'rateLimitSeconds'
  | 'emailRateLimit'
  | 'invalidEmail'
  | 'samePassword'
  | 'network'
  | 'deleteFailedConnection'
  | 'deleteFailed';

// `n` is the number the message carries (a length, a wait in seconds), for
// the two entries that are plural forms.
export interface AuthErrorMatch {
  key: AuthErrorKey;
  n?: number;
}

// The app's own two messages for a failed account deletion (lib/db/auth.ts),
// matched whole.
const DELETE_FAILED_CONNECTION = "Your account couldn't be deleted. Check your connection and try again.";
const DELETE_FAILED = "Your account couldn't be deleted. Please try again.";

export function matchAuthError(message: unknown): AuthErrorMatch | null {
  if (typeof message !== 'string') return null;
  const text = message.trim();
  if (!text) return null;

  if (text === DELETE_FAILED_CONNECTION) return { key: 'deleteFailedConnection' };
  if (text === DELETE_FAILED) return { key: 'deleteFailed' };

  if (/invalid login credentials/i.test(text)) return { key: 'invalidCredentials' };
  if (/email not confirmed/i.test(text)) return { key: 'emailNotConfirmed' };
  if (/user already registered/i.test(text)) return { key: 'userExists' };

  const tooShort = /password should be at least (\d+) characters?/i.exec(text);
  if (tooShort) return { key: 'passwordTooShort', n: Number(tooShort[1]) };

  const wait = /you can only request this (?:after|once every) (\d+) seconds?/i.exec(text);
  if (wait) return { key: 'rateLimitSeconds', n: Number(wait[1]) };

  if (/email rate limit exceeded/i.test(text)) return { key: 'emailRateLimit' };
  if (/unable to validate email address|invalid email format|email address .* is invalid/i.test(text)) return { key: 'invalidEmail' };
  if (/new password should be different from the old password/i.test(text)) return { key: 'samePassword' };

  // What fetch throws with no connection: React Native, Chrome and Safari
  // each word it differently.
  if (/^(?:TypeError: )?(?:network request failed|failed to fetch|load failed)\.?$/i.test(text)) return { key: 'network' };

  return null;
}
