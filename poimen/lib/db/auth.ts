// Auth adapter — the ONLY place auth talks to the backend.
// Screens and the auth provider depend on these functions and the
// backend-agnostic AuthUser / AuthSession types, never on Supabase directly.
// To swap backends, reimplement this file (and the sibling db modules).
import { supabase } from '../supabase';

export interface AuthUser {
  id: string;
  email: string | null;
}

export interface AuthSession {
  user: AuthUser;
}

export interface AuthSubscription {
  unsubscribe: () => void;
}

function mapSession(session: { user: { id: string; email?: string | null } } | null): AuthSession | null {
  if (!session) return null;
  return { user: { id: session.user.id, email: session.user.email ?? null } };
}

export async function getSession(): Promise<AuthSession | null> {
  const { data: { session } } = await supabase.auth.getSession();
  return mapSession(session);
}

export function onAuthChange(callback: (session: AuthSession | null) => void): AuthSubscription {
  const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
    callback(mapSession(session));
  });
  return { unsubscribe: () => subscription.unsubscribe() };
}

export async function signInWithPassword(email: string, password: string): Promise<{ error: string | null }> {
  const { error } = await supabase.auth.signInWithPassword({ email, password });
  return { error: error?.message ?? null };
}

export type SignupRole = 'congregant' | 'servant' | 'priest';

// The church chosen at sign-up. church_id null + a name means "my church
// isn't listed" (lib/church-choice.ts).
export interface SignupChurch {
  church_id: string | null;
  church_name: string;
}

export async function signUp(
  email: string, password: string, fullName: string,
  requestedRole: SignupRole = 'congregant', redirectTo?: string, church?: SignupChurch,
): Promise<{ error: string | null }> {
  const { error } = await supabase.auth.signUp({
    email,
    password,
    // The handle_new_user trigger applies the choice server-side, so the
    // client can never grant itself a role. All three are granted directly;
    // a priest sees nothing until a member links to them (see
    // 20260913010000_remove_priest_approval.sql).
    //
    // The church rides in the same metadata so profiles.church_id is written
    // in the same transaction as the account. The trigger validates both: an
    // id counts only if it names a churches row, whose name then overrides the
    // typed one. What the client sends is a claim, not a fact.
    options: {
      data: { full_name: fullName, requested_role: requestedRole, ...(church ?? {}) },
      emailRedirectTo: redirectTo,
    },
  });
  return { error: error?.message ?? null };
}

export async function signInWithOtp(email: string, redirectTo: string): Promise<{ error: string | null }> {
  const { error } = await supabase.auth.signInWithOtp({ email, options: { emailRedirectTo: redirectTo } });
  return { error: error?.message ?? null };
}

export async function resetPasswordForEmail(email: string, redirectTo: string): Promise<{ error: string | null }> {
  const { error } = await supabase.auth.resetPasswordForEmail(email, { redirectTo });
  return { error: error?.message ?? null };
}

export async function setSessionFromTokens(accessToken: string, refreshToken: string): Promise<{ error: string | null }> {
  const { error } = await supabase.auth.setSession({ access_token: accessToken, refresh_token: refreshToken });
  return { error: error?.message ?? null };
}

export async function updatePassword(password: string): Promise<{ error: string | null }> {
  const { error } = await supabase.auth.updateUser({ password });
  return { error: error?.message ?? null };
}

export async function signOut(): Promise<void> {
  await supabase.auth.signOut();
}

// Delete the signed-in user's own account (supabase/functions/delete-account).
// The function deletes whoever the session belongs to; nothing here names a user.
export async function deleteMyAccount(): Promise<{ error: string | null }> {
  const { data, error } = await supabase.functions.invoke('delete-account', { body: { confirm: 'DELETE' } });
  if (error) {
    let message = "Your account couldn't be deleted. Check your connection and try again.";
    try { const body = await (error as any).context?.json?.(); if (body?.error) message = body.error; } catch {}
    return { error: message };
  }
  return { error: data?.deleted ? null : "Your account couldn't be deleted. Please try again." };
}

// After deletion the session's user no longer exists, so skip the server call.
export async function signOutLocally(): Promise<void> {
  try { await supabase.auth.signOut({ scope: 'local' }); } catch {}
}
