// lib/church-prompt-store.ts
// The one flag behind the Home church prompt, scoped per user: "Not now" on
// a shared family phone must not silence the prompt for the next account.
import { userStorage } from '@/lib/storage';

const KEY = 'poimen.churchPrompt.dismissed';

export async function loadChurchPromptDismissed(): Promise<boolean> {
  try { return (await userStorage.getItem(KEY)) === '1'; } catch { return false; }
}

export async function dismissChurchPrompt(): Promise<void> {
  try { await userStorage.setItem(KEY, '1'); } catch {}
}
