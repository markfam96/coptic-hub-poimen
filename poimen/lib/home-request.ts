// lib/home-request.ts
// Lets a screen outside the side menus (Profile and the screens it opens)
// send the person to the Home of the area they came from. Those screens sit
// in the root stack, above the menus, so they cannot reach a menu's Home
// directly: HomeButton records the request and returns to the area, and the
// menu layouts go to their first screen when they regain focus with a
// request waiting (takeHomeRequest).
//
// A request expires after a few seconds, so one that nothing picks up (the
// app was signed out on the way) cannot move the person somewhere later.

const EXPIRES_MS = 4000;
let requestedAt: number | null = null;

export function requestHome(now = Date.now()): void {
  requestedAt = now;
}

export function takeHomeRequest(now = Date.now()): boolean {
  const waiting = requestedAt !== null && now - requestedAt < EXPIRES_MS;
  requestedAt = null;
  return waiting;
}
