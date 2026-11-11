// lib/face-id-lock.ts
// When the Face ID app lock locks, and when it may show the Face ID prompt.
// Import-free so the rules can be tested in plain Node (face-id-lock.test.ts);
// app/_layout.tsx feeds it events and shows the prompt when told to.
//
// The rules that keep it to ONE prompt per opening of the app:
//  · Only 'background' locks. iOS also reports 'inactive' while the Face ID
//    sheet itself is on screen (and for Control Centre, the notification
//    shade and the app switcher). Treating that as leaving the app re-locked
//    it in the middle of its own prompt.
//  · Returning to 'active' prompts only after a real trip to the background
//    (or on the first activation of a cold start). Coming back from the Face
//    ID sheet, which is inactive → active, never prompts. Before this, a
//    successful scan raced the 'active' event and asked again, and a
//    cancelled scan re-prompted at once.
//  · Unlocking holds until the app next goes to the background. If
//    protection drops and returns within the same visit (the demo flag being
//    cleared on launch, a sign-out and sign-in), it does not lock again.
//  · One prompt at a time. After a failed or cancelled scan the lock screen
//    waits for its Unlock button.
//  · The prompt's own trip to the background is not leaving the app. Where
//    Face ID is unavailable (Expo Go, or after failed scans) the system asks
//    for the phone's passcode on a full screen of its own, and iOS reports
//    the app as 'background' while it shows, with the notice sometimes
//    arriving just AFTER the passcode was accepted. A 'background' during a
//    prompt, or within AUTH_UI_GRACE_MS after one ends, is that screen.

export type AppStateName = 'active' | 'background' | 'inactive' | 'unknown' | 'extension' | string;

export interface LockState {
  protect: boolean;          // Face ID lock on, available, signed in, not demo
  locked: boolean;
  prompting: boolean;        // a Face ID sheet is open
  promptOnActive: boolean;   // prompt the next time the app becomes active
  unlockedThisVisit: boolean;
  promptEndedAt: number | null; // ms timestamp the last prompt closed
}

export const AUTH_UI_GRACE_MS = 1500;

export type LockEvent =
  | { type: 'protect'; on: boolean; appState: AppStateName }
  | { type: 'appState'; state: AppStateName; at: number }
  | { type: 'promptDone'; ok: boolean; at: number }
  | { type: 'retry' };

export const INITIAL_LOCK_STATE: LockState = {
  protect: false,
  locked: false,
  prompting: false,
  promptOnActive: false,
  unlockedThisVisit: false,
  promptEndedAt: null,
};

// Returns the next state and whether to open the Face ID prompt now.
export function lockStep(s: LockState, e: LockEvent): { state: LockState; prompt: boolean } {
  const next = { ...s };
  let prompt = false;

  const startPrompt = () => {
    if (next.protect && next.locked && !next.prompting) {
      next.prompting = true;
      next.promptOnActive = false;
      prompt = true;
    }
  };

  switch (e.type) {
    case 'protect':
      if (e.on === s.protect) break;
      next.protect = e.on;
      if (!e.on) {
        next.locked = false;
        next.promptOnActive = false;
        break;
      }
      if (s.unlockedThisVisit) break;
      next.locked = true;
      if (e.appState === 'active') startPrompt();
      else next.promptOnActive = true;
      break;

    case 'appState':
      if (e.state === 'background') {
        const fromAuthScreen = s.prompting
          || (s.promptEndedAt !== null && e.at - s.promptEndedAt < AUTH_UI_GRACE_MS);
        if (fromAuthScreen) break;
        next.unlockedThisVisit = false;
        if (next.protect) {
          next.locked = true;
          next.promptOnActive = true;
        }
      } else if (e.state === 'active' && next.promptOnActive) {
        startPrompt();
      }
      break;

    case 'promptDone':
      next.prompting = false;
      next.promptEndedAt = e.at;
      if (e.ok) {
        next.locked = false;
        next.unlockedThisVisit = true;
      }
      break;

    case 'retry':
      startPrompt();
      break;
  }
  return { state: next, prompt };
}
